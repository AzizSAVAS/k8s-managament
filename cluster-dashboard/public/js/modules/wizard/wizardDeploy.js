// ==============================================================================

// WIZARD SUBMODULE: DISTRIBUTION MATRIX & LIVE DEPLOYMENT EXECUTION

// Shamssoftware & Aziz SAVAS Enterprise Architecture

// ==============================================================================

async function prepareDistributionPreview() {
  const masterCount = parseInt(document.getElementById('cfg-master-count').value, 10) || 0;
  const workerCount = parseInt(document.getElementById('cfg-worker-count').value, 10) || 0;
  const startVmId = parseInt(document.getElementById('cfg-start-vmid').value, 10) || 100;
  const subnetBase = document.getElementById('cfg-subnet-base').value.trim();
  const startIpHost = parseInt(document.getElementById('cfg-start-host').value, 10) || 10;
  const startMasterNum = parseInt(document.getElementById('cfg-start-master-num') ? document.getElementById('cfg-start-master-num').value : 1, 10) || 1;
  const startWorkerNum = parseInt(document.getElementById('cfg-start-worker-num') ? document.getElementById('cfg-start-worker-num').value : 1, 10) || 1;
  const vipIp = document.getElementById('cfg-vip').value.trim();
  const clusterToken = document.getElementById('cfg-token').value.trim();

  if (operationMode === 'scale') {
    if (masterCount === 0 && workerCount === 0) {
      alert('Lütfen eklenecek en az 1 adet Master veya Worker sayısı giriniz.');
      return;
    }
    if (!vipIp) {
      alert('Lütfen mevcut kümenizin API / Join Adresini (VIP veya Master IP) giriniz.');
      return;
    }
    if (!clusterToken) {
      alert('Lütfen mevcut kümenizin Join Token\'ını (/var/lib/rancher/rke2/server/node-token) giriniz.');
      return;
    }
  }

  const physicalNodeNames = discoveredNodes.map(n => n.name);

  try {
    const res = await fetch('/api/cluster/preview-distribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: operationMode,
        provider: selectedProvider,
        physicalNodes: physicalNodeNames,
        masterCount,
        workerCount,
        startMasterNum,
        startWorkerNum,
        startVmId,
        subnetBase,
        startIpHost
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    clusterDistribution = data.distribution;
    renderDistributionTable(clusterDistribution);
    goToStep(4);
  } catch (err) {
    alert(`Dağıtım planı oluşturulamadı: ${err.message}`);
  }
}

function renderDistributionTable(dist) {
  renderHostTopology(dist);

  const tbody = document.getElementById('distribution-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const physicalNodeNames = discoveredNodes.length > 0
    ? discoveredNodes.map(n => n.name)
    : [...new Set(dist.map(d => d.targetPhysicalNode))];

  dist.forEach(item => {
    const tr = document.createElement('tr');
    const isMaster = (item.type === 'Master');
    const isJoin = item.roleLabel && item.roleLabel.includes('Join');
    const badgeColor = isJoin
      ? 'background:rgba(52, 211, 153, 0.2); color:#34D399; border:1px solid rgba(52, 211, 153, 0.3);'
      : '';

    // Bu hostta baska master var mi kontrol et (Anti-affinity uyarisi)
    const mastersOnSameHost = dist.filter(d => d.type === 'Master' && d.targetPhysicalNode === item.targetPhysicalNode);
    const hasCollision = isMaster && mastersOnSameHost.length > 1;

    // Hedef Fiziksel Sunucu Hucre Icerigi (Tek node ise rozet, birden fazlaysa secim kutusu)
    let hostCellHtml = '';
    if (physicalNodeNames.length > 1) {
      let optionsHtml = '';
      physicalNodeNames.forEach(pNode => {
        optionsHtml += `<option value="${pNode}" ${pNode === item.targetPhysicalNode ? 'selected' : ''}>🖥️ ${pNode}</option>`;
      });
      hostCellHtml = `
        <select class="phys-select-cell" onchange="updateVmTargetHost('${item.name}', this.value)">
          ${optionsHtml}
        </select>
      `;
    } else {
      hostCellHtml = `<span class="phys-badge">🖥️ ${item.targetPhysicalNode}</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="role-badge ${isMaster ? 'role-master' : 'role-worker'}" ${isJoin ? `style="${badgeColor}"` : ''}>
          ${isMaster ? '👑 ' : '⚡ '}${item.roleLabel}
        </span>
      </td>
      <td style="font-weight:700; color:#fff;">${item.name}</td>
      <td><span style="font-family:'JetBrains Mono'; font-weight:600;">${item.vmId}</span></td>
      <td><span style="font-family:'JetBrains Mono'; color:var(--primary-glow); font-weight:600;">${item.ip}</span></td>
      <td>${hostCellHtml}</td>
      <td>
        ${hasCollision 
          ? `<span style="color:var(--warning); font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
               ⚠️ Aynı Host (${mastersOnSameHost.length} Master)
             </span>`
          : `<span style="color:var(--success); font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
               ✔ Anti-Affinity Korumalı
             </span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Fiziksel Sunucu (Host) Dağıtım Haritası - Profesyonel Kurumsal Görünüm
function renderHostTopology(dist) {
  const container = document.getElementById('host-topology-container');
  if (!container) return;
  container.innerHTML = '';

  const uniqueHosts = [...new Set(dist.map(d => d.targetPhysicalNode))];
  const physicalNodeNames = discoveredNodes.length > 0
    ? discoveredNodes.map(n => n.name)
    : uniqueHosts;

  const totalMasters = dist.filter(d => d.type === 'Master').length;
  const totalWorkers = dist.filter(d => d.type === 'Worker').length;
  
  // Anti-affinity kontrolü
  let globalCollision = false;
  uniqueHosts.forEach(h => {
    const mCount = dist.filter(d => d.targetPhysicalNode === h && d.type === 'Master').length;
    if (mCount > 1) globalCollision = true;
  });

  const badgeEl = document.getElementById('anti-affinity-badge');
  if (badgeEl) {
    if (globalCollision) {
      badgeEl.innerText = '⚠️ Anti-Affinity Uyarısı: Çoklu Master!';
      badgeEl.style.background = 'rgba(217, 119, 6, 0.15)';
      badgeEl.style.color = 'var(--warning-text)';
      badgeEl.style.borderColor = 'rgba(217, 119, 6, 0.3)';
    } else {
      badgeEl.innerText = '✔ Anti-Affinity: Korumalı';
      badgeEl.style.background = 'rgba(5, 150, 105, 0.15)';
      badgeEl.style.color = 'var(--success-text)';
      badgeEl.style.borderColor = 'rgba(5, 150, 105, 0.3)';
    }
  }

  // 1. ÜST ÖZET ÇUBUĞU (Kullanıcı Dostu & Sade)
  const summaryHud = document.createElement('div');
  summaryHud.className = 'host-summary-bar';
  summaryHud.innerHTML = `
    <div class="summary-metric">
      <span class="metric-label">Fiziksel Sunucu</span>
      <span class="metric-value">${uniqueHosts.length} Host</span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Toplam Sanal Makine</span>
      <span class="metric-value">${dist.length} VM</span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Master Dağılımı</span>
      <span class="metric-value ${globalCollision ? 'text-warning' : 'text-success'}">
        ${totalMasters} Master (${globalCollision ? 'Çakışma Var' : 'Farklı Hostlarda'})
      </span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Worker Sayısı</span>
      <span class="metric-value">${totalWorkers} Worker</span>
    </div>
  `;
  container.appendChild(summaryHud);

  // 2. FİZİKSEL HOST KARTLARI
  const grid = document.createElement('div');
  grid.className = 'host-topology-grid';

  uniqueHosts.forEach((hostName, idx) => {
    const vmsOnThisHost = dist.filter(d => d.targetPhysicalNode === hostName);
    const masters = vmsOnThisHost.filter(v => v.type === 'Master');
    const workers = vmsOnThisHost.filter(v => v.type === 'Worker');
    const hasCollision = masters.length > 1;

    const hostMeta = discoveredNodes.find(n => n.name === hostName);
    const hostIpStr = hostMeta && hostMeta.pveHost ? hostMeta.pveHost : (hostMeta && hostMeta.host ? hostMeta.host : `Host #${idx + 1}`);

    const card = document.createElement('div');
    card.className = `host-card ${hasCollision ? 'host-collision' : ''}`;

    let vmRowsHtml = '';
    if (vmsOnThisHost.length === 0) {
      vmRowsHtml = '<div class="empty-host-msg">Bu sunucuya atanmış sanal makine bulunmuyor.</div>';
    } else {
      vmsOnThisHost.forEach(vm => {
        const isM = (vm.type === 'Master');
        
        let selectOptionsHtml = '';
        physicalNodeNames.forEach(pNode => {
          selectOptionsHtml += `<option value="${pNode}" ${pNode === hostName ? 'selected' : ''}>${pNode}</option>`;
        });

        vmRowsHtml += `
          <div class="host-vm-row">
            <div class="vm-info">
              <span class="vm-badge ${isM ? 'master' : 'worker'}">${isM ? 'Master' : 'Worker'}</span>
              <span class="vm-name">${vm.name}</span>
            </div>
            <div class="vm-meta">
              <span class="vm-ip">${vm.ip}</span>
              <span class="vm-id">ID: ${vm.vmId}</span>
            </div>
            <div class="vm-actions">
              <label class="action-label">Taşı:</label>
              <select class="action-select" onchange="updateVmTargetHost('${vm.name}', this.value)">
                ${selectOptionsHtml}
              </select>
            </div>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <div class="host-card-header">
        <div class="host-title-area">
          <span class="host-icon">🖥️</span>
          <div>
            <div class="host-name">${hostName}</div>
            <div class="host-ip">${hostIpStr}</div>
          </div>
        </div>
        <span class="host-count-badge">${vmsOnThisHost.length} VM</span>
      </div>

      ${hasCollision 
        ? `<div class="host-alert warning">
             ⚠️ <strong>Anti-Affinity Uyarısı:</strong> Bu fiziksel makinede ${masters.length} adet Master çalışıyor. HA güvenliği için Master'ları farklı hostlara dağıtmanız önerilir.
           </div>`
        : `<div class="host-alert success">
             ✔ <strong>Quorum Korumalı:</strong> ${masters.length === 1 ? '1 Master bu hostta güvenle izole.' : 'Yalnızca Worker düğümleri çalışıyor.'}
           </div>`
      }

      <div class="host-vm-list">
        ${vmRowsHtml}
      </div>

      <div class="host-card-footer">
        <span>Dağılım: ${masters.length} Master / ${workers.length} Worker</span>
        <span class="host-status-pill ${hasCollision ? 'warning' : 'success'}">
          ${hasCollision ? 'Çakışma Mevcut' : 'Dengeli'}
        </span>
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Kullanıcı Tablodan VM'in Hedef Sunucusunu Değiştirdiğinde Çalışır
function updateVmTargetHost(vmName, newHost) {
  const targetItem = clusterDistribution.find(d => d.name === vmName);
  if (targetItem) {
    targetItem.targetPhysicalNode = newHost;
    // Topoloji kartlarini ve tablodaki statuleri aninda guncelle
    renderDistributionTable(clusterDistribution);
  }
}

// --- START DEPLOYMENT (WEBSOCKET STREAM) ---
async function startDeployment() {
  goToStep(5);

  const terminal = document.getElementById('terminal-output');
  terminal.innerHTML = '<div class="log-line cyan">[SYSTEM] Canlı WebSocket oturumu başlatılıyor...</div>';

  // WebSocket Baglantisi Ac
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'log') {
        const line = document.createElement('div');
        line.className = 'log-line';
        if (data.message.includes('BASARILI') || data.message.includes('TEBRIKLER')) line.classList.add('green');
        else if (data.message.includes('HATA')) line.classList.add('red');
        else if (data.message.includes('>>>') || data.message.includes('===')) line.classList.add('cyan');
        else if (data.message.includes('Uyari')) line.classList.add('yellow');

        line.innerText = data.message;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
      } else if (data.type === 'progress') {
        const percent = Math.round((data.step / data.total) * 100);
        document.getElementById('progress-percent').innerText = `${percent}%`;
        document.getElementById('progress-fill').style.width = `${percent}%`;
      } else if (data.type === 'complete') {
        document.getElementById('term-status-badge').innerText = data.success ? 'Tamamlandı' : 'Hata';
        document.getElementById('term-status-badge').style.color = data.success ? 'var(--success)' : 'var(--danger)';
        if (data.success) {
          document.getElementById('final-btn-row').style.display = 'flex';
          const btnDl = document.getElementById('btn-download-kubeconfig');
          if (btnDl) btnDl.style.display = 'inline-flex';
          const btnRef = document.getElementById('btn-refresh-live');
          if (btnRef) btnRef.style.display = 'inline-flex';
          setTimeout(() => { fetchClusterLiveStatus(); }, 3000);
        }
      }
    } catch {}
  };

  // Deploy Request Gönder
  const templateId = document.getElementById('selected-template') ? document.getElementById('selected-template').value : null;
  const targetStorage = document.getElementById('selected-storage') ? document.getElementById('selected-storage').value : null;
  const diskSizeGB = document.getElementById('cfg-disk') ? parseInt(document.getElementById('cfg-disk').value, 10) : 60;
  const gateway = document.getElementById('cfg-gateway').value;
  const cores = parseInt(document.getElementById('cfg-cores').value, 10);
  const memoryMB = parseInt(document.getElementById('cfg-ram').value, 10);
  const sshUser = document.getElementById('cfg-ssh-user').value;
  const sshPass = document.getElementById('cfg-ssh-pass').value;
  const sshPublicKey = '';
  const vipIp = document.getElementById('cfg-vip').value.trim();
  const clusterToken = document.getElementById('cfg-token').value.trim();
  const cni = document.getElementById('cfg-cni').value;
  const maxPods = parseInt(document.getElementById('cfg-max-pods').value, 10);

  // Day-2 Operasyonları için kimlik bilgilerini sakla
  const masterNode = (clusterDistribution && clusterDistribution.find(d => d.type === 'Master')) || (clusterDistribution && clusterDistribution[0]);
  activeClusterMasterIp = masterNode ? masterNode.ip : '';
  activeClusterVip = vipIp;
  activeSshUser = sshUser;
  activeSshPass = sshPass;

  try {
    const res = await fetch('/api/cluster/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: operationMode,
        provider: selectedProvider,
        auth: providerAuth,
        templateId,
        targetStorage,
        diskSizeGB,
        distribution: clusterDistribution,
        gateway,
        cores,
        memoryMB,
        sshUser,
        sshPass,
        sshPublicKey,
        vipIp,
        clusterToken,
        cni,
        maxPods
      })
    });

    const result = await res.json();
    if (!result.success) {
      alert(`Kurulum başlatılamadı: ${result.error}`);
    }
  } catch (err) {
    alert(`Deploy isteği başarısız: ${err.message}`);
  }
}

// --- TEMPLATE CREATION MODAL CONTROLLER ---