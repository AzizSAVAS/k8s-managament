// ==============================================================================
// RKE2 CLUSTER HUB: KUBERNETES RESOURCE TIME-MACHINE & VISUAL ROLLBACK
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchTimeMachineHistory() {
  const container = document.getElementById('time-machine-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/time-machine-history');
    const data = await res.json();
    if (!data.success) throw new Error('Zaman makinesi geçmişi alınamadı');

    renderTimeMachine(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderTimeMachine(data) {
  const container = document.getElementById('time-machine-content');
  if (!container) return;

  let html = `
    <!-- Top Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
      <div>
        <span style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Seçili Kaynak:</span>
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#38BDF8; font-size:1.05rem;"> ${data.resource}</span>
      </div>
      <button class="btn btn-secondary" onclick="fetchTimeMachineHistory()" style="padding:4px 10px; font-size:0.75rem;">🔄 Revizyonları Yenile</button>
    </div>

    <!-- Revisions List & Visual Diff -->
    <div style="display:flex; flex-direction:column; gap:16px;">
  `;

  data.revisions.forEach(rev => {
    const isCurrent = rev.status === 'active';
    const isStable = rev.status === 'stable';

    html += `
      <div class="glass-card" style="padding:18px; border-left:4px solid ${isCurrent ? '#EF4444' : isStable ? '#10B981' : 'var(--border-color)'};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-weight:700; font-size:1rem; color:#FFFFFF;">Revizyon #${rev.revision}</span>
              ${isCurrent ? '<span style="background:rgba(239,68,68,0.15); color:#F87171; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">ŞU ANKİ CANLI (HATALI)</span>' : ''}
              ${isStable ? '<span style="background:rgba(16,185,129,0.15); color:#34D399; font-size:0.7rem; font-weight:700; padding:2px 8px; border-radius:4px;">KARARLI SÜRÜM</span>' : ''}
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">
              🕒 ${rev.timestamp} • Yazar: <strong>${rev.author}</strong>
            </div>
            <div style="font-size:0.82rem; color:#F8FAFC; margin-top:4px;">
              📝 <strong>Değişiklik:</strong> ${rev.change}
            </div>
          </div>

          ${!isCurrent ? `
            <button class="btn btn-success rbac-admin-only" onclick="rollbackToRevisionAction(${rev.revision})" style="padding:6px 14px; font-size:0.78rem;">
              ⏪ Bu Sürüme Geri Al (Rollback)
            </button>
          ` : ''}
        </div>

        ${rev.diffRemoved || rev.diffAdded ? `
          <!-- Visual Red/Green Diff Code Block -->
          <div style="background:#060911; border:1px solid var(--border-color); border-radius:6px; padding:12px; font-family:'JetBrains Mono',monospace; font-size:0.76rem; line-height:1.6; overflow-x:auto;">
            ${rev.diffRemoved ? `<div style="background:rgba(239,68,68,0.15); color:#FCA5A5; padding:2px 6px; border-radius:3px; margin-bottom:2px;"><span style="color:#EF4444; font-weight:700;">- </span>${rev.diffRemoved.replace(/\n/g, '<br><span style="color:#EF4444; font-weight:700;">- </span>')}</div>` : ''}
            ${rev.diffAdded ? `<div style="background:rgba(16,185,129,0.15); color:#6EE7B7; padding:2px 6px; border-radius:3px;"><span style="color:#10B981; font-weight:700;">+ </span>${rev.diffAdded.replace(/\n/g, '<br><span style="color:#10B981; font-weight:700;">+ </span>')}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function rollbackToRevisionAction(revision) {
  try {
    const res = await fetch('/api/studios/time-machine-rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revision })
    });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('success', '⏪ Sürüm Geri Alındı', data.message);
    }
    fetchTimeMachineHistory();
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Rollback Hatası', err.message);
    }
  }
}

// Global Attachments
window.fetchTimeMachineHistory = fetchTimeMachineHistory;
window.rollbackToRevisionAction = rollbackToRevisionAction;
