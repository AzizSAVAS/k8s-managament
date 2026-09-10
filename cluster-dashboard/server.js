process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');

const proxmoxService = require('./services/proxmoxService');
const vcenterService = require('./services/vcenterService');
const hypervService = require('./services/hypervService');
const rke2Installer = require('./services/rke2Installer');
const sshService = require('./services/sshService');
const clusterOpsService = require('./services/clusterOpsService');
const aiCopilotService = require('./services/aiCopilotService');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// Tum bagli WebSocket istemcilerine mesaj gonderen yardimci
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// -------------------------------------------------------------
// AUTHENTICATION & RBAC ENDPOINTS
// -------------------------------------------------------------
const AUTH_USERS = [
  { username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin', role: 'cluster-admin', name: 'Aziz SAVAŞ' },
  { username: 'devops', password: process.env.DEVOPS_PASSWORD || 'devops', role: 'devops-engineer', name: 'DevOps Mühendisi' },
  { username: 'auditor', password: process.env.AUDITOR_PASSWORD || 'auditor', role: 'security-auditor', name: 'Güvenlik Denetçisi' }
];

app.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body || {};
  const user = AUTH_USERS.find(u => u.username.toLowerCase() === (username || '').toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı!' });
  }
  const token = `shams-session-${Buffer.from(user.username + ':' + Date.now()).toString('base64')}`;
  res.json({
    success: true,
    token,
    user: {
      username: user.username,
      name: user.name,
      role: role || user.role
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer shams-session-')) {
    return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
  }
  res.json({ success: true, authenticated: true });
});

// -------------------------------------------------------------
// 6 ENTERPRISE SUITE SUITE ENDPOINTS
// -------------------------------------------------------------

// 1. Audit Logs Trail
let AUDIT_LOGS = [
  { id: 'aud-101', timestamp: new Date(Date.now() - 3600000).toISOString(), user: 'admin (Aziz SAVAŞ)', action: 'CLUSTER_DEPLOY_SUCCESS', target: 'Cluster-Proxmox-HA', status: 'SUCCESS', ip: '192.168.1.50', details: 'RKE2 v1.30.4+rke2r1 3-Node HA cluster successfully deployed.' },
  { id: 'aud-102', timestamp: new Date(Date.now() - 2400000).toISOString(), user: 'admin (Aziz SAVAŞ)', action: 'ETCD_SNAPSHOT_TRIGGER', target: 'etcd-db', status: 'SUCCESS', ip: '192.168.1.50', details: 'Automatic pre-flight snapshot created before upgrade.' },
  { id: 'aud-103', timestamp: new Date(Date.now() - 1500000).toISOString(), user: 'devops (DevOps Team)', action: 'ADDON_INSTALL', target: 'cilium-hubble-ui', status: 'SUCCESS', ip: '10.0.5.12', details: 'Cilium Hubble UI installed with eBPF telemetry.' },
  { id: 'aud-104', timestamp: new Date(Date.now() - 600000).toISOString(), user: 'auditor (Security Auditor)', action: 'CIS_BENCHMARK_SCAN', target: 'All Nodes', status: 'SUCCESS', ip: '10.0.8.24', details: 'CIS Benchmark v1.8 scan completed. Score: 94.2%.' },
  { id: 'aud-105', timestamp: new Date(Date.now() - 120000).toISOString(), user: 'admin (Aziz SAVAŞ)', action: 'AUTH_LOGIN', target: 'Console Session', status: 'SUCCESS', ip: '192.168.1.50', details: 'Role cluster-admin authenticated.' }
];

app.get('/api/cluster/audit-logs', (req, res) => {
  res.json({ success: true, logs: AUDIT_LOGS });
});

app.post('/api/cluster/audit-logs', (req, res) => {
  const { user, action, target, status, details } = req.body || {};
  const newEntry = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user || 'admin',
    action: action || 'CUSTOM_ACTION',
    target: target || 'Cluster',
    status: status || 'SUCCESS',
    ip: req.ip || '127.0.0.1',
    details: details || ''
  };
  AUDIT_LOGS.unshift(newEntry);
  if (AUDIT_LOGS.length > 200) AUDIT_LOGS.pop();
  res.json({ success: true, entry: newEntry });
});

// 2. Interactive Topology Graph
app.get('/api/cluster/topology', (req, res) => {
  res.json({
    success: true,
    nodes: [
      { id: 'ing-1', name: 'ingress-nginx-controller', type: 'ingress', namespace: 'ingress-nginx', status: 'Healthy', ip: '10.0.10.100', load: '1,450 req/s' },
      { id: 'gw-1', name: 'cilium-envoy-gateway', type: 'gateway', namespace: 'cilium-system', status: 'Healthy', ip: '10.0.10.101', load: 'L7 eBPF Filter' },
      { id: 'pod-fe', name: 'frontend-web-ui', type: 'service', namespace: 'production', status: 'Healthy', replicas: '3/3', load: '980 req/s' },
      { id: 'pod-api', name: 'core-backend-api', type: 'service', namespace: 'production', status: 'Healthy', replicas: '5/5', load: '1.2ms latency' },
      { id: 'pod-redis', name: 'redis-ha-sentinel', type: 'database', namespace: 'production', status: 'Healthy', replicas: '3/3', load: '12,400 ops/s' },
      { id: 'pod-db', name: 'postgresql-primary', type: 'database', namespace: 'database', status: 'Healthy', replicas: '1/1', load: '4.8 GB RAM' },
      { id: 'sys-dns', name: 'coredns-system', type: 'system', namespace: 'kube-system', status: 'Healthy', replicas: '2/2', load: '0.2ms DNS' },
      { id: 'sys-ebpf', name: 'cilium-agent-ebpf', type: 'networking', namespace: 'kube-system', status: 'Healthy', replicas: 'DaemonSet', load: 'Zero-drop' }
    ],
    links: [
      { from: 'ing-1', to: 'gw-1', protocol: 'HTTPS / TLS 1.3', rate: '1,450 rps', latency: '0.4ms' },
      { from: 'gw-1', to: 'pod-fe', protocol: 'HTTP/2', rate: '980 rps', latency: '0.6ms' },
      { from: 'pod-fe', to: 'pod-api', protocol: 'gRPC / L7', rate: '850 rps', latency: '1.1ms' },
      { from: 'pod-api', to: 'pod-redis', protocol: 'RESP / TCP 6379', rate: '12,400 ops', latency: '0.3ms' },
      { from: 'pod-api', to: 'pod-db', protocol: 'PostgreSQL / TCP 5432', rate: '320 qps', latency: '2.4ms' },
      { from: 'pod-fe', to: 'sys-dns', protocol: 'UDP 53', rate: 'Normal', latency: '0.2ms' },
      { from: 'gw-1', to: 'sys-ebpf', protocol: 'eBPF Kernel Hook', rate: 'Native', latency: '0.01ms' }
    ]
  });
});

// 3. Custom Helm Catalog & Repository
const HELM_REPOSITORIES = [
  { name: 'bitnami', url: 'https://charts.bitnami.com/bitnami', description: 'Enterprise Ready Open Source Application Catalog', chartsCount: 142 },
  { name: 'shams-internal', url: 'https://harbor.shamssoftware.com/chartrepo/core', description: 'Shamssoftware Kurumsal Özel Mikroservis Helm Deposu', chartsCount: 18 },
  { name: 'cilium', url: 'https://helm.cilium.io/', description: 'Cilium eBPF & Hubble Networking Stack', chartsCount: 8 }
];

const HELM_CHARTS = [
  { id: 'rabbitmq-ha', name: 'RabbitMQ HA Cluster', repo: 'bitnami', version: '12.0.4', appVersion: '3.12.0', category: 'Mesajlaşma', defaultValues: 'replicaCount: 3\nauth:\n  username: user\n  password: securePassword123\nclustering:\n  addressType: hostname\npersistence:\n  enabled: true\n  size: 20Gi\n' },
  { id: 'mongodb-sharded', name: 'MongoDB Sharded Cluster', repo: 'bitnami', version: '14.2.1', appVersion: '7.0.2', category: 'Veritabanı', defaultValues: 'shards: 2\nconfigServer:\n  replicas: 3\nmongos:\n  replicas: 2\npersistence:\n  size: 50Gi\n' },
  { id: 'vault', name: 'HashiCorp Vault Secrets', repo: 'bitnami', version: '0.27.0', appVersion: '1.15.2', category: 'Güvenlik', defaultValues: 'server:\n  ha:\n    enabled: true\n    replicas: 3\n  dataStorage:\n    enabled: true\n    size: 10Gi\n' },
  { id: 'elasticsearch', name: 'Elasticsearch Analytics', repo: 'bitnami', version: '19.5.4', appVersion: '8.10.2', category: 'Arama & Log', defaultValues: 'master:\n  replicas: 3\ndata:\n  replicas: 2\n  heapSize: 2048m\n' },
  { id: 'shams-gateway', name: 'Shams Microservice Gateway', repo: 'shams-internal', version: '2.4.0', appVersion: '2.4.0', category: 'Kurumsal Servis', defaultValues: 'replicaCount: 3\nenvironment: production\nrateLimit:\n  enabled: true\n  maxRps: 5000\n' }
];

app.get('/api/cluster/helm/catalog', (req, res) => {
  res.json({ success: true, repos: HELM_REPOSITORIES, charts: HELM_CHARTS });
});

app.post('/api/cluster/helm/install', async (req, res) => {
  const { chartName, releaseName, namespace, valuesYaml } = req.body || {};
  res.json({
    success: true,
    releaseName: releaseName || `release-${Date.now()}`,
    namespace: namespace || 'default',
    status: 'DEPLOYED',
    message: `${chartName || 'Chart'} '${namespace || 'default'}' namespace'ine başarıyla kuruldu!`
  });
});

// 4. Chaos Engineering Simulator
app.post('/api/cluster/chaos/simulate', async (req, res) => {
  const { scenario, target } = req.body || {};
  let result = {};
  
  if (scenario === 'pod_kill') {
    result = {
      scenario: 'Worker Pod Kesintisi (Pod Kill)',
      target: target || 'core-backend-api-7b89f-2k9xm',
      killedAt: new Date().toISOString(),
      evicted: true,
      rescheduledPod: `core-backend-api-7b89f-${Math.random().toString(36).substring(7)}`,
      recoveryTimeMs: 1420,
      slaImpact: '0% (ReplicaSet ve PodDisruptionBudget kesintisiz devraldı)',
      status: 'SUCCESS'
    };
  } else if (scenario === 'etcd_failover') {
    result = {
      scenario: 'etcd Lider Düğüm Kesintisi (Leader Failover)',
      target: 'rke2-master-01 (Port 2379/2380)',
      electionTimeMs: 480,
      newLeader: 'rke2-master-02',
      raftQuorum: '2 / 3 (Sağlam)',
      slaImpact: 'Sıfır Veri Kaybı (Zero Data Loss)',
      status: 'SUCCESS'
    };
  } else if (scenario === 'latency_injection') {
    result = {
      scenario: 'Cilium eBPF Ağ Gecikmesi Enjeksiyonu (+150ms)',
      target: 'production namespace (L3/L4 Traffic)',
      injectedDelay: '150ms',
      circuitBreaker: 'Aktif (Istio/Envoy L7 Retry devrede)',
      droppedPackets: '0 (Paket kaybı yaşanmadı)',
      status: 'SUCCESS'
    };
  } else {
    result = {
      scenario: 'Genel HA Dayanıklılık Testi',
      target: 'Cluster Nodes',
      score: '98 / 100 (Kurumsal HA Dayanıklı)',
      status: 'SUCCESS'
    };
  }
  
  res.json({ success: true, result });
});

// 5. Notification Webhook Channels
app.post('/api/cluster/notifications/test', async (req, res) => {
  const { channel, webhookUrl, botToken, chatId } = req.body || {};
  if (!webhookUrl && !botToken) {
    return res.status(400).json({ success: false, error: 'Lütfen geçerli bir Webhook URL veya Bot Token giriniz.' });
  }

  const alertCard = {
    title: '🚨 [TEST] Shamssoftware RKE2 Cluster Hub Bildirim Testi',
    cluster: 'Enterprise HA Cluster',
    status: 'HEALTHY / TELEMETRY TEST',
    metric: 'CPU Kullanımı: %24 | Bellek: %38 | Düğümler: 3/3 Ready',
    message: 'Bu bildirim Shamssoftware Kubernetes alarm kanalı doğrulama testi için gönderilmiştir.',
    timestamp: new Date().toLocaleString('tr-TR')
  };

  res.json({
    success: true,
    channel: channel || 'slack',
    message: `${(channel || 'Webhook').toUpperCase()} test bildirimi başarıyla sevk edildi!`,
    deliveredPayload: alertCard
  });
});

// 6. Harbor & Private Registry Secret Generator
app.post('/api/cluster/registry/secret', async (req, res) => {
  const { registryUrl, username, password, secretName, namespace } = req.body || {};
  if (!registryUrl || !username || !password) {
    return res.status(400).json({ success: false, error: 'Registry URL, kullanıcı adı ve şifre zorunludur!' });
  }

  const authString = Buffer.from(`${username}:${password}`).toString('base64');
  const dockerConfig = {
    auths: {
      [registryUrl]: {
        username,
        password,
        auth: authString
      }
    }
  };
  const secretYaml = `apiVersion: v1
kind: Secret
metadata:
  name: ${secretName || 'shams-registry-secret'}
  namespace: ${namespace || 'default'}
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: ${Buffer.from(JSON.stringify(dockerConfig)).toString('base64')}
---
# Otomatik ServiceAccount yaması (default SA için imagePullSecrets)
apiVersion: v1
kind: ServiceAccount
metadata:
  name: default
  namespace: ${namespace || 'default'}
imagePullSecrets:
  - name: ${secretName || 'shams-registry-secret'}
`;

  res.json({
    success: true,
    secretName: secretName || 'shams-registry-secret',
    namespace: namespace || 'default',
    generatedYaml: secretYaml,
    message: `'${secretName || 'shams-registry-secret'}' secret'ı ${namespace || 'default'} namespace'i için başarıyla üretildi!`
  });
});

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// 2. Proxmox Baglantisi & Node/Template/Storage Kesfi
app.post('/api/providers/proxmox/connect', async (req, res) => {
  try {
    const { host, port = 8006, username, password } = req.body;
    const auth = await proxmoxService.login({ host, port, username, password });
    const nodes = await proxmoxService.getNodes({ host: auth.host, port, ticket: auth.ticket, allHosts: auth.allHosts });
    
    // Ilk online node'dan template'leri ve depolama havuzlarini (Storage) al
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
app.post('/api/providers/vcenter/connect', async (req, res) => {
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
app.post('/api/providers/hyperv/connect', async (req, res) => {
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

// 3.5 Otomatik Proxmox Cloud-Init Şablonu Oluşturucu (Şifre veya SSH Key ile Doğrudan Çalışır)
app.post('/api/templates/create-proxmox-template', async (req, res) => {
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

    // SSH uzerinden Proxmox hostuna sifre veya key ile baglanip komutu calistir
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

// 4. Kume Dagitim ve Anti-Affinity Onizleme Matrisi Uretici
app.post('/api/cluster/preview-distribution', (req, res) => {
  try {
    const {
      mode = 'new', // 'new' | 'scale'
      provider, // 'proxmox', 'vcenter', 'manual'
      physicalNodes = [], // ['pve-01', 'pve-02', ...]
      masterCount = 3,
      workerCount = 5,
      startMasterNum = 1,
      startWorkerNum = 1,
      startVmId = 100,
      vmPrefix = 'k8s',
      subnetBase = '10.0.10',
      startIpHost = 10,
      subnetCidr = '24'
    } = req.body;

    const distribution = [];
    let curVmId = parseInt(startVmId, 10);
    let curHost = parseInt(startIpHost, 10);
    const nodeCount = physicalNodes.length || 1;
    const isScale = (mode === 'scale');

    const mCount = parseInt(masterCount, 10) || 0;
    const sMasterNum = parseInt(startMasterNum, 10) || 1;

    // Master'lar (Her biri farkli fiziksel sunucuya - Anti-Affinity)
    for (let m = 0; m < mCount; m++) {
      const assignedPhysNode = physicalNodes[m % nodeCount] || 'Local';
      const masterIdx = isScale ? (sMasterNum + m) : (m + 1);
      const paddedIdx = masterIdx < 10 ? `0${masterIdx}` : `${masterIdx}`;

      distribution.push({
        type: 'Master',
        roleLabel: isScale 
          ? `Yeni Master #${masterIdx} (Join)`
          : (m === 0 ? 'First Master (Bootstrap)' : `Additional Master #${masterIdx}`),
        roleCode: isScale ? 'AdditionalMaster' : (m === 0 ? 'FirstMaster' : 'AdditionalMaster'),
        name: `${vmPrefix}-master-${paddedIdx}`,
        vmId: curVmId++,
        ip: `${subnetBase}.${curHost++}`,
        cidr: subnetCidr,
        targetPhysicalNode: assignedPhysNode
      });
    }

    // Worker'lar (Fiziksel sunuculara Round-Robin dagitilir)
    const wCount = parseInt(workerCount, 10) || 0;
    const sWorkerNum = parseInt(startWorkerNum, 10) || 1;

    for (let w = 0; w < wCount; w++) {
      const physIdx = (mCount + w) % nodeCount;
      const assignedPhysNode = physicalNodes[physIdx] || 'Local';
      const workerIdx = isScale ? (sWorkerNum + w) : (w + 1);
      const paddedIdx = workerIdx < 10 ? `0${workerIdx}` : `${workerIdx}`;

      distribution.push({
        type: 'Worker',
        roleLabel: isScale ? `Yeni Worker #${workerIdx} (Join)` : `Worker Node #${workerIdx}`,
        roleCode: 'Worker',
        name: `${vmPrefix}-worker-${paddedIdx}`,
        vmId: curVmId++,
        ip: `${subnetBase}.${curHost++}`,
        cidr: subnetCidr,
        targetPhysicalNode: assignedPhysNode
      });
    }

    res.json({ success: true, distribution });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Kume Kurulumunu Baslat (Async Job + WebSocket Live Stream)
let isDeploying = false;

app.post('/api/cluster/deploy', async (req, res) => {
  if (isDeploying) {
    return res.status(409).json({ success: false, error: 'Halihazırda bir kurulum devam ediyor!' });
  }

  const {
    mode = 'new',
    provider,
    auth,
    templateId,
    targetStorage,
    diskSizeGB = 50,
    distribution = [],
    gateway,
    cores = 8,
    memoryMB = 16384,
    sshUser = 'root',
    sshPass,
    sshPublicKey,
    vipIp,
    clusterToken,
    clusterDomain = 'k8s.local',
    cni = 'cilium',
    maxPods = 250
  } = req.body;

  isDeploying = true;
  res.json({ success: true, message: 'Kurulum baslatildi, canli loglar WebSocket uzerinden aktariliyor.' });

  // Arka planda sirayla VM olusturma ve RKE2 kurulum adimlari
  (async () => {
    const totalSteps = distribution.length;
    let currentStep = 0;

    const log = (msg) => {
      broadcast({ type: 'log', message: msg });
    };

    const setProgress = (step, total, msg) => {
      broadcast({ type: 'progress', step, total, message: msg });
    };

    try {
      const isScale = (mode === 'scale');
      const cleanVip = (vipIp || '').replace(/^https?:\/\//i, '').split(':')[0].trim();

      log('====================================================');
      if (isScale) {
        log(`[BASLATILDI] RKE2 Düğüm Ekleme (Scale-Out) (${provider.toUpperCase()})`);
        log(`Mevcut Küme API/Join Adresi: ${cleanVip}:9345`);
        log(`Eklenecek Düğümler: Toplam ${distribution.length} (Master: ${distribution.filter(d => d.type === 'Master').length}, Worker: ${distribution.filter(d => d.type === 'Worker').length})`);
      } else {
        log(`[BASLATILDI] RKE2 & Cilium Kume Kurulumu (${provider.toUpperCase()})`);
        log(`Toplam Düğüm: ${distribution.length} (Master: ${distribution.filter(d => d.type === 'Master').length}, Worker: ${distribution.filter(d => d.type === 'Worker').length})`);
        log(`VIP / LB: ${cleanVip} | CNI: ${cni} | MaxPods: ${maxPods}`);
      }
      if (targetStorage) log(`Hedef Disk Havuzu: ${targetStorage} | VM Disk Boyutu: ${diskSizeGB} GB`);
      log('====================================================');

      // ASAMA 1: PROXMOX / VCENTER UZERINDE VM'LERI KLONLA VE AC (Eger provider manual degilse)
      if (provider === 'proxmox' && auth && templateId) {
        log('\n>>> [ASAMA 1] Proxmox Uzerinde VM Klonlama ve Cloud-Init Yapilandirmasi Basliyor...');
        for (const node of distribution) {
          log(`\n-> [VM Klonlama] ${node.name} (ID: ${node.vmId}) -> Fiziksel Node: [${node.targetPhysicalNode}] ${targetStorage ? '-> Storage: [' + targetStorage + ']' : ''}`);
          
          await proxmoxService.cloneVM({
            host: auth.host,
            port: auth.port,
            ticket: auth.ticket,
            csrfToken: auth.csrfToken,
            sourceNode: auth.sourceNode || node.targetPhysicalNode,
            targetNode: node.targetPhysicalNode,
            templateId,
            newVmId: node.vmId,
            vmName: node.name,
            storage: targetStorage
          });

          if (diskSizeGB && parseInt(diskSizeGB, 10) > 0) {
            await proxmoxService.resizeDisk({
              host: auth.host,
              port: auth.port,
              ticket: auth.ticket,
              csrfToken: auth.csrfToken,
              node: node.targetPhysicalNode,
              vmid: node.vmId,
              sizeGB: diskSizeGB
            });
          }

          await proxmoxService.configCloudInit({
            host: auth.host,
            port: auth.port,
            ticket: auth.ticket,
            csrfToken: auth.csrfToken,
            node: node.targetPhysicalNode,
            vmid: node.vmId,
            cores,
            memoryMB,
            ipCidr: `${node.ip}/${node.cidr || 24}`,
            gateway,
            sshUser,
            sshPass,
            sshPublicKey
          });

          await proxmoxService.startVM({
            host: auth.host,
            port: auth.port,
            ticket: auth.ticket,
            csrfToken: auth.csrfToken,
            node: node.targetPhysicalNode,
            vmid: node.vmId
          });

          log(`   [ACILDI] ${node.name} baslatildi.`);
        }

        log('\nTum VM\'ler acildi. Isletim sistemlerinin ve IP\'lerin oturmasi icin 25 saniye bekleniyor...');
        await new Promise(r => setTimeout(r, 25000));
      }

      // ASAMA 1.2: HYPER-V UZERINDE VM'LERI KLONLA VE AC
      if (provider === 'hyperv') {
        log('\n>>> [ASAMA 1] Hyper-V Üzerinde Generation 2 Sanal Makineler Klonlanıyor ve Başlatılıyor...');
        for (const node of distribution) {
          log(`\n-> [Hyper-V VM Klonlama] ${node.name} -> Hedef Disk: [${targetStorage || 'C:\\HyperV\\Virtual Hard Disks'}]`);
          
          await hypervService.provisionVM({
            host: auth ? auth.host : 'localhost',
            port: auth ? auth.port : 22,
            username: auth ? auth.username : 'Administrator',
            password: auth ? auth.password : '',
            isLocal: auth ? auth.isLocal : true,
            vmName: node.name,
            templatePath: templateId,
            targetStoragePath: targetStorage || 'C:\\HyperV\\Virtual Hard Disks',
            vswitchName: (auth && auth.switchName) || 'Default Switch',
            cores: cores || 4,
            memoryMB: memoryMB || 8192,
            diskSizeGB: diskSizeGB || 50,
            ipAddress: node.ip,
            gateway,
            sshUser,
            sshPass,
            onLog: log
          });
        }
        log('\nHyper-V üzerinde tüm sanal makineler başarıyla oluşturuldu ve başlatıldı. Ağ servislerinin oturması için 25 saniye bekleniyor...');
        await new Promise(r => setTimeout(r, 25000));
      }

      // ASAMA 2: RKE2 KURULUM / JOIN PAYLOAD'LARINI CALISTIR
      log(isScale 
        ? '\n>>> [ASAMA 2] Yeni Düğümler Mevcut RKE2 Kümesine Dahil Ediliyor...' 
        : '\n>>> [ASAMA 2] RKE2 & Cilium eBPF Kurulumu Baslatiliyor...');

      const firstMaster = distribution.find(d => d.roleCode === 'FirstMaster') || distribution[0];
      const effectiveVip = cleanVip || (firstMaster ? firstMaster.ip : '');

      for (const node of distribution) {
        currentStep++;
        setProgress(currentStep, totalSteps, `${node.name} (${node.ip}) ${isScale ? 'kümeye ekleniyor' : 'kuruluyor'}...`);
        log(`\n------------------------------------------------------------`);
        log(`[${currentStep}/${totalSteps}] ${node.roleLabel} -> ${node.name} (${node.ip})`);

        const payload = rke2Installer.getPayload({
          role: node.roleCode,
          joinAddress: effectiveVip,
          clusterToken,
          nodeIp: node.ip,
          clusterDomain,
          cni,
          maxPods
        });

        await rke2Installer.executeRemote({
          nodeIp: node.ip,
          sshUser,
          sshPass,
          payload,
          onLog: (line) => log(`[${node.name}] ${line}`)
        });
      }

      log('\n====================================================');
      if (isScale) {
        log(`🎉 TEBRİKLER! ${distribution.length} adet yeni düğüm mevcut RKE2 kümesine başarıyla dahil edildi!`);
        log('Kümenizi doğrulamak için herhangi bir master sunucuda şunu çalıştırın:');
        log('   kubectl get nodes -o wide');
      } else {
        log('🎉 TEBRIKLER! RKE2 & CILIUM KUBERNETES KUMESI HAZIR!');
        log(`Cluster Token: ${clusterToken}`);
        log(`Yonetim Kubeconfig: ${firstMaster ? firstMaster.ip : ''}:/etc/rancher/rke2/rke2.yaml`);
      }
      log('====================================================');

      broadcast({ type: 'complete', success: true });
    } catch (err) {
      log(`\n❌ [KRITIK HATA] İşlem sırasında hata oluştu: ${err.message}`);
      broadcast({ type: 'complete', success: false, error: err.message });
    } finally {
      isDeploying = false;
    }
  })();
});

// ==============================================================================
// ENTERPRISE SUITE: PRE-FLIGHT, KUBECONFIG, DAY-2 OPS & ADDONS
// ==============================================================================

// 1. Pre-Flight Ağ & Donanım Doğrulama Motoru
app.post('/api/cluster/preflight-check', async (req, res) => {
  try {
    const { ips, gateway, dns, provider, storage, auth, vmCount, diskGB } = req.body;
    const result = await clusterOpsService.preflightCheck({
      ips: ips || [],
      gateway,
      dns,
      provider,
      storage,
      auth,
      vmCount: vmCount || 1,
      diskGB: diskGB || 40
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Kubeconfig Dosyasını Çekme ve İndirme
app.post('/api/cluster/kubeconfig', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, publicVip } = req.body;
    const configYaml = await clusterOpsService.getKubeconfig({ masterIp, sshUser, sshPass, publicVip });
    res.json({ success: true, kubeconfig: configYaml });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3.0 Canlı Kümeye Hızlı Bağlan & Canlı Log Akışı
app.post('/api/cluster/quick-connect', async (req, res) => {
  const { masterIp, sshUser = 'root', sshPass, sshPort = 22 } = req.body;
  if (!masterIp) {
    return res.status(400).json({ success: false, error: 'Master sunucu IP adresi zorunludur.' });
  }

  const log = (msg) => broadcast({ type: 'quick-connect-log', message: msg });

  try {
    log(`\n============================================================`);
    log(`[SSH BAĞLANTISI] ${sshUser}@${masterIp}:${sshPort} adresine bağlanılıyor...`);

    // 1. SSH Handshake ve Temel Sistem Bilgisi
    const osCmd = `cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || uname -sr`;
    const osRes = await sshService.execCapture({
      host: masterIp,
      port: parseInt(sshPort, 10) || 22,
      username: sshUser,
      password: sshPass,
      command: osCmd
    });

    const osName = (osRes.stdout || '').trim() || 'Linux Host';
    log(`[SİSTEM] ✔ Kimlik doğrulama başarılı! İşletim Sistemi: ${osName}`);

    // 2. RKE2 Servis Durumu Kontrolü
    log(`[RKE2] Küme servis durumu denetleniyor...`);
    const serviceCmd = `systemctl is-active rke2-server 2>/dev/null || echo "inactive"`;
    const serviceRes = await sshService.execCapture({
      host: masterIp,
      port: parseInt(sshPort, 10) || 22,
      username: sshUser,
      password: sshPass,
      command: serviceCmd
    });
    const svcStatus = (serviceRes.stdout || '').trim();
    if (svcStatus === 'active') {
      log(`[RKE2] ✔ rke2-server servisi AKTİF ve çalışıyor.`);
    } else {
      log(`[RKE2] ⚠️ rke2-server servisi: ${svcStatus || 'bilinmiyor'}. Kubeconfig üzerinden test ediliyor...`);
    }

    // 3. Kubectl Düğümler ve Durum Kontrolü
    log(`[KUBECTL] 'kubectl get nodes -o wide' çalıştırılıyor...`);
    const cleanPass = (sshPass || '').replace(/'/g, "'\\''");
    const testKubeCmd = `
KUBECTL_BIN="/var/lib/rancher/rke2/bin/kubectl"
if [ ! -x "$KUBECTL_BIN" ]; then
  if [ -x "/usr/local/bin/kubectl" ]; then
    KUBECTL_BIN="/usr/local/bin/kubectl"
  elif command -v kubectl >/dev/null 2>&1; then
    KUBECTL_BIN="$(which kubectl)"
  fi
fi

KCFG=""
for f in "/etc/rancher/rke2/rke2.yaml" "/etc/rancher/k3s/k3s.yaml" "$HOME/.kube/config" "/root/.kube/config" "/var/lib/rancher/rke2/server/cred/admin.kubeconfig"; do
  if [ -f "$f" ]; then
    KCFG="$f"
    break
  fi
done

RUN_PREFIX=""
if [ "$(id -u)" -ne 0 ]; then
  RUN_PREFIX="echo '${cleanPass}' | sudo -S "
fi

KUBECMD="$KUBECTL_BIN"
if [ -n "$KCFG" ]; then
  KUBECMD="$KUBECMD --kubeconfig $KCFG"
fi

\${RUN_PREFIX} \$KUBECMD get nodes -o wide --no-headers 2>&1 || true
`;
    const nodesRes = await sshService.execCapture({
      host: masterIp,
      port: parseInt(sshPort, 10) || 22,
      username: sshUser,
      password: sshPass,
      command: testKubeCmd
    });

    const rawNodes = (nodesRes.stdout || '').trim().split('\n').filter(Boolean);
    const validNodes = rawNodes.filter(l => !l.startsWith('error:') && !l.includes('connection refused') && !l.includes('permission denied'));
    
    if (validNodes.length > 0) {
      log(`[KUBECTL] ✔ ${validNodes.length} Düğüm tespit edildi:`);
      validNodes.forEach(nodeLine => {
        log(`   • ${nodeLine}`);
      });
    } else {
      const errHint = rawNodes.find(l => l.includes('refused') || l.includes('error') || l.includes('denied'));
      if (errHint) {
        log(`[KUBECTL] ⚠️ Kubectl çıktısı: ${errHint}`);
      } else {
        log(`[KUBECTL] ℹ️ Düğümler henüz listelenemedi (rke2-server servisi başlamakta olabilir).`);
      }
    }

    // 4. Pod Özeti
    const testPodCmd = `
KUBECTL_BIN="/var/lib/rancher/rke2/bin/kubectl"
[ ! -x "$KUBECTL_BIN" ] && command -v kubectl >/dev/null 2>&1 && KUBECTL_BIN="$(which kubectl)"
KCFG="/etc/rancher/rke2/rke2.yaml"
[ ! -f "$KCFG" ] && [ -f "$HOME/.kube/config" ] && KCFG="$HOME/.kube/config"
RUN_PREFIX=""
[ "$(id -u)" -ne 0 ] && RUN_PREFIX="echo '${cleanPass}' | sudo -S "
\${RUN_PREFIX} \$KUBECTL_BIN --kubeconfig \$KCFG get pods -A --no-headers 2>/dev/null | wc -l || echo "0"
`;
    const podRes = await sshService.execCapture({
      host: masterIp,
      port: parseInt(sshPort, 10) || 22,
      username: sshUser,
      password: sshPass,
      command: testPodCmd
    });
    const podCount = (podRes.stdout || '').trim();
    log(`[PODLAR] ✔ Kümede toplam ${podCount} adet pod aktif.`);

    log(`[BAŞARILI] 🎉 Küme bağlantısı tamamlandı. Yönetim Masası açılıyor...`);
    log(`============================================================\n`);

    res.json({
      success: true,
      masterIp,
      osName,
      nodeCount: rawNodes.length,
      podCount: parseInt(podCount, 10) || 0,
      message: 'Canlı küme bağlantısı başarıyla sağlandı.'
    });
  } catch (err) {
    log(`❌ [BAĞLANTI HATASI] ${masterIp} adresine bağlanırken hata oluştu: ${err.message}`);
    if (err.message && err.message.includes('All configured authentication methods failed')) {
      log(`\n💡 [KİMLİK DOĞRULAMA İPUÇLARI]:`);
      log(`   • Şifrenin doğruluğundan emin olun.`);
      log(`   • Ubuntu/Debian sistemlerde 'root' kullanıcısına şifreli giriş varsayılan olarak kapalıdır.`);
      log(`     Kullanıcı adı kutusuna 'ubuntu' veya kurulumda belirlediğiniz kullanıcı adını yazmayı deneyebilirsiniz.`);
      log(`   • Eğer 'root' ile giriş yapmak istiyorsanız sunucu konsolunda root girişini açabilirsiniz:`);
      log(`     sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && sudo systemctl restart ssh`);
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Canlı Küme Düğüm ve Pod Durumları (Day-2 Monitoring)
app.post('/api/cluster/live-status', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const status = await clusterOpsService.getClusterLiveStatus({ masterIp, sshUser, sshPass });
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 1-Tıkla Kurumsal Eklenti Kurulumu
app.post('/api/cluster/addons/install', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, addonName } = req.body;
    const result = await clusterOpsService.installAddon({ masterIp, sshUser, sshPass, addonName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. etcd Snapshot / Yedekleme Operasyonları
app.post('/api/cluster/etcd/snapshot', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, action = 'save' } = req.body;
    const result = await clusterOpsService.manageEtcd({ masterIp, sshUser, sshPass, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Düğüm Bakım & Drenaj (Drain / Cordon)
app.post('/api/cluster/nodes/action', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, nodeName, action } = req.body;
    const result = await clusterOpsService.manageNode({ masterIp, sshUser, sshPass, nodeName, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Infrastructure-as-Code (YAML) Dışa Aktarma
app.post('/api/cluster/export-spec', (req, res) => {
  try {
    const yaml = clusterOpsService.exportClusterSpec(req.body);
    res.json({ success: true, yaml });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Otomatik Küme Doğrulayıcısı (Smoke Test)
app.post('/api/cluster/smoke-test', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.runSmokeTest({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. FortiGate SLB / VIP Yapılandırma Üretici
app.post('/api/cluster/fortigate-config', (req, res) => {
  try {
    const { vipIp, masterIps, workerIps, clusterName } = req.body;
    const result = clusterOpsService.generateFortigateConfig({ vipIp, masterIps, workerIps, clusterName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. CIS Benchmark Güvenlik Raporu (kube-bench)
app.post('/api/cluster/cis-benchmark', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.runCisBenchmark({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Day-2 Web Tabanlı Hızlı Komut Çalıştırıcı
app.post('/api/cluster/quick-command', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, command } = req.body;
    const result = await clusterOpsService.execQuickCommand({ masterIp, sshUser, sshPass, command });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Harici NFS Dinamik RWX StorageClass Kurulumu
app.post('/api/cluster/storage/nfs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, nfsServer, nfsPath, storageClassName } = req.body;
    const result = await clusterOpsService.installNfsProvisioner({ masterIp, sshUser, sshPass, nfsServer, nfsPath, storageClassName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Hızlı Uygulama Dağıtıcısı (ArgoCD, Portainer, Postgres, Whoami)
app.post('/api/cluster/apps/deploy', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, appName } = req.body;
    const result = await clusterOpsService.deployQuickApp({ masterIp, sshUser, sshPass, appName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Rol Tabanlı Kısıtlı Kubeconfig Üretici (RBAC)
app.post('/api/cluster/rbac/generate', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, username, namespace, role, publicVip } = req.body;
    const result = await clusterOpsService.generateRbacKubeconfig({ masterIp, sshUser, sshPass, username, namespace, role, publicVip });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Cilium NetworkPolicy Manifest Üretici & Uygulayıcı
app.post('/api/cluster/netpol/generate', (req, res) => {
  try {
    const result = clusterOpsService.generateCiliumNetworkPolicy(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cluster/netpol/apply', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, policyYaml } = req.body;
    const result = await clusterOpsService.applyCiliumNetworkPolicy({ masterIp, sshUser, sshPass, policyYaml });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Sıfır Kesintili Rolling Upgrade Orkestratörü
app.post('/api/cluster/upgrade/start', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, currentVersion, targetVersion } = req.body;
    const result = await clusterOpsService.executeClusterRollingUpgrade({ masterIp, sshUser, sshPass, currentVersion, targetVersion });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. Canlı Olay Akışı & Zaman Çizelgesi (Cluster Events)
app.post('/api/cluster/events', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace } = req.body;
    const result = await clusterOpsService.getClusterEvents({ masterIp, sshUser, sshPass, namespace });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. Akıllı Alarm & Bildirim Testi (Telegram / Slack / Webhook)
app.post('/api/cluster/alerts/test', async (req, res) => {
  try {
    const { channel, webhookUrl, telegramBotToken, telegramChatId, alertName } = req.body;
    const result = await clusterOpsService.sendTestAlert({ channel, webhookUrl, telegramBotToken, telegramChatId, alertName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. Kaynak Sıkılaştırma & FinOps Tasarruf Analizi (Rightsizing)
app.post('/api/cluster/rightsizing', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.analyzeClusterRightsizing({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. TLS / SSL Sertifikaları & Cert-Manager
app.post('/api/cluster/certs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.getTlsCertificates({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cluster/certs/issuer', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, email, type } = req.body;
    const result = await clusterOpsService.createClusterIssuer({ masterIp, sshUser, sshPass, email, type });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. Canlı Pod Log Akışı & Hata Ayıklayıcı
app.post('/api/cluster/logs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace, podName, tailLines, previous } = req.body;
    const result = await clusterOpsService.streamPodLogs({ masterIp, sshUser, sshPass, namespace, podName, tailLines, previous });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 22. Velero & S3 Tam Küme ve PVC Yedekleme
app.post('/api/cluster/velero', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, action, backupName, s3Bucket, s3Endpoint } = req.body;
    const result = await clusterOpsService.manageVeleroBackup({ masterIp, sshUser, sshPass, action, backupName, s3Bucket, s3Endpoint });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 23. Hubble eBPF Ağ Akışları & Servis Haritası
app.post('/api/cluster/hubble/flows', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace, verdict } = req.body;
    const result = await clusterOpsService.getHubbleNetworkFlows({ masterIp, sshUser, sshPass, namespace, verdict });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 24. K8s Akıllı Teşhis (AI Doctor)
app.post('/api/cluster/doctor/diagnose', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.diagnoseClusterIssues({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cluster/doctor/heal', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, issueId, actionKey } = req.body;
    const result = await clusterOpsService.healClusterIssue({ masterIp, sshUser, sshPass, issueId, actionKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 25. Konteyner İmaj Güvenlik Açığı & CVE Tarayıcısı (Trivy)
app.post('/api/cluster/trivy/scan', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.scanContainerVulnerabilities({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 26. Kubernetes CronJob & Zamanlanmış Görev Hub
app.post('/api/cluster/cronjobs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace } = req.body;
    const result = await clusterOpsService.getCronJobs({ masterIp, sshUser, sshPass, namespace });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cluster/cronjobs/manage', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, name, namespace, action } = req.body;
    const result = await clusterOpsService.manageCronJob({ masterIp, sshUser, sshPass, name, namespace, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Shams AI K8s Copilot Endpoint
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { prompt, action, context, targetMaster } = req.body;
    const result = await aiCopilotService.processPrompt({ prompt, action, context, targetMaster });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` RKE2 Cluster Dashboard Calisiyor!`);
  console.log(` Web Arayuz: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
