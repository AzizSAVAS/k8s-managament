// ==============================================================================
// RKE2 CLUSTER HUB: LENS KUBERNETES IDE STUDIO (OPENLENS CONTROLLER)
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

let currentLensKind = 'pods';
let currentLensNamespace = 'all';
let currentLensSearchQuery = '';
let currentLensCache = [];
let activeLensInspectorData = null;

// 1. Ana Kaynakları Çek
async function fetchLensResources(kind, namespace) {
  if (kind) currentLensKind = kind;
  if (namespace !== undefined) currentLensNamespace = namespace;

  const container = document.getElementById('lens-resource-table-container');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:50px 20px; color:var(--text-muted);">
      <div class="spinner" style="margin:0 auto 16px;"></div>
      <div style="font-size:0.9rem; font-weight:600;">Kubernetes Kaynakları taranıyor (${currentLensKind})...</div>
    </div>
  `;

  // Port-forwards özel sekmesi
  if (currentLensKind === 'portforwards') {
    fetchLensPortForwards();
    return;
  }

  try {
    const nsParam = currentLensNamespace === 'all' ? '' : currentLensNamespace;
    const res = await fetch(`/api/lens/resources?kind=${encodeURIComponent(currentLensKind)}&namespace=${encodeURIComponent(nsParam)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Kaynaklar listelenemedi');

    currentLensCache = data.items || [];
    renderLensResourceTable(currentLensCache);
  } catch (err) {
    container.innerHTML = `
      <div style="padding:24px; background:rgba(239,68,68,0.1); border:1px solid var(--danger-border); border-radius:8px; color:var(--danger-text);">
        <strong>⚠️ Hata:</strong> ${err.message}
      </div>
    `;
  }
}

// 2. Tabloyu Ekrana Bas (Kind tipine göre akıllı sütunlar)
function renderLensResourceTable(items) {
  const container = document.getElementById('lens-resource-table-container');
  const countEl = document.getElementById('lens-item-count-badge');
  if (!container) return;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  // Filtreleme
  const q = currentLensSearchQuery.toLowerCase().trim();
  const filtered = items.filter(item => {
    if (!q) return true;
    return (item.name || '').toLowerCase().includes(q) ||
           (item.namespace || '').toLowerCase().includes(q) ||
           (item.status || '').toLowerCase().includes(q) ||
           (item.node || '').toLowerCase().includes(q);
  });

  if (countEl) {
    countEl.innerText = `${filtered.length} / ${items.length} ${isEn ? 'Resources' : 'Kaynak'}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--text-dim); background:rgba(255,255,255,0.02); border-radius:8px;">
        <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
        <div>${isEn ? 'No matching resources found for this filter.' : 'Bu filtreye uyan kaynak bulunamadı.'}</div>
      </div>
    `;
    return;
  }

  let tableHtml = `
    <div style="overflow-x:auto;">
      <table class="data-table" style="width:100%; border-collapse:collapse; font-size:0.83rem;">
        <thead>
          <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); text-align:left;">
            <th style="padding:10px 14px;">${isEn ? 'Name' : 'Ad'}</th>
            <th style="padding:10px 14px;">Namespace</th>
            ${currentLensKind === 'pods' ? `
              <th style="padding:10px 14px;">Status</th>
              <th style="padding:10px 14px;">Ready</th>
              <th style="padding:10px 14px;">Restarts</th>
              <th style="padding:10px 14px;">CPU / RAM</th>
              <th style="padding:10px 14px;">Node & IP</th>
            ` : ''}
            ${currentLensKind === 'deployments' ? `
              <th style="padding:10px 14px;">Pods (Ready/Desired)</th>
              <th style="padding:10px 14px;">Strategy</th>
              <th style="padding:10px 14px;">Conditions</th>
            ` : ''}
            ${currentLensKind === 'statefulsets' ? `
              <th style="padding:10px 14px;">Ready</th>
              <th style="padding:10px 14px;">Replicas</th>
              <th style="padding:10px 14px;">Service</th>
            ` : ''}
            ${currentLensKind === 'daemonsets' ? `
              <th style="padding:10px 14px;">Desired / Current</th>
              <th style="padding:10px 14px;">Ready</th>
              <th style="padding:10px 14px;">Node Selector</th>
            ` : ''}
            ${currentLensKind === 'services' ? `
              <th style="padding:10px 14px;">Type</th>
              <th style="padding:10px 14px;">Cluster IP</th>
              <th style="padding:10px 14px;">External IP / VIP</th>
              <th style="padding:10px 14px;">Ports</th>
            ` : ''}
            ${currentLensKind === 'ingresses' ? `
              <th style="padding:10px 14px;">Hosts</th>
              <th style="padding:10px 14px;">Class</th>
              <th style="padding:10px 14px;">VIP Address</th>
              <th style="padding:10px 14px;">TLS Secret</th>
            ` : ''}
            ${currentLensKind === 'configmaps' ? `
              <th style="padding:10px 14px;">Keys Count</th>
              <th style="padding:10px 14px;">Data Keys</th>
            ` : ''}
            ${currentLensKind === 'secrets' ? `
              <th style="padding:10px 14px;">Type</th>
              <th style="padding:10px 14px;">Keys Count</th>
              <th style="padding:10px 14px;">Data Keys</th>
            ` : ''}
            ${currentLensKind === 'pvcs' ? `
              <th style="padding:10px 14px;">Status</th>
              <th style="padding:10px 14px;">Volume</th>
              <th style="padding:10px 14px;">Capacity</th>
              <th style="padding:10px 14px;">StorageClass</th>
            ` : ''}
            <th style="padding:10px 14px;">Age</th>
            <th style="padding:10px 14px; text-align:right;">${isEn ? 'Quick Actions' : 'Hızlı Eylemler'}</th>
          </tr>
        </thead>
        <tbody>
  `;

  filtered.forEach(item => {
    const isPod = currentLensKind === 'pods';
    const isDeploy = currentLensKind === 'deployments';
    const isRunning = item.status === 'Running' || item.status === 'Bound' || (item.replicas && item.replicas.startsWith('3/3'));

    let statusChip = '';
    if (item.status === 'Running' || item.status === 'Bound') {
      statusChip = `<span class="preflight-status-chip success" style="font-size:0.75rem;">● ${item.status}</span>`;
    } else if (item.status === 'CrashLoopBackOff' || item.status === 'Error') {
      statusChip = `<span class="preflight-status-chip error" style="font-size:0.75rem;">● ${item.status}</span>`;
    } else if (item.status) {
      statusChip = `<span class="preflight-status-chip warning" style="font-size:0.75rem;">● ${item.status}</span>`;
    }

    tableHtml += `
      <tr class="lens-table-row" style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.15s ease;">
        <td style="padding:10px 14px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:#38BDF8; cursor:pointer;" onclick="openLensInspector('${currentLensKind}', '${item.namespace}', '${item.name}')">
              ${item.name}
            </span>
          </div>
        </td>
        <td style="padding:10px 14px;">
          <span style="background:rgba(255,255,255,0.06); padding:2px 7px; border-radius:4px; font-size:0.75rem; font-family:'JetBrains Mono',monospace;">
            ${item.namespace}
          </span>
        </td>

        ${isPod ? `
          <td style="padding:10px 14px;">${statusChip}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">${item.ready || '1/1'}</td>
          <td style="padding:10px 14px; color:${item.restarts > 0 ? '#F59E0B' : 'inherit'}; font-weight:${item.restarts > 0 ? '700' : 'normal'};">
            ${item.restarts || 0}
          </td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.78rem;">
            <span style="color:#60A5FA;">${item.cpu || '-'}</span> / <span style="color:#A78BFA;">${item.memory || '-'}</span>
          </td>
          <td style="padding:10px 14px; font-size:0.78rem;">
            <div style="color:#E2E8F0;">${item.node || '-'}</div>
            <div style="color:var(--text-dim); font-family:'JetBrains Mono',monospace;">${item.ip || '-'}</div>
          </td>
        ` : ''}

        ${isDeploy ? `
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-weight:700; color:#34D399;">
            ${item.replicas}
          </td>
          <td style="padding:10px 14px; font-size:0.75rem; color:var(--text-muted);">${item.strategy || '-'}</td>
          <td style="padding:10px 14px; font-size:0.75rem; color:#93C5FD;">${item.conditions || '-'}</td>
        ` : ''}

        ${currentLensKind === 'statefulsets' ? `
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; color:#34D399;">${item.ready}</td>
          <td style="padding:10px 14px;">${item.replicas}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">${item.service}</td>
        ` : ''}

        ${currentLensKind === 'daemonsets' ? `
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">${item.desired} / ${item.current}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; color:#34D399;">${item.ready}</td>
          <td style="padding:10px 14px; font-size:0.75rem;">${item.nodeSelector}</td>
        ` : ''}

        ${currentLensKind === 'services' ? `
          <td style="padding:10px 14px;"><span class="step-badge-pill" style="padding:2px 6px; font-size:0.7rem;">${item.type}</span></td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">${item.clusterIp}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; color:#38BDF8;">${item.externalIp}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.75rem;">${item.ports}</td>
        ` : ''}

        ${currentLensKind === 'ingresses' ? `
          <td style="padding:10px 14px; font-weight:700; color:#60A5FA;">${item.hosts}</td>
          <td style="padding:10px 14px; font-size:0.75rem;">${item.class}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">${item.address}</td>
          <td style="padding:10px 14px; font-size:0.75rem; color:#A78BFA;">${item.tls}</td>
        ` : ''}

        ${currentLensKind === 'configmaps' ? `
          <td style="padding:10px 14px; font-weight:700;">${item.dataCount}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:var(--text-muted);">${item.keys}</td>
        ` : ''}

        ${currentLensKind === 'secrets' ? `
          <td style="padding:10px 14px;"><span style="font-size:0.75rem; color:#F59E0B;">${item.type}</span></td>
          <td style="padding:10px 14px; font-weight:700;">${item.dataCount}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:var(--text-muted);">${item.keys}</td>
        ` : ''}

        ${currentLensKind === 'pvcs' ? `
          <td style="padding:10px 14px;"><span class="preflight-status-chip success" style="font-size:0.75rem;">● ${item.status}</span></td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.75rem;">${item.volume}</td>
          <td style="padding:10px 14px; font-weight:700; color:#38BDF8;">${item.capacity}</td>
          <td style="padding:10px 14px; font-size:0.75rem;">${item.storageClass}</td>
        ` : ''}

        <td style="padding:10px 14px; color:var(--text-dim); font-size:0.78rem;">${item.age || '1d'}</td>
        <td style="padding:10px 14px; text-align:right;">
          <div style="display:inline-flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="openLensInspector('${currentLensKind}', '${item.namespace}', '${item.name}')" title="Lens Inspector">
              🔍 ${isEn ? 'Inspect' : 'İncele'}
            </button>
            ${isPod ? `
              <button class="btn btn-secondary btn-sm" onclick="openLensLogs('${item.namespace}', '${item.name}')" title="Pod Logs">
                📜 Logs
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openLensExec('${item.namespace}', '${item.name}')" title="Shell">
                💻 Shell
              </button>
              <button class="btn btn-secondary btn-sm" onclick="openLensPortForwardPrompt('${item.namespace}', 'Pod/${item.name}', 8080)" title="Port Forward">
                🔌 PF
              </button>
            ` : ''}
            ${isDeploy ? `
              <button class="btn btn-secondary btn-sm" onclick="scaleLensResourcePrompt('${currentLensKind}', '${item.namespace}', '${item.name}')" title="Scale Replicas">
                📈 Scale
              </button>
              <button class="btn btn-secondary btn-sm" onclick="restartLensResourceAction('${currentLensKind}', '${item.namespace}', '${item.name}')" title="Rollout Restart">
                🔄 Restart
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = tableHtml;
}

// 3. Sekme Değiştirme
function switchLensKind(kind) {
  currentLensKind = kind;
  document.querySelectorAll('.lens-kind-tab').forEach(el => el.classList.remove('active'));
  const activeBtn = document.getElementById(`lens-tab-${kind}`);
  if (activeBtn) activeBtn.classList.add('active');

  fetchLensResources(kind);
}

// 4. Namespace Filtresi Değiştirme
function filterLensNamespace(ns) {
  currentLensNamespace = ns;
  fetchLensResources(currentLensKind, ns);
}

// 5. İstemci Tarafı Hızlı Arama
function searchLensResources(query) {
  currentLensSearchQuery = query;
  if (currentLensKind === 'portforwards') {
    fetchLensPortForwards();
  } else {
    renderLensResourceTable(currentLensCache);
  }
}

// 6. Sliding Drawer / Inspector Aç
async function openLensInspector(kind, namespace, name) {
  const drawer = document.getElementById('lens-resource-drawer');
  const backdrop = document.getElementById('lens-drawer-backdrop');
  if (!drawer || !backdrop) return;

  drawer.style.transform = 'translateX(0)';
  backdrop.style.display = 'block';

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  // Başlık güncelle
  document.getElementById('lens-drawer-title').innerText = name;
  document.getElementById('lens-drawer-kind-badge').innerText = kind.toUpperCase();
  document.getElementById('lens-drawer-ns-badge').innerText = namespace;

  // Drawer Content Yükleme İkonu
  const contentArea = document.getElementById('lens-drawer-body');
  contentArea.innerHTML = `
    <div style="text-align:center; padding:60px 20px; color:var(--text-muted);">
      <div class="spinner" style="margin:0 auto 16px;"></div>
      <div>${isEn ? 'Fetching resource manifest & live metrics...' : 'Kaynak manifestosu ve canlı metrikler alınıyor...'}</div>
    </div>
  `;

  try {
    const res = await fetch(`/api/lens/resource-details?kind=${encodeURIComponent(kind)}&namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Detaylar alınamadı');

    activeLensInspectorData = data;
    renderLensDrawerTabs('overview');
  } catch (err) {
    contentArea.innerHTML = `
      <div style="padding:20px; color:var(--danger-text);">Hata: ${err.message}</div>
    `;
  }
}

// 7. Drawer Kapat
function closeLensInspector() {
  const drawer = document.getElementById('lens-resource-drawer');
  const backdrop = document.getElementById('lens-drawer-backdrop');
  if (drawer) drawer.style.transform = 'translateX(100%)';
  if (backdrop) backdrop.style.display = 'none';
  activeLensInspectorData = null;
}

// 8. Drawer İçi Sekmeler (Overview, Containers, Events, Live YAML Editor)
function renderLensDrawerTabs(tabName) {
  const contentArea = document.getElementById('lens-drawer-body');
  if (!contentArea || !activeLensInspectorData) return;

  document.querySelectorAll('.lens-drawer-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeTabBtn = document.getElementById(`lens-dtab-${tabName}`);
  if (activeTabBtn) activeTabBtn.classList.add('active');

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  const d = activeLensInspectorData;

  if (tabName === 'overview') {
    contentArea.innerHTML = `
      <!-- Action Bar -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; padding-bottom:14px; margin-bottom:16px; border-bottom:1px solid var(--border-color);">
        <button class="btn btn-secondary btn-sm" onclick="openLensLogs('${d.namespace}', '${d.name}')">
          📜 Logs
        </button>
        <button class="btn btn-secondary btn-sm" onclick="openLensExec('${d.namespace}', '${d.name}')">
          💻 Terminal (Shell)
        </button>
        <button class="btn btn-secondary btn-sm" onclick="openLensPortForwardPrompt('${d.namespace}', '${d.kind}/${d.name}', 8080)">
          🔌 Port Forward
        </button>
        <button class="btn btn-secondary btn-sm" onclick="scaleLensResourcePrompt('${d.kind}', '${d.namespace}', '${d.name}')">
          📈 Replicas
        </button>
        <button class="btn btn-secondary btn-sm" onclick="restartLensResourceAction('${d.kind}', '${d.namespace}', '${d.name}')">
          🔄 Restart
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteLensResourceAction('${d.kind}', '${d.namespace}', '${d.name}')">
          🗑️ ${isEn ? 'Delete' : 'Sil'}
        </button>
      </div>

      <!-- Resource Telemetry Gauges -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
        <div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); border-radius:8px; padding:12px;">
          <div style="font-size:0.72rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">CPU Usage</div>
          <div style="font-size:1.15rem; font-weight:700; color:#60A5FA; margin-top:2px;">${d.metrics.cpuUsage} <span style="font-size:0.75rem; color:var(--text-muted);">(${d.metrics.cpuPercent}% / Limit: ${d.metrics.cpuLimit})</span></div>
          <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:6px; overflow:hidden;">
            <div style="width:${d.metrics.cpuPercent}%; height:100%; background:#3B82F6;"></div>
          </div>
        </div>
        <div style="background:rgba(168,85,247,0.08); border:1px solid rgba(168,85,247,0.2); border-radius:8px; padding:12px;">
          <div style="font-size:0.72rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Memory Usage</div>
          <div style="font-size:1.15rem; font-weight:700; color:#C084FC; margin-top:2px;">${d.metrics.memoryUsage} <span style="font-size:0.75rem; color:var(--text-muted);">(${d.metrics.memoryPercent}% / Limit: ${d.metrics.memoryLimit})</span></div>
          <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:2px; margin-top:6px; overflow:hidden;">
            <div style="width:${d.metrics.memoryPercent}%; height:100%; background:#A855F7;"></div>
          </div>
        </div>
      </div>

      <!-- Metadata Box -->
      <div style="display:flex; flex-direction:column; gap:10px; font-size:0.82rem;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">UID:</span>
          <span style="font-family:'JetBrains Mono',monospace; color:#fff;">${d.overview.uid}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">${isEn ? 'Created' : 'Oluşturuldu'}:</span>
          <span style="color:#fff;">${d.overview.created}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">${isEn ? 'Controlled By' : 'Yönetici'}:</span>
          <span style="color:#38BDF8; font-family:'JetBrains Mono',monospace;">${d.overview.controlledBy}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">Node:</span>
          <span style="color:#fff;">${d.overview.node}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">Pod IP:</span>
          <span style="font-family:'JetBrains Mono',monospace; color:#34D399;">${d.overview.ip}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:6px;">
          <span style="color:var(--text-dim);">QoS Class:</span>
          <span style="color:#FBBF24; font-weight:700;">${d.overview.qosClass}</span>
        </div>
      </div>

      <!-- Labels -->
      <div style="margin-top:18px;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700; margin-bottom:8px;">Labels (${d.labels.length})</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${d.labels.map(l => `
            <span style="background:rgba(255,255,255,0.06); border:1px solid var(--border-color); padding:3px 8px; border-radius:4px; font-size:0.73rem; font-family:'JetBrains Mono',monospace;">
              <span style="color:#93C5FD;">${l.key}</span>=<span style="color:#34D399;">${l.value}</span>
            </span>
          `).join('')}
        </div>
      </div>
    `;
  } else if (tabName === 'containers') {
    contentArea.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${d.containers.map(c => `
          <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-color); border-radius:8px; padding:14px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-weight:700; color:#38BDF8; font-size:0.9rem;">🐳 ${c.name}</span>
              <span class="preflight-status-chip success" style="font-size:0.75rem;">● ${c.state}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-dim); margin-bottom:4px;">Image:</div>
            <div style="background:#0F172A; padding:6px 10px; border-radius:4px; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#A78BFA; word-break:break-all; margin-bottom:8px;">
              ${c.image}
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
              <span style="color:var(--text-dim);">Ports: <strong style="color:#fff;">${c.ports}</strong></span>
              <span style="color:var(--text-dim);">Restarts: <strong style="color:#fff;">${c.restarts}</strong></span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tabName === 'events') {
    contentArea.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${d.events.map(ev => `
          <div style="background:rgba(255,255,255,0.02); border-left:3px solid #3B82F6; padding:10px 14px; border-radius:0 6px 6px 0; font-size:0.78rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:700; color:#93C5FD;">${ev.reason} (${ev.type})</span>
              <span style="color:var(--text-dim); font-size:0.72rem;">${ev.age}</span>
            </div>
            <div style="color:var(--text-muted);">${ev.message}</div>
          </div>
        `).join('')}
      </div>
    `;
  } else if (tabName === 'yaml') {
    contentArea.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span style="font-size:0.75rem; color:var(--text-dim);">Canlı YAML Düzenle (In-Place Apply):</span>
        <button class="btn btn-success btn-sm" onclick="applyLensYamlFromDrawer()">
          💾 ${isEn ? 'Save & Apply' : 'Değişiklikleri Uygula'}
        </button>
      </div>
      <textarea id="lens-drawer-yaml-textarea" style="width:100%; height:420px; background:#0B0F19; color:#38BDF8; font-family:'JetBrains Mono',monospace; font-size:0.8rem; padding:12px; border:1px solid var(--border-color); border-radius:6px; outline:none; resize:vertical; line-height:1.4;">${d.yaml}</textarea>
    `;
  }
}

// 9. Canlı Pod Log Görüntüleyici
async function openLensLogs(namespace, podName) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  
  // Drawer içindeki log görünümü veya modal
  alert(`${isEn ? 'Opening Live Pod Log Stream for' : 'Canlı Pod Log Akışı Açılıyor:'} ${podName} [${namespace}]`);

  try {
    const res = await fetch(`/api/lens/pod-logs?namespace=${encodeURIComponent(namespace)}&podName=${encodeURIComponent(podName)}&tail=100`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Loglar alınamadı');

    // Terminal / Log pane'ine yönlendir veya göster
    if (typeof switchOpsView === 'function') {
      switchOpsView('logs');
      const logArea = document.getElementById('live-pod-log-terminal');
      if (logArea) {
        logArea.innerText = data.lines.join('\n');
      }
    }
  } catch (err) {
    alert(`Log hatası: ${err.message}`);
  }
}

// 10. Canlı Terminal / Shell
function openLensExec(namespace, podName) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  if (typeof switchOpsView === 'function') {
    switchOpsView('console');
    const termInput = document.getElementById('web-kubectl-input');
    if (termInput) {
      termInput.value = `kubectl exec -it -n ${namespace} ${podName} -- /bin/sh`;
      termInput.focus();
    }
  }
}

// 11. Port-Forwarding Başlatma İstemi
async function openLensPortForwardPrompt(namespace, resource, defaultPort = 8080) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  const targetPort = prompt(isEn ? `Enter target container port for ${resource}:` : `${resource} için hedef konteyner portunu girin:`, defaultPort);
  if (!targetPort) return;

  const localPort = prompt(isEn ? 'Enter local host port to bind (e.g. 8080):' : 'Bağlanacak yerel makine portunu girin (Örn: 8080):', targetPort);
  if (!localPort) return;

  try {
    const res = await fetch('/api/lens/port-forward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namespace, resource, targetPort, localPort })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Port yönlendirme başlatılamadı');

    alert(data.message);
    switchLensKind('portforwards');
  } catch (err) {
    alert(`Port-forward hatası: ${err.message}`);
  }
}

// 12. Canlı YAML Uygula
async function applyLensYamlFromDrawer() {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  const textarea = document.getElementById('lens-drawer-yaml-textarea');
  if (!textarea) return;

  const yamlContent = textarea.value;
  try {
    const res = await fetch('/api/lens/resource-yaml', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yaml: yamlContent })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'YAML uygulanamadı');

    alert(isEn ? 'Manifest successfully applied to cluster!' : 'Manifesto kümeye başarıyla uygulandı (configured)!');
    closeLensInspector();
    fetchLensResources(currentLensKind);
  } catch (err) {
    alert(`Hata: ${err.message}`);
  }
}

// 13. Replicas Ölçekleme
async function scaleLensResourcePrompt(kind, namespace, name) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  const count = prompt(isEn ? `Enter target replicas for ${name}:` : `${name} için yeni replika sayısını girin:`, '3');
  if (count === null) return;

  try {
    const res = await fetch('/api/lens/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, namespace, name, replicas: count })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Ölçeklenemedi');

    alert(data.message);
    fetchLensResources(currentLensKind);
  } catch (err) {
    alert(`Ölçekleme hatası: ${err.message}`);
  }
}

// 14. Rollout Restart
async function restartLensResourceAction(kind, namespace, name) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  if (!confirm(isEn ? `Are you sure you want to restart ${name}?` : `'${name}' kaynağını sıfır kesintiyle yeniden başlatmak istiyor musunuz?`)) return;

  try {
    const res = await fetch('/api/lens/rollout-restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, namespace, name })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Yeniden başlatılamadı');

    alert(data.message);
    fetchLensResources(currentLensKind);
  } catch (err) {
    alert(`Restart hatası: ${err.message}`);
  }
}

// 15. Safe Delete
async function deleteLensResourceAction(kind, namespace, name) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  if (!confirm(isEn ? `WARNING: Permanently delete ${kind} '${name}' from ${namespace}?` : `DİKKAT: '${name}' (${kind}) kaynağını kalıcı olarak silmek istiyor musunuz?`)) return;

  try {
    const res = await fetch('/api/lens/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, namespace, name })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Silinemedi');

    alert(data.message);
    closeLensInspector();
    fetchLensResources(currentLensKind);
  } catch (err) {
    alert(`Silme hatası: ${err.message}`);
  }
}

// 16. Aktif Port-Forward Tünelleri Listeleme
async function fetchLensPortForwards() {
  const container = document.getElementById('lens-resource-table-container');
  const countEl = document.getElementById('lens-item-count-badge');
  if (!container) return;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  try {
    const res = await fetch('/api/lens/port-forwards');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Tüneller listelenemedi');

    const pfs = data.portForwards || [];
    if (countEl) countEl.innerText = `${pfs.length} ${isEn ? 'Active Tunnels' : 'Aktif Tünel'}`;

    if (pfs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-dim); background:rgba(255,255,255,0.02); border-radius:8px;">
          <div style="font-size:2rem; margin-bottom:8px;">🔌</div>
          <div>${isEn ? 'No active port-forwarding tunnels. Click any Pod to start a tunnel.' : 'Aktif port yönlendirme tüneli yok. Bir pod veya servis üzerinden tünel başlatabilirsiniz.'}</div>
        </div>
      `;
      return;
    }

    let html = `
      <div style="overflow-x:auto;">
        <table class="data-table" style="width:100%; border-collapse:collapse; font-size:0.83rem;">
          <thead>
            <tr style="background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border-color); text-align:left;">
              <th style="padding:10px 14px;">Local Port / Endpoint</th>
              <th style="padding:10px 14px;">Target Kubernetes Resource</th>
              <th style="padding:10px 14px;">Namespace</th>
              <th style="padding:10px 14px;">Status</th>
              <th style="padding:10px 14px;">Uptime</th>
              <th style="padding:10px 14px;">Data Transferred</th>
              <th style="padding:10px 14px; text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    pfs.forEach(p => {
      html += `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
          <td style="padding:10px 14px;">
            <a href="${p.localUrl}" target="_blank" style="color:#38BDF8; font-weight:700; text-decoration:none; font-family:'JetBrains Mono',monospace;">
              🔗 ${p.localUrl} ➔
            </a>
          </td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace;">
            ${p.resource}:${p.targetPort}
          </td>
          <td style="padding:10px 14px;">
            <span style="background:rgba(255,255,255,0.06); padding:2px 7px; border-radius:4px; font-size:0.75rem; font-family:'JetBrains Mono',monospace;">
              ${p.namespace}
            </span>
          </td>
          <td style="padding:10px 14px;">
            <span class="preflight-status-chip success" style="font-size:0.75rem;">● ${p.status}</span>
          </td>
          <td style="padding:10px 14px; color:var(--text-muted);">${p.uptime}</td>
          <td style="padding:10px 14px; font-family:'JetBrains Mono',monospace; color:#34D399;">${p.bytesTransferred}</td>
          <td style="padding:10px 14px; text-align:right;">
            <button class="btn btn-danger btn-sm" onclick="stopLensPortForwardAction('${p.id}')">
              🛑 ${isEn ? 'Stop Tunnel' : 'Tüneli Durdur'}
            </button>
          </td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px; color:var(--danger-text);">Hata: ${err.message}</div>`;
  }
}

// 17. Tüneli Durdur
async function stopLensPortForwardAction(id) {
  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');
  try {
    const res = await fetch(`/api/lens/port-forward/${encodeURIComponent(id)}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Tünel durdurulamadı');

    alert(data.message);
    fetchLensPortForwards();
  } catch (err) {
    alert(`Durdurma hatası: ${err.message}`);
  }
}
