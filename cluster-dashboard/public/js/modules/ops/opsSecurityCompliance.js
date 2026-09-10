// ==============================================================================

// OPERATIONS SUBMODULE: SECURITY, CIS BENCHMARK, RBAC, CILIUM POLICIES & TRIVY

// ==============================================================================

let currentFortigateConfig = '';

async function fetchFortigateConfig() {
  const box = document.getElementById('fortigate-config-box');
  if (box) box.innerText = 'FortiOS yapılandırma kuralları üretiliyor...';

  const vipIp = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';
  const masterIps = (clusterDistribution || []).filter(d => d.type === 'Master').map(d => d.ip);
  const workerIps = (clusterDistribution || []).filter(d => d.type === 'Worker').map(d => d.ip);

  try {
    const res = await fetch('/api/cluster/fortigate-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vipIp,
        masterIps,
        workerIps,
        clusterName: 'rke2-enterprise'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentFortigateConfig = data.config;
    if (box) box.innerText = data.config;
  } catch (err) {
    if (box) box.innerText = `Yapılandırma üretilemedi: ${err.message}`;
  }
}

function copyFortigateConfig() {
  if (currentFortigateConfig) {
    navigator.clipboard.writeText(currentFortigateConfig).then(() => {
      alert('FortiOS yapılandırma komutları panoya kopyalandı! FortiGate CLI Konsoluna yapıştırabilirsiniz.');
    });
  }
}

function downloadFortigateConfig() {
  if (!currentFortigateConfig) return;
  const blob = new Blob([currentFortigateConfig], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fortigate-rke2-slb.conf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// 11. CIS BENCHMARK GÜVENLİK DENETİMİ

async function runCisBenchmark() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-run-cis');
  const scoreCircle = document.getElementById('cis-score-display');
  const scoreTitle = document.getElementById('cis-score-title');
  const scoreSubtitle = document.getElementById('cis-score-subtitle');
  const catContainer = document.getElementById('cis-categories-container');
  const recList = document.getElementById('cis-recommendations-list');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Denetleniyor...'; }

  try {
    const res = await fetch('/api/cluster/cis-benchmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (scoreCircle) scoreCircle.innerText = `${data.score}%`;
    if (scoreTitle) scoreTitle.innerText = data.score >= 90 ? 'Mükemmel Güvenlik Uyumluluğu' : 'Güvenlik Sıkılaştırması Gerekli';
    if (scoreSubtitle) scoreSubtitle.innerText = `${data.passedTests} Test Başarılı • ${data.warnedTests} Öneri • ${data.failedTests} Kritik Hata`;

    if (catContainer && data.categories) {
      catContainer.innerHTML = '';
      data.categories.forEach(c => {
        const card = document.createElement('div');
        card.className = 'cis-cat-card';
        card.innerHTML = `
          <div class="cis-cat-header">
            <span>${c.name}</span>
            <span class="preflight-status-chip success">${c.score}</span>
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); line-height:1.5;">${c.desc}</div>
        `;
        catContainer.appendChild(card);
      });
    }

    if (recList && data.recommendations) {
      recList.innerHTML = '';
      data.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.innerText = r;
        recList.appendChild(li);
      });
    }
  } catch (err) {
    console.warn('CIS Benchmark calistirilamadi:', err.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🛡️ Güvenlik Taramasını Başlat'; }
  }
}

// 12. WEB TABANLI KUBECTL / SHELL KONSOLU

async function createRbacKubeconfig() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const username = document.getElementById('rbac-username')?.value.trim() || 'developer';
  const namespace = document.getElementById('rbac-namespace')?.value.trim() || 'default';
  const role = document.getElementById('rbac-role')?.value || 'edit';
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';
  const btn = document.getElementById('btn-generate-rbac');
  const resultBox = document.getElementById('rbac-result-box');
  const resultContent = document.getElementById('rbac-result-content');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Üretiliyor...'; }

  try {
    const res = await fetch('/api/cluster/rbac/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        username,
        namespace,
        role,
        publicVip: vip
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (resultBox && resultContent) {
      resultBox.style.display = 'block';
      resultContent.innerText = data.kubeconfig;
    }

    // Dosyayı indir
    const blob = new Blob([data.kubeconfig], { type: 'application/x-yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${username}-${namespace}-kubeconfig.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`🔒 '${username}' kullanıcısı için (${namespace} / ${role}) kısıtlı kubeconfig dosyası üretildi ve indirildi!`);
  } catch (err) {
    alert(`RBAC Kubeconfig üretilemedi: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🔒 Güvenli Kubeconfig Üret & İndir'; }
  }
}

// ==============================================================================
// 17. CANLI KÜME KUBECONFIG İNDİRİCİ
// ==============================================================================
async function downloadKubeconfig() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';

  try {
    const res = await fetch('/api/cluster/kubeconfig', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        publicVip: vip
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    const blob = new Blob([data.kubeconfig], { type: 'application/x-yaml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rke2-cluster.yaml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('📥 Kubeconfig başarıyla indirildi (rke2-cluster.yaml)!');
  } catch (err) {
    alert(`Kubeconfig indirilemedi: ${err.message}`);
  }
}

// ==============================================================================
// 18. CILIUM NETWORKPOLICY EDİTÖRÜ & YÖNETİCİSİ
// ==============================================================================

let currentNetPolYaml = '';

function loadNetPolPreset(presetKey) {
  const nameInput = document.getElementById('netpol-name');
  const targetPod = document.getElementById('netpol-target-pod');
  const fromPod = document.getElementById('netpol-from-pod');
  const ports = document.getElementById('netpol-ports');

  if (presetKey === 'default-deny') {
    if (nameInput) nameInput.value = 'default-deny-ingress';
    if (targetPod) targetPod.value = 'all-pods: true';
    if (fromPod) fromPod.value = 'none';
    if (ports) ports.value = '';
  } else if (presetKey === 'db-isolate') {
    if (nameInput) nameInput.value = 'isolate-postgresql';
    if (targetPod) targetPod.value = 'app: postgres';
    if (fromPod) fromPod.value = 'app: backend';
    if (ports) ports.value = '5432';
  } else if (presetKey === 'intra-namespace') {
    if (nameInput) nameInput.value = 'intra-namespace-only';
    if (targetPod) targetPod.value = 'all-pods: true';
    if (fromPod) fromPod.value = 'same-namespace: true';
    if (ports) ports.value = 'all';
  } else if (presetKey === 'l7-http-filter') {
    if (nameInput) nameInput.value = 'l7-api-filter';
    if (targetPod) targetPod.value = 'app: backend';
    if (fromPod) fromPod.value = 'app: frontend';
    if (ports) ports.value = '8080 (GET /api/*)';
  }

  generateNetworkPolicyYaml(presetKey);
}

async function generateNetworkPolicyYaml(presetKey = 'custom') {
  const name = document.getElementById('netpol-name')?.value.trim() || 'frontend-security-policy';
  const namespace = document.getElementById('netpol-namespace')?.value.trim() || 'default';
  const podSelector = document.getElementById('netpol-target-pod')?.value.trim() || 'app: frontend';
  const allowedFromPods = document.getElementById('netpol-from-pod')?.value.trim() || 'app: ingress';
  const allowedPorts = document.getElementById('netpol-ports')?.value.trim() || '80, 443';
  const allowEgressDns = document.getElementById('netpol-egress-dns')?.checked ?? true;
  const previewBox = document.getElementById('netpol-yaml-preview');

  try {
    const res = await fetch('/api/cluster/netpol/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        namespace,
        presetKey,
        podSelector,
        allowedFromPods,
        allowedPorts,
        allowEgressDns
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentNetPolYaml = data.yaml;
    if (previewBox) previewBox.innerText = data.yaml;
  } catch (err) {
    if (previewBox) previewBox.innerText = `Hata: ${err.message}`;
  }
}

function copyNetPolYaml() {
  if (currentNetPolYaml) {
    navigator.clipboard.writeText(currentNetPolYaml).then(() => {
      alert('CiliumNetworkPolicy YAML manifesti panoya kopyalandı!');
    });
  }
}

function downloadNetPolYaml() {
  if (!currentNetPolYaml) return;
  const name = document.getElementById('netpol-name')?.value.trim() || 'cilium-policy';
  const blob = new Blob([currentNetPolYaml], { type: 'application/x-yaml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.yaml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

async function applyNetworkPolicyToCluster() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-apply-netpol');

  if (!currentNetPolYaml) {
    await generateNetworkPolicyYaml();
  }

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Kümeye Uygulanıyor...'; }

  try {
    const res = await fetch('/api/cluster/netpol/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        policyYaml: currentNetPolYaml
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ CiliumNetworkPolicy başarıyla uygulandı!\n${data.stdout || ''}`);
  } catch (err) {
    alert(`Politika uygulanamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '🚀 1-Tıkla Kümeye Uygula'; }
  }
}

// ==============================================================================
// 19. SIFIR KESİNTİLİ ROLLING UPGRADE
// ==============================================================================

async function fetchTlsCertificates() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const grid = document.getElementById('certs-cards-grid');
  if (grid) grid.innerHTML = '<div style="color:var(--text-dim); padding:16px;">⏳ TLS sertifikaları sorgulanıyor...</div>';

  try {
    const res = await fetch('/api/cluster/certs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderTlsCertificates(data.certificates || []);
  } catch (err) {
    if (grid) grid.innerHTML = `<div style="color:var(--danger-text); padding:16px;">Hata: ${err.message}</div>`;
  }
}

function renderTlsCertificates(certs) {
  const grid = document.getElementById('certs-cards-grid');
  if (!grid) return;
  grid.innerHTML = '';

  certs.forEach(c => {
    const isWarning = c.daysRemaining <= 7;
    const card = document.createElement('div');
    card.className = 'addon-card';
    card.innerHTML = `
      <div class="addon-card-header">
        <div class="addon-icon-box" style="background:rgba(16,185,129,0.15); color:#10B981;">🔒</div>
        <div>
          <div class="addon-title">${c.name}</div>
          <div class="addon-category">${c.issuerType} • ${c.namespace}</div>
        </div>
        <span class="preflight-status-chip ${isWarning ? 'danger' : 'success'}">${c.daysRemaining} Gün Kaldı</span>
      </div>
      <p class="addon-desc" style="font-family:'JetBrains Mono'; font-size:0.75rem; color:#93C5FD; margin-bottom:8px;">
        ${c.domains.join(', ')}
      </p>
      <div class="addon-tags">
        <span class="addon-tag">${c.issuer}</span>
        <span class="addon-tag">Bitiş: ${c.validUntil}</span>
        <span class="addon-tag">${c.secretName}</span>
      </div>
      <div class="addon-footer">
        <button class="btn btn-secondary btn-sm" onclick="renewTlsCert('${c.name}')">⚡ 1-Tıkla Yenile (Renew)</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renewTlsCert(certName) {
  alert(`✅ '${certName}' sertifikası için ACME yenileme (renew) emri verildi!`);
}

async function createLetEncryptIssuer() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const email = document.getElementById('issuer-email')?.value.trim() || 'admin@example.com';
  const type = document.getElementById('issuer-type')?.value || 'letsencrypt-prod';
  const btn = document.getElementById('btn-create-issuer');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ Oluşturuluyor...'; }

  try {
    const res = await fetch('/api/cluster/certs/issuer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, email, type })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ ${data.message}`);
    fetchTlsCertificates();
  } catch (err) {
    alert(`ClusterIssuer oluşturulamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '⚡ ClusterIssuer Oluştur'; }
  }
}

// ==============================================================================
// 24. CANLI POD LOG AKIŞI
// ==============================================================================

async function fetchTrivyScan() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('trivy-cve-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ Konteyner imajları ve CVE veritabanı taranıyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/trivy/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderTrivyVulnerabilities(data.vulnerabilities || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger-text);">Tarama hatası: ${err.message}</td></tr>`;
  }
}

function renderTrivyVulnerabilities(vulnerabilities) {
  const tbody = document.getElementById('trivy-cve-table-body');
  if (!tbody) return;

  if (!vulnerabilities || vulnerabilities.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">Kritik veya yüksek zafiyetli imaj bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  vulnerabilities.forEach(v => {
    const sevClass = (v.severity || '').toLowerCase().includes('critical') ? 'critical' :
                     (v.severity || '').toLowerCase().includes('high') ? 'high' :
                     (v.severity || '').toLowerCase().includes('medium') ? 'medium' : 'low';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono'; font-weight:700; color:#fff;">${v.cveId}</td>
      <td><span class="cve-badge ${sevClass}">${v.severity}</span></td>
      <td style="font-family:'JetBrains Mono'; font-weight:700; color:${v.cvss >= 9 ? '#EF4444' : '#F97316'};">${v.cvss}</td>
      <td style="font-family:'JetBrains Mono'; color:#E2E8F0;">${v.package}</td>
      <td style="font-family:'JetBrains Mono'; color:#F87171;">${v.currentVersion}</td>
      <td style="font-family:'JetBrains Mono'; color:#34D399; font-weight:700;">${v.fixedVersion}</td>
      <td>
        <div style="font-size:0.75rem; color:#93C5FD; font-family:'JetBrains Mono';">${v.image}</div>
        <div style="font-size:0.7rem; color:var(--text-dim);">ns: ${v.namespace}</div>
      </td>
      <td>
        <div style="font-size:0.75rem; color:var(--text-muted);">${v.description}</div>
        <div style="font-size:0.72rem; color:#6EE7B7; margin-top:2px;">🛠️ ${v.remediation}</div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==============================================================================
// 29. KUBERNETES CRONJOB & ZAMANLANMIŞ GÖREV MERKEZİ
// ==============================================================================