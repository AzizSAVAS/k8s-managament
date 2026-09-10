// ==============================================================================
// RKE2 CLUSTER HUB: eBPF CONTINUOUS FLAMEGRAPH PROFILER
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchFlamegraphProfile() {
  const container = document.getElementById('flamegraph-canvas-container');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/flamegraph-profile');
    const data = await res.json();
    if (!data.success) throw new Error('Alev grafiği verisi alınamadı');

    renderFlamegraph(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderFlamegraph(data) {
  const container = document.getElementById('flamegraph-canvas-container');
  if (!container) return;

  const total = data.root.value;

  function renderNode(node, depth, x, width) {
    const percent = ((node.value / total) * 100).toFixed(1);
    const isKernel = node.name.includes('kernel') || node.name.includes('bpf') || node.name.includes('tcp');
    const bg = isKernel ? 'linear-gradient(90deg, #DC2626, #EA580C)' : 'linear-gradient(90deg, #2563EB, #7C3AED)';

    let nodeHtml = `
      <div class="flame-bar" style="left:${x}%; width:${width}%; top:${depth * 28}px; background:${bg};" 
           title="${node.name} (${node.value} samples, %${percent})"
           onclick="focusFlameNode('${node.name}', '${percent}')">
        <span class="flame-label">${node.name} (%${percent})</span>
      </div>
    `;

    if (node.children && node.children.length > 0) {
      let currentX = x;
      node.children.forEach(child => {
        const childWidth = (child.value / total) * 100;
        nodeHtml += renderNode(child, depth + 1, currentX, childWidth);
        currentX += childWidth;
      });
    }

    return nodeHtml;
  }

  const html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div style="font-size:0.8rem; color:var(--text-muted);">
        ⏱️ Örnekleme Süresi: <strong>${data.capturedDuration}</strong> • Toplam eBPF Yığın Örneği: <strong>${data.totalSamples.toLocaleString()}</strong>
      </div>
      <button class="btn btn-secondary" onclick="fetchFlamegraphProfile()" style="padding:4px 10px; font-size:0.75rem;">🔥 Yeniden Profillendir</button>
    </div>

    <div id="flame-focus-banner" style="display:none; padding:8px 12px; background:rgba(37,99,235,0.15); border:1px solid #3B82F6; border-radius:6px; font-size:0.8rem; color:#93C5FD; margin-bottom:12px;"></div>

    <div class="flamegraph-viewport" style="position:relative; height:240px; background:#0B0F19; border:1px solid var(--border-color); border-radius:8px; overflow-x:auto; overflow-y:hidden; padding:8px;">
      ${renderNode(data.root, 0, 0, 100)}
    </div>
  `;

  container.innerHTML = html;
}

function focusFlameNode(name, percent) {
  const banner = document.getElementById('flame-focus-banner');
  if (!banner) return;
  banner.style.display = 'block';
  banner.innerHTML = `🔍 <strong>Seçilen Yığın Çerçevesi:</strong> <code>${name}</code> • Toplam CPU Zamanı Payı: <strong>%${percent}</strong>`;
}

// Global Attachments
window.fetchFlamegraphProfile = fetchFlamegraphProfile;
window.focusFlameNode = focusFlameNode;
