process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const https = require('https');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function parseHostPort(raw, defaultPort = 443) {
  let h = (raw || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  let p = defaultPort;
  if (h.includes(':')) {
    const parts = h.split(':');
    h = parts[0];
    p = parseInt(parts[1], 10) || defaultPort;
  }
  return { host: h, port: p };
}

class VCenterService {
  /**
   * VMware vCenter REST API'ye Basic Auth ile oturum acar ve session token alir.
   */
  async login({ host, port = 443, username, password }) {
    const { host: cleanHost, port: effectivePort } = parseHostPort(host, port);
    let user = (username || '').trim();
    if (!user.includes('@')) {
      user = `${user}@vsphere.local`;
    }

    const credentials = Buffer.from(`${user}:${password}`).toString('base64');
    const url = `https://${cleanHost}:${effectivePort}/api/session`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`
      },
      agent: httpsAgent
    });

    if (!response.ok) {
      // Fallback to legacy vSphere 6.5/6.7 REST API endpoint
      const legacyUrl = `https://${host}:${port}/rest/com/vmware/cis/session`;
      const legRes = await fetch(legacyUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`
        },
        agent: httpsAgent
      });

      if (!legRes.ok) {
        const err = await legRes.text();
        throw new Error(`vCenter giris basarisiz (${legRes.status}): ${err}`);
      }

      const legData = await legRes.json();
      return {
        sessionId: legData.value,
        host,
        port,
        username: user
      };
    }

    const sessionId = (await response.text()).replace(/"/g, '').trim();
    return {
      sessionId,
      host,
      port,
      username: user
    };
  }

  /**
   * vCenter altindaki tum ESXi fiziksel sunucularini ceker
   */
  async getHosts({ host, port, sessionId }) {
    const url = `https://${host}:${port}/api/vcenter/host`;
    const response = await fetch(url, {
      headers: {
        'vmware-api-session-id': sessionId
      },
      agent: httpsAgent
    });

    if (!response.ok) {
      throw new Error(`ESXi Host listesi alinamadi: ${response.statusText}`);
    }

    const data = await response.json();
    return (data || []).map(h => ({
      name: h.name,
      hostId: h.host,
      status: h.connection_state === 'CONNECTED' ? 'online' : 'offline',
      powerState: h.power_state
    }));
  }

  /**
   * vCenter altindaki Datastore ve Sablonlari (Templates) listeler
   */
  async getTemplates({ host, port, sessionId }) {
    const url = `https://${host}:${port}/api/vcenter/vm`;
    const response = await fetch(url, {
      headers: {
        'vmware-api-session-id': sessionId
      },
      agent: httpsAgent
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data || [])
      .filter(vm => vm.name.toLowerCase().includes('template') || vm.name.toLowerCase().includes('tmpl') || vm.name.toLowerCase().includes('ubuntu'))
      .map(vm => ({
        vmId: vm.vm,
        name: vm.name,
        cpuCount: vm.cpu_count,
        memoryMB: vm.memory_size_MiB,
        powerState: vm.power_state
      }));
  }

  /**
   * vCenter altindaki Datastore / Disk havuzlarini listeler
   */
  async getDatastores({ host, port, sessionId }) {
    const url = `https://${host}:${port}/api/vcenter/datastore`;
    try {
      const response = await fetch(url, {
        headers: {
          'vmware-api-session-id': sessionId
        },
        agent: httpsAgent
      });

      if (!response.ok) return [];
      const data = await response.json();
      return (data || []).map(d => ({
        name: d.name,
        datastoreId: d.datastore,
        type: d.type,
        availGB: Math.round((d.free_space || 0) / (1024 * 1024 * 1024)),
        totalGB: Math.round((d.capacity || 0) / (1024 * 1024 * 1024))
      }));
    } catch {
      return [];
    }
  }

  /**
   * vCenter'da VM'i baslatir (Power ON)
   */
  async startVM({ host, port, sessionId, vmId }) {
    const url = `https://${host}:${port}/api/vcenter/vm/${vmId}/power?action=start`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'vmware-api-session-id': sessionId
      },
      agent: httpsAgent
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`vCenter VM baslatma hatasi (${vmId}): ${err}`);
    }
    return true;
  }
}

module.exports = new VCenterService();
