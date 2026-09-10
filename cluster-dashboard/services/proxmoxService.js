process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

// SSL sertifika uyarilarini self-signed certs icin yoksayan agent
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function parseHostPort(raw, defaultPort = 8006) {
  let h = (raw || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  let p = defaultPort;
  if (h.includes(':')) {
    const parts = h.split(':');
    h = parts[0];
    p = parseInt(parts[1], 10) || defaultPort;
  }
  return { host: h, port: p };
}

class ProxmoxService {
  /**
   * Proxmox API'sine giris yapar ve Ticket/CSRF token alir.
   * Tek IP, portlu IP (örn: 138.201.57.25:8006) veya virgulle ayrilmis coklu IP'leri destekler.
   */
  async login({ host, port = 8006, username, password }) {
    let user = (username || '').trim();
    if (!user.includes('@')) {
      user = `${user}@pam`;
    }

    const hostEntries = (host || '').split(/[,;\s]+/).map(h => h.trim()).filter(Boolean);
    let primaryAuth = null;
    let successfulHosts = [];
    let lastError = '';

    for (const raw of hostEntries) {
      const { host: h, port: effectivePort } = parseHostPort(raw, port);
      try {
        const postData = new URLSearchParams({
          username: user,
          password: password
        }).toString();

        const url = `https://${h}:${effectivePort}/api2/json/access/ticket`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: postData
        });

        if (response.ok) {
          const data = await response.json();
          const authInfo = {
            ticket: data.data.ticket,
            csrfToken: data.data.CSRFPreventionToken,
            username: user,
            host: h,
            port: effectivePort
          };
          if (!primaryAuth) {
            primaryAuth = { ...authInfo };
          }
          successfulHosts.push({
            host: h,
            port: effectivePort,
            ticket: data.data.ticket,
            csrfToken: data.data.CSRFPreventionToken
          });
        } else {
          const errText = await response.text();
          if (response.status === 401) {
            lastError = `${h}:${effectivePort} -> Giriş başarısız (401 Yetkisiz). Lütfen Proxmox kullanıcı adı (örn: root) ve şifrenizi kontrol ediniz.`;
          } else {
            lastError = `${h}:${effectivePort} -> HTTP ${response.status}: ${errText}`;
          }
          console.warn(`Proxmox login error on ${h}:${effectivePort}:`, lastError);
        }
      } catch (err) {
        lastError = `${h}:${effectivePort} -> Bağlantı hatası: ${err.message}`;
        console.warn(`Proxmox host ${h}:${effectivePort} erişim hatası:`, err.message);
      }
    }

    if (!primaryAuth) {
      throw new Error(lastError || `Belirtilen Proxmox sunucu(lar)ına bağlanılamadı. Lütfen IP, Port ve şifreyi kontrol edin.`);
    }

    return {
      ticket: primaryAuth.ticket,
      csrfToken: primaryAuth.csrfToken,
      username: primaryAuth.username,
      host: primaryAuth.host,
      port: primaryAuth.port,
      allHosts: successfulHosts
    };
  }

  /**
   * Aktif fiziksel node'lari ve donanim kapasitelerini (CPU, RAM) ceker.
   * Cluster ise tum node'lar tek API'den gelir, ayri node'lar ise birlestirilir.
   */
  async getNodes({ host, port, ticket, allHosts = [] }) {
    const nodeMap = new Map();

    const targets = allHosts.length > 0 ? allHosts : [{ host, port, ticket }];

    for (const target of targets) {
      try {
        const tHost = target.host || host;
        const tPort = target.port || port;
        const tTicket = target.ticket || (target.auth ? target.auth.ticket : ticket);
        const url = `https://${tHost}:${tPort}/api2/json/nodes`;
        const response = await fetch(url, {
          headers: { 'Cookie': `PVEAuthCookie=${tTicket}` }
        });

        if (response.ok) {
          const data = await response.json();
          (data.data || []).forEach(n => {
            if (!nodeMap.has(n.node)) {
              nodeMap.set(n.node, {
                name: n.node,
                pveHost: tHost,
                status: n.status,
                cpu: Math.round((n.cpu || 0) * 100),
                maxCpu: n.maxcpu || 0,
                memoryUsedGB: Math.round(((n.mem || 0) / (1024 * 1024 * 1024)) * 10) / 10,
                memoryTotalGB: Math.round(((n.maxmem || 0) / (1024 * 1024 * 1024)) * 10) / 10,
                uptimeSeconds: n.uptime || 0
              });
            }
          });
        }
      } catch (err) {}
    }

    return Array.from(nodeMap.values());
  }

  /**
   * Belirtilen node'daki Cloud-Init ve normal QEMU template'lerini listeler
   */
  async getTemplates({ host, port, ticket, node }) {
    const url = `https://${host}:${port}/api2/json/nodes/${node}/qemu`;
    const response = await fetch(url, {
      headers: {
        'Cookie': `PVEAuthCookie=${ticket}`
      },
      agent: httpsAgent
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.data || [])
      .filter(vm => vm.template === 1)
      .map(t => ({
        vmid: t.vmid,
        name: t.name || `template-${t.vmid}`,
        memoryMB: Math.round((t.maxmem || 0) / (1024 * 1024)),
        cpus: t.cpus || 1
      }));
  }

  /**
   * Belirtilen node'daki depolama alanlarini (Storage / Disk havuzlari) listeler
   */
  async getStorages({ host, port, ticket, node }) {
    const url = `https://${host}:${port}/api2/json/nodes/${node}/storage`;
    try {
      const response = await fetch(url, {
        headers: {
          'Cookie': `PVEAuthCookie=${ticket}`
        },
        agent: httpsAgent
      });

      if (!response.ok) return [];
      const data = await response.json();
      return (data.data || [])
        .filter(s => s.active && s.content && (s.content.includes('images') || s.content.includes('rootdir')))
        .map(s => ({
          name: s.storage,
          type: s.type,
          availGB: Math.round((s.avail || 0) / (1024 * 1024 * 1024)),
          totalGB: Math.round((s.total || 0) / (1024 * 1024 * 1024)),
          usedGB: Math.round((s.used || 0) / (1024 * 1024 * 1024))
        }));
    } catch {
      return [];
    }
  }

  /**
   * Template'i yeni bir VM olarak klonlar (Hedef Storage havuzu opsiyoneldir)
   */
  async cloneVM({ host, port, ticket, csrfToken, sourceNode, targetNode, templateId, newVmId, vmName, storage }) {
    const url = `https://${host}:${port}/api2/json/nodes/${sourceNode}/qemu/${templateId}/clone`;
    const params = {
      newid: newVmId,
      name: vmName,
      target: targetNode,
      full: 1
    };
    if (storage) {
      params.storage = storage;
    }
    const body = new URLSearchParams(params).toString();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': `PVEAuthCookie=${ticket}`,
        'CSRFPreventionToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body,
      agent: httpsAgent
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`VM klonlama hatasi (${newVmId}): ${err}`);
    }

    return await response.json();
  }

  /**
   * VM diskini genisletir (Resize Disk)
   */
  async resizeDisk({ host, port, ticket, csrfToken, node, vmid, disk = 'scsi0', sizeGB }) {
    if (!sizeGB) return;
    const url = `https://${host}:${port}/api2/json/nodes/${node}/qemu/${vmid}/resize`;
    const body = new URLSearchParams({
      disk,
      size: `+${sizeGB}G`
    }).toString();

    try {
      await fetch(url, {
        method: 'PUT',
        headers: {
          'Cookie': `PVEAuthCookie=${ticket}`,
          'CSRFPreventionToken': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body,
        agent: httpsAgent
      });
    } catch {}
  }

  /**
   * Cloud-Init donanim ve ag yapilandirmasini enjekte eder
   */
  async configCloudInit({ host, port, ticket, csrfToken, node, vmid, cores, memoryMB, ipCidr, gateway, sshUser, sshPass, sshPublicKey }) {
    const url = `https://${host}:${port}/api2/json/nodes/${node}/qemu/${vmid}/config`;
    const params = new URLSearchParams({
      cores: cores || 8,
      memory: memoryMB || 16384,
      ipconfig0: `ip=${ipCidr},gw=${gateway}`,
      ciuser: sshUser || 'root'
    });

    if (sshPass) {
      params.append('cipassword', sshPass);
    }
    if (sshPublicKey) {
      params.append('sshkeys', encodeURIComponent(sshPublicKey.trim()));
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': `PVEAuthCookie=${ticket}`,
        'CSRFPreventionToken': csrfToken,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      agent: httpsAgent
    });

    if (!response.ok) {
      const err = await response.text();
      console.warn(`Cloud-init yapilandirma uyarisi (${vmid}):`, err);
    }
    return true;
  }

  /**
   * VM'i baslatir (Start)
   */
  async startVM({ host, port, ticket, csrfToken, node, vmid }) {
    const url = `https://${host}:${port}/api2/json/nodes/${node}/qemu/${vmid}/status/start`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': `PVEAuthCookie=${ticket}`,
        'CSRFPreventionToken': csrfToken
      },
      agent: httpsAgent
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`VM baslatilamadi (${vmid}): ${err}`);
    }
    return true;
  }
}

module.exports = new ProxmoxService();
