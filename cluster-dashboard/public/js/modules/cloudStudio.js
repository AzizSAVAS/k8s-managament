// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Cloud Studio & Next-Gen Suite Module
// 1. In-Browser Live K8s YAML IDE
// 2. Pod File Explorer & Transfer
// 3. Autoscaling Studio & HPA Simulator
// 4. Secure Secret & ConfigMap Vault
// 5. FinOps Cloud Cost & ROI Calculator
// 6. Multi-Cluster Failover & GSLB Simulator
// ==============================================================================

// -------------------------------------------------------------
// 1. IN-BROWSER LIVE YAML IDE
// -------------------------------------------------------------
const YAML_TEMPLATES = {
  deployment: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-enterprise-app
  namespace: default
  labels:
    app: sample-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-app
  template:
    metadata:
      labels:
        app: sample-app
    spec:
      containers:
      - name: web
        image: nginx:1.25-alpine
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
          requests:
            cpu: "100m"
            memory: "64Mi"
`,
  service: `apiVersion: v1
kind: Service
metadata:
  name: sample-enterprise-svc
  namespace: default
spec:
  type: ClusterIP
  selector:
    app: sample-app
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
`,
  ingress: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-enterprise-ingress
  namespace: default
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  rules:
  - host: app.shamssoftware.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sample-enterprise-svc
            port:
              number: 80
`,
  configmap: `apiVersion: v1
kind: ConfigMap
metadata:
  name: sample-enterprise-config
  namespace: default
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  MAX_CLIENTS: "2500"
`
};

function loadYamlTemplate(type) {
  const editor = document.getElementById('yaml-ide-editor');
  if (editor && YAML_TEMPLATES[type]) {
    editor.value = YAML_TEMPLATES[type];
  }
}

async function applyYamlManifest(dryRun = false) {
  const editor = document.getElementById('yaml-ide-editor');
  const logBox = document.getElementById('yaml-ide-output');
  const btn = document.getElementById(dryRun ? 'btn-yaml-dryrun' : 'btn-yaml-apply');

  if (!editor || !editor.value.trim()) {
    alert('Lütfen uygulanacak YAML manifestini giriniz.');
    return;
  }

  if (logBox) {
    logBox.style.display = 'block';
    logBox.innerHTML = '<span class="btn-spinner" style="display:inline-block; margin-right:6px;"></span> Küme ile senkronize ediliyor...';
  }

  const { ip, user, pass } = (typeof getTargetMasterCredentials === 'function')
    ? getTargetMasterCredentials()
    : { ip: '', user: '', pass: '' };

  try {
    const res = await fetch('/api/cluster/manifest/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        yamlContent: editor.value,
        dryRun,
        masterIp: ip,
        sshUser: user,
        sshPass: pass
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || data.output);

    if (logBox) {
      logBox.style.color = '#38BDF8';
      logBox.innerText = `[KUBECTL ÇIKTISI]\n${data.output}`;
    }
  } catch (err) {
    if (logBox) {
      logBox.style.color = '#EF4444';
      logBox.innerText = `[HATA] ${err.message}`;
    }
  }
}

// -------------------------------------------------------------
// 2. POD FILE EXPLORER
// -------------------------------------------------------------
async function fetchPodFiles(path = '/app') {
  const container = document.getElementById('pod-files-list');
  const podName = document.getElementById('pod-file-target-select')?.value || 'core-backend-api-pod';
  const pathInput = document.getElementById('pod-file-current-path');

  if (pathInput) pathInput.value = path;
  if (!container) return;

  container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--text-muted);">Pod dosya sistemi taranıyor...</td></tr>';

  try {
    const res = await fetch(`/api/cluster/pod/files?podName=${encodeURIComponent(podName)}&path=${encodeURIComponent(path)}`);
    const data = await res.json();
    if (!data.success) throw new Error('Dosyalar listelenemedi');

    renderPodFiles(data.items, path);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#EF4444;">Hata: ${err.message}</td></tr>`;
  }
}

function renderPodFiles(files, currentPath) {
  const container = document.getElementById('pod-files-list');
  if (!container) return;
  container.innerHTML = '';

  files.forEach(f => {
    const isDir = f.type === 'dir';
    const icon = isDir ? '📁' : '📄';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-size:1rem; margin-right:6px;">${icon}</span><strong>${f.name}</strong></td>
      <td><span class="role-tag ${isDir ? 'info' : 'violet'}">${f.type.toUpperCase()}</span></td>
      <td><code>${f.size}</code></td>
      <td><code style="color:var(--text-dim);">${f.permissions}</code></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="${isDir ? `fetchPodFiles('${currentPath}/${f.name}')` : `viewPodFile('${currentPath}/${f.name}')`}">
          ${isDir ? '📂 Klasörü Aç' : '👁️ Görüntüle'}
        </button>
      </td>
    `;
    container.appendChild(tr);
  });
}

async function viewPodFile(filePath) {
  try {
    const res = await fetch(`/api/cluster/pod/files?action=read&path=${encodeURIComponent(filePath)}`);
    const data = await res.json();
    alert(`📄 DOSYA İÇERİĞİ: ${filePath}\n\n${data.content}`);
  } catch (err) {
    alert(`Dosya okuma hatası: ${err.message}`);
  }
}

// -------------------------------------------------------------
// 3. AUTOSCALING STUDIO & HPA SIMULATOR
// -------------------------------------------------------------
async function runHpaSimulation() {
  const minR = parseInt(document.getElementById('hpa-min-replicas')?.value || 2, 10);
  const maxR = parseInt(document.getElementById('hpa-max-replicas')?.value || 8, 10);
  const cpuT = parseInt(document.getElementById('hpa-target-cpu')?.value || 70, 10);
  const ramT = parseInt(document.getElementById('hpa-target-ram')?.value || 80, 10);
  const timelineBox = document.getElementById('hpa-timeline-results');
  const yamlBox = document.getElementById('hpa-generated-yaml');

  if (timelineBox) {
    timelineBox.innerHTML = '<div style="padding:20px; color:var(--text-muted);"><span class="btn-spinner" style="display:inline-block; margin-right:8px;"></span> Trafik dalgası enjekte ediliyor, HPA tepki matrisi hesaplanıyor...</div>';
  }

  try {
    const res = await fetch('/api/cluster/hpa/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ minReplicas: minR, maxReplicas: maxR, targetCpu: cpuT, targetRam: ramT })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Simülasyon yürütülemedi');

    if (timelineBox) {
      let html = '<div class="events-timeline-wrap">';
      data.simulation.forEach(item => {
        html += `
          <div class="timeline-event-card normal">
            <div class="event-card-header">
              <span class="event-obj-badge">${item.time} • Replika: <strong style="color:#38BDF8;">${item.replicas} Pod</strong></span>
              <span class="role-tag violet">${item.load}</span>
            </div>
            <div class="event-card-msg">${item.status}</div>
          </div>
        `;
      });
      html += '</div>';
      timelineBox.innerHTML = html;
    }

    if (yamlBox) {
      yamlBox.innerText = data.hpaYaml;
      yamlBox.style.display = 'block';
    }
  } catch (err) {
    if (timelineBox) timelineBox.innerHTML = `<div style="color:#EF4444;">Hata: ${err.message}</div>`;
  }
}

// -------------------------------------------------------------
// 4. SECURE SECRETS & CONFIGMAP VAULT
// -------------------------------------------------------------
async function fetchVaultSecrets() {
  const container = document.getElementById('secrets-vault-list');
  if (!container) return;

  container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Güvenli kasa taranıyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/vault/secrets');
    const data = await res.json();
    if (!data.success) throw new Error('Kasa verisi alınamadı');

    renderVaultSecrets(data.items);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#EF4444;">Hata: ${err.message}</td></tr>`;
  }
}

function renderVaultSecrets(items) {
  const container = document.getElementById('secrets-vault-list');
  if (!container) return;
  container.innerHTML = '';

  items.forEach(sec => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>🔒 ${sec.name}</strong></td>
      <td><span class="role-tag ${sec.type === 'ConfigMap' ? 'info' : 'violet'}">${sec.type}</span></td>
      <td><code>${sec.namespace}</code></td>
      <td><span style="font-size:0.75rem; color:#93C5FD;">${sec.keys.join(', ')}</span></td>
      <td><span class="status-badge active">${sec.masked ? '•••• Encrypted' : 'Plaintext'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="alert('Secret: ${sec.name}\\n\\nAnahtarlar: ${sec.keys.join(', ')}\\nDurum: Güvenli Base64 Korumalı\\nNamespace: ${sec.namespace}')">
          👁️ Göster
        </button>
      </td>
    `;
    container.appendChild(tr);
  });
}

// -------------------------------------------------------------
// 5. FINOPS CLOUD COST & ROI CALCULATOR
// -------------------------------------------------------------
async function calculateFinOpsSavings() {
  const vcpu = document.getElementById('finops-input-vcpu')?.value || 48;
  const ram = document.getElementById('finops-input-ram')?.value || 96;
  const storage = document.getElementById('finops-input-storage')?.value || 1500;

  try {
    const res = await fetch(`/api/cluster/finops/cost-comparison?vcpu=${vcpu}&ramGb=${ram}&storageGb=${storage}`);
    const data = await res.json();
    if (!data.success) throw new Error('Maliyet analizi hesaplanamadı');

    document.getElementById('cost-aws-val').innerText = `$${data.costs.awsEks.toLocaleString()} / ay`;
    document.getElementById('cost-azure-val').innerText = `$${data.costs.azureAks.toLocaleString()} / ay`;
    document.getElementById('cost-gcp-val').innerText = `$${data.costs.googleGke.toLocaleString()} / ay`;
    document.getElementById('cost-onprem-val').innerText = `$${data.costs.onPremRke2} / ay`;

    document.getElementById('finops-annual-savings').innerText = `$${data.savings.annual.toLocaleString()} / YIL`;
    document.getElementById('finops-monthly-savings').innerText = `$${data.savings.monthly.toLocaleString()} / ay tasarruf`;
    document.getElementById('finops-roi-badge').innerText = `%${data.savings.roiPercentage} ROI`;
  } catch (err) {
    console.error('Finops error:', err);
  }
}

// -------------------------------------------------------------
// 6. MULTI-CLUSTER DR & GSLB FAILOVER SIMULATOR
// -------------------------------------------------------------
async function runClusterFailoverTest() {
  const targetSelect = document.getElementById('failover-target-cluster');
  const secondary = targetSelect ? targetSelect.value : 'DR-HyperV-Cluster';
  const reportBox = document.getElementById('failover-report-card');
  const reportBody = document.getElementById('failover-report-body');

  if (reportBox) reportBox.style.display = 'block';
  if (reportBody) {
    reportBody.innerHTML = '<div style="padding:16px; color:var(--text-muted);"><span class="btn-spinner" style="display:inline-block; margin-right:8px;"></span> GSLB DNS ağırlıkları güncelleniyor, trafik aktarılıyor...</div>';
  }

  try {
    const res = await fetch('/api/cluster/failover/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secondaryCluster: secondary, trafficShiftPct: 100 })
    });

    const data = await res.json();
    if (!data.success) throw new Error('Failover gerçekleştirilemedi');

    const rep = data.failoverReport;
    if (reportBody) {
      reportBody.innerHTML = `
        <div class="chaos-report-box" style="border-left-color:#38BDF8;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h4 style="font-size:0.95rem; font-weight:700; color:#fff;">🌐 Global Yük Aktarımı Başarılı: ${rep.target}</h4>
            <span class="role-tag success">GSLB AKTİF</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted); line-height:1.7;">
            <div>• <strong>Aktarılan Trafik:</strong> <strong style="color:#38BDF8;">${rep.shiftedTraffic}</strong></div>
            <div>• <strong>DNS TTL Yayılma Hızı:</strong> <strong style="color:#10B981;">${rep.dnsTtlSeconds} saniye</strong></div>
            <div>• <strong>GSLB Ağ Gecikmesi:</strong> ${rep.gslbLatencyMs} ms</div>
            <div>• <strong>Oturum Devamlılığı (Sticky Sessions):</strong> ${rep.sessionsPreserved}</div>
            <div>• <strong>Yüksek Erişilebilirlik Skoru:</strong> <strong style="color:#34D399;">${rep.slaScore}</strong></div>
          </div>
        </div>
      `;
    }
  } catch (err) {
    if (reportBody) reportBody.innerHTML = `<div style="color:#EF4444;">Hata: ${err.message}</div>`;
  }
}

// Global Window Exports
window.loadYamlTemplate = loadYamlTemplate;
window.applyYamlManifest = applyYamlManifest;
window.fetchPodFiles = fetchPodFiles;
window.viewPodFile = viewPodFile;
window.runHpaSimulation = runHpaSimulation;
window.fetchVaultSecrets = fetchVaultSecrets;
window.calculateFinOpsSavings = calculateFinOpsSavings;
window.runClusterFailoverTest = runClusterFailoverTest;
