// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Intelligent AI K8s Copilot Frontend Controller
// ==============================================================================

let aiCopilotOpen = false;

function toggleAiCopilot() {
  const drawer = document.getElementById('ai-copilot-drawer');
  if (!drawer) return;
  aiCopilotOpen = !aiCopilotOpen;
  drawer.classList.toggle('open', aiCopilotOpen);

  if (aiCopilotOpen) {
    const input = document.getElementById('ai-copilot-input');
    if (input) input.focus();
  }
}

function closeAiCopilot() {
  const drawer = document.getElementById('ai-copilot-drawer');
  if (drawer) {
    aiCopilotOpen = false;
    drawer.classList.remove('open');
  }
}

async function askAiCopilot(actionType, customPrompt) {
  const inputEl = document.getElementById('ai-copilot-input');
  const chatBox = document.getElementById('ai-copilot-messages');
  const sendBtn = document.getElementById('btn-ai-send');

  const prompt = customPrompt || (inputEl ? inputEl.value.trim() : '');
  if (!prompt && !actionType) return;

  if (inputEl) inputEl.value = '';

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'ai-chat-bubble user';
  userMsg.innerHTML = `<div class="ai-bubble-sender">Siz:</div><div>${escapeHtml(prompt || getActionLabel(actionType))}</div>`;
  chatBox.appendChild(userMsg);

  // Append thinking bubble
  const aiMsg = document.createElement('div');
  aiMsg.className = 'ai-chat-bubble assistant';
  aiMsg.innerHTML = `<div class="ai-bubble-sender">🤖 Shams AI Copilot:</div><div class="ai-loading-dots"><span>.</span><span>.</span><span>.</span> Küme telemetrisi ve loglar analiz ediliyor</div>`;
  chatBox.appendChild(aiMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (sendBtn) sendBtn.disabled = true;

  try {
    const creds = (typeof getTargetMasterCredentials === 'function') ? getTargetMasterCredentials() : {};
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt || getActionLabel(actionType),
        action: actionType,
        targetMaster: creds
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'AI yanıtı alınamadı.');

    const result = data.result;
    let html = `<div class="ai-bubble-sender">🤖 Shams AI Copilot:</div>`;
    html += `<div style="font-weight:700; color:#38BDF8; margin-bottom:6px;">${result.title}</div>`;
    html += `<div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:10px;">${result.summary}</div>`;

    if (result.findings && result.findings.length > 0) {
      html += `<div class="ai-findings-list">`;
      result.findings.forEach(f => {
        html += `
          <div class="ai-finding-card ${f.severity}">
            <div style="font-weight:700; font-size:0.82rem; color:#fff;">${f.issue}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin:3px 0;"><strong>Sebep:</strong> ${f.reason}</div>
            <div style="font-size:0.75rem; color:#34D399;"><strong>Çözüm:</strong> ${f.solution}</div>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (result.recommendations) {
      html += `<ul style="font-size:0.78rem; color:var(--text-muted); padding-left:16px; margin-bottom:10px;">`;
      result.recommendations.forEach(r => html += `<li style="margin-bottom:4px;">${r}</li>`);
      html += `</ul>`;
    }

    if (result.steps) {
      html += `<div style="font-size:0.78rem; color:#E2E8F0; margin-bottom:10px; line-height:1.6;">`;
      result.steps.forEach(s => html += `<div>${s}</div>`);
      html += `</div>`;
    }

    if (result.response) {
      html += `<div style="font-size:0.8rem; color:#E2E8F0; white-space:pre-wrap; margin-bottom:10px;">${result.response}</div>`;
    }

    if (result.quickFixYaml || result.yaml) {
      const yamlCode = result.quickFixYaml || result.yaml;
      const id = 'yaml-block-' + Math.random().toString(36).substr(2, 6);
      html += `
        <div class="ai-code-wrapper">
          <div class="ai-code-header">
            <span>Kubernetes Manifest (YAML)</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-secondary btn-sm" onclick="copyAiCode('${id}')" style="padding:2px 8px; font-size:0.7rem;">📋 Kopyala</button>
              <button class="btn btn-primary btn-sm" onclick="applyAiYaml('${id}')" style="padding:2px 8px; font-size:0.7rem;">⚡ Kümeye Uygula</button>
            </div>
          </div>
          <pre class="ai-code-body" id="${id}"><code>${escapeHtml(yamlCode)}</code></pre>
        </div>
      `;
    }

    aiMsg.innerHTML = html;
  } catch (err) {
    aiMsg.innerHTML = `<div class="ai-bubble-sender">🤖 Shams AI Copilot:</div><div style="color:var(--danger); font-size:0.82rem;">❌ Hata: ${err.message}</div>`;
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function getActionLabel(action) {
  switch (action) {
    case 'diagnose_crash': return 'Pod Crash & Event Teşhisi Yap';
    case 'generate_yaml': return 'Üretim Standartlarında Deployment YAML Oluştur';
    case 'cis_remediation': return 'CIS Güvenlik Sıkılaştırma Kurallarını Göster';
    case 'finops_advice': return 'FinOps Kaynak ve Tasarruf Tavsiyeleri Ver';
    default: return 'Kubernetes Küme Analizi';
  }
}

function copyAiCode(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    alert('YAML manifestosu panoya kopyalandı!');
  });
}

async function applyAiYaml(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const yamlContent = el.innerText;

  if (!confirm('Bu Kubernetes manifestosunu doğrudan canlı kümeye uygulamak (kubectl apply -f) istiyor musunuz?')) {
    return;
  }

  const { ip, user, pass } = (typeof getTargetMasterCredentials === 'function') ? getTargetMasterCredentials() : {};
  if (!ip) {
    alert('Aktif küme bağlantısı bulunamadı. Lütfen önce kümeye bağlanınız.');
    return;
  }

  try {
    const res = await fetch('/api/cluster/quick-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        command: `cat << 'EOF' | kubectl apply -f -\n${yamlContent}\nEOF`
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`Manifesto başarıyla uygulandı!\n\nÇıktı:\n${data.output || 'Uygulandı.'}`);
  } catch (e) {
    alert(`Uygulama hatası: ${e.message}`);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
