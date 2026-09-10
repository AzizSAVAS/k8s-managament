// ==============================================================================
// RKE2 CLUSTER HUB: REAL-TIME METRICS OSCILLOSCOPE (CANVAS 60-FPS)
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

let oscilloscopeTimer = null;
let oscilloscopeHistory = [];
const MAX_OSCILLOSCOPE_POINTS = 50;

function initMetricsOscilloscope() {
  const canvas = document.getElementById('metrics-oscilloscope-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set high-DPI canvas dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio || 800;
  canvas.height = (rect.height || 360) * window.devicePixelRatio;

  // Populate initial history if empty
  if (oscilloscopeHistory.length === 0) {
    for (let i = 0; i < MAX_OSCILLOSCOPE_POINTS; i++) {
      oscilloscopeHistory.push({
        cpu: 25 + Math.random() * 15,
        mem: 60 + Math.random() * 5,
        disk: 30 + Math.random() * 20,
        net: 40 + Math.random() * 35
      });
    }
  }

  if (oscilloscopeTimer) clearInterval(oscilloscopeTimer);

  // Poll data every 1 second
  oscilloscopeTimer = setInterval(async () => {
    try {
      const res = await fetch('/api/studios/oscilloscope-data');
      const data = await res.json();
      if (data.success) {
        oscilloscopeHistory.push({
          cpu: data.cpuPercent,
          mem: data.memoryPercent,
          disk: (data.diskIops / 3000) * 100,
          net: (data.networkMbps / 300) * 100
        });
        if (oscilloscopeHistory.length > MAX_OSCILLOSCOPE_POINTS) {
          oscilloscopeHistory.shift();
        }
        drawOscilloscopeFrame(ctx, canvas.width, canvas.height, data);
      }
    } catch (e) {
      // Fallback local animation if offline
      oscilloscopeHistory.push({
        cpu: 25 + Math.random() * 15,
        mem: 60 + Math.random() * 5,
        disk: 30 + Math.random() * 20,
        net: 40 + Math.random() * 35
      });
      if (oscilloscopeHistory.length > MAX_OSCILLOSCOPE_POINTS) {
        oscilloscopeHistory.shift();
      }
      drawOscilloscopeFrame(ctx, canvas.width, canvas.height, null);
    }
  }, 1000);

  drawOscilloscopeFrame(ctx, canvas.width, canvas.height, null);
}

function drawOscilloscopeFrame(ctx, w, h, latestData) {
  ctx.clearRect(0, 0, w, h);

  // Oscilloscope Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const stepY = h / 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * stepY);
    ctx.lineTo(w, i * stepY);
    ctx.stroke();
  }

  // Draw Time-Series Channels
  const channels = [
    { key: 'cpu', color: '#38BDF8', label: 'CPU Yükü' },
    { key: 'mem', color: '#C084FC', label: 'RAM Kullanımı' },
    { key: 'disk', color: '#FBBF24', label: 'Disk I/O' },
    { key: 'net', color: '#34D399', label: 'Ağ Bps' }
  ];

  const stepX = w / (MAX_OSCILLOSCOPE_POINTS - 1);

  channels.forEach(ch => {
    ctx.save();
    ctx.strokeStyle = ch.color;
    ctx.shadowColor = ch.color;
    ctx.shadowBlur = 8;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    oscilloscopeHistory.forEach((pt, i) => {
      const x = i * stepX;
      const y = h - ((pt[ch.key] / 100) * (h - 30)) - 15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  });

  // Update top text stats if provided
  if (latestData) {
    const statEl = document.getElementById('oscilloscope-stats-live');
    if (statEl) {
      statEl.innerHTML = `
        <span style="color:#38BDF8;">CPU: %${latestData.cpuPercent}</span> • 
        <span style="color:#C084FC;">RAM: %${latestData.memoryPercent}</span> • 
        <span style="color:#FBBF24;">Disk: ${latestData.diskIops} IOPS</span> • 
        <span style="color:#34D399;">Ağ: ${latestData.networkMbps} MB/s</span>
      `;
    }
  }
}

// Global Attachments
window.initMetricsOscilloscope = initMetricsOscilloscope;
