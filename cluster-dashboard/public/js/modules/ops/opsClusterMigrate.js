// ==============================================================================
// RKE2 CLUSTER HUB: CLUSTER HYPER-MIGRATE & LIVE CLONING ENGINE
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchMigrationPlan() {
  const container = document.getElementById('migration-status-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/migration-plan');
    const data = await res.json();
    renderMigrationPlan(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderMigrationPlan(data) {
  const container = document.getElementById('migration-status-content');
  if (!container) return;

  let html = `
    <!-- Top summary bar -->
    <div style="background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.25); border-radius:8px; padding:16px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Kaynak Ortam ➔ Hedef DR Ortamı:</div>
        <div style="font-size:1.05rem; font-weight:700; color:#FFFFFF;">
          🏢 ${data.source} ➔ ☁️ ${data.target}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:16px;">
        <div style="text-align:right;">
          <div style="font-size:0.72rem; color:var(--text-dim);">Ölçülen RTO / Kesinti:</div>
          <div style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:1.1rem; color:#34D399;">⏱️ ${data.rtoSeconds || 1.2} sn</div>
        </div>
        <button class="btn btn-primary" onclick="stepMigrationAction()" style="padding:8px 16px;">
          ${data.active ? '⏩ Sonraki Aşamaya Geç' : '🚀 Canlı Göçü Başlat'}
        </button>
      </div>
    </div>

    <!-- Progress Bar -->
    <div style="margin-bottom:24px;">
      <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:6px;">
        <span style="color:var(--text-muted);">Genel Taşıma İlerlemesi</span>
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#38BDF8;">%${data.progress || 0}</span>
      </div>
      <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
        <div style="height:100%; width:${data.progress || 0}%; background:linear-gradient(90deg, #3B82F6, #10B981); transition:width 0.4s ease;"></div>
      </div>
    </div>

    <!-- 5-Phase Timeline -->
    <div style="display:flex; flex-direction:column; gap:10px;">
  `;

  data.phases.forEach((phase, idx) => {
    const isDone = phase.status === 'completed';
    const isProg = phase.status === 'in_progress';
    const badgeColor = isDone ? '#10B981' : isProg ? '#3B82F6' : 'rgba(255,255,255,0.2)';
    const badgeBg = isDone ? 'rgba(16,185,129,0.15)' : isProg ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)';
    const badgeText = isDone ? 'TAMAMLANDI' : isProg ? 'İŞLENİYOR...' : 'BEKLEMEDE';

    html += `
      <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${badgeColor};">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:1.1rem;">${isDone ? '✅' : isProg ? '⏳' : '⚪'}</span>
          <span style="font-size:0.9rem; font-weight:600; color:#FFFFFF;">${phase.name}</span>
        </div>
        <span style="background:${badgeBg}; color:${badgeColor}; font-size:0.72rem; font-weight:700; padding:3px 8px; border-radius:4px;">
          ${badgeText}
        </span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function stepMigrationAction() {
  try {
    const res = await fetch('/api/studios/step-migration', { method: 'POST' });
    const data = await res.json();
    renderMigrationPlan(data);
    if (typeof showToast === 'function') {
      showToast('info', 'Göç Hattı İlerletildi', `Aşama ${data.step}/5 işletildi.`);
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Hata', err.message);
    }
  }
}

// Global Attachments
window.fetchMigrationPlan = fetchMigrationPlan;
window.stepMigrationAction = stepMigrationAction;
