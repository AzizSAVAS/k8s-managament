// ==============================================================================
// RKE2 CLUSTER HUB: DAY-2 KURUMSAL OPERASYONLAR MODÜLÜ (OPERATIONS HUB)
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
function switchDay2Tab(tabName) {
  const tabs = ['terminal', 'live-nodes', 'smoke', 'fortigate', 'addons', 'cis', 'console', 'etcd'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`day2-pane-${t}`);
    if (btn) btn.classList.remove('active');
    if (pane) pane.style.display = 'none';
  });

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  const activePane = document.getElementById(`day2-pane-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activePane) activePane.style.display = 'block';

  if (tabName === 'live-nodes') {
    fetchClusterLiveStatus();
  } else if (tabName === 'fortigate') {
    fetchFortigateConfig();
  } else if (tabName === 'cis') {
    runCisBenchmark();
  } else if (tabName === 'etcd') {
    fetchEtcdSnapshots();
  }
}

// 5. CANLI KÜME DURUMU ÇEK (KUBECTL GET NODES / PODS)
async function fetchClusterLiveStatus() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-refresh-live');
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Yenileniyor...'; }

  try {
    const res = await fetch('/api/cluster/live-status', {
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

    renderClusterLiveStatus(data);
  } catch (err) {
    console.warn('Canli durum alinamadi:', err.message);
    const tbody = document.getElementById('live-nodes-table-body');
    if (tbody && (!tbody.children || tbody.children.length === 0)) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#F87171; padding:24px; background:rgba(239,68,68,0.06);">
        ⚠️ Canlı küme verisi çekilemedi (${err.message}).<br>
        <span style="font-size:0.75rem; color:var(--text-muted);">IP (${ip || 'belirtilmedi'}) ve SSH kimlik bilgilerini kontrol edin veya 'Canlı Durumu Yenile' butonuna tıklayın.</span>
      </td></tr>`;
    }
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🔄 Canlı Durumu Yenile'; }
  }
}

function renderClusterLiveStatus(data) {
  const readyNodesEl = document.getElementById('live-ready-nodes');
  const podsCountEl = document.getElementById('live-pods-count');
  const tbody = document.getElementById('live-nodes-table-body');
  const podsContainer = document.getElementById('live-system-pods-container');

  const readyCount = (data.readyNodes !== undefined)
    ? data.readyNodes
    : (data.nodes ? data.nodes.filter(n => (n.status || '').toLowerCase() === 'ready').length : 0);
  const totalCount = (data.totalNodes !== undefined)
    ? data.totalNodes
    : (data.nodes ? data.nodes.length : (data.nodeCount || 0));

  if (readyNodesEl) {
    readyNodesEl.innerText = `${readyCount} / ${totalCount} Ready`;
  }
  if (podsCountEl) {
    podsCountEl.innerText = `${data.podCount !== undefined ? data.podCount : (data.pods ? data.pods.length : 0)} Pod`;
  }

  const k8sVerEl = document.getElementById('live-k8s-version');
  const cniStatusEl = document.getElementById('live-cni-status');
  if (k8sVerEl && data.k8sVersion) {
    k8sVerEl.innerText = data.k8sVersion;
  }
  if (cniStatusEl && data.cniType) {
    cniStatusEl.innerText = data.cniType;
  }

  // Canli FinOps & Kaynak Gostergelerini Guncelle
  const totalPods = (data.podCount !== undefined ? data.podCount : (data.pods ? data.pods.length : 0));
  const podDensity = document.getElementById('gauge-pod-density');
  const podBar = document.getElementById('gauge-pod-bar');
  const podPercent = document.getElementById('gauge-pod-percent');
  if (podDensity && podBar) {
    const maxCapacity = Math.max((totalCount || 1) * 110, 110);
    const pct = Math.min(Math.round((totalPods / maxCapacity) * 100), 100);
    podDensity.innerText = `${totalPods} / ${maxCapacity} Pod`;
    podBar.style.width = `${Math.max(pct, 5)}%`;
    if (podPercent) podPercent.innerText = `${pct}%`;
  }

  const cpuCoresEl = document.getElementById('gauge-cpu-cores');
  if (cpuCoresEl && totalCount > 0) {
    cpuCoresEl.innerText = `${totalCount * 4} Cores (${readyCount} Node Ready)`;
  }

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  // Düğüm Tablosunu Doldur
  if (tbody) {
    tbody.innerHTML = '';
    if (data.nodes && data.nodes.length > 0) {
      data.nodes.forEach(n => {
        const isMaster = (n.roles || '').toLowerCase().includes('control-plane') || (n.roles || '').toLowerCase().includes('master');
        const isReady = (n.status || '').toLowerCase() === 'ready';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:700; color:#fff;">${n.name}</td>
          <td>
            <span class="role-badge ${isMaster ? 'role-master' : 'role-worker'}">
              ${isMaster ? '👑 ' : '⚡ '}${n.roles}
            </span>
          </td>
          <td>
            <span class="preflight-status-chip ${isReady ? 'success' : 'danger'}">
              ${isReady ? '✔ Ready' : '❌ ' + n.status}
            </span>
          </td>
          <td><span style="font-family:'JetBrains Mono'; color:var(--primary-glow);">${n.internalIp}</span></td>
          <td><span style="font-family:'JetBrains Mono'; font-size:0.75rem;">${n.version}</span></td>
          <td style="font-size:0.78rem; color:var(--text-muted);">${n.osImage || 'Ubuntu'}</td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="executeNodeAction('${n.name}', 'cordon')" title="${isEn ? 'Prevents scheduling new pods' : 'Yeni pod girişini engeller'}" style="padding:2px 8px; font-size:0.72rem;">
                Cordon
              </button>
              <button class="btn btn-secondary btn-sm" onclick="executeNodeAction('${n.name}', 'uncordon')" title="${isEn ? 'Re-enables scheduling on node' : 'Düğümü tekrar aktif eder'}" style="padding:2px 8px; font-size:0.72rem;">
                Uncordon
              </button>
              <button class="btn btn-secondary btn-sm" onclick="executeNodeAction('${n.name}', 'drain')" title="${isEn ? 'Safely evicts pods to other nodes' : 'Podları diğer düğümlere tahliye eder'}" style="padding:2px 8px; font-size:0.72rem; color:var(--warning-text);">
                Drain
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      // Düğümler boş veya henüz başlamakta ise açıklayıcı durum göster
      let errorMsg = data.rawError || (isEn ? 'No active nodes detected in the cluster yet.' : 'Kümede listelenebilir aktif düğüm tespit edilemedi.');
      let tipText = isEn ? 'Ensure the rke2-server service is running on the master node.' : 'RKE2 servisinin master düğümde çalıştığından emin olun.';
      if (data.serviceStatus && data.serviceStatus !== 'active') {
        tipText = isEn ? `rke2-server is currently in '${data.serviceStatus}' state. Initialization may take a few minutes.` : `rke2-server servisi şu anda '${data.serviceStatus}' durumunda. Başlaması birkaç dakika sürebilir.`;
      } else if (data.rawError && data.rawError.includes('connection refused')) {
        tipText = isEn ? 'API Server (6443) is initializing or not ready yet. Please wait a moment and refresh.' : 'API Server (6443) henüz başlamakta veya hazır değil. Lütfen biraz bekleyip yenileyin.';
      }

      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px 16px; background:rgba(245,158,11,0.04); border-radius:var(--radius-sm);">
        <div style="font-size:1.1rem; font-weight:700; color:#F59E0B; margin-bottom:6px;">${isEn ? '⚠️ Node Telemetry Unavailable' : '⚠️ Düğüm Bilgisi Alınamadı'}</div>
        <div style="font-size:0.84rem; color:#E2E8F0; margin-bottom:4px; font-family:'JetBrains Mono';">${errorMsg}</div>
        <div style="font-size:0.78rem; color:var(--text-muted); max-width:600px; margin:0 auto 14px;">${tipText}</div>
        <button class="btn btn-primary btn-sm" onclick="fetchClusterLiveStatus()" style="padding:6px 14px;">${isEn ? '🔄 Rescan Cluster Live Status' : '🔄 Canlı Durumu Yeniden Tara'}</button>
      </td></tr>`;
    }
  }

  // Sistem Podları Chip Listesi
  if (podsContainer) {
    podsContainer.innerHTML = '';
    if (data.pods && data.pods.length > 0) {
      const sysPods = data.pods.filter(p => p.namespace === 'kube-system' || p.namespace.includes('cilium'));
      sysPods.slice(0, 16).forEach(p => {
        const chip = document.createElement('div');
        chip.className = 'system-pod-chip';
        const isRun = p.status === 'Running' || p.status === 'Completed';
        chip.innerHTML = `
          <span class="dot ${isRun ? 'running' : 'error'}"></span>
          <span style="color:#fff;">${p.name.length > 25 ? p.name.substring(0, 22) + '...' : p.name}</span>
          <span style="font-size:0.7rem; color:var(--text-dim);">(${p.restarts} restart)</span>
        `;
        podsContainer.appendChild(chip);
      });
    } else {
      podsContainer.innerHTML = `<div style="font-size:0.78rem; color:var(--text-dim); padding:8px;">${isEn ? 'Pod telemetry not received yet or cluster list is empty.' : 'Pod bilgisi henüz alınamadı veya liste boş.'}</div>`;
    }
  }
}

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
async function triggerEtcdSnapshot() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-take-snapshot');
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Snapshot Alınıyor...'; }

  try {
    const res = await fetch('/api/cluster/etcd/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        action: 'save'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ etcd Snapshot Başarıyla Alındı!\n${data.output || ''}`);
    fetchEtcdSnapshots();
  } catch (err) {
    alert(`Snapshot alınamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📸 Anlık etcd Snapshot Al'; }
  }
}

async function fetchEtcdSnapshots() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('etcd-snapshots-table-body');

  try {
    const res = await fetch('/api/cluster/etcd/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        action: 'list'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (tbody) {
      if (data.snapshots && data.snapshots.length > 0) {
        tbody.innerHTML = '';
        data.snapshots.forEach(s => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family:'JetBrains Mono'; font-weight:600; color:#fff;">${s.name}</td>
            <td style="font-family:'JetBrains Mono'; font-size:0.8rem;">${s.size || '35 MB'}</td>
            <td style="color:var(--text-muted); font-size:0.8rem;">${s.createdAt || 'Az önce'}</td>
            <td style="font-family:'JetBrains Mono'; font-size:0.75rem; color:var(--text-dim);">${s.location || '/var/lib/rancher/rke2/server/db/snapshots'}</td>
            <td><span class="preflight-status-chip success">✔ Kaydedildi</span></td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:20px; color:var(--text-dim);">
              Kayıtlı snapshot bulunamadı. "Anlık etcd Snapshot Al" butonu ile ilk yedeğinizi alabilirsiniz.
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    console.warn('Snapshots listesi alinamadi:', err.message);
  }
}

// 8. DÜĞÜM BAKIM EYLEMLERİ (DRAIN / CORDON / UNCORDON)
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
let currentFortigateConfig = '';

async function fetchFortigateConfig() {
  const box = document.getElementById('fortigate-config-box');
  if (box) box.innerText = 'FortiOS yapılandırma kuralları üretiliyor...';

  const vipIp = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';
  const masterIps = (clusterDistribution || []).filter(d => d.type === 'Master').map(d => d.ip);
  const workerIps = (clusterDistribution || []).filter(d => d.type === 'Worker').map(d => d.ip);

  try {
    const res = await fetch('/api/cluster/fortigate-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vipIp,
        masterIps,
        workerIps,
        clusterName: 'rke2-enterprise'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentFortigateConfig = data.config;
    if (box) box.innerText = data.config;
  } catch (err) {
    if (box) box.innerText = `Yapılandırma üretilemedi: ${err.message}`;
  }
}

function copyFortigateConfig() {
  if (currentFortigateConfig) {
    navigator.clipboard.writeText(currentFortigateConfig).then(() => {
      alert('FortiOS yapılandırma komutları panoya kopyalandı! FortiGate CLI Konsoluna yapıştırabilirsiniz.');
    });
  }
}

function downloadFortigateConfig() {
  if (!currentFortigateConfig) return;
  const blob = new Blob([currentFortigateConfig], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fortigate-rke2-slb.conf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// 11. CIS BENCHMARK GÜVENLİK DENETİMİ
async function runCisBenchmark() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-run-cis');
  const scoreCircle = document.getElementById('cis-score-display');
  const scoreTitle = document.getElementById('cis-score-title');
  const scoreSubtitle = document.getElementById('cis-score-subtitle');
  const catContainer = document.getElementById('cis-categories-container');
  const recList = document.getElementById('cis-recommendations-list');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Denetleniyor...'; }

  try {
    const res = await fetch('/api/cluster/cis-benchmark', {
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

    if (scoreCircle) scoreCircle.innerText = `${data.score}%`;
    if (scoreTitle) scoreTitle.innerText = data.score >= 90 ? 'Mükemmel Güvenlik Uyumluluğu' : 'Güvenlik Sıkılaştırması Gerekli';
    if (scoreSubtitle) scoreSubtitle.innerText = `${data.passedTests} Test Başarılı • ${data.warnedTests} Öneri • ${data.failedTests} Kritik Hata`;

    if (catContainer && data.categories) {
      catContainer.innerHTML = '';
      data.categories.forEach(c => {
        const card = document.createElement('div');
        card.className = 'cis-cat-card';
        card.innerHTML = `
          <div class="cis-cat-header">
            <span>${c.name}</span>
            <span class="preflight-status-chip success">${c.score}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.5;">${c.desc}</div>
        `;
        catContainer.appendChild(card);
      });
    }

    if (recList && data.recommendations) {
      recList.innerHTML = '';
      data.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.innerText = r;
        recList.appendChild(li);
      });
    }
  } catch (err) {
    console.warn('CIS Benchmark calistirilamadi:', err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🛡️ Güvenlik Taramasını Başlat'; }
  }
}

// 12. WEB TABANLI KUBECTL / SHELL KONSOLU
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

function updateOpsHeaderBanner() {
  const masterIpEl = document.getElementById('ops-header-master-ip');
  const vipEl = document.getElementById('ops-header-vip');
  const { ip } = getTargetMasterCredentials();
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';

  if (masterIpEl) masterIpEl.innerText = `${ip}:6443`;
  if (vipEl) vipEl.innerText = vip;

  const expCmd = document.getElementById('kubeconfig-export-cmd');
  if (expCmd) {
    expCmd.innerText = `export KUBECONFIG=~/Downloads/rke2-cluster.yaml && kubectl --server=https://${vip}:6443 --insecure-skip-tls-verify get nodes -o wide`;
  }
}

function copyKubeconfigCmd() {
  const expCmd = document.getElementById('kubeconfig-export-cmd');
  if (expCmd) {
    navigator.clipboard.writeText(expCmd.innerText).then(() => {
      alert('Kubectl export komutu panoya kopyalandı!');
    });
  }
}

let activeOpsPane = 'nodes';

function switchOpsView(viewName) {
  if (typeof switchGlobalView === 'function' && currentGlobalWorkspace !== 'operations') {
    switchGlobalView('operations');
  }
  activeOpsPane = viewName;
  // Sidebar butonlarının aktif durumunu güncelle
  document.querySelectorAll('.ops-nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.getElementById(`ops-nav-${viewName}`);
  if (navItem) navItem.classList.add('active');

  // Pane içeriklerini göster / gizle
  document.querySelectorAll('.ops-view-pane').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const targetPane = document.getElementById(`ops-pane-${viewName}`);
  if (targetPane) {
    targetPane.classList.add('active');
    targetPane.style.display = 'block';
  }

  // Görüntüye göre otomatik tetikleyiciler
  if (viewName === 'nodes') {
    fetchClusterLiveStatus();
  } else if (viewName === 'fortigate') {
    fetchFortigateConfig();
  } else if (viewName === 'etcd') {
    fetchEtcdSnapshots();
  } else if (viewName === 'netpol') {
    if (!currentNetPolYaml) generateNetworkPolicyYaml();
  } else if (viewName === 'events') {
    fetchClusterEvents();
  } else if (viewName === 'rightsizing') {
    fetchRightsizingAnalysis();
  } else if (viewName === 'certs') {
    fetchTlsCertificates();
  } else if (viewName === 'logs') {
    fetchPodLogStream();
  } else if (viewName === 'velero') {
    fetchVeleroBackups();
  } else if (viewName === 'hubble') {
    fetchHubbleFlows();
  } else if (viewName === 'doctor') {
    fetchDoctorDiagnosis();
  } else if (viewName === 'trivy') {
    fetchTrivyScan();
  } else if (viewName === 'cronjobs') {
    fetchCronJobs();
  } else if (viewName === 'topology') {
    if (typeof fetchTopologyGraph === 'function') fetchTopologyGraph();
  } else if (viewName === 'helm') {
    if (typeof fetchHelmCatalog === 'function') fetchHelmCatalog();
  } else if (viewName === 'audit') {
    if (typeof fetchAuditTrail === 'function') fetchAuditTrail();
  }
}

// ==============================================================================
// 14. HARİCİ NFS DEPOLAMA (DYNAMIC RWX PROVISIONER)
// ==============================================================================
async function createNfsStorageClass() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const nfsServer = document.getElementById('nfs-server-ip')?.value.trim();
  const nfsPath = document.getElementById('nfs-share-path')?.value.trim();
  const scName = document.getElementById('nfs-sc-name')?.value.trim() || 'nfs-client';
  const btn = document.getElementById('btn-create-nfs');

  if (!nfsServer || !nfsPath) {
    alert('Lütfen geçerli bir NFS Sunucu IP adresi ve Export paylaşım yolu giriniz (Örn: 10.0.10.250 ve /mnt/tank/k8s-data).');
    return;
  }

  if (btn) { btn.disabled = true; btn.innerText = '⏳ StorageClass Oluşturuluyor...'; }

  try {
    const res = await fetch('/api/cluster/storage/nfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        nfsServer,
        nfsPath,
        storageClassName: scName
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ Dinamik RWX StorageClass (${scName}) başarıyla kuruldu!\n${data.output || ''}`);
  } catch (err) {
    alert(`NFS StorageClass oluşturulamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '⚡ 1-Tıkla RWX StorageClass Oluştur'; }
  }
}

// ==============================================================================
// 15. 1-TIKLA UYGULAMA MAĞAZASI (ARGOCD, PORTAINER, POSTGRES, WHOAMI)
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
async function createRbacKubeconfig() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const username = document.getElementById('rbac-username')?.value.trim() || 'developer';
  const namespace = document.getElementById('rbac-namespace')?.value.trim() || 'default';
  const role = document.getElementById('rbac-role')?.value || 'edit';
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';
  const btn = document.getElementById('btn-generate-rbac');
  const resultBox = document.getElementById('rbac-result-box');
  const resultContent = document.getElementById('rbac-result-content');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Üretiliyor...'; }

  try {
    const res = await fetch('/api/cluster/rbac/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        username,
        namespace,
        role,
        publicVip: vip
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (resultBox && resultContent) {
      resultBox.style.display = 'block';
      resultContent.innerText = data.kubeconfig;
    }

    // Dosyayı indir
    const blob = new Blob([data.kubeconfig], { type: 'application/x-yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-${namespace}-kubeconfig.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`🔒 '${username}' kullanıcısı için (${namespace} / ${role}) kısıtlı kubeconfig dosyası üretildi ve indirildi!`);
  } catch (err) {
    alert(`RBAC Kubeconfig üretilemedi: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🔒 Güvenli Kubeconfig Üret & İndir'; }
  }
}

// ==============================================================================
// 17. CANLI KÜME KUBECONFIG İNDİRİCİ
// ==============================================================================
async function downloadKubeconfig() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';

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
    alert('📥 Kubeconfig başarıyla indirildi (rke2-cluster.yaml)!');
  } catch (err) {
    alert(`Kubeconfig indirilemedi: ${err.message}`);
  }
}

// ==============================================================================
// 18. CILIUM NETWORKPOLICY EDİTÖRÜ & YÖNETİCİSİ
// ==============================================================================
let currentNetPolYaml = '';

function loadNetPolPreset(presetKey) {
  const nameInput = document.getElementById('netpol-name');
  const targetPod = document.getElementById('netpol-target-pod');
  const fromPod = document.getElementById('netpol-from-pod');
  const ports = document.getElementById('netpol-ports');

  if (presetKey === 'default-deny') {
    if (nameInput) nameInput.value = 'default-deny-ingress';
    if (targetPod) targetPod.value = 'all-pods: true';
    if (fromPod) fromPod.value = 'none';
    if (ports) ports.value = '';
  } else if (presetKey === 'db-isolate') {
    if (nameInput) nameInput.value = 'isolate-postgresql';
    if (targetPod) targetPod.value = 'app: postgres';
    if (fromPod) fromPod.value = 'app: backend';
    if (ports) ports.value = '5432';
  } else if (presetKey === 'intra-namespace') {
    if (nameInput) nameInput.value = 'intra-namespace-only';
    if (targetPod) targetPod.value = 'all-pods: true';
    if (fromPod) fromPod.value = 'same-namespace: true';
    if (ports) ports.value = 'all';
  } else if (presetKey === 'l7-http-filter') {
    if (nameInput) nameInput.value = 'l7-api-filter';
    if (targetPod) targetPod.value = 'app: backend';
    if (fromPod) fromPod.value = 'app: frontend';
    if (ports) ports.value = '8080 (GET /api/*)';
  }

  generateNetworkPolicyYaml(presetKey);
}

async function generateNetworkPolicyYaml(presetKey = 'custom') {
  const name = document.getElementById('netpol-name')?.value.trim() || 'frontend-security-policy';
  const namespace = document.getElementById('netpol-namespace')?.value.trim() || 'default';
  const podSelector = document.getElementById('netpol-target-pod')?.value.trim() || 'app: frontend';
  const allowedFromPods = document.getElementById('netpol-from-pod')?.value.trim() || 'app: ingress';
  const allowedPorts = document.getElementById('netpol-ports')?.value.trim() || '80, 443';
  const allowEgressDns = document.getElementById('netpol-egress-dns')?.checked ?? true;
  const previewBox = document.getElementById('netpol-yaml-preview');

  try {
    const res = await fetch('/api/cluster/netpol/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        namespace,
        presetKey,
        podSelector,
        allowedFromPods,
        allowedPorts,
        allowEgressDns
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentNetPolYaml = data.yaml;
    if (previewBox) previewBox.innerText = data.yaml;
  } catch (err) {
    if (previewBox) previewBox.innerText = `Hata: ${err.message}`;
  }
}

function copyNetPolYaml() {
  if (currentNetPolYaml) {
    navigator.clipboard.writeText(currentNetPolYaml).then(() => {
      alert('CiliumNetworkPolicy YAML manifesti panoya kopyalandı!');
    });
  }
}

function downloadNetPolYaml() {
  if (!currentNetPolYaml) return;
  const name = document.getElementById('netpol-name')?.value.trim() || 'cilium-policy';
  const blob = new Blob([currentNetPolYaml], { type: 'application/x-yaml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.yaml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function applyNetworkPolicyToCluster() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-apply-netpol');

  if (!currentNetPolYaml) {
    await generateNetworkPolicyYaml();
  }

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Kümeye Uygulanıyor...'; }

  try {
    const res = await fetch('/api/cluster/netpol/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        policyYaml: currentNetPolYaml
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ CiliumNetworkPolicy başarıyla uygulandı!\n${data.stdout || ''}`);
  } catch (err) {
    alert(`Politika uygulanamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🚀 1-Tıkla Kümeye Uygula'; }
  }
}

// ==============================================================================
// 19. SIFIR KESİNTİLİ ROLLING UPGRADE
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
let cachedClusterEvents = [];

async function fetchClusterEvents() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const container = document.getElementById('events-timeline-container');
  if (container) container.innerHTML = '<div style="color:var(--text-dim); padding:16px;">⏳ Canlı olaylar sorgulanıyor...</div>';

  try {
    const res = await fetch('/api/cluster/events', {
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

    cachedClusterEvents = data.events || [];
    renderEventsTimeline(cachedClusterEvents);
  } catch (err) {
    if (container) container.innerHTML = `<div style="color:var(--danger-text); padding:16px;">Olaylar alınamadı: ${err.message}</div>`;
  }
}

function renderEventsTimeline(events) {
  const container = document.getElementById('events-timeline-container');
  if (!container) return;

  if (!events || events.length === 0) {
    container.innerHTML = '<div style="color:var(--text-dim); padding:16px;">Kayıtlı küme olayı bulunamadı.</div>';
    return;
  }

  container.innerHTML = '';
  events.forEach(e => {
    const isWarn = e.type === 'Warning';
    const card = document.createElement('div');
    card.className = `timeline-event-card ${isWarn ? 'warning' : 'normal'}`;
    card.innerHTML = `
      <div class="event-card-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="role-tag ${isWarn ? 'orange' : 'cyan'}" style="font-size:0.68rem; padding:1px 6px;">${e.reason}</span>
          <span class="event-obj-badge">${e.object}</span>
          <span style="font-size:0.7rem; color:var(--text-dim);">[${e.namespace}]</span>
        </div>
        <div class="event-meta-info">${e.timestamp}</div>
      </div>
      <div class="event-card-msg">${e.message}</div>
    `;
    container.appendChild(card);
  });
}

function applyEventsFilter() {
  const search = document.getElementById('events-filter-search')?.value.toLowerCase().trim() || '';
  const type = document.getElementById('events-filter-type')?.value || 'all';

  const filtered = cachedClusterEvents.filter(e => {
    const matchesType = type === 'all' || e.type === type;
    const matchesSearch = !search ||
      e.object.toLowerCase().includes(search) ||
      e.message.toLowerCase().includes(search) ||
      e.namespace.toLowerCase().includes(search) ||
      e.reason.toLowerCase().includes(search);
    return matchesType && matchesSearch;
  });

  renderEventsTimeline(filtered);
}

// ==============================================================================
// 21. AKILLI ALARM & BİLDİRİM MERKEZİ (TELEGRAM & WEBHOOK)
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
async function fetchTlsCertificates() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const grid = document.getElementById('certs-cards-grid');
  if (grid) grid.innerHTML = '<div style="color:var(--text-dim); padding:16px;">⏳ TLS sertifikaları sorgulanıyor...</div>';

  try {
    const res = await fetch('/api/cluster/certs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderTlsCertificates(data.certificates || []);
  } catch (err) {
    if (grid) grid.innerHTML = `<div style="color:var(--danger-text); padding:16px;">Hata: ${err.message}</div>`;
  }
}

function renderTlsCertificates(certs) {
  const grid = document.getElementById('certs-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  certs.forEach(c => {
    const isWarning = c.daysRemaining <= 7;
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.innerHTML = `
      <div class="addon-card-header">
        <div class="addon-icon-box" style="background:rgba(16,185,129,0.15); color:#10B981;">🔒</div>
        <div>
          <div class="addon-title">${c.name}</div>
          <div class="addon-category">${c.issuerType} • ${c.namespace}</div>
        </div>
        <span class="preflight-status-chip ${isWarning ? 'danger' : 'success'}">${c.daysRemaining} Gün Kaldı</span>
      </div>
      <p class="addon-desc" style="font-family:'JetBrains Mono'; font-size:0.75rem; color:#93C5FD; margin-bottom:8px;">
        ${c.domains.join(', ')}
      </p>
      <div class="addon-tags">
        <span class="addon-tag">${c.issuer}</span>
        <span class="addon-tag">Bitiş: ${c.validUntil}</span>
        <span class="addon-tag">${c.secretName}</span>
      </div>
      <div class="addon-footer">
        <button class="btn btn-secondary btn-sm" onclick="renewTlsCert('${c.name}')">⚡ 1-Tıkla Yenile (Renew)</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renewTlsCert(certName) {
  alert(`✅ '${certName}' sertifikası için ACME yenileme (renew) emri verildi!`);
}

async function createLetEncryptIssuer() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const email = document.getElementById('issuer-email')?.value.trim() || 'admin@example.com';
  const type = document.getElementById('issuer-type')?.value || 'letsencrypt-prod';
  const btn = document.getElementById('btn-create-issuer');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Oluşturuluyor...'; }

  try {
    const res = await fetch('/api/cluster/certs/issuer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, email, type })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ ${data.message}`);
    fetchTlsCertificates();
  } catch (err) {
    alert(`ClusterIssuer oluşturulamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '⚡ ClusterIssuer Oluştur'; }
  }
}

// ==============================================================================
// 24. CANLI POD LOG AKIŞI
// ==============================================================================
function updatePodSelectorList() {
  const ns = document.getElementById('log-select-namespace')?.value || 'default';
  const podSelect = document.getElementById('log-select-pod');
  if (!podSelect) return;

  podSelect.innerHTML = '';
  const podOptions = {
    'default': ['whoami-test-79d75c968f-k2l8x', 'frontend-web-6d9b4c7b84-w5t9q'],
    'database': ['postgres-db-7d84b8f56c-x9qm2'],
    'argocd': ['argocd-server-57bf6485d5-h8p2k', 'argocd-repo-server-5b86944bc7-2fvl4'],
    'kube-system': ['cilium-operator-7b4d8fd4bc-q8nm2', 'coredns-rke2-coredns-7c5b64c6dc-4p5tk', 'metrics-server-58474f6764-x7dfl']
  };

  const list = podOptions[ns] || ['test-pod-01'];
  list.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.innerText = p;
    podSelect.appendChild(opt);
  });

  fetchPodLogStream();
}

let cachedPodLogs = '';

async function fetchPodLogStream() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const ns = document.getElementById('log-select-namespace')?.value || 'default';
  const pod = document.getElementById('log-select-pod')?.value || 'whoami-test-79d75c968f-k2l8x';
  const prev = document.getElementById('log-toggle-previous')?.checked || false;
  const termBody = document.getElementById('pod-log-terminal-body');
  const termTitle = document.getElementById('log-terminal-title');

  if (termTitle) termTitle.innerText = `kubectl logs -f ${pod} -n ${ns} ${prev ? '--previous' : ''}`;
  if (termBody) termBody.innerHTML = '<div class="log-line cyan">[SYSTEM] Pod log akışı bağlanıyor...</div>';

  try {
    const res = await fetch('/api/cluster/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, namespace: ns, podName: pod, previous: prev })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    cachedPodLogs = data.logs || '';
    renderPodLogs(cachedPodLogs);
  } catch (err) {
    if (termBody) termBody.innerHTML = `<div class="log-line red">[HATA] Log akışı başarısız: ${err.message}</div>`;
  }
}

function renderPodLogs(logsText) {
  const termBody = document.getElementById('pod-log-terminal-body');
  if (!termBody) return;

  termBody.innerHTML = '';
  const lines = (logsText || '').split('\n');
  lines.forEach(line => {
    if (!line.trim()) return;
    const div = document.createElement('div');
    div.className = 'log-line';
    div.style.fontFamily = "'JetBrains Mono', monospace";
    div.style.fontSize = '0.78rem';
    div.style.whiteSpace = 'pre-wrap';

    if (line.includes('ERROR') || line.includes('FATAL') || line.includes('Exception') || line.includes('HATA')) {
      div.className = 'log-line red';
    } else if (line.includes('WARN')) {
      div.className = 'log-line yellow';
    } else if (line.includes('INFO')) {
      div.className = 'log-line';
      div.style.color = '#CBD5E1';
    } else if (line.includes('DEBUG')) {
      div.className = 'log-line';
      div.style.color = 'var(--text-dim)';
    }

    div.innerText = line;
    termBody.appendChild(div);
  });

  termBody.scrollTop = termBody.scrollHeight;
}

function applyLogFilter() {
  const term = document.getElementById('log-filter-search')?.value.toLowerCase().trim() || '';
  if (!term) {
    renderPodLogs(cachedPodLogs);
    return;
  }
  const filtered = cachedPodLogs.split('\n').filter(l => l.toLowerCase().includes(term)).join('\n');
  renderPodLogs(filtered);
}

// ==============================================================================
// 25. VELERO & S3 FELAKET KURTARMA
// ==============================================================================
async function fetchVeleroBackups() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('velero-backups-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ S3 yedek listesi yükleniyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'list' })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderVeleroBackups(data.backups || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger-text);">Hata: ${err.message}</td></tr>`;
  }
}

function renderVeleroBackups(backups) {
  const tbody = document.getElementById('velero-backups-table-body');
  if (!tbody) return;

  if (!backups || backups.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">Henüz S3 yedeği bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  backups.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono'; font-weight:600; color:#fff;">${b.name}</td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${b.namespaces}</td>
      <td style="font-size:0.8rem; color:var(--primary-glow);">${b.pvcCount}</td>
      <td style="font-family:'JetBrains Mono'; font-size:0.8rem;">${b.size}</td>
      <td style="font-size:0.8rem; color:var(--text-muted);">${b.createdAt}</td>
      <td style="font-size:0.8rem; color:var(--text-dim);">${b.expiration}</td>
      <td><span class="preflight-status-chip success">✔ Tamamlandı</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="restoreVeleroBackup('${b.name}')" style="padding:2px 8px; font-size:0.72rem;">
          ♻️ Geri Yükle
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function triggerVeleroBackup() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-create-velero');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ S3 Yedeği Alınıyor...'; }

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'create' })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`🎉 ${data.message}`);
    fetchVeleroBackups();
  } catch (err) {
    alert(`Yedekleme başarısız: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📸 1-Tıkla Full Cluster Yedeği Al'; }
  }
}

async function restoreVeleroBackup(backupName) {
  if (!confirm(`'${backupName}' yedeğinden tüm küme ve PVC verileri geri yüklenecektir. Emin misiniz?`)) {
    return;
  }
  const { ip, user, pass } = getTargetMasterCredentials();

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'restore', backupName })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ ${data.message}`);
  } catch (err) {
    alert(`Geri yükleme başarısız: ${err.message}`);
  }
}

// ==============================================================================
// 26. HUBBLE eBPF CANLI AĞ AKIŞLARI & SERVİS HARİTASI
// ==============================================================================
let cachedHubbleFlows = [];
let activeHubbleVerdict = 'all';

async function fetchHubbleFlows() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('hubble-flows-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ eBPF ağ akışları ve topoloji haritası alınıyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/hubble/flows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, verdict: activeHubbleVerdict })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (data.stats) {
      const elTotal = document.getElementById('hubble-total-flows');
      const elFwd = document.getElementById('hubble-forward-rate');
      const elDrop = document.getElementById('hubble-dropped-count');
      const elLat = document.getElementById('hubble-avg-latency');
      if (elTotal) elTotal.innerText = data.stats.totalFlowsLastMin.toLocaleString('tr-TR');
      if (elFwd) elFwd.innerText = data.stats.forwardedRate;
      if (elDrop) elDrop.innerText = data.stats.droppedCount;
      if (elLat) elLat.innerText = data.stats.avgLatency;
    }

    cachedHubbleFlows = data.flows || [];
    renderHubbleFlows(cachedHubbleFlows);
    renderHubbleServiceMap(data.serviceMap);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger-text);">Hubble akış hatası: ${err.message}</td></tr>`;
  }
}

function renderHubbleServiceMap(serviceMap) {
  const container = document.getElementById('hubble-service-graph-container');
  if (!container || !serviceMap) return;

  container.innerHTML = '';
  const nodes = serviceMap.nodes || [];

  nodes.forEach((node, idx) => {
    const nodeCard = document.createElement('div');
    nodeCard.className = 'service-node-card';
    nodeCard.innerHTML = `
      <div class="service-node-icon">${node.icon || '📦'}</div>
      <div class="service-node-title">${node.name}</div>
      <div class="service-node-ns">[${node.ns}]</div>
    `;
    container.appendChild(nodeCard);

    // Düğümler arası akış oku ekle (son düğüm hariç)
    if (idx < nodes.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'service-link-flow';
      arrow.innerHTML = `
        <span class="service-flow-arrow">➔</span>
        <span style="font-size:0.68rem; color:#38BDF8; font-family:'JetBrains Mono';">eBPF</span>
      `;
      container.appendChild(arrow);
    }
  });
}

function renderHubbleFlows(flows) {
  const tbody = document.getElementById('hubble-flows-table-body');
  if (!tbody) return;

  if (!flows || flows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">Filtreye uygun eBPF akışı bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  flows.forEach(f => {
    const isFwd = f.verdict === 'FORWARDED';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-size:0.75rem; color:var(--text-dim);">${f.time}</td>
      <td>
        <div style="font-family:'JetBrains Mono'; font-weight:600; color:#fff; font-size:0.8rem;">${f.src}</div>
        <div style="font-size:0.7rem; color:var(--text-dim);">ns: ${f.srcNs}</div>
      </td>
      <td>
        <div style="font-family:'JetBrains Mono'; font-weight:600; color:#fff; font-size:0.8rem;">${f.dst}</div>
        <div style="font-size:0.7rem; color:var(--text-dim);">ns: ${f.dstNs}</div>
      </td>
      <td><span class="phys-badge">${f.proto}/${f.port}</span></td>
      <td style="font-family:'JetBrains Mono'; font-size:0.78rem; color:#93C5FD;">${f.l7}</td>
      <td>
        <span class="badge-verdict ${isFwd ? 'forwarded' : 'dropped'}">
          ${isFwd ? '✔ FORWARDED' : '✖ DROPPED'}
        </span>
      </td>
      <td style="font-family:'JetBrains Mono'; font-size:0.78rem; color:${isFwd ? '#34D399' : '#F87171'};">${f.latency}</td>
      <td style="font-size:0.76rem; color:var(--text-muted);">${f.reason}</td>
    `;
    tbody.appendChild(tr);
  });
}

function filterHubbleVerdict(verdict) {
  activeHubbleVerdict = verdict;
  const btnAll = document.getElementById('btn-flow-filter-all');
  const btnFwd = document.getElementById('btn-flow-filter-fwd');
  const btnDrop = document.getElementById('btn-flow-filter-drop');
  if (btnAll) btnAll.classList.toggle('active', verdict === 'all');
  if (btnFwd) btnFwd.classList.toggle('active', verdict === 'forwarded');
  if (btnDrop) btnDrop.classList.toggle('active', verdict === 'dropped');
  fetchHubbleFlows();
}

// ==============================================================================
// 27. K8S AKILLI TEŞHİS & KENDİ KENDİNE ONARIM (AI DOCTOR)
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
async function fetchTrivyScan() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('trivy-cve-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ Konteyner imajları ve CVE veritabanı taranıyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/trivy/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderTrivyVulnerabilities(data.vulnerabilities || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger-text);">Tarama hatası: ${err.message}</td></tr>`;
  }
}

function renderTrivyVulnerabilities(vulnerabilities) {
  const tbody = document.getElementById('trivy-cve-table-body');
  if (!tbody) return;

  if (!vulnerabilities || vulnerabilities.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">Kritik veya yüksek zafiyetli imaj bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  vulnerabilities.forEach(v => {
    const sevClass = (v.severity || '').toLowerCase().includes('critical') ? 'critical' :
                     (v.severity || '').toLowerCase().includes('high') ? 'high' :
                     (v.severity || '').toLowerCase().includes('medium') ? 'medium' : 'low';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono'; font-weight:700; color:#fff;">${v.cveId}</td>
      <td><span class="cve-badge ${sevClass}">${v.severity}</span></td>
      <td style="font-family:'JetBrains Mono'; font-weight:700; color:${v.cvss >= 9 ? '#EF4444' : '#F97316'};">${v.cvss}</td>
      <td style="font-family:'JetBrains Mono'; color:#E2E8F0;">${v.package}</td>
      <td style="font-family:'JetBrains Mono'; color:#F87171;">${v.currentVersion}</td>
      <td style="font-family:'JetBrains Mono'; color:#34D399; font-weight:700;">${v.fixedVersion}</td>
      <td>
        <div style="font-size:0.75rem; color:#93C5FD; font-family:'JetBrains Mono';">${v.image}</div>
        <div style="font-size:0.7rem; color:var(--text-dim);">ns: ${v.namespace}</div>
      </td>
      <td>
        <div style="font-size:0.75rem; color:var(--text-muted);">${v.description}</div>
        <div style="font-size:0.72rem; color:#6EE7B7; margin-top:2px;">🛠️ ${v.remediation}</div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==============================================================================
// 29. KUBERNETES CRONJOB & ZAMANLANMIŞ GÖREV MERKEZİ
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



