// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Core Application Controller & State
// ==============================================================================

// Global State
let currentStep = 1;
let selectedProvider = 'proxmox';
let operationMode = 'new'; // 'new' | 'scale'
let providerAuth = null;
let discoveredNodes = [];
let clusterDistribution = [];
let ws = null;

let activeClusterMasterIp = '';
let activeClusterVip = '';
let activeSshUser = 'root';
let activeSshPass = '';

document.addEventListener('DOMContentLoaded', () => {
  // Varsayılan olarak Giriş & Karşılama Portalı açılsın
  if (typeof switchGlobalView === 'function') {
    switchGlobalView('portal');
  }

  if (typeof applyProviderUI === 'function') {
    applyProviderUI(selectedProvider);
  }
  if (typeof updateLiveSummary === 'function') {
    updateLiveSummary();
  }
});

// Master IP ve Kimlik Bilgilerini Çözümleyici
function getTargetMasterCredentials() {
  const masterNode = (clusterDistribution && clusterDistribution.find(d => d.type === 'Master')) || (clusterDistribution && clusterDistribution[0]);
  const ip = activeClusterMasterIp || (masterNode ? masterNode.ip : null) || (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : null);
  const user = activeSshUser || (document.getElementById('cfg-ssh-user') ? document.getElementById('cfg-ssh-user').value.trim() : 'root') || 'root';
  const pass = activeSshPass || (document.getElementById('cfg-ssh-pass') ? document.getElementById('cfg-ssh-pass').value : '') || '';
  const vip = activeClusterVip || (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '');
  return { ip, user, pass, vip };
}

// ==============================================================================
// GLOBAL WORKSPACE & PORTAL ROUTING
// ==============================================================================
let currentGlobalWorkspace = 'portal';

function switchGlobalView(mode) {
  currentGlobalWorkspace = mode;
  const portalWs = document.getElementById('workspace-portal');
  const wizardWs = document.getElementById('workspace-wizard');
  const opsWs = document.getElementById('workspace-operations');

  const portalNav = document.getElementById('sidebar-portal-nav');
  const wizardNav = document.getElementById('sidebar-wizard-nav');
  const opsNav = document.getElementById('sidebar-ops-nav');

  const btnPortal = document.getElementById('btn-mode-portal');
  const btnWizard = document.getElementById('btn-mode-wizard');
  const btnOps = document.getElementById('btn-mode-operations');
  const breadcrumb = document.getElementById('breadcrumb-step-title');

  // Mode pill buttons sync
  if (btnPortal) btnPortal.classList.toggle('active', mode === 'portal');
  if (btnWizard) btnWizard.classList.toggle('active', mode === 'wizard');
  if (btnOps) btnOps.classList.toggle('active', mode === 'operations');

  if (mode === 'portal') {
    if (portalWs) portalWs.style.display = 'block';
    if (wizardWs) wizardWs.style.display = 'none';
    if (opsWs) opsWs.style.display = 'none';

    if (portalNav) portalNav.style.display = 'flex';
    if (wizardNav) wizardNav.style.display = 'none';
    if (opsNav) opsNav.style.display = 'none';

    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    if (breadcrumb) breadcrumb.innerText = isEn ? '00 • Launchpad Portal' : '00 • Karşılama & Başlangıç Portalı';
  } else if (mode === 'wizard') {
    if (portalWs) portalWs.style.display = 'none';
    if (wizardWs) wizardWs.style.display = 'block';
    if (opsWs) opsWs.style.display = 'none';

    if (portalNav) portalNav.style.display = 'none';
    if (wizardNav) wizardNav.style.display = 'flex';
    if (opsNav) opsNav.style.display = 'none';

    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    if (breadcrumb) {
      if (typeof operationMode !== 'undefined' && operationMode === 'scale') {
        breadcrumb.innerText = isEn ? '01 • Node Scale-Out' : '01 • Düğüm Ekleme (Scale-Out)';
      } else {
        breadcrumb.innerText = isEn ? '01 • Infra & Setup Mode' : '01 • Altyapı & Kurulum Modu';
      }
    }
  } else {
    // operations
    if (portalWs) portalWs.style.display = 'none';
    if (wizardWs) wizardWs.style.display = 'none';
    if (opsWs) opsWs.style.display = 'block';

    if (portalNav) portalNav.style.display = 'none';
    if (wizardNav) wizardNav.style.display = 'none';
    if (opsNav) opsNav.style.display = 'flex';

    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    if (breadcrumb) breadcrumb.innerText = isEn ? 'Day-2 • Cluster Operations Desk' : 'Day-2 • Küme Operasyon Masası';

    if (typeof updateOpsHeaderBanner === 'function') {
      updateOpsHeaderBanner();
    }
    if (typeof fetchClusterLiveStatus === 'function') {
      fetchClusterLiveStatus();
    }
  }
}

// Portal Action Cards & Mode Entry
function enterAppMode(targetView, subMode) {
  if (subMode && typeof selectOperationMode === 'function') {
    selectOperationMode(subMode);
  }
  if (targetView === 'wizard') {
    if (typeof goToStep === 'function') {
      goToStep(1);
    }
  }
  switchGlobalView(targetView);
}

// Canlı Kümeye Hızlı Bağlan & Operasyon Aç (Gelişmiş Canlı Log & Hata Yakalama)
let quickConnectWs = null;

function appendQuickLog(msg) {
  const content = document.getElementById('portal-quick-log-content');
  if (!content) return;

  const lines = String(msg).split('\n');
  lines.forEach(line => {
    if (!line && lines.length > 1) return;
    const div = document.createElement('div');
    div.className = 'log-line';
    
    if (line.includes('❌') || line.includes('[HATA]') || line.includes('HATASI') || line.includes('hata')) {
      div.className += ' red';
    } else if (line.includes('✔') || line.includes('[BAŞARILI]') || line.includes('🎉') || line.includes('başarılı')) {
      div.className += ' green';
    } else if (line.includes('⚠️') || line.includes('[UYARI]')) {
      div.className += ' yellow';
    } else if (line.includes('[SSH') || line.includes('[SİSTEM]') || line.includes('[RKE2]') || line.includes('[KUBECTL]')) {
      div.className += ' cyan';
    }

    div.innerText = line;
    content.appendChild(div);
  });
  content.scrollTop = content.scrollHeight;
}

function closeQuickLogBox() {
  const box = document.getElementById('portal-quick-log-box');
  if (box) box.style.display = 'none';
}

async function connectAndEnterOps() {
  const ipInput = document.getElementById('portal-quick-ip');
  const userInput = document.getElementById('portal-quick-user');
  const passInput = document.getElementById('portal-quick-pass');
  const btn = document.getElementById('btn-portal-quick-connect');

  const ip = ipInput ? ipInput.value.trim() : '';
  const user = userInput ? (userInput.value.trim() || 'root') : 'root';
  const pass = passInput ? passInput.value : '';

  if (!ip) {
    alert((typeof currentLanguage !== 'undefined' && currentLanguage === 'en')
      ? 'Please specify the Master node IP address.'
      : 'Lütfen bağlanılacak Master sunucu IP adresini girin.');
    if (ipInput) ipInput.focus();
    return;
  }

  // Durum ve Terminali Aç
  const box = document.getElementById('portal-quick-log-box');
  const title = document.getElementById('portal-quick-log-title');
  const statusBadge = document.getElementById('portal-quick-log-status');
  const content = document.getElementById('portal-quick-log-content');

  if (box) box.style.display = 'block';
  if (title) title.innerText = `ssh: ${user}@${ip}:22`;
  if (statusBadge) {
    statusBadge.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? 'Connecting...' : 'Bağlanılıyor...';
    statusBadge.style.color = '#38BDF8';
  }
  if (content) content.innerHTML = '';

  if (btn) {
    btn.disabled = true;
    btn.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? '⏳ Connecting...' : '⏳ Bağlanılıyor...';
  }

  appendQuickLog(`[SYSTEM] Canlı bağlantı testi başlatılıyor: ${user}@${ip}:22`);

  // WebSocket Dinleyicisi Hazırla
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  try {
    if (!quickConnectWs || quickConnectWs.readyState !== 1) {
      quickConnectWs = new WebSocket(`${protocol}//${window.location.host}`);
    }
    quickConnectWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'quick-connect-log') {
          appendQuickLog(data.message);
        }
      } catch {}
    };
  } catch (e) {
    console.warn('WebSocket connect error:', e);
  }

  try {
    const res = await fetch('/api/cluster/quick-connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Bağlantı kurulamadı.');
    }

    if (statusBadge) {
      statusBadge.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? 'Connected' : 'Bağlandı';
      statusBadge.style.color = '#34D399';
    }

    activeClusterMasterIp = ip;
    activeSshUser = user;
    if (pass) activeSshPass = pass;

    appendQuickLog(`\n✔ [BAŞARILI] Canlı yönetim masasına yönlendiriliyorsunuz (Düğümler: ${data.nodeCount}, Podlar: ${data.podCount})...`);

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? '⚡ Connect & Open Live' : '⚡ Doğrudan Bağlan & Aç';
      }
      switchGlobalView('operations');
    }, 1200);

  } catch (err) {
    appendQuickLog(`\n❌ [BAĞLANTI BAŞARISIZ] ${err.message}`);
    appendQuickLog(`💡 İpucu: Sunucunun açık olduğundan, SSH servisinin dinlediğinden ve şifrenin doğru olduğundan emin olun.`);
    
    if (statusBadge) {
      statusBadge.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? 'Failed' : 'Başarısız';
      statusBadge.style.color = '#EF4444';
    }
    if (btn) {
      btn.disabled = false;
      btn.innerText = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') ? '⚡ Tekrar Dene' : '⚡ Tekrar Dene';
    }
  }
}

// Global Workspace Geçişi (Kurulum Sihirbazı, Operasyon Masası veya Giriş Portalı)
function switchGlobalWorkspace(workspaceName) {
  return switchGlobalView(workspaceName);
}
