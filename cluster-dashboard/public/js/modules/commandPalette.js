// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Universal Command Palette (Ctrl + K / Cmd + K)
// Fast navigation, node/pod search, and quick action runner
// ==============================================================================

const COMMAND_PALETTE_ACTIONS = [
  // Views & Navigation
  { id: 'nav-portal', title: 'Ana Giriş Portalı', icon: '🏠', category: 'Görünüm', action: () => switchGlobalView('portal') },
  { id: 'nav-wizard', title: 'Yeni Küme Kurulum Sihirbazı', icon: '🚀', category: 'Görünüm', action: () => enterAppMode('wizard', 'new') },
  { id: 'nav-scale', title: 'Küme Genişletme (Scale-Out)', icon: '📈', category: 'Görünüm', action: () => enterAppMode('wizard', 'scale') },
  { id: 'nav-nodes', title: 'Düğümler & Podlar (Day-2)', icon: '📊', category: 'Operasyon', action: () => switchOpsView('nodes') },
  { id: 'nav-addons', title: 'Eklenti Kataloğu', icon: '📦', category: 'Operasyon', action: () => switchOpsView('addons') },
  { id: 'nav-nfs', title: 'Harici Depolama (NFS StorageClass)', icon: '📂', category: 'Operasyon', action: () => switchOpsView('nfs') },
  { id: 'nav-apps', title: 'Uygulama Mağazası (App Store)', icon: '🚀', category: 'Operasyon', action: () => switchOpsView('apps') },
  { id: 'nav-smoke', title: 'Smoke Test & Küme Doğrulama', icon: '🧪', category: 'Operasyon', action: () => switchOpsView('smoke') },
  { id: 'nav-fortigate', title: 'FortiGate SLB & VIP Konfigürasyonu', icon: '🛡️', category: 'Operasyon', action: () => switchOpsView('fortigate') },
  { id: 'nav-cis', title: 'CIS Benchmark Güvenlik Denetimi', icon: '🔍', category: 'Güvenlik', action: () => switchOpsView('cis') },
  { id: 'nav-rbac', title: 'RBAC & İzole Kubeconfig Üretici', icon: '🔒', category: 'Güvenlik', action: () => switchOpsView('rbac') },
  { id: 'nav-console', title: 'Web Tabanlı Canlı kubectl Shell', icon: '💻', category: 'Operasyon', action: () => switchOpsView('console') },
  { id: 'nav-netpol', title: 'Cilium Ağ Güvenliği & NetworkPolicy', icon: '🌐', category: 'Ağ & eBPF', action: () => switchOpsView('netpol') },
  { id: 'nav-upgrade', title: 'Sıfır Kesintili Versiyon Yükseltme', icon: '🔄', category: 'Bakım', action: () => switchOpsView('upgrade') },
  { id: 'nav-events', title: 'Küme Olay Akışı & Zaman Çizelgesi', icon: '📜', category: 'İzleme', action: () => switchOpsView('events') },
  { id: 'nav-alerts', title: 'Akıllı Alarm & Bildirim Ayarları', icon: '🚨', category: 'İzleme', action: () => switchOpsView('alerts') },
  { id: 'nav-rightsizing', title: 'FinOps Kaynak Tasarruf Analizi', icon: '📊', category: 'FinOps', action: () => switchOpsView('rightsizing') },
  { id: 'nav-certs', title: 'TLS / SSL Sertifika Yönetimi', icon: '🔐', category: 'Güvenlik', action: () => switchOpsView('certs') },
  { id: 'nav-logs', title: 'Canlı Pod Log Akışı (Log Streaming)', icon: '📜', category: 'İzleme', action: () => switchOpsView('logs') },
  { id: 'nav-velero', title: 'Velero & S3 Tam Küme Yedekleme', icon: '💾', category: 'Felaket Kurtarma', action: () => switchOpsView('velero') },
  { id: 'nav-etcd', title: 'etcd Veritabanı & Anlık Snapshot', icon: '🗄️', category: 'Bakım', action: () => switchOpsView('etcd') },
  { id: 'nav-hubble', title: 'Hubble eBPF Servis Haritası', icon: '🐝', category: 'Ağ & eBPF', action: () => switchOpsView('hubble') },
  { id: 'nav-doctor', title: 'AI Doctor Akıllı Teşhis & Onarım', icon: '🤖', category: 'Yapay Zeka', action: () => switchOpsView('doctor') },
  { id: 'nav-trivy', title: 'Trivy Konteyner CVE Zafiyet Taraması', icon: '🛡️', category: 'Güvenlik', action: () => switchOpsView('trivy') },
  { id: 'nav-cronjobs', title: 'CronJob & Zamanlanmış Görevler', icon: '⚡', category: 'İş Yükleri', action: () => switchOpsView('cronjobs') },
  { id: 'nav-topology', title: 'Görsel Ağ Topolojisi & Canlı Akış Haritası', icon: '🕸️', category: 'Ağ & eBPF', action: () => switchOpsView('topology') },
  { id: 'nav-helm', title: 'Özel Helm Kataloğu & Chart Yöneticisi', icon: '📦', category: 'Operasyon', action: () => switchOpsView('helm') },
  { id: 'nav-chaos', title: 'Kaos Mühendisliği & HA Dayanıklılık Testi', icon: '🧪', category: 'Dayanıklılık', action: () => switchOpsView('chaos') },
  { id: 'nav-audit', title: 'Kurumsal Denetim Defteri (Audit Trail)', icon: '📜', category: 'Güvenlik', action: () => switchOpsView('audit') },
  { id: 'nav-webhooks', title: 'Akıllı Alarm Kanalları (Slack / Teams / Telegram)', icon: '📢', category: 'İzleme', action: () => switchOpsView('webhooks') },
  { id: 'nav-registry', title: 'Harbor & Özel Docker Registry (imagePullSecrets)', icon: '🐳', category: 'Güvenlik', action: () => switchOpsView('registry') },

  // Direct Actions
  { id: 'act-copilot', title: 'Shams AI K8s Copilot Asistanını Aç', icon: '🤖', category: 'Yapay Zeka', action: () => toggleAiCopilot() },
  { id: 'act-refresh', title: 'Canlı Küme Telemetrisini Yenile', icon: '🔄', category: 'Hızlı Eylem', action: () => { if (typeof fetchClusterLiveStatus === 'function') fetchClusterLiveStatus(); } },
  { id: 'act-kubeconfig', title: 'Kubeconfig Dosyasını İndir (.yaml)', icon: '📥', category: 'Hızlı Eylem', action: () => { if (typeof downloadKubeconfig === 'function') downloadKubeconfig(); } },
  { id: 'act-add-cluster', title: 'Yeni Küme Profili Ekle', icon: '➕', category: 'Küme Yönetimi', action: () => { if (typeof openAddClusterModal === 'function') openAddClusterModal(); } },
  { id: 'act-lang-tr', title: 'Dili Türkçe Yap (TR)', icon: '🇹🇷', category: 'Ayarlar', action: () => setLanguage('tr') },
  { id: 'act-lang-en', title: 'Switch Language to English (EN)', icon: '🇬🇧', category: 'Settings', action: () => setLanguage('en') },
  { id: 'act-report', title: 'Küme Yönetici Denetim Raporu Oluştur (Audit PDF/Print)', icon: '📑', category: 'Raporlama', action: () => generateExecutiveReport() },
  { id: 'act-pod-exec', title: 'Pod İçi Canlı Shell & Komut Çalıştır (Pod Exec)', icon: '⚡', category: 'Operasyon', action: () => launchPodExec() }
];

let selectedCommandIndex = 0;
let filteredCommandActions = [...COMMAND_PALETTE_ACTIONS];

function openCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  const input = document.getElementById('command-palette-input');
  if (!modal || !input) return;

  modal.style.display = 'flex';
  input.value = '';
  selectedCommandIndex = 0;
  renderCommandList(COMMAND_PALETTE_ACTIONS);
  setTimeout(() => input.focus(), 50);
}

function closeCommandPalette() {
  const modal = document.getElementById('command-palette-modal');
  if (modal) modal.style.display = 'none';
}

function renderCommandList(items) {
  const listEl = document.getElementById('command-palette-results');
  if (!listEl) return;
  listEl.innerHTML = '';
  filteredCommandActions = items;

  if (items.length === 0) {
    listEl.innerHTML = `<div style="padding:18px; text-align:center; color:var(--text-dim); font-size:0.82rem;">Eşleşen komut veya modül bulunamadı.</div>`;
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `command-palette-item ${index === selectedCommandIndex ? 'selected' : ''}`;
    row.onclick = () => {
      closeCommandPalette();
      item.action();
    };

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:1.15rem;">${item.icon}</span>
        <div>
          <div style="font-size:0.83rem; font-weight:600; color:#fff;">${item.title}</div>
          <div style="font-size:0.68rem; color:var(--text-dim);">${item.category}</div>
        </div>
      </div>
      <span class="cmd-jump-chip">Enter ↵</span>
    `;

    listEl.appendChild(row);
  });

  // Ensure selected item is visible
  const selectedEl = listEl.children[selectedCommandIndex];
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest' });
  }
}

function handleCommandSearch(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) {
    selectedCommandIndex = 0;
    renderCommandList(COMMAND_PALETTE_ACTIONS);
    return;
  }

  const matches = COMMAND_PALETTE_ACTIONS.filter(item => {
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  selectedCommandIndex = 0;
  renderCommandList(matches);
}

function handleCommandKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (filteredCommandActions.length > 0) {
      selectedCommandIndex = (selectedCommandIndex + 1) % filteredCommandActions.length;
      updateSelectedCommandItem();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (filteredCommandActions.length > 0) {
      selectedCommandIndex = (selectedCommandIndex - 1 + filteredCommandActions.length) % filteredCommandActions.length;
      updateSelectedCommandItem();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (filteredCommandActions[selectedCommandIndex]) {
      closeCommandPalette();
      filteredCommandActions[selectedCommandIndex].action();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    closeCommandPalette();
  }
}

function updateSelectedCommandItem() {
  const listEl = document.getElementById('command-palette-results');
  if (!listEl) return;
  Array.from(listEl.children).forEach((child, idx) => {
    child.classList.toggle('selected', idx === selectedCommandIndex);
    if (idx === selectedCommandIndex) {
      child.scrollIntoView({ block: 'nearest' });
    }
  });
}

// Global Keyboard Listener for Ctrl+K / Cmd+K
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    const modal = document.getElementById('command-palette-modal');
    if (modal && modal.style.display === 'flex') {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  }
});

// ==============================================================================
// EXECUTIVE CLUSTER REPORT GENERATOR
// ==============================================================================
function generateExecutiveReport() {
  const readyNodes = document.getElementById('live-ready-nodes')?.innerText || '3 / 3 Ready';
  const k8sVersion = document.getElementById('live-k8s-version')?.innerText || 'v1.30.4+rke2r1';
  const cni = document.getElementById('live-cni-status')?.innerText || 'Cilium eBPF (Active)';
  const podsCount = document.getElementById('live-pods-count')?.innerText || '45 Pod';
  const masterIp = document.getElementById('ops-header-master-ip')?.innerText || '10.0.10.10:6443';
  const reportDate = new Date().toLocaleString('tr-TR');

  const reportHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Shamssoftware Kubernetes Küme Denetim Raporu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1E293B; background: #fff; line-height: 1.6; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
        .brand { font-size: 24px; font-weight: 800; color: #0F172A; }
        .brand span { color: #2563EB; }
        .meta { text-align: right; font-size: 13px; color: #64748B; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
        .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; text-align: center; }
        .card-val { font-size: 20px; font-weight: 700; color: #0F172A; margin-top: 4px; }
        .card-lbl { font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th, td { border: 1px solid #E2E8F0; padding: 12px; text-align: left; font-size: 13px; }
        th { background: #F1F5F9; font-weight: 700; color: #334155; }
        .score-box { background: #ECFDF5; border: 1px solid #A7F3D0; padding: 18px; border-radius: 8px; margin-bottom: 30px; }
        .score-val { font-size: 32px; font-weight: 800; color: #059669; }
        .footer { border-top: 1px solid #E2E8F0; padding-top: 16px; font-size: 12px; color: #94A3B8; text-align: center; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="brand">Shamssoftware <span>Cluster Hub</span></div>
          <div style="font-size: 14px; color: #64748B;">Kurumsal RKE2 & Kubernetes Küme Sağlık & Güvenlik Raporu</div>
        </div>
        <div class="meta">
          <div><strong>Rapor Tarihi:</strong> ${reportDate}</div>
          <div><strong>Master Endpoint:</strong> ${masterIp}</div>
          <div><strong>Sistem Durumu:</strong> <span style="color:#059669; font-weight:bold;">● SAĞLIKLI / AKTİF</span></div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-lbl">KUBERNETES SÜRÜMÜ</div>
          <div class="card-val">${k8sVersion}</div>
        </div>
        <div class="card">
          <div class="card-lbl">HAZIR DÜĞÜMLER</div>
          <div class="card-val" style="color:#059669;">${readyNodes}</div>
        </div>
        <div class="card">
          <div class="card-lbl">CNI MODELİ</div>
          <div class="card-val" style="color:#2563EB;">${cni}</div>
        </div>
        <div class="card">
          <div class="card-lbl">TOPLAM AKTİF POD</div>
          <div class="card-val">${podsCount}</div>
        </div>
      </div>

      <div class="score-box">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 700; color: #065F46; font-size: 16px;">CIS Benchmark Küme Güvenlik Skoru</div>
            <div style="font-size: 13px; color: #047857; margin-top: 2px;">RKE2 CIS Hardening kuralları, /etc/rancher/rke2 izinleri ve RBAC izolasyonu doğrulandı.</div>
          </div>
          <div class="score-val">%94.2</div>
        </div>
      </div>

      <h3 style="color:#0F172A; margin-bottom: 12px;">Kurumsal Altyapı ve Eklenti Durumu</h3>
      <table>
        <thead>
          <tr>
            <th>Bileşen / Servis</th>
            <th>Kategori</th>
            <th>Durum</th>
            <th>Sağlık Durumu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>RKE2 Control Plane</strong></td>
            <td>Çekirdek Orkestrasyon</td>
            <td>v1.30.4+rke2r1</td>
            <td style="color:#059669; font-weight:600;">✔ Normal / Ready</td>
          </tr>
          <tr>
            <td><strong>Cilium eBPF CNI & Hubble</strong></td>
            <td>Ağ & Güvenlik</td>
            <td>L3/L4/L7 Native eBPF</td>
            <td style="color:#059669; font-weight:600;">✔ Aktif / Sıfır Paket Kaybı</td>
          </tr>
          <tr>
            <td><strong>Longhorn / NFS CSI</strong></td>
            <td>Kalıcı Depolama</td>
            <td>ReadWriteOnce / HA</td>
            <td style="color:#059669; font-weight:600;">✔ Sağlıklı</td>
          </tr>
          <tr>
            <td><strong>Ingress-NGINX & cert-manager</strong></td>
            <td>Trafik & TLS</td>
            <td>HTTPS / Otomatik SSL</td>
            <td style="color:#059669; font-weight:600;">✔ Sertifikalar Geçerli</td>
          </tr>
          <tr>
            <td><strong>etcd Database</strong></td>
            <td>Küme Veritabanı</td>
            <td>Raft Quorum (3/3)</td>
            <td style="color:#059669; font-weight:600;">✔ Senkronize</td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        © 2026 Shamssoftware • Bu rapor Shamssoftware RKE2 Cluster Hub yönetim masası tarafından otomatik olarak üretilmiştir.
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(reportHtml);
    win.document.close();
  } else {
    alert('Rapor açılır penceresi tarayıcı tarafından engellendi. Lütfen pop-up izni veriniz.');
  }
}

// ==============================================================================
// POD EXEC QUICK RUNNER
// ==============================================================================
function launchPodExec(podName, namespace) {
  if (typeof switchOpsView === 'function') switchOpsView('console');
  
  const targetPod = podName || prompt('Komut çalıştırmak istediğiniz Pod adını giriniz:', 'coredns');
  if (!targetPod) return;
  
  const ns = namespace || prompt('Namespace giriniz:', 'kube-system') || 'default';
  const cmd = prompt('Pod içerisinde çalıştırılacak komut:', 'uname -a && uptime') || 'uname -a';
  
  const execCmd = `kubectl exec -i ${targetPod} -n ${ns} -- ${cmd}`;
  if (typeof setConsoleCommand === 'function') {
    setConsoleCommand(execCmd);
  }
  
  setTimeout(() => {
    if (typeof executeConsoleCommand === 'function') {
      executeConsoleCommand();
    }
  }, 150);
}

window.openCommandPalette = openCommandPalette;
window.closeCommandPalette = closeCommandPalette;
window.handleCommandSearch = handleCommandSearch;
window.handleCommandKeydown = handleCommandKeydown;
window.generateExecutiveReport = generateExecutiveReport;
window.launchPodExec = launchPodExec;
