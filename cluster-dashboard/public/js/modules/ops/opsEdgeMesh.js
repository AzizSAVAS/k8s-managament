// ==============================================================================
// RKE2 CLUSTER HUB: EDGE MESH & AUTONOMOUS BRANCH SITES
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchEdgeSites() {
  const container = document.getElementById('edge-mesh-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/edge-sites');
    const data = await res.json();
    if (!data.success) throw new Error('Edge lokasyonları alınamadı');

    renderEdgeSites(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderEdgeSites(data) {
  const container = document.getElementById('edge-mesh-content');
  if (!container) return;

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div style="font-size:0.85rem; color:var(--text-muted);">
        Aktif <strong>${data.sites.length} Uç Saha İstasyonu</strong> (Fabrika, Lojistik, Deniz Filosu) izleniyor.
      </div>
      <button class="btn btn-secondary" onclick="fetchEdgeSites()" style="padding:4px 10px; font-size:0.75rem;">🔄 Saha Durumunu Tara</button>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px;">
  `;

  data.sites.forEach(site => {
    html += `
      <div class="glass-card" style="padding:18px; border-left:4px solid #10B981;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <div style="font-size:0.95rem; font-weight:700; color:#FFFFFF;">📡 ${site.name}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${site.type} • ID: ${site.id}</div>
          </div>
          <span style="background:rgba(16,185,129,0.15); color:#34D399; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">${site.nodes} Node</span>
        </div>

        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-size:0.75rem; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--text-dim);">Bağlantı:</span>
            <span style="font-weight:600; color:#38BDF8;">${site.connectivity}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--text-dim);">Gecikme (Latency):</span>
            <span style="font-family:'JetBrains Mono',monospace; color:#F8FAFC;">${site.latencyMs} ms</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--text-dim);">Yerel NVMe Tampon:</span>
            <span style="color:#34D399;">${site.offlineBufferCapacity}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--text-dim);">Otonom Mod:</span>
            <span style="color:#FBBF24;">${site.autonomousMode}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.72rem; color:var(--text-muted);">Durum: <strong>${site.syncStatus}</strong></span>
          <button class="btn btn-secondary" onclick="syncEdgeSiteAction('${site.id}')" style="padding:4px 8px; font-size:0.72rem;">⚡ Manuel Senkronize Et</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function syncEdgeSiteAction(siteId) {
  try {
    const res = await fetch('/api/studios/edge-sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId })
    });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('success', 'Edge Eşitleme', data.message);
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Hata', err.message);
    }
  }
}

// Global Attachments
window.fetchEdgeSites = fetchEdgeSites;
window.syncEdgeSiteAction = syncEdgeSiteAction;
