// ==============================================================================

// OPERATIONS SUBMODULE: MONITORING, LOGS, EVENTS & CILIUM HUBBLE

// ==============================================================================

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