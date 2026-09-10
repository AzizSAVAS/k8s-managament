// ==============================================================================
// RKE2 CLUSTER HUB: eBPF KERNEL WAF & GEO-DEFENSE MAP
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchEbpfWaf() {
  const container = document.getElementById('ebpf-waf-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/waf-telemetry');
    const data = await res.json();
    if (!data.success) throw new Error('WAF telemetrisi alınamadı');

    renderEbpfWaf(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderEbpfWaf(data) {
  const container = document.getElementById('ebpf-waf-content');
  if (!container) return;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  let html = `
    <!-- Top KPI Grid -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="glass-card" style="padding:16px; border-left:4px solid #10B981;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Inspected HTTP/gRPC Requests' : 'İncelenen HTTP/gRPC İstek'}</div>
        <div style="font-size:1.4rem; font-weight:700; color:#38BDF8;">${data.totalInspectedRequests.toLocaleString()}</div>
      </div>
      <div class="glass-card" style="padding:16px; border-left:4px solid #EF4444;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Blocked Kernel (eBPF) Attacks' : 'Engellenen Çekirdek (eBPF) Saldırı'}</div>
        <div style="font-size:1.4rem; font-weight:700; color:#F87171;">${data.blockedAttacks.toLocaleString()}</div>
      </div>
      <div class="glass-card" style="padding:16px; border-left:4px solid #3B82F6;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Avg Packet Drop Latency' : 'Ortalama Paket Düşürme Süresi'}</div>
        <div style="font-size:1.4rem; font-weight:700; color:#34D399;">${data.averageDropLatency}</div>
      </div>
    </div>

    <!-- Geo-Defense & Threat Origin Heatmap -->
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
      <div class="glass-card" style="padding:18px;">
        <div style="font-size:0.95rem; font-weight:700; color:#FFFFFF; margin-bottom:12px;">${isEn ? '🌍 Geographic Threat Origins & Geo-Blocking' : '🌍 Coğrafi Tehdit Kaynakları & Geo-Blocking'}</div>
        <div style="display:flex; flex-direction:column; gap:8px;">
  `;

  data.countries.forEach(c => {
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:8px 12px; border-radius:6px; font-size:0.82rem;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.2rem;">${c.flag}</span>
          <span style="font-weight:600; color:#fff;">${c.name} (${c.code})</span>
          <span style="color:var(--text-dim); font-size:0.75rem;">• ${c.attacks.toLocaleString()} ${isEn ? 'attacks' : 'saldırı'}</span>
        </div>
        <button class="btn btn-sm ${c.blocked ? 'btn-danger' : 'btn-secondary'}" 
                onclick="toggleWafCountryBlock('${c.code}', ${!c.blocked})" 
                style="padding:3px 8px; font-size:0.72rem;">
          ${c.blocked ? (isEn ? '🚫 BLOCKED' : '🚫 BLOKLU') : (isEn ? 'Allowed' : 'İzin Veriliyor')}
        </button>
      </div>
    `;
  });

  html += `
        </div>
      </div>

      <!-- Attack Types Breakdown -->
      <div class="glass-card" style="padding:18px;">
        <div style="font-size:0.95rem; font-weight:700; color:#FFFFFF; margin-bottom:12px;">${isEn ? '⚔️ Blocked L7 Attack Vectors' : '⚔️ Engellenen L7 Saldırı Vektörleri'}</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
  `;

  data.attackTypes.forEach(att => {
    const sevColor = att.severity === 'CRITICAL' ? '#EF4444' : '#F59E0B';
    html += `
      <div style="background:rgba(0,0,0,0.25); padding:10px 14px; border-radius:6px; border-left:3px solid ${sevColor};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-weight:700; font-size:0.84rem; color:#fff;">${att.type}</span>
          <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:${sevColor};">${att.count.toLocaleString()}</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${isEn ? 'Dropped at kernel level via Cilium eBPF TC (Traffic Control).' : 'Cilium eBPF TC (Traffic Control) kernel seviyesinde drop edildi.'}</div>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

async function toggleWafCountryBlock(code, blocked) {
  try {
    const res = await fetch('/api/studios/waf-block-country', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, blocked })
    });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('info', 'eBPF Geo-Defense', data.message);
    }
    fetchEbpfWaf();
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Hata', err.message);
    }
  }
}

// Global Attachments
window.fetchEbpfWaf = fetchEbpfWaf;
window.toggleWafCountryBlock = toggleWafCountryBlock;
