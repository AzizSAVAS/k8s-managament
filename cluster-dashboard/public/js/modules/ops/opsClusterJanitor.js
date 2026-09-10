// ==============================================================================
// RKE2 CLUSTER HUB: CLUSTER JANITOR & ZOMBIE PURGER
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchClusterJanitor() {
  const container = document.getElementById('cluster-janitor-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/janitor-scan');
    const data = await res.json();
    if (!data.success) throw new Error('Çöp taraması tamamlanamadı');

    renderClusterJanitor(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderClusterJanitor(data) {
  const container = document.getElementById('cluster-janitor-content');
  if (!container) return;

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en') || (window.currentLanguage === 'en');

  let html = `
    <!-- Top KPI Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; background:rgba(37,99,235,0.08); border:1px solid rgba(37,99,235,0.25); border-radius:8px; padding:16px; margin-bottom:20px;">
      <div>
        <div style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">${isEn ? 'Reclaimable Stale Storage & Memory:' : 'Geri Kazanılabilir Atıl Depolama & Bellek:'}</div>
        <div style="font-size:1.15rem; font-weight:700; color:#FFFFFF; margin-top:2px;">
          💾 <span style="color:#34D399;">~${data.reclaimableDiskGB} GB Disk</span> • 🧠 <span style="color:#38BDF8;">~${data.reclaimableRamMB} MB RAM</span>
        </div>
      </div>
      <button class="btn btn-success" onclick="purgeClusterJanitorAction()" style="padding:10px 18px;">
        ${isEn ? '🧹 Purge All Stale Resources' : '🧹 Tüm Atıl Kaynakları Temizle (Purge)'}
      </button>
    </div>

    <!-- Items Table -->
    <div style="display:flex; flex-direction:column; gap:10px;">
  `;

  data.orphanItems.forEach(item => {
    html += `
      <div class="glass-card" style="padding:14px 18px; display:flex; justify-content:space-between; align-items:center; border-left:3px solid #F59E0B;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:#FFFFFF; font-size:0.9rem;">${item.name}</span>
            <span style="background:rgba(245,158,11,0.15); color:#FBBF24; font-size:0.7rem; font-weight:700; padding:2px 6px; border-radius:4px;">
              ${item.type}
            </span>
            <span style="font-size:0.72rem; color:var(--text-dim);">[${item.namespace}]</span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">
            ⚠️ <strong>${isEn ? 'Why Stale:' : 'Neden Atıl:'}</strong> ${item.reason}
          </div>
        </div>
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; font-size:0.85rem; color:#38BDF8;">
          ${item.size || 'Pod Log'}
        </span>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function purgeClusterJanitorAction() {
  try {
    const res = await fetch('/api/studios/janitor-purge', { method: 'POST' });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('success', '🧹 Küme Temizlendi', data.message);
    }
    fetchClusterJanitor();
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Temizlik Hatası', err.message);
    }
  }
}

// Global Attachments
window.fetchClusterJanitor = fetchClusterJanitor;
window.purgeClusterJanitorAction = purgeClusterJanitorAction;
