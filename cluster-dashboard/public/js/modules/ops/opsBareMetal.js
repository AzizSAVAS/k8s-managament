// ==============================================================================
// RKE2 CLUSTER HUB: BARE-METAL & IPMI/iDRAC HARDWARE CONSOLE
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchBareMetalNodes() {
  const container = document.getElementById('bare-metal-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/bare-metal-nodes');
    const data = await res.json();
    if (!data.success) throw new Error('Bare-Metal sunucular alınamadı');

    renderBareMetalNodes(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderBareMetalNodes(data) {
  const container = document.getElementById('bare-metal-content');
  if (!container) return;

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div style="font-size:0.85rem; color:var(--text-muted);">
        Toplam <strong>${data.servers.length} Fiziksel Şasi</strong> IPMI/Redfish üzerinden senkronize.
      </div>
      <button class="btn btn-secondary" onclick="fetchBareMetalNodes()" style="padding:4px 10px; font-size:0.75rem;">🔄 Sensörleri Oku</button>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(340px, 1fr)); gap:16px;">
  `;

  data.servers.forEach(srv => {
    html += `
      <div class="glass-card" style="padding:18px; border-left:4px solid #38BDF8;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:#FFFFFF;">🖥️ ${srv.chassis}</div>
            <div style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#38BDF8;">IPMI IP: ${srv.ipmiIp} • ${srv.managementType}</div>
          </div>
          <span style="background:rgba(16,185,129,0.15); color:#34D399; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">PWR: ${srv.powerState}</span>
        </div>

        <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:12px;">
          Atanmış Küme Düğümü: <strong style="color:#F8FAFC;">${srv.assignedRole}</strong>
        </div>

        <!-- Hardware Telemetry Matrix -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-size:0.72rem; margin-bottom:12px;">
          <div>
            <span style="color:var(--text-dim);">CPU Sıcaklık:</span>
            <div style="font-weight:700; color:#F8FAFC;">${srv.cpuTempC}°C</div>
          </div>
          <div>
            <span style="color:var(--text-dim);">Fan Devri:</span>
            <div style="font-weight:700; color:#34D399;">${srv.fansRpm} RPM</div>
          </div>
          <div>
            <span style="color:var(--text-dim);">Güç Çekimi:</span>
            <div style="font-weight:700; color:#FBBF24;">${srv.powerDrawWatts} W</div>
          </div>
          <div style="grid-column:span 3; padding-top:4px; border-top:1px solid rgba(255,255,255,0.06); color:var(--text-muted);">
            PSU Durumu: <strong style="color:#34D399;">${srv.psuRedundancy}</strong>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display:flex; gap:8px; justify-content:flex-end;">
          <button class="btn btn-secondary" onclick="triggerIpmiAction('${srv.id}', 'identify-led')" style="padding:4px 8px; font-size:0.72rem;">💡 Işık Yak</button>
          <button class="btn btn-secondary rbac-admin-only" onclick="triggerIpmiAction('${srv.id}', 'power-cycle')" style="padding:4px 8px; font-size:0.72rem; color:#F87171;">⚡ Güç Kes/Aç</button>
          <button class="btn btn-primary" onclick="triggerIpmiAction('${srv.id}', 'pxe-reboot')" style="padding:4px 8px; font-size:0.72rem;">🚀 iPXE Boot</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function triggerIpmiAction(serverId, action) {
  try {
    const res = await fetch('/api/studios/ipmi-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, action })
    });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('info', 'IPMI Eylemi', data.message);
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'IPMI Hatası', err.message);
    }
  }
}

// Global Attachments
window.fetchBareMetalNodes = fetchBareMetalNodes;
window.triggerIpmiAction = triggerIpmiAction;
