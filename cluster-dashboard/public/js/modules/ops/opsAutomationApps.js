// ==============================================================================

// OPERATIONS SUBMODULE: WORKLOADS, APPS, UPGRADES, HEALING DOCTOR & AUTOMATION

// ==============================================================================

// 1. PRE-FLIGHT KONTROLÜ
async function runPreflightCheck() {
  const panel = document.getElementById('preflight-results-panel');
  const btn = document.getElementById('btn-preflight');
  const icon = document.getElementById('preflight-main-icon');
  const title = document.getElementById('preflight-main-title');
  const desc = document.getElementById('preflight-main-desc');
  const grid = document.getElementById('preflight-grid-content');

  if (!panel || !btn) return;
  panel.style.display = 'block';
  btn.disabled = true;
  btn.innerText = '⏳ Taranıyor...';

  icon.innerText = '🔄';
  title.innerText = 'Pre-Flight Kontrolleri Yürütülüyor...';
  desc.innerText = 'Tüm hedef IP\'ler, Gateway ve Sanallaştırma depolama havuzları taranıyor.';
  grid.innerHTML = '<div style="padding:20px; color:var(--text-muted); font-size:0.85rem;">Hedef IP adreslerine ICMP ping paketleri gönderiliyor...</div>';

  const ips = (clusterDistribution || []).map(d => ({ name: d.name, ip: d.ip, role: d.type }));
  const gateway = document.getElementById('cfg-gateway') ? document.getElementById('cfg-gateway').value.trim() : '';
  const vipIp = document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '';
  if (vipIp) {
    ips.push({ name: 'FortiGate / VIP', ip: vipIp, role: 'VIP' });
  }

  const vmCount = (clusterDistribution || []).length;
  const diskGB = document.getElementById('cfg-disk') ? parseInt(document.getElementById('cfg-disk').value, 10) : 60;
  const storageName = document.getElementById('selected-storage') ? document.getElementById('selected-storage').value : null;

  try {
    const res = await fetch('/api/cluster/preflight-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: selectedProvider,
        auth: providerAuth,
        candidateIps: ips,
        gatewayIp: gateway,
        storageName,
        vmCount,
        diskGB
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderPreflightResults(data);
  } catch (err) {
    icon.innerText = '❌';
    title.innerText = 'Pre-Flight Taraması Başarısız!';
    desc.innerText = err.message;
    grid.innerHTML = `<div style="color:var(--danger-text); padding:10px; font-size:0.85rem;">Hata: ${err.message}</div>`;
  } finally {
    btn.disabled = false;
    btn.innerText = '🛡️ Pre-Flight Ağ & Kaynak Doğrula';
  }
}

function renderPreflightResults(data) {
  const icon = document.getElementById('preflight-main-icon');
  const title = document.getElementById('preflight-main-title');
  const desc = document.getElementById('preflight-main-desc');
  const grid = document.getElementById('preflight-grid-content');

  const ipList = data.ipChecks || data.ipResults || [];
  const hasCollision = data.hasConflict || ipList.some(r => r.inUse || r.conflict);
  const gw = data.gatewayStatus || data.gatewayCheck;
  const gatewayOk = gw ? gw.reachable : true;
  const st = data.storageStatus || data.storageCheck;
  const storageOk = st ? (st.hasEnoughSpace !== false && st.sufficient !== false) : true;

  if (hasCollision || !gatewayOk || !storageOk) {
    icon.innerText = '⚠️';
    title.innerText = 'Pre-Flight Uyarısı: Olası Sorunlar Tespit Edildi';
    desc.innerText = 'Lütfen kırmızı ile işaretlenen IP çakışmalarını veya yetersiz kaynakları gözden geçirin.';
  } else {
    icon.innerText = '✅';
    title.innerText = 'Tüm Doğrulamalar Başarılı (100% Ready)';
    desc.innerText = 'Tüm IP adresleri ağda boştur, Gateway erişilebilir ve depolama alanı yeterlidir.';
  }

  // 1. IP Çakışma Kartı
  let ipRowsHtml = '';
  if (ipList.length > 0) {
    ipList.forEach(r => {
      const isConflict = r.inUse || r.conflict;
      ipRowsHtml += `
        <div class="preflight-ip-row">
          <div>
            <span style="color:#fff; font-weight:600;">${r.ip}</span>
            <span style="color:var(--text-dim); font-size:0.7rem; margin-left:6px;">(${r.name || 'Düğüm'})</span>
          </div>
          <span class="preflight-status-chip ${isConflict ? 'danger' : 'success'}">
            ${isConflict ? '❌ Çakışma (Cevap Veriyor)' : '✔ Boşta (Kullanılabilir)'}
          </span>
        </div>
      `;
    });
  }

  const ipCard = `
    <div class="preflight-card">
      <div class="preflight-card-header">
        <span>🌐 IP Adres Çakışma Taranması (${ipList.length} IP)</span>
        <span style="font-size:0.75rem; color:${hasCollision ? 'var(--danger-text)' : 'var(--success-text)'}">
          ${hasCollision ? 'Çakışma Var!' : 'Tamamı Temiz'}
        </span>
      </div>
      <div style="max-height: 180px; overflow-y: auto;">
        ${ipRowsHtml}
      </div>
    </div>
  `;

  // 2. Gateway & Ağ Geçidi Kartı
  const gwCard = `
    <div class="preflight-card">
      <div class="preflight-card-header">
        <span>🚪 Ağ Geçidi (Gateway) Durumu</span>
        <span class="preflight-status-chip ${gatewayOk ? 'success' : 'danger'}">
          ${gatewayOk ? '✔ Erişilebilir' : '❌ Zaman Aşımı'}
        </span>
      </div>
      <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.6; margin-top:8px;">
        <div>Hedef Gateway IP: <strong style="color:#fff; font-family:'JetBrains Mono';">${gw && gw.ip ? gw.ip : (document.getElementById('cfg-gateway') ? document.getElementById('cfg-gateway').value : '-')}</strong></div>
        <div style="margin-top:4px;">
          ${gatewayOk 
            ? 'Ağ geçidi ICMP ping isteklerine yanıt veriyor. VM\'ler dış dünyaya ve DNS sunucularına erişebilir.' 
            : 'Gateway ping isteklerine yanıt vermedi. Güvenlik duvarını veya subnet ayarlarını kontrol ediniz.'}
        </div>
      </div>
    </div>
  `;

  // 3. Storage Depolama Kartı
  const stCard = `
    <div class="preflight-card">
      <div class="preflight-card-header">
        <span>💾 Depolama Havuzu Boyutlandırması</span>
        <span class="preflight-status-chip ${storageOk ? 'success' : 'warning'}">
          ${storageOk ? '✔ Yeterli Kapasite' : '⚠️ Dikkat'}
        </span>
      </div>
      <div style="font-size:0.82rem; color:var(--text-muted); line-height:1.6; margin-top:8px;">
        <div>Hedef Depolama: <strong style="color:#fff;">${(st && st.storage) || (document.getElementById('selected-storage') ? document.getElementById('selected-storage').value : 'Varsayılan')}</strong></div>
        <div>Gereken Alan: <strong style="color:var(--primary-text);">${st ? (st.requiredGB || 0) : 0} GB</strong></div>
        <div>Mevcut Boş Alan: <strong style="color:#fff;">${st && st.availableGB ? st.availableGB + ' GB' : 'Doğrulandı'}</strong></div>
        <div style="margin-top:6px; font-size:0.75rem; color:var(--text-dim);">
          ${storageOk 
            ? 'Hedef depolama havuzunda yeterli disk alanı bulunmaktadır.' 
            : 'Depolama alanı sınırda olabilir, lütfen Proxmox/vCenter disk alanını doğrulayın.'}
        </div>
      </div>
    </div>
  `;

  grid.innerHTML = ipCard + gwCard + stCard;
}

// 2. IAC SPEC YAML İNDİR
async function downloadClusterSpecYaml() {
  const btn = document.getElementById('btn-export-yaml');
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Hazırlanıyor...'; }

  const templateId = document.getElementById('selected-template') ? document.getElementById('selected-template').value : null;
  const targetStorage = document.getElementById('selected-storage') ? document.getElementById('selected-storage').value : null;
  const diskSizeGB = document.getElementById('cfg-disk') ? parseInt(document.getElementById('cfg-disk').value, 10) : 60;
  const gateway = document.getElementById('cfg-gateway') ? document.getElementById('cfg-gateway').value.trim() : '';
  const cores = parseInt(document.getElementById('cfg-cores').value, 10);
  const memoryMB = parseInt(document.getElementById('cfg-ram').value, 10);
  const sshUser = document.getElementById('cfg-ssh-user').value.trim();
  const vipIp = document.getElementById('cfg-vip').value.trim();
  const clusterToken = document.getElementById('cfg-token').value.trim();
  const cni = document.getElementById('cfg-cni').value;
  const maxPods = parseInt(document.getElementById('cfg-max-pods').value, 10);

  try {
    const res = await fetch('/api/cluster/export-spec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: operationMode,
        provider: selectedProvider,
        distribution: clusterDistribution,
        gateway,
        cores,
        memoryMB,
        diskSizeGB,
        sshUser,
        vipIp,
        clusterToken,
        cni,
        maxPods,
        targetStorage,
        templateId
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const blob = new Blob([data.yaml], { type: 'application/x-yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename || 'rke2-cluster-spec.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Spec indirilemedi: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📄 IaC Spec İndir (.yaml)'; }
  }
}

// 3. KUBECONFIG İNDİR
async function downloadKubeconfig() {
  const { ip, user, pass, vip } = getTargetMasterCredentials();
  if (!ip) {
    alert('Master IP adresi bulunamadı. Lütfen önce kurulumu tamamlayınız veya 3. Adımdaki VIP/IP alanını doldurunuz.');
    return;
  }

  try {
    const res = await fetch('/api/cluster/kubeconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        publicVip: vip
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const blob = new Blob([data.kubeconfig], { type: 'application/x-yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rke2-cluster.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert(`Kubeconfig alınamadı: ${err.message}\n(Master düğümde RKE2 servisinin hazır olduğundan emin olunuz)`);
  }
}

function copyKubeconfigCmd() {
  const el = document.getElementById('kubeconfig-export-cmd');
  if (el) {
    navigator.clipboard.writeText(el.innerText.trim()).then(() => {
      alert('Kubeconfig bağlantı komutu panoya kopyalandı!');
    });
  }
}

// 4. DAY-2 SEKME GEÇİŞLERİ

function filterAddons(category) {
  const categories = ['all', 'networking', 'storage', 'observability', 'security', 'scaling'];
  categories.forEach(cat => {
    const btn = document.getElementById(`filter-addon-${cat}`);
    if (btn) btn.classList.toggle('active', cat === category);
  });

  const cards = document.querySelectorAll('#addons-catalog-grid .addon-card');
  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (category === 'all' || cardCat === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// 6. EKLENTİ KURULUMU (1-CLICK ADDON INSTALL)
async function installClusterAddon(addonKey) {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById(`btn-addon-${addonKey}`);
  const badge = document.getElementById(`addon-badge-${addonKey}`);

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Kuruluyor...'; }
  if (badge) { badge.innerText = 'Yükleniyor'; badge.className = 'addon-status-pill warning'; }

  try {
    const res = await fetch('/api/cluster/addons/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        addon: addonKey
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ ${addonKey.toUpperCase()} başarıyla kuruldu!\n${data.output || ''}`);
    if (badge) { badge.innerText = 'Kuruldu (Aktif)'; badge.className = 'addon-status-pill installed'; }
    if (btn) {
      if (addonKey === 'hubble') {
        const hubbleUrl = `http://${ip}:12000`;
        btn.outerHTML = `<a href="${hubbleUrl}" target="_blank" class="btn btn-success btn-sm" style="text-decoration:none;">🚀 Hubble UI Aç (Port 12000)</a>`;
      } else {
        btn.disabled = true;
        btn.innerText = '✔ Aktif';
      }
    }
  } catch (err) {
    alert(`Eklenti kurulumu başarısız: ${err.message}`);
    if (badge) { badge.innerText = 'Hata'; badge.className = 'addon-status-pill danger'; }
    if (btn) { btn.disabled = false; btn.innerText = '⚡ Tekrar Dene'; }
  }
}

// 7. ETCD SNAPSHOT YÖNETİMİ

async function executeNodeAction(nodeName, action) {
  const { ip, user, pass } = getTargetMasterCredentials();
  const confirmMsg = action === 'drain'
    ? `'${nodeName}' düğümündeki tüm podlar tahliye edilecek. Emin misiniz?`
    : `'${nodeName}' düğümüne '${action}' işlemi uygulanacak. Devam edilsin mi?`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch('/api/cluster/nodes/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        nodeName,
        action
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ İşlem tamamlandı:\n${data.output || ''}`);
    fetchClusterLiveStatus();
  } catch (err) {
    alert(`Düğüm eylemi başarısız: ${err.message}`);
  }
}

// 9. OTOMATİK KÜME SAĞLIK DOĞRULAYICISI (SMOKE TEST)
async function runSmokeTest() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-run-smoke-test');
  const rawLog = document.getElementById('smoke-raw-output');
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Doğrulanıyor...'; }

  const stepIds = ['nodes', 'cni', 'dns', 'datapath'];
  stepIds.forEach(id => {
    const badge = document.getElementById(`smoke-badge-${id}`);
    const card = document.getElementById(`smoke-card-${id}`);
    if (badge) { badge.innerText = '⏳ Test Ediliyor...'; badge.className = 'smoke-status-badge running'; }
    if (card) { card.className = 'smoke-step-card'; }
  });

  if (rawLog) rawLog.innerText = 'Küme bileşenleri test ediliyor, geçici pod başlatılıyor...';

  try {
    const res = await fetch('/api/cluster/smoke-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (data.steps) {
      data.steps.forEach(s => {
        const badge = document.getElementById(`smoke-badge-${s.id}`);
        const card = document.getElementById(`smoke-card-${s.id}`);
        const isPassed = s.status === 'passed';
        if (badge) {
          badge.innerText = isPassed ? '✔ Başarılı' : '❌ Hata';
          badge.className = `smoke-status-badge ${isPassed ? 'passed' : 'failed'}`;
        }
        if (card) {
          card.className = `smoke-step-card ${isPassed ? 'passed' : 'failed'}`;
        }
      });
    }

    if (rawLog && data.rawOutput) {
      rawLog.innerText = data.rawOutput;
    }
  } catch (err) {
    alert(`Smoke test yürütülemedi: ${err.message}`);
    stepIds.forEach(id => {
      const badge = document.getElementById(`smoke-badge-${id}`);
      if (badge && badge.innerText.includes('Test Ediliyor')) {
        badge.innerText = '❌ Başarısız';
        badge.className = 'smoke-status-badge failed';
      }
    });
    if (rawLog) rawLog.innerText = `Hata: ${err.message}`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🚀 Kümeyi Doğrula (Smoke Test Başlat)'; }
  }
}

// 10. FORTIGATE SLB & VIP YAPILANDIRMASI

function setConsoleCommand(cmd) {
  const input = document.getElementById('console-cmd-input');
  if (input) {
    input.value = cmd;
    input.focus();
  }
}

async function executeConsoleCommand() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const input = document.getElementById('console-cmd-input');
  const btn = document.getElementById('btn-exec-console');
  const termBody = document.getElementById('console-terminal-body');
  const badge = document.getElementById('console-status-badge');

  if (!input) return;
  const cmd = input.value.trim();
  if (!cmd) return;

  if (btn) { btn.disabled = true; btn.innerText = '⏳'; }
  if (badge) { badge.innerText = 'Çalışıyor...'; badge.style.color = 'var(--primary-glow)'; }

  // Terminal ekranına komutu yaz
  const promptLine = document.createElement('div');
  promptLine.className = 'log-line cyan';
  promptLine.style.marginTop = '8px';
  promptLine.innerText = `$ ${cmd}`;
  termBody.appendChild(promptLine);

  try {
    const res = await fetch('/api/cluster/quick-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        command: cmd
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const outLine = document.createElement('div');
    outLine.className = 'log-line';
    outLine.style.whiteSpace = 'pre-wrap';
    outLine.style.fontFamily = "'JetBrains Mono', monospace";
    outLine.style.fontSize = '0.78rem';
    outLine.style.color = data.code === 0 ? '#CBD5E1' : '#F87171';
    outLine.innerText = (data.stdout || data.stderr || '(Çıktı yok)').trim();
    termBody.appendChild(outLine);

    if (badge) { badge.innerText = data.code === 0 ? 'Tamamlandı' : 'Exit Code: ' + data.code; badge.style.color = data.code === 0 ? 'var(--success)' : 'var(--danger)'; }
  } catch (err) {
    const errLine = document.createElement('div');
    errLine.className = 'log-line red';
    errLine.innerText = `[HATA] ${err.message}`;
    termBody.appendChild(errLine);
    if (badge) { badge.innerText = 'Hata'; badge.style.color = 'var(--danger)'; }
  } finally {
    termBody.scrollTop = termBody.scrollHeight;
    if (btn) { btn.disabled = false; btn.innerText = '🚀 Çalıştır'; }
  }
}

// ==============================================================================
// 13. GLOBAL WORKSPACE & DAY-2 OPERATIONS NAVIGATION
// ==============================================================================
// ==============================================================================
// 13. GLOBAL WORKSPACE & DAY-2 OPERATIONS NAVIGATION
// ==============================================================================


async function deployClusterApp(appName) {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById(`btn-app-${appName}`);
  const badge = document.getElementById(`app-badge-${appName}`);

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Dağıtılıyor...'; }
  if (badge) { badge.innerText = 'Kuruluyor...'; badge.className = 'addon-status-pill warning'; }

  try {
    const res = await fetch('/api/cluster/apps/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        appName
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`🚀 ${appName.toUpperCase()} başarıyla kuruldu!\n${data.output || ''}`);
    if (badge) { badge.innerText = 'Çalışıyor'; badge.className = 'addon-status-pill installed'; }
    if (btn) {
      if (appName === 'argocd') {
        btn.outerHTML = `<a href="https://${ip}:30080" target="_blank" class="btn btn-success btn-sm" style="text-decoration:none;">🚀 ArgoCD Aç (Port 30080)</a>`;
      } else if (appName === 'portainer') {
        btn.outerHTML = `<a href="https://${ip}:30777" target="_blank" class="btn btn-success btn-sm" style="text-decoration:none;">🚀 Portainer Aç (Port 30777)</a>`;
      } else if (appName === 'whoami') {
        btn.outerHTML = `<a href="http://${ip}:30088" target="_blank" class="btn btn-success btn-sm" style="text-decoration:none;">🌐 Whoami Test Aç (Port 30088)</a>`;
      } else {
        btn.disabled = true;
        btn.innerText = '✔ Kuruldu';
      }
    }
  } catch (err) {
    alert(`Uygulama kurulumu başarısız: ${err.message}`);
    if (badge) { badge.innerText = 'Hata'; badge.className = 'addon-status-pill danger'; }
    if (btn) { btn.disabled = false; btn.innerText = '🚀 1-Tıkla Kur'; }
  }
}

// ==============================================================================
// 16. RBAC KISITLI KUBECONFIG ÜRETİCİ
// ==============================================================================

async function startClusterUpgrade() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const currentVer = document.getElementById('upgrade-current-ver')?.innerText.trim() || 'v1.30.4+rke2r1';
  const targetVer = document.getElementById('upgrade-target-ver')?.value || 'v1.31.2+rke2r1';
  const btn = document.getElementById('btn-start-upgrade');
  const logBox = document.getElementById('upgrade-console-log');

  if (!confirm(`RKE2 kümeniz ${currentVer} sürümünden ${targetVer} sürümüne kesintisiz (rolling upgrade) olarak yükseltilecektir. Devam edilsin mi?`)) {
    return;
  }

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Yükseltiliyor...'; }
  if (logBox) logBox.innerText = `[${new Date().toLocaleTimeString()}] Rolling Upgrade başlatıldı: ${currentVer} -> ${targetVer}\nÖn kontroller yürütülüyor...`;

  // Adımları görsel olarak ilerlet
  for (let i = 1; i <= 5; i++) {
    const badge = document.getElementById(`upg-badge-${i}`);
    if (badge) { badge.innerText = '⏳ İşleniyor...'; badge.className = 'smoke-status-badge running'; }
  }

  try {
    const res = await fetch('/api/cluster/upgrade/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        currentVersion: currentVer,
        targetVersion: targetVer
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    for (let i = 1; i <= 5; i++) {
      const badge = document.getElementById(`upg-badge-${i}`);
      if (badge) { badge.innerText = '✔ Tamamlandı'; badge.className = 'smoke-status-badge passed'; }
    }

    if (logBox) {
      logBox.innerText += `\n[BAŞARILI] Tüm Master ve Worker düğümleri ${targetVer} sürümüne kesintisiz yükseltildi!\n${data.log || ''}`;
    }

    const curVerBadge = document.getElementById('upgrade-current-ver');
    if (curVerBadge) curVerBadge.innerText = targetVer;

    alert(`🎉 Küme başarıyla ${targetVer} sürümüne yükseltildi!`);
  } catch (err) {
    alert(`Yükseltme hatası: ${err.message}`);
    if (logBox) logBox.innerText += `\n[HATA] ${err.message}`;
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🚀 Yükseltmeyi Başlat (Rolling Upgrade)'; }
  }
}

// ==============================================================================
// 20. CANLI KÜME OLAYLARI (EVENTS TIMELINE)
// ==============================================================================

let activeAlertChannel = 'telegram';

function switchAlertChannel(channel) {
  activeAlertChannel = channel;
  const tgBtn = document.getElementById('btn-alert-chan-telegram');
  const whBtn = document.getElementById('btn-alert-chan-webhook');
  const tgForm = document.getElementById('alert-form-telegram');
  const whForm = document.getElementById('alert-form-webhook');

  if (channel === 'telegram') {
    if (tgBtn) tgBtn.classList.add('active');
    if (whBtn) whBtn.classList.remove('active');
    if (tgForm) tgForm.style.display = 'block';
    if (whForm) whForm.style.display = 'none';
  } else {
    if (tgBtn) tgBtn.classList.remove('active');
    if (whBtn) whBtn.classList.add('active');
    if (tgForm) tgForm.style.display = 'none';
    if (whForm) whForm.style.display = 'block';
  }
}

function saveAlertSettings() {
  const token = document.getElementById('alert-tg-token')?.value.trim() || '';
  const chatId = document.getElementById('alert-tg-chatid')?.value.trim() || '';
  const whUrl = document.getElementById('alert-webhook-url')?.value.trim() || '';

  const settings = { activeAlertChannel, token, chatId, whUrl };
  localStorage.setItem('rke2_alert_settings', JSON.stringify(settings));
  alert('💾 Alarm ve bildirim ayarları tarayıcı hafızasına güvenle kaydedildi!');
}

async function sendTestClusterAlert() {
  const btn = document.getElementById('btn-test-alert');
  const resultBox = document.getElementById('alert-result-box');
  const resultContent = document.getElementById('alert-result-content');
  const token = document.getElementById('alert-tg-token')?.value.trim() || '';
  const chatId = document.getElementById('alert-tg-chatid')?.value.trim() || '';
  const whUrl = document.getElementById('alert-webhook-url')?.value.trim() || '';

  if (btn) { btn.disabled = true; btn.innerText = '⏳ İletiliyor...'; }

  try {
    const res = await fetch('/api/cluster/alerts/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: activeAlertChannel,
        telegramBotToken: token,
        telegramChatId: chatId,
        webhookUrl: whUrl,
        alertName: 'Düğüm Kalp Atışı Kesintisi (Node NotReady)'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (resultBox && resultContent) {
      resultBox.style.display = 'block';
      resultContent.innerText = `[SONUÇ] ${data.message}\n\nİletilen Mesaj:\n${data.preview || ''}`;
    }

    alert(`✅ ${data.message}`);
  } catch (err) {
    alert(`Bildirim gönderilemedi: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🚨 Canlı Test Bildirimi Gönder'; }
  }
}

// ==============================================================================
// 22. KAYNAK SIKILAŞTIRMA & FINOPS (RIGHTSIZING)
// ==============================================================================

let cachedRightsizingData = null;

async function fetchRightsizingAnalysis() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('rightsizing-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ Pod kaynak tüketimleri analiz ediliyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/rightsizing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    cachedRightsizingData = data;
    renderRightsizing(data);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--danger-text);">Analiz hatası: ${err.message}</td></tr>`;
  }
}

function renderRightsizing(data) {
  const rsTotal = document.getElementById('rs-total-mem');
  const rsUsed = document.getElementById('rs-used-mem');
  const rsSavings = document.getElementById('rs-savings-mem');
  const rsMonthly = document.getElementById('rs-monthly-savings');
  const tbody = document.getElementById('rightsizing-table-body');

  if (data.summary) {
    if (rsTotal) rsTotal.innerText = `${data.summary.totalAllocatedMemGB} GB`;
    if (rsUsed) rsUsed.innerText = `${data.summary.actualUsedMemGB} GB`;
    if (rsSavings) rsSavings.innerText = `${data.summary.potentialMemSavingsGB} GB (%${data.summary.potentialMemSavingsPercent})`;
    if (rsMonthly) rsMonthly.innerText = data.summary.estimatedMonthlySavings;
  }

  if (tbody && data.recommendations) {
    tbody.innerHTML = '';
    data.recommendations.forEach(r => {
      const isOver = r.status === 'over-provisioned';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="role-tag cyan" style="font-size:0.7rem;">${r.namespace}</span></td>
        <td style="font-family:'JetBrains Mono'; font-weight:600; color:#fff;">${r.pod}</td>
        <td style="color:#F87171; font-family:'JetBrains Mono';">${r.currentReqMem}</td>
        <td style="color:#60A5FA; font-family:'JetBrains Mono';">${r.peakUsageMem}</td>
        <td style="color:#34D399; font-family:'JetBrains Mono'; font-weight:700;">${r.recommendedReqMem}</td>
        <td style="color:var(--success-text); font-weight:700;">${r.memSavingsPercent > 0 ? `-%${r.memSavingsPercent}` : '-'}</td>
        <td>
          <span class="preflight-status-chip ${isOver ? 'over' : 'under'}">
            ${isOver ? '⚠️ Aşırı Rezerve' : '🚨 OOM Riski'}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function downloadOptimizedSpecYaml() {
  const yaml = `# RKE2 Rightsizing FinOps Optimized Spec
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-db-optimized
  namespace: database
spec:
  template:
    spec:
      containers:
      - name: postgres
        resources:
          requests:
            cpu: "500m"
            memory: "2048Mi"
          limits:
            cpu: "1000m"
            memory: "4096Mi"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: argocd-server-optimized
  namespace: argocd
spec:
  template:
    spec:
      containers:
      - name: argocd-server
        resources:
          requests:
            cpu: "250m"
            memory: "768Mi"
          limits:
            cpu: "500m"
            memory: "1536Mi"
`;
  const blob = new Blob([yaml], { type: 'application/x-yaml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optimized-workloads-spec.yaml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ==============================================================================
// 23. TLS / SSL SERTİFİKA YÖNETİCİSİ (CERT-MANAGER)
// ==============================================================================

let cachedDoctorData = null;

async function fetchDoctorDiagnosis() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const container = document.getElementById('doctor-issues-container');
  if (container) container.innerHTML = '<div style="color:var(--text-dim); padding:20px;">⏳ Küme bileşenleri ve pod durumları taranıyor...</div>';

  try {
    const res = await fetch('/api/cluster/doctor/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    cachedDoctorData = data;
    renderDoctorIssues(data);
  } catch (err) {
    if (container) container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Teşhis motoru hatası: ${err.message}</div>`;
  }
}

function renderDoctorIssues(data) {
  const scoreEl = document.getElementById('doctor-health-score');
  if (scoreEl && data.clusterHealthScore) {
    scoreEl.innerText = `${data.clusterHealthScore}%`;
  }

  const container = document.getElementById('doctor-issues-container');
  if (!container) return;

  if (!data.issues || data.issues.length === 0) {
    container.innerHTML = '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-sm); padding:20px; color:#A7F3D0;">🎉 Tebrikler! Kümede herhangi bir kritik arıza veya performans darboğazı tespit edilmedi.</div>';
    return;
  }

  container.innerHTML = '';
  data.issues.forEach(issue => {
    const isCrit = issue.severity === 'critical';
    const card = document.createElement('div');
    card.className = `doctor-diag-card ${isCrit ? 'critical' : 'warning'}`;
    card.id = `card-${issue.id}`;
    card.innerHTML = `
      <div class="doctor-diag-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <span class="role-tag ${isCrit ? 'orange' : 'cyan'}" style="font-weight:700;">${isCrit ? '🚨 KRİTİK HATA' : '⚠️ UYARI'}</span>
          <span class="doctor-diag-title">${issue.title}</span>
        </div>
        <span class="doctor-diag-component">${issue.component} • ${issue.detectedAt}</span>
      </div>

      <div class="doctor-diag-body">
        <div><strong>🔍 Kök Neden Analizi:</strong> ${issue.rootCause}</div>
        <div style="margin-top:4px;"><strong>💥 İş Yükü Etkisi:</strong> <span style="color:#FCA5A5;">${issue.impact}</span></div>
        <div style="margin-top:4px;"><strong>💡 Önerilen Çözüm:</strong> <span style="color:#93C5FD;">${issue.suggestedFix}</span></div>
      </div>

      <div class="doctor-action-row">
        <span style="font-size:0.75rem; color:var(--text-dim);">Otomatik Düzeltici (Auto-Remediation Engine)</span>
        <button class="btn btn-primary btn-sm" id="btn-heal-${issue.id}" onclick="triggerDoctorHealing('${issue.id}', '${issue.actionKey}')">
          ${issue.actionLabel || '⚡ Otomatik İyileştir'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

async function triggerDoctorHealing(issueId, actionKey) {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById(`btn-heal-${issueId}`);
  const alertBox = document.getElementById('doctor-action-alert');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ İyileştiriliyor...'; }

  try {
    const res = await fetch('/api/cluster/doctor/heal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, issueId, actionKey })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `<strong>✔ Otomatik Onarım Başarılı (${data.resolvedAt}):</strong> ${data.message}`;
    }

    // Sorun kartını yeşile çevirip tamamlandı yap
    const card = document.getElementById(`card-${issueId}`);
    if (card) {
      card.style.borderLeft = '4px solid #10B981';
      card.style.opacity = '0.7';
      if (btn) {
        btn.className = 'btn btn-secondary btn-sm';
        btn.innerText = '✔ Sorun Çözüldü';
        btn.disabled = true;
      }
    }
  } catch (err) {
    alert(`Onarım başarısız: ${err.message}`);
    if (btn) { btn.disabled = false; btn.innerText = '⚡ Tekrar Dene'; }
  }
}

// ==============================================================================
// 28. KONTEYNER İMAJ GÜVENLİK AÇIĞI & CVE TARAYICISI (TRIVY)
// ==============================================================================

async function fetchCronJobs() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('cronjobs-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ Zamanlanmış görevler listeleniyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/cronjobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderCronJobs(data.cronjobs || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--danger-text);">CronJob hatası: ${err.message}</td></tr>`;
  }
}

function renderCronJobs(cronjobs) {
  const tbody = document.getElementById('cronjobs-table-body');
  if (!tbody) return;

  if (!cronjobs || cronjobs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:var(--text-dim);">Tanımlı CronJob nesnesi bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  cronjobs.forEach(c => {
    const isSuspended = c.suspend;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono'; font-weight:700; color:#fff;">${c.name}</td>
      <td><span class="role-tag cyan" style="font-size:0.7rem;">${c.namespace}</span></td>
      <td style="font-family:'JetBrains Mono'; color:#38BDF8; font-weight:600;">${c.schedule}</td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${c.humanSchedule}</td>
      <td>
        <span class="cronjob-chip ${isSuspended ? 'suspended' : 'active'}">
          ${isSuspended ? '⏸️ Askıya Alındı' : '🟢 Aktif'}
        </span>
      </td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${c.lastSchedule}</td>
      <td style="font-size:0.78rem; color:#A7F3D0; font-weight:600;">${c.nextSchedule}</td>
      <td style="font-family:'JetBrains Mono'; font-size:0.75rem; color:var(--text-dim);">${c.image}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-secondary btn-sm" onclick="manageCronJobAction('${c.name}', '${c.namespace}', 'trigger')" style="padding:2px 8px; font-size:0.72rem;">
            🚀 Şimdi Çalıştır
          </button>
          <button class="btn btn-secondary btn-sm" onclick="manageCronJobAction('${c.name}', '${c.namespace}', '${isSuspended ? 'resume' : 'suspend'}')" style="padding:2px 8px; font-size:0.72rem;">
            ${isSuspended ? '▶️ Başlat' : '⏸️ Durdur'}
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function manageCronJobAction(name, namespace, action) {
  const { ip, user, pass } = getTargetMasterCredentials();
  const alertBox = document.getElementById('cronjob-action-alert');

  try {
    const res = await fetch('/api/cluster/cronjobs/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, name, namespace, action })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (alertBox) {
      alertBox.style.display = 'block';
      alertBox.innerHTML = `<strong>✔ Bildirim:</strong> ${data.message}`;
    }

    fetchCronJobs();
  } catch (err) {
    alert(`İşlem başarısız: ${err.message}`);
  }
}



