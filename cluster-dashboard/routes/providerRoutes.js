const express = require('express');
const proxmoxService = require('../services/proxmoxService');
const vcenterService = require('../services/vcenterService');
const hypervService = require('../services/hypervService');
const sshService = require('../services/sshService');

module.exports = function(broadcast = () => {}) {
  const router = express.Router();

  // 2. Proxmox Baglantisi & Node/Template/Storage Kesfi
  router.post('/api/providers/proxmox/connect', async (req, res) => {
    try {
      const { host, port = 8006, username, password } = req.body;
      const auth = await proxmoxService.login({ host, port, username, password });
      const nodes = await proxmoxService.getNodes({ host: auth.host, port, ticket: auth.ticket, allHosts: auth.allHosts });
      
      let templates = [];
      let storages = [];
      if (nodes.length > 0) {
        templates = await proxmoxService.getTemplates({ host: auth.host, port, ticket: auth.ticket, node: nodes[0].name });
        storages = await proxmoxService.getStorages({ host: auth.host, port, ticket: auth.ticket, node: nodes[0].name });
      }

      res.json({
        success: true,
        auth,
        nodes,
        templates,
        storages
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3. VMware vCenter Baglantisi & ESXi Host/Template/Datastore Kesfi
  router.post('/api/providers/vcenter/connect', async (req, res) => {
    try {
      const { host, port = 443, username, password } = req.body;
      const auth = await vcenterService.login({ host, port, username, password });
      const hosts = await vcenterService.getHosts({ host, port, sessionId: auth.sessionId });
      const templates = await vcenterService.getTemplates({ host, port, sessionId: auth.sessionId });
      const storages = await vcenterService.getDatastores({ host, port, sessionId: auth.sessionId });

      res.json({
        success: true,
        auth,
        hosts,
        templates,
        storages
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3.1 Microsoft Hyper-V Baglantisi & Host/vSwitch/VHDX Kesfi
  router.post('/api/providers/hyperv/connect', async (req, res) => {
    try {
      const { host = 'localhost', port = 22, username = 'Administrator', password = '' } = req.body;
      const isLocal = (!host || host === 'localhost' || host === '127.0.0.1');
      const result = await hypervService.loginAndDiscover({ host, port, username, password, isLocal });
      const templates = await hypervService.getTemplates({ host, port, username, password, isLocal });
      const storages = await hypervService.getStorages({ host, port, username, password, isLocal });

      res.json({
        success: true,
        auth: {
          host: result.host,
          port,
          username,
          isLocal,
          switchName: (result.switches && result.switches[0]) ? result.switches[0].Name : 'Default Switch'
        },
        nodes: result.nodes,
        switches: result.switches,
        templates,
        storages
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 3.5 Otomatik Proxmox Cloud-Init Şablonu Oluşturucu
  router.post('/api/templates/create-proxmox-template', async (req, res) => {
    try {
      const {
        host,
        username = 'root',
        password,
        templateId = 9000,
        storage = 'local-lvm',
        osVersion = '22.04'
      } = req.body;

      let cleanHost = (host || '').split(/[,;\s]+/)[0].trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
      let targetPort = 22;
      if (cleanHost.includes(':')) {
        const parts = cleanHost.split(':');
        cleanHost = parts[0];
      }

      if (!cleanHost) {
        return res.status(400).json({ success: false, error: 'Geçerli bir Proxmox host IP adresi giriniz.' });
      }

      const cleanUser = username.split('@')[0] || 'root';

      const imgUrl = osVersion === '24.04'
        ? 'https://cloud-images.ubuntu.com/minimal/releases/noble/release/ubuntu-24.04-minimal-cloudimg-amd64.img'
        : 'https://cloud-images.ubuntu.com/minimal/releases/jammy/release/ubuntu-22.04-minimal-cloudimg-amd64.img';
      const imgName = osVersion === '24.04' ? 'noble-minimal-cloudimg-amd64.img' : 'jammy-minimal-cloudimg-amd64.img';

      let script = `set -e
echo "=== [1/3] Ubuntu ${osVersion} Minimal Cloud Image İndiriliyor (~300 MB) ==="
cd /tmp
if [ ! -s "${imgName}" ]; then
  echo "İmaj Canonical CDN sunucusundan indiriliyor..."
  curl -sSL -C - --fail "${imgUrl}" -o "${imgName}.tmp"
  mv "${imgName}.tmp" "${imgName}"
  echo "İmaj indirme tamamlandı: $(ls -lh ${imgName} | awk '{print $5}')"
else
  echo "İmaj önceden indirilmiş, doğrudan kullanılıyor: $(ls -lh ${imgName} | awk '{print $5}')"
fi

echo "=== [2/3] Sanal Makine Oluşturuluyor & Disk Import Ediliyor (${storage}) ==="
qm destroy ${templateId} 2>/dev/null || true
qm create ${templateId} --name "ubuntu-${osVersion.replace('.', '')}-cloudinit" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk ${templateId} "/tmp/${imgName}" ${storage}

DISK_VOL=$(qm config ${templateId} | awk '/^unused[0-9]:/ {print $2}' | head -n 1)
if [ -z "$DISK_VOL" ]; then
  DISK_VOL="${storage}:vm-${templateId}-disk-0"
fi
echo "Bağlanan disk: $DISK_VOL"
qm set ${templateId} --scsihw virtio-scsi-pci --scsi0 "$DISK_VOL"
qm set ${templateId} --ide2 ${storage}:cloudinit
qm set ${templateId} --boot c --bootdisk scsi0
qm set ${templateId} --serial0 socket --vga serial0

echo "=== [3/3] Şablona (Template) Dönüştürülüyor ==="
qm template ${templateId}
echo "=== [TAMAMLANDI] Ubuntu ${osVersion} Cloud-Init Şablonu (${templateId}) Kullanıma Hazır! ==="
`;

      await sshService.execute({
        host: cleanHost,
        port: targetPort,
        username: cleanUser,
        password,
        command: script,
        onLog: (msg) => {
          broadcast({ type: 'template-log', message: msg });
        }
      });

      res.json({
        success: true,
        message: `Ubuntu ${osVersion} Cloud-Init Şablonu (ID: ${templateId}) başarıyla oluşturuldu!`,
        templateId,
        templateName: `ubuntu-${osVersion.replace('.', '')}-cloudinit`
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
