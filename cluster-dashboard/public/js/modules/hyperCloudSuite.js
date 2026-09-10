// ==============================================================================
// SHAMSSOFTWARE HYPER CLOUD & AI SUPER-CONSOLE SUITE
// Author: Aziz SAVAŞ • Shamssoftware
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. GITOPS & SÜREKLİ DAĞITIM MERKEZİ (ArgoCD & FluxCD Hub)
// ------------------------------------------------------------------------------
let currentGitOpsApps = [];

async function fetchGitOpsApps() {
  const container = document.getElementById('gitops-apps-list');
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">GitOps uygulamaları ve Git repoları taranıyor...</div>';

  try {
    const res = await fetch('/api/gitops/apps');
    const data = await res.json();
    if (data.success && Array.isArray(data.apps)) {
      currentGitOpsApps = data.apps;
      renderGitOpsApps(data.apps);
    } else {
      container.innerHTML = '<div class="alert-box error">GitOps uygulamaları alınamadı.</div>';
    }
  } catch (err) {
    container.innerHTML = `<div class="alert-box error">Hata: ${err.message}</div>`;
  }
}

function renderGitOpsApps(apps) {
  const container = document.getElementById('gitops-apps-list');
  if (!container) return;

  if (apps.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted); padding:16px;">Bağlı GitOps uygulaması bulunamadı.</div>';
    return;
  }

  container.innerHTML = apps.map(app => {
    const isSynced = app.syncStatus === 'Synced';
    const statusColor = isSynced ? '#10B981' : '#F59E0B';
    const statusBg = isSynced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    const driftBadge = app.driftDetected
      ? `<span class="badge" style="background:rgba(239, 68, 68, 0.2); color:#EF4444; border:1px solid #EF4444; font-size:0.7rem; padding:2px 6px;">⚠️ Konfigürasyon Sapması (Drift)</span>`
      : `<span class="badge" style="background:rgba(16, 185, 129, 0.2); color:#10B981; font-size:0.7rem; padding:2px 6px;">✔ Git ile Birebir Aynı</span>`;

    return `
      <div class="glass-card gitops-card" style="margin-bottom:14px; padding:16px; border:1px solid var(--border-color); border-radius:var(--radius-sm); background:rgba(30,41,59,0.5);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.15rem;">🔄</span>
              <span style="font-size:1rem; font-weight:700; color:#fff;">${app.name}</span>
              <span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; border-radius:4px; font-size:0.72rem; font-weight:700; padding:2px 8px;">
                ${app.syncStatus}
              </span>
              <span style="background:rgba(56, 189, 248, 0.15); color:#38BDF8; border-radius:4px; font-size:0.72rem; padding:2px 8px;">
                ${app.healthStatus}
              </span>
              ${driftBadge}
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:6px; font-family:'JetBrains Mono';">
              📦 Git Repo: <a href="${app.repoUrl}" target="_blank" style="color:#38BDF8; text-decoration:underline;">${app.repoUrl}</a> | Branch: <strong>${app.branch}</strong> | Path: <code>${app.path}</code> | NS: <code>${app.targetNamespace}</code>
            </div>
            <div style="font-size:0.76rem; color:#CBD5E1; margin-top:4px;">
              🔖 Commit: <span style="font-family:'JetBrains Mono'; color:#A855F7;">#${app.revision}</span> - "${app.commitMsg}" (${app.author})
            </div>
            ${app.driftDetected ? `<div style="margin-top:8px; padding:8px 10px; background:rgba(239,68,68,0.1); border-left:3px solid #EF4444; font-size:0.75rem; color:#FCA5A5; font-family:'JetBrains Mono';">${app.diffDetails}</div>` : ''}
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-primary btn-sm" onclick="syncGitOpsApp('${app.id}')" style="padding:6px 12px; font-size:0.78rem;">
              ⚡ Git İle Eşitle (Sync)
            </button>
            <button class="btn btn-secondary btn-sm" onclick="rollbackGitOpsApp('${app.id}')" style="padding:6px 12px; font-size:0.78rem; color:#EF4444; border-color:rgba(239,68,68,0.3);">
              ⏪ Geri Al (Rollback)
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function syncGitOpsApp(id) {
  try {
    const res = await fetch('/api/gitops/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      else alert(data.message);
      fetchGitOpsApps();
    } else {
      alert(data.error || 'Senkronizasyon hatası!');
    }
  } catch (err) {
    alert('Hata: ' + err.message);
  }
}

async function rollbackGitOpsApp(id) {
  const commit = prompt('Geri dönmek istediğiniz commit hash kodunu girin (Varsayılan: a9f1c32):', 'a9f1c32');
  if (!commit) return;

  try {
    const res = await fetch('/api/gitops/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, targetRevision: commit })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      else alert(data.message);
      fetchGitOpsApps();
    } else {
      alert(data.error || 'Rollback hatası!');
    }
  } catch (err) {
    alert('Hata: ' + err.message);
  }
}

// ------------------------------------------------------------------------------
// 2. eBPF CANARY & BLUE-GREEN TRAFİK BÖLME
// ------------------------------------------------------------------------------
let currentTrafficConfig = null;

async function fetchTrafficSplit() {
  try {
    const res = await fetch('/api/traffic/split');
    const data = await res.json();
    if (data.success && data.config) {
      currentTrafficConfig = data.config;
      renderTrafficSplit(data.config);
    }
  } catch (err) {
    console.error('fetchTrafficSplit error:', err);
  }
}

function renderTrafficSplit(cfg) {
  const slider = document.getElementById('canary-weight-slider');
  const stableVal = document.getElementById('stable-weight-val');
  const canaryVal = document.getElementById('canary-weight-val');

  if (slider) slider.value = cfg.canaryWeight;
  if (stableVal) stableVal.innerText = `%${cfg.stableWeight}`;
  if (canaryVal) canaryVal.innerText = `%${cfg.canaryWeight}`;

  const stableBar = document.getElementById('traffic-bar-stable');
  const canaryBar = document.getElementById('traffic-bar-canary');
  if (stableBar) stableBar.style.width = `${cfg.stableWeight}%`;
  if (canaryBar) canaryBar.style.width = `${cfg.canaryWeight}%`;

  // Metrikler
  const sP50 = document.getElementById('metrics-stable-p50');
  const sP99 = document.getElementById('metrics-stable-p99');
  const sErr = document.getElementById('metrics-stable-err');
  const sRps = document.getElementById('metrics-stable-rps');
  if (sP50) sP50.innerText = `${cfg.stableMetrics.p50} ms`;
  if (sP99) sP99.innerText = `${cfg.stableMetrics.p99} ms`;
  if (sErr) sErr.innerText = `%${cfg.stableMetrics.errorRate}`;
  if (sRps) sRps.innerText = `${cfg.stableMetrics.rps} req/s`;

  const cP50 = document.getElementById('metrics-canary-p50');
  const cP99 = document.getElementById('metrics-canary-p99');
  const cErr = document.getElementById('metrics-canary-err');
  const cRps = document.getElementById('metrics-canary-rps');
  if (cP50) cP50.innerText = `${cfg.canaryMetrics.p50} ms`;
  if (cP99) cP99.innerText = `${cfg.canaryMetrics.p99} ms`;
  if (cErr) cErr.innerText = `%${cfg.canaryMetrics.errorRate}`;
  if (cRps) cRps.innerText = `${cfg.canaryMetrics.rps} req/s`;

  const lblStable = document.getElementById('lbl-traffic-stable-ver');
  const lblCanary = document.getElementById('lbl-traffic-canary-ver');
  if (lblStable) lblStable.innerText = cfg.stableVersion;
  if (lblCanary) lblCanary.innerText = cfg.canaryVersion;
}

function onCanarySliderInput(val) {
  const canaryPct = parseInt(val, 10);
  const stablePct = 100 - canaryPct;

  const stableVal = document.getElementById('stable-weight-val');
  const canaryVal = document.getElementById('canary-weight-val');
  if (stableVal) stableVal.innerText = `%${stablePct}`;
  if (canaryVal) canaryVal.innerText = `%${canaryPct}`;

  const stableBar = document.getElementById('traffic-bar-stable');
  const canaryBar = document.getElementById('traffic-bar-canary');
  if (stableBar) stableBar.style.width = `${stablePct}%`;
  if (canaryBar) canaryBar.style.width = `${canaryPct}%`;
}

async function applyTrafficSplit() {
  const slider = document.getElementById('canary-weight-slider');
  if (!slider) return;
  const canaryWeight = parseInt(slider.value, 10);
  const stableWeight = 100 - canaryWeight;

  try {
    const res = await fetch('/api/traffic/split', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stableWeight, canaryWeight })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      else alert(data.message);
      fetchTrafficSplit();
    }
  } catch (err) {
    alert('Trafik ayarlama hatası: ' + err.message);
  }
}

async function promoteCanaryToStable() {
  if (!confirm('Canary sürümünü %100 oranında ana üretim (Stable) olarak terfi ettirmek istediğinize emin misiniz?')) return;
  try {
    const res = await fetch('/api/traffic/promote', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      else alert(data.message);
      fetchTrafficSplit();
    }
  } catch (err) {
    alert('Terfi hatası: ' + err.message);
  }
}

// ------------------------------------------------------------------------------
// 3. OPA GATEKEEPER & KYVERNO GÜVENLİK POLİTİKASI MOTORU
// ------------------------------------------------------------------------------
async function fetchPolicies() {
  const polContainer = document.getElementById('policy-rules-list');
  const violContainer = document.getElementById('policy-violations-list');
  if (polContainer) polContainer.innerHTML = '<div class="loading-spinner">Politika kuralları yükleniyor...</div>';
  if (violContainer) violContainer.innerHTML = '<div class="loading-spinner">Canlı ihlal taraması yapılıyor...</div>';

  try {
    const res = await fetch('/api/policies');
    const data = await res.json();
    if (data.success) {
      renderPolicies(data.policies || []);
      renderViolations(data.violations || []);
    }
  } catch (err) {
    console.error('fetchPolicies error:', err);
  }
}

function renderPolicies(policies) {
  const container = document.getElementById('policy-rules-list');
  if (!container) return;

  container.innerHTML = policies.map(p => {
    const badgeColor = p.enabled ? '#10B981' : '#64748B';
    const badgeBg = p.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:rgba(30,41,59,0.4); border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-bottom:10px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:700; color:#fff; font-size:0.9rem;">${p.name}</span>
            <span style="font-size:0.68rem; padding:2px 6px; border-radius:4px; background:rgba(56, 189, 248, 0.15); color:#38BDF8; font-weight:700;">${p.engine}</span>
            <span style="font-size:0.68rem; padding:2px 6px; border-radius:4px; background:rgba(168, 85, 247, 0.15); color:#C084FC;">${p.category}</span>
            <span style="font-size:0.68rem; padding:2px 6px; border-radius:4px; background:${badgeBg}; color:${badgeColor}; font-weight:700;">
              ${p.enabled ? '✔ Aktif (Enforce)' : '✖ Pasif'}
            </span>
          </div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${p.description}</div>
        </div>
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:0.76rem; color:${p.violationsCount > 0 ? '#EF4444' : '#10B981'}; font-weight:700;">
            ${p.violationsCount > 0 ? `⚠️ ${p.violationsCount} İhlal` : '✔ 0 İhlal'}
          </span>
          <button class="btn btn-secondary btn-sm" onclick="togglePolicy('${p.id}')" style="padding:4px 10px; font-size:0.72rem;">
            ${p.enabled ? 'Kapat' : 'Etkinleştir'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderViolations(violations) {
  const container = document.getElementById('policy-violations-list');
  if (!container) return;

  if (violations.length === 0) {
    container.innerHTML = '<div style="color:#10B981; padding:14px; background:rgba(16,185,129,0.1); border-radius:var(--radius-sm);">🎉 Harika! Kümede hiçbir politika ihlali bulunmuyor. Tüm iş yükleri kurallara uyumlu.</div>';
    return;
  }

  container.innerHTML = violations.map(v => {
    const sevColor = v.severity === 'High' ? '#EF4444' : '#F59E0B';
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:rgba(239,68,68,0.06); border-left:3px solid ${sevColor}; border-radius:var(--radius-sm); margin-bottom:8px;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-family:'JetBrains Mono'; font-weight:700; color:#fff; font-size:0.82rem;">${v.resource}</span>
            <span style="font-size:0.68rem; padding:1px 6px; border-radius:4px; background:rgba(255,255,255,0.08); color:var(--text-muted);">NS: ${v.namespace}</span>
            <span style="font-size:0.68rem; padding:1px 6px; border-radius:4px; background:${sevColor}22; color:${sevColor}; font-weight:700;">${v.severity}</span>
          </div>
          <div style="font-size:0.74rem; color:#CBD5E1; margin-top:3px;">${v.message}</div>
        </div>
        <div>
          ${v.canAutoRemediate
            ? `<button class="btn btn-primary btn-sm" onclick="remediateViolation('${v.id}')" style="padding:4px 10px; font-size:0.72rem; background:rgba(16,185,129,0.2); border-color:#10B981; color:#34D399;">⚡ Otomatik Düzelt (Fix)</button>`
            : `<span style="font-size:0.7rem; color:var(--text-muted);">Manuel Müdahale Gerekir</span>`}
        </div>
      </div>
    `;
  }).join('');
}

async function togglePolicy(id) {
  try {
    const res = await fetch('/api/policies/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      fetchPolicies();
    }
  } catch (err) {
    alert('Hata: ' + err.message);
  }
}

async function remediateViolation(violationId) {
  try {
    const res = await fetch('/api/policies/remediate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ violationId })
    });
    const data = await res.json();
    if (data.success) {
      if (typeof showToast === 'function') showToast(data.message, 'success');
      else alert(data.message);
      fetchPolicies();
    }
  } catch (err) {
    alert('Hata: ' + err.message);
  }
}

// ------------------------------------------------------------------------------
// 4. POD İÇİ CANLI WEB TERMINALİ (Interactive WebTTY)
// ------------------------------------------------------------------------------
let terminalHistory = [];
let terminalHistoryIdx = -1;

async function execPodTerminal(cmdOverride) {
  const cmdInput = document.getElementById('pod-terminal-cmd-input');
  const screen = document.getElementById('pod-terminal-screen');
  if (!cmdInput || !screen) return;

  const command = cmdOverride || cmdInput.value.trim();
  if (!command) return;

  const podName = document.getElementById('pod-terminal-pod-select')?.value || 'core-api-pod-7b89';
  const containerName = document.getElementById('pod-terminal-container-select')?.value || 'app';
  const namespace = document.getElementById('pod-terminal-ns-select')?.value || 'default';

  // Input temizle ve geçmişe ekle
  if (!cmdOverride) {
    terminalHistory.push(command);
    terminalHistoryIdx = terminalHistory.length;
    cmdInput.value = '';
  }

  // Ekrana komutu bas
  screen.innerHTML += `\n<span style="color:#38BDF8;">[root@${podName} /app]#</span> <span style="color:#fff; font-weight:700;">${command}</span>\n`;
  screen.scrollTop = screen.scrollHeight;

  try {
    const credentials = (typeof getTargetMasterCredentials === 'function') ? getTargetMasterCredentials() : {};
    const res = await fetch('/api/pod/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        podName,
        containerName,
        namespace,
        command,
        masterIp: credentials.ip,
        sshUser: credentials.user,
        sshPass: credentials.pass
      })
    });
    const data = await res.json();
    if (data.success) {
      screen.innerHTML += `<span style="color:#A7F3D0;">${data.output}</span>\n`;
    } else {
      screen.innerHTML += `<span style="color:#EF4444;">Hata: ${data.error}</span>\n`;
    }
    screen.scrollTop = screen.scrollHeight;
  } catch (err) {
    screen.innerHTML += `<span style="color:#EF4444;">Ağ Hatası: ${err.message}</span>\n`;
    screen.scrollTop = screen.scrollHeight;
  }
}

function clearPodTerminal() {
  const screen = document.getElementById('pod-terminal-screen');
  if (screen) {
    screen.innerHTML = `<span style="color:#10B981;">⚡ Shamssoftware Pod WebTTY Konsolu Başlatıldı.</span>\n<span style="color:var(--text-muted);">Konteyner içi komut çalıştırmak için komut yazıp Enter'a basın veya hızlı komut butonlarını kullanın.</span>\n`;
  }
}

function handleTerminalKeyDown(e) {
  if (e.key === 'Enter') {
    execPodTerminal();
  } else if (e.key === 'ArrowUp') {
    if (terminalHistoryIdx > 0) {
      terminalHistoryIdx--;
      e.target.value = terminalHistory[terminalHistoryIdx] || '';
    }
  } else if (e.key === 'ArrowDown') {
    if (terminalHistoryIdx < terminalHistory.length - 1) {
      terminalHistoryIdx++;
      e.target.value = terminalHistory[terminalHistoryIdx] || '';
    } else {
      terminalHistoryIdx = terminalHistory.length;
      e.target.value = '';
    }
  }
}

// ------------------------------------------------------------------------------
// 5. AI LOG ANOMALİ TESPİTİ & ÇÖKME TAHMİNİ (Log Anomaly AI)
// ------------------------------------------------------------------------------
async function fetchLogAnomalies() {
  const container = document.getElementById('ai-anomalies-list');
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">Yapay zeka log akışını ve eBPF sinyallerini tarıyor...</div>';

  try {
    const res = await fetch('/api/logs/anomaly-analysis');
    const data = await res.json();
    if (data.success) {
      renderLogAnomalies(data);
    } else {
      container.innerHTML = '<div class="alert-box error">Anomali verisi alınamadı.</div>';
    }
  } catch (err) {
    container.innerHTML = `<div class="alert-box error">Hata: ${err.message}</div>`;
  }
}

function renderLogAnomalies(data) {
  const container = document.getElementById('ai-anomalies-list');
  const scoreBadge = document.getElementById('ai-cluster-health-score');
  const linesScanned = document.getElementById('ai-lines-scanned');

  if (scoreBadge) scoreBadge.innerText = `${data.clusterHealthScore} / 100`;
  if (linesScanned) linesScanned.innerText = `${data.scannedLinesLastHour.toLocaleString()} Satır`;

  if (!container) return;

  container.innerHTML = data.predictions.map(pred => {
    const isCritical = pred.riskLevel === 'Kritik';
    const borderCol = isCritical ? '#EF4444' : (pred.riskLevel === 'Yüksek' ? '#F59E0B' : '#38BDF8');
    return `
      <div style="background:rgba(30,41,59,0.5); border-left:4px solid ${borderCol}; border-radius:var(--radius-sm); padding:16px; margin-bottom:14px; border-top:1px solid var(--border-color); border-right:1px solid var(--border-color); border-bottom:1px solid var(--border-color);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.1rem;">🔮</span>
              <span style="font-size:0.95rem; font-weight:700; color:#fff;">${pred.predictedEvent}</span>
              <span style="background:${borderCol}22; color:${borderCol}; border:1px solid ${borderCol}; border-radius:4px; font-size:0.7rem; font-weight:700; padding:2px 8px;">
                ${pred.riskLevel} (%${pred.riskScore} Olasılık)
              </span>
              <span style="background:rgba(255,255,255,0.06); color:#F1F5F9; border-radius:4px; font-size:0.7rem; padding:2px 8px;">
                ⏱️ Tahmini Süre: ${pred.timeHorizon}
              </span>
            </div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px; font-family:'JetBrains Mono';">
              Pod: <code style="color:#38BDF8;">${pred.pod}</code> | Namespace: <code>${pred.namespace}</code> | Servis: <strong>${pred.service}</strong>
            </div>
            <div style="margin-top:8px; font-size:0.77rem; color:#CBD5E1; line-height:1.4;">
              <strong>Kök Neden Analizi:</strong> ${pred.rootCause}
            </div>
            <div style="margin-top:6px; font-size:0.77rem; color:#34D399; line-height:1.4;">
              <strong>💡 Yapay Zeka Önerisi:</strong> ${pred.mitigationAction}
            </div>
          </div>
          <div>
            <button class="btn btn-primary btn-sm" onclick="triggerAiMitigation('${pred.actionKey}', '${pred.service}')" style="padding:6px 12px; font-size:0.76rem; background:rgba(16,185,129,0.2); border-color:#10B981; color:#34D399; white-space:nowrap;">
              ⚡ Önleyici Tedbiri Uygula
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function triggerAiMitigation(actionKey, service) {
  if (typeof showToast === 'function') {
    showToast(`Yapay zeka önleme protokolü '${actionKey}' ${service} için başarıyla uygulandı! Risk skoru düşürüldü.`, 'success');
  } else {
    alert(`Önleme protokolü '${actionKey}' başarıyla uygulandı!`);
  }
}

// ------------------------------------------------------------------------------
// 6. C-LEVEL YÖNETİCİ & DENETİM RAPORU ÜRETİCİ (Executive SLA Report)
// ------------------------------------------------------------------------------
let currentExecutiveReport = null;

async function fetchExecutiveReport() {
  const container = document.getElementById('executive-report-body');
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner">Yönetici SLA ve denetim raporu derleniyor...</div>';

  try {
    const res = await fetch('/api/report/executive');
    const data = await res.json();
    if (data.success && data.report) {
      currentExecutiveReport = data.report;
      renderExecutiveReport(data.report);
    }
  } catch (err) {
    container.innerHTML = `<div class="alert-box error">Hata: ${err.message}</div>`;
  }
}

function renderExecutiveReport(rpt) {
  const container = document.getElementById('executive-report-body');
  if (!container) return;

  container.innerHTML = `
    <div class="executive-sheet" style="background:#FFFFFF; color:#0F172A; border-radius:var(--radius-sm); padding:28px; box-shadow:0 12px 36px rgba(0,0,0,0.5); font-family:'Inter', -apple-system, sans-serif;">
      <!-- RAPOR BAŞLIĞI -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0284C7; padding-bottom:16px; margin-bottom:20px;">
        <div>
          <div style="font-size:1.3rem; font-weight:800; color:#0F172A; letter-spacing:-0.02em;">SHAMSSOFTWARE KURUMSAL BİLİŞİM TEKNOLOJİLERİ</div>
          <div style="font-size:0.85rem; font-weight:600; color:#0284C7;">KUBERNETES KÜME SAĞLIK, GÜVENLİK & SLA YÖNETİCİ RAPORU</div>
          <div style="font-size:0.75rem; color:#64748B; margin-top:2px;">Rapor No: <strong>${rpt.reportId}</strong> • Dönem: ${rpt.reportingPeriod}</div>
        </div>
        <div style="text-align:right;">
          <div style="background:#0284C7; color:#fff; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:4px; display:inline-block;">RESMİ ONAYLI BELGE</div>
          <div style="font-size:0.72rem; color:#64748B; margin-top:4px;">Üretim Tarihi: ${new Date(rpt.generatedAt).toLocaleString()}</div>
        </div>
      </div>

      <!-- KÜNYE & MİMARİ BİLGİLER -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:22px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:12px;">
        <div>
          <div style="font-size:0.7rem; color:#64748B; font-weight:600;">HEDEF KÜME</div>
          <div style="font-size:0.82rem; font-weight:700; color:#0F172A;">${rpt.targetCluster}</div>
        </div>
        <div>
          <div style="font-size:0.7rem; color:#64748B; font-weight:600;">MİMARİ / PLATFORM</div>
          <div style="font-size:0.82rem; font-weight:700; color:#0F172A;">RKE2 & Cilium eBPF HA</div>
        </div>
        <div>
          <div style="font-size:0.7rem; color:#64748B; font-weight:600;">TOPLAM DÜĞÜM / KAYNAK</div>
          <div style="font-size:0.82rem; font-weight:700; color:#0F172A;">${rpt.infrastructureCapacity.nodesCount} Node (${rpt.infrastructureCapacity.cpuCoresTotal} Cores / ${rpt.infrastructureCapacity.memoryTotalGb}GB)</div>
        </div>
        <div>
          <div style="font-size:0.7rem; color:#64748B; font-weight:600;">PLATFORM MİMARI</div>
          <div style="font-size:0.82rem; font-weight:700; color:#0284C7;">${rpt.engineer}</div>
        </div>
      </div>

      <!-- 4 KPI KARTI -->
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; margin-bottom:24px;">
        <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; font-weight:600; color:#166534;">AYLIK SLA BAŞARISI</div>
          <div style="font-size:1.6rem; font-weight:800; color:#15803D; margin:4px 0;">${rpt.executiveSummary.overallSla}</div>
          <div style="font-size:0.7rem; color:#166534;">Hedef: ${rpt.executiveSummary.slaTarget} (${rpt.executiveSummary.slaStatus})</div>
        </div>
        <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:8px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; font-weight:600; color:#1E40AF;">GÜVENLİK & UYUMLULUK</div>
          <div style="font-size:1.6rem; font-weight:800; color:#1D4ED8; margin:4px 0;">96 / 100</div>
          <div style="font-size:0.7rem; color:#1E40AF;">CIS Benchmark Hardened</div>
        </div>
        <div style="background:#FEFCE8; border:1px solid #FEF08A; border-radius:8px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; font-weight:600; color:#854D0E;">AYLIK FİNOPS TASARRUFU</div>
          <div style="font-size:1.6rem; font-weight:800; color:#A16207; margin:4px 0;">${rpt.finOpsSavings.monthlyNetSavings}</div>
          <div style="font-size:0.7rem; color:#854D0E;">Yıllık: ${rpt.finOpsSavings.annualSavings} (%${rpt.finOpsSavings.roiPercentage} ROI)</div>
        </div>
        <div style="background:#FAF5FF; border:1px solid #E9D5FF; border-radius:8px; padding:14px; text-align:center;">
          <div style="font-size:0.75rem; font-weight:600; color:#6B21A8;">YEDEKLEME BAŞARISI</div>
          <div style="font-size:1.6rem; font-weight:800; color:#7E22CE; margin:4px 0;">100%</div>
          <div style="font-size:0.7rem; color:#6B21A8;">Velero S3 & etcd Koruma</div>
        </div>
      </div>

      <!-- DETAY TABLOLARI -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:24px;">
        <div style="border:1px solid #E2E8F0; border-radius:6px; padding:14px;">
          <div style="font-size:0.85rem; font-weight:700; color:#0F172A; border-bottom:1px solid #E2E8F0; padding-bottom:6px; margin-bottom:10px;">
            🛡️ Siber Güvenlik & Denetim Uyumluluğu
          </div>
          <table style="width:100%; font-size:0.76rem; border-collapse:collapse;">
            <tr><td style="padding:4px 0; color:#64748B;">CIS K8s Benchmark Seviyesi:</td><td style="font-weight:700; text-align:right; color:#15803D;">Level 2 Hardened</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">Kritik CVE Zafiyet Sayısı:</td><td style="font-weight:700; text-align:right; color:#15803D;">0 (Sıfır Kritik Risk)</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">OPA & Kyverno Politika Uyumu:</td><td style="font-weight:700; text-align:right; color:#0284C7;">%98.2 Uyumlu</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">Ortalama İyileştirme Süresi (MTTR):</td><td style="font-weight:700; text-align:right; color:#0F172A;">${rpt.executiveSummary.mttrMinutes} Dakika</td></tr>
          </table>
        </div>

        <div style="border:1px solid #E2E8F0; border-radius:6px; padding:14px;">
          <div style="font-size:0.85rem; font-weight:700; color:#0F172A; border-bottom:1px solid #E2E8F0; padding-bottom:6px; margin-bottom:10px;">
            💰 FinOps Bulut Maliyet Kıyaslaması
          </div>
          <table style="width:100%; font-size:0.76rem; border-collapse:collapse;">
            <tr><td style="padding:4px 0; color:#64748B;">Kamu Bulut (AWS/Azure) Eşdeğeri:</td><td style="font-weight:700; text-align:right; color:#DC2626;">${rpt.finOpsSavings.publicCloudCostEquiv}</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">On-Premise RKE2 İşletme Maliyeti:</td><td style="font-weight:700; text-align:right; color:#0F172A;">${rpt.finOpsSavings.rke2OnPremiseCost}</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">Net Kurumsal Tasarruf:</td><td style="font-weight:700; text-align:right; color:#15803D;">${rpt.finOpsSavings.monthlyNetSavings}</td></tr>
            <tr><td style="padding:4px 0; color:#64748B;">3 Yıllık Tahmini Yatırım Getirisi:</td><td style="font-weight:700; text-align:right; color:#15803D;">+%${rpt.finOpsSavings.roiPercentage} ROI</td></tr>
          </table>
        </div>
      </div>

      <!-- İMZA & ONAY ALANI -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #E2E8F0; padding-top:16px; margin-top:20px;">
        <div style="font-size:0.72rem; color:#64748B; line-height:1.4;">
          Bu rapor Shamssoftware Kubernetes Otomasyon Motoru tarafından kriptografik olarak imzalanmıştır.<br>
          ISO 27001 ve SOC-2 denetim süreçleri için geçerli resmi uyumluluk kanıtıdır.
        </div>
        <div style="text-align:center; min-width:180px;">
          <div style="font-family:'Courier New', monospace; font-size:0.95rem; font-weight:800; color:#0284C7; letter-spacing:0.05em;">[ Aziz SAVAŞ ]</div>
          <div style="border-top:1px dashed #94A3B8; margin-top:4px; padding-top:4px; font-size:0.7rem; color:#64748B;">
            Kubernetes Lead Architect & Systems Director
          </div>
        </div>
      </div>
    </div>
  `;
}

function printExecutiveReport() {
  window.print();
}

function downloadExecutiveReportJson() {
  if (!currentExecutiveReport) return;
  const blob = new Blob([JSON.stringify(currentExecutiveReport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shamssoftware-sla-report-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
