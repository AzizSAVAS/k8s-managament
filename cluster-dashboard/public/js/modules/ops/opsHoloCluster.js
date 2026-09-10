// ==============================================================================
// RKE2 CLUSTER HUB: 3D HOLO-CLUSTER NOC TOPOLOGY DISPLAY
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

let holoAnimationId = null;
let holoAngle = 0;
let holoLaserOffset = 0;

function initHoloCluster() {
  const canvas = document.getElementById('holo-cluster-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set crisp canvas dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio || 800;
  canvas.height = (rect.height || 460) * window.devicePixelRatio;

  if (holoAnimationId) {
    cancelAnimationFrame(holoAnimationId);
  }

  function renderFrame() {
    holoAngle += 0.005;
    holoLaserOffset = (holoLaserOffset + 1.8) % 100;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 35 * window.devicePixelRatio;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Center coordinates
    const cx = w / 2;
    const cy = h / 2 + 20;

    // Draw 3D Racks
    const racks = [
      { x: cx - 220, y: cy - 40, label: 'RACK-01 (DC-1 Compute)' },
      { x: cx + 20, y: cy - 90, label: 'RACK-02 (DC-1 Storage)' },
      { x: cx + 240, y: cy + 30, label: 'RACK-03 (Edge Gateway)' }
    ];

    racks.forEach((rack, idx) => {
      // Draw isometric server chassis box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;

      const rw = 120;
      const rh = 170;

      ctx.beginPath();
      ctx.roundRect(rack.x, rack.y, rw, rh, 8);
      ctx.fill();
      ctx.stroke();

      // Rack header label
      ctx.fillStyle = '#94A3B8';
      ctx.font = `bold ${10 * window.devicePixelRatio}px JetBrains Mono`;
      ctx.fillText(rack.label, rack.x + 8, rack.y - 10);

      // Draw server blades inside rack
      for (let s = 0; s < 5; s++) {
        const sy = rack.y + 16 + s * 28;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
        ctx.fillRect(rack.x + 8, sy, rw - 16, 22);

        // Status LEDs
        ctx.fillStyle = s === 3 && idx === 1 ? '#F59E0B' : '#10B981';
        ctx.beginPath();
        ctx.arc(rack.x + 20, sy + 11, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#E2E8F0';
        ctx.font = `${8 * window.devicePixelRatio}px Inter`;
        ctx.fillText(`Blade-${s+1}: Ready`, rack.x + 30, sy + 14);
      }
    });

    // Draw eBPF Laser Packet Trails between racks
    ctx.save();
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.lineDashOffset = -holoLaserOffset;

    // Laser 1: Rack 1 -> Rack 2 (Green)
    ctx.strokeStyle = '#10B981';
    ctx.shadowColor = '#10B981';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(racks[0].x + 60, racks[0].y + 60);
    ctx.bezierCurveTo(cx - 100, cy - 120, cx, cy - 140, racks[1].x + 60, racks[1].y + 60);
    ctx.stroke();

    // Laser 2: Rack 2 -> Rack 3 (Blue)
    ctx.strokeStyle = '#38BDF8';
    ctx.shadowColor = '#38BDF8';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(racks[1].x + 60, racks[1].y + 90);
    ctx.bezierCurveTo(cx + 100, cy, cx + 160, cy + 20, racks[2].x + 60, racks[2].y + 60);
    ctx.stroke();

    ctx.restore();

    holoAnimationId = requestAnimationFrame(renderFrame);
  }

  renderFrame();
}

function toggleHoloNocMode() {
  const canvas = document.getElementById('holo-cluster-canvas');
  if (!canvas) return;

  if (!document.fullscreenElement) {
    if (canvas.requestFullscreen) canvas.requestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

// Global Attachments
window.initHoloCluster = initHoloCluster;
window.toggleHoloNocMode = toggleHoloNocMode;
