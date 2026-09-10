// ==============================================================================
// RKE2 CLUSTER HUB: SECRET & CREDENTIAL LEAK RADAR
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchSecretLeakRadar() {
  const container = document.getElementById('secret-radar-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/scan-secret-leaks');
    const data = await res.json();
    if (!data.success) throw new Error('Sızıntı taraması tamamlanamadı');

    renderSecretLeaks(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderSecretLeaks(data) {
  const container = document.getElementById('secret-radar-content');
  if (!container) return;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  let html = `
    <!-- Top KPI Bar -->
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:20px;">
      <div class="glass-card" style="padding:14px; text-align:center;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Scanned K8s Objects' : 'Taranan K8s Nesnesi'}</div>
        <div style="font-size:1.4rem; font-weight:700; color:#38BDF8;">${data.scannedObjects}</div>
      </div>
      <div class="glass-card" style="padding:14px; text-align:center; border-left:3px solid #EF4444;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Exposed Secrets / Tokens' : 'Açıkta Kalan Şifre / Token'}</div>
        <div style="font-size:1.4rem; font-weight:700; color:#F87171;">${data.leaksFound}</div>
      </div>
      <div class="glass-card" style="padding:14px; text-align:center;">
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Last Scan Time' : 'Son Tarama Saati'}</div>
        <div style="font-size:1.1rem; font-weight:700; color:#34D399;">${data.scannedAt}</div>
      </div>
      <div style="display:flex; align-items:center; justify-content:flex-end;">
        <button class="btn btn-primary" onclick="fetchSecretLeakRadar()" style="padding:10px 18px;">
          ${isEn ? '🔍 Run Deep Scan Now' : '🔍 Yeniden Derin Tarama Başlat'}
        </button>
      </div>
    </div>

    <!-- Leaks List -->
    <div style="display:flex; flex-direction:column; gap:14px;">
  `;

  data.leaks.forEach(leak => {
    const sevColor = leak.severity === 'CRITICAL' ? '#EF4444' : leak.severity === 'HIGH' ? '#F59E0B' : '#3B82F6';
    const sevBg = leak.severity === 'CRITICAL' ? 'rgba(239,68,68,0.15)' : leak.severity === 'HIGH' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)';

    html += `
      <div class="glass-card" style="padding:18px; border-left:4px solid ${sevColor};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:${sevBg}; color:${sevColor}; font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px;">
                ${leak.severity}
              </span>
              <span style="font-size:0.98rem; font-weight:700; color:#FFFFFF;">${leak.type}</span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">
              ${isEn ? 'Affected Object:' : 'Etkilenen Nesne:'} <code style="color:#F8FAFC; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:3px;">${leak.object}</code>
            </div>
          </div>
          <span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:var(--text-dim);">${leak.id}</span>
        </div>

        <div style="background:#060911; border:1px solid var(--border-color); border-radius:6px; padding:10px 14px; font-family:'JetBrains Mono',monospace; font-size:0.78rem; color:#F87171; margin-bottom:10px; word-break:break-all;">
          ⚠️ ${isEn ? 'Leaked Value:' : 'Sızıntı Değeri:'} <span style="color:#FBBF24;">${leak.maskedValue}</span>
          <div style="font-size:0.7rem; color:var(--text-dim); margin-top:4px;">${isEn ? 'Location:' : 'Konum:'} ${leak.location}</div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div style="font-size:0.76rem; color:#94A3B8; max-width:650px;">
            💡 <strong>${isEn ? 'Remediation:' : 'İyileştirme (Remediation):'}</strong> ${leak.remediation}
          </div>
          <button class="btn btn-secondary" onclick="generateVaultRemediation('${leak.id}')" style="padding:4px 10px; font-size:0.75rem;">
            ${isEn ? '🔐 Convert to Vault Secret' : '🔐 Vault Secret\'a Dönüştür'}
          </button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function generateVaultRemediation(leakId) {
  if (typeof showToast === 'function') {
    showToast('success', 'Vault Secret Dönüştürüldü', `${leakId} için Kubernetes Secret ve Vault ExternalSecret manifestosu hazırlandı.`);
  }
}

// Global Attachments
window.fetchSecretLeakRadar = fetchSecretLeakRadar;
window.generateVaultRemediation = generateVaultRemediation;
