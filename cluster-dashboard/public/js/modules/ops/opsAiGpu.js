// ==============================================================================
// RKE2 CLUSTER HUB: AI & GPU OPS WORKSTATION
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

async function fetchGpuTelemetry() {
  const container = document.getElementById('gpu-telemetry-content');
  if (!container) return;

  try {
    const res = await fetch('/api/studios/gpu-telemetry');
    const data = await res.json();
    if (!data.success) throw new Error('GPU telemetrisi alınamadı');

    renderGpuTelemetry(data);
  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger-text); padding:20px;">Hata: ${err.message}</div>`;
  }
}

function renderGpuTelemetry(data) {
  const container = document.getElementById('gpu-telemetry-content');
  if (!container) return;

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div>
        <span style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">NVIDIA Driver:</span>
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#38BDF8; margin-right:16px;"> ${data.driverVersion}</span>
        <span style="font-size:0.75rem; color:var(--text-dim); text-transform:uppercase; font-weight:700;">CUDA:</span>
        <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:#34D399;"> ${data.cudaVersion}</span>
      </div>
      <button class="btn btn-secondary" onclick="fetchGpuTelemetry()" style="padding:4px 10px; font-size:0.75rem;">🔄 Yenile</button>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin-bottom:24px;">
  `;

  data.gpus.forEach(gpu => {
    const vramColor = gpu.vramPercent > 80 ? '#EF4444' : gpu.vramPercent > 60 ? '#F59E0B' : '#10B981';
    html += `
      <div class="glass-card" style="padding:18px; border-left:4px solid #8B5CF6;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
          <div>
            <div style="font-size:0.95rem; font-weight:700; color:#FFFFFF;">GPU #${gpu.id}: ${gpu.name}</div>
            <div style="font-size:0.74rem; color:var(--text-muted);">Aktif Model: <strong style="color:#C084FC;">${gpu.activeModel}</strong></div>
          </div>
          <span style="background:rgba(139,92,246,0.15); color:#C084FC; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:700;">ONLINE</span>
        </div>

        <!-- VRAM Gauge -->
        <div style="margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
            <span style="color:var(--text-muted);">VRAM Doluluğu</span>
            <span style="font-family:'JetBrains Mono',monospace; font-weight:700; color:${vramColor};">${gpu.vramUsedGB} GB / ${gpu.vramTotalGB} GB (%${gpu.vramPercent})</span>
          </div>
          <div style="height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden;">
            <div style="height:100%; width:${gpu.vramPercent}%; background:${vramColor}; border-radius:3px;"></div>
          </div>
        </div>

        <!-- Metrics Grid -->
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; text-align:center; background:rgba(0,0,0,0.25); padding:10px; border-radius:6px; font-size:0.75rem;">
          <div>
            <div style="color:var(--text-dim); font-size:0.68rem;">Sıcaklık</div>
            <div style="font-weight:700; color:#fff;">🌡️ ${gpu.gpuTempC}°C</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:0.68rem;">Güç (Watt)</div>
            <div style="font-weight:700; color:#FBBF24;">⚡ ${gpu.powerWatts}W</div>
          </div>
          <div>
            <div style="color:var(--text-dim); font-size:0.68rem;">Tensor Yükü</div>
            <div style="font-weight:700; color:#38BDF8;">⚙️ %${gpu.tensorUtilization}</div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
}

async function deployLlmModelAction() {
  const select = document.getElementById('llm-model-select');
  const gpuSelect = document.getElementById('llm-gpu-select');
  const model = select ? select.value : 'DeepSeek-R1-Distill-Llama-70B';
  const gpuId = gpuSelect ? gpuSelect.value : 0;

  try {
    const res = await fetch('/api/studios/deploy-llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelName: model, gpuId: gpuId })
    });
    const data = await res.json();
    if (typeof showToast === 'function') {
      showToast('success', '🤖 LLM Modeli Dağıtıldı', data.message);
    }
    fetchGpuTelemetry();
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast('danger', 'Dağıtım Hatası', err.message);
    }
  }
}

async function sendTestLlmPrompt() {
  const input = document.getElementById('llm-prompt-input');
  const output = document.getElementById('llm-chat-response');
  if (!input || !output) return;

  const prompt = input.value.trim();
  if (!prompt) return;

  output.style.display = 'block';
  output.innerHTML = '⏳ <em>DeepSeek-R1 kernel çıkarımı hesaplıyor...</em>';

  try {
    const res = await fetch('/api/studios/llm-infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt, model: 'DeepSeek-R1' })
    });
    const data = await res.json();
    output.innerHTML = `
      <div style="color:#C084FC; font-weight:700; margin-bottom:4px;">DeepSeek-R1 Yanıtı (${data.latencyMs}ms • ${data.tokensUsed} token):</div>
      <div style="color:#E2E8F0; font-size:0.86rem; line-height:1.5;">${data.reply}</div>
    `;
  } catch (err) {
    output.innerHTML = `<div style="color:var(--danger-text);">Hata: ${err.message}</div>`;
  }
}

// Global Attachments
window.fetchGpuTelemetry = fetchGpuTelemetry;
window.deployLlmModelAction = deployLlmModelAction;
window.sendTestLlmPrompt = sendTestLlmPrompt;
