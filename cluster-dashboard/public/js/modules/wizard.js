// ==============================================================================
// RKE2 CLUSTER HUB: KURULUM SİHİRBAZI MODÜLÜ (WIZARD ENGINE)
// ==============================================================================
// --- OPERATION MODE SELECTOR (NEW VS SCALE-OUT) ---
function selectOperationMode(mode) {
  operationMode = mode;
  document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));

  const card = document.getElementById(`mode-${mode}`);
  if (card) card.classList.add('selected');

  const title = document.getElementById('step3-title');
  const desc = document.getElementById('step3-desc');
  const scaleBanner = document.getElementById('scale-info-banner');
  const lblMaster = document.getElementById('lbl-master-count');
  const hintMaster = document.getElementById('hint-master-count');
  const inputMaster = document.getElementById('cfg-master-count');
  const lblWorker = document.getElementById('lbl-worker-count');
  const hintWorker = document.getElementById('hint-worker-count');
  const inputWorker = document.getElementById('cfg-worker-count');
  const inputVmid = document.getElementById('cfg-start-vmid');
  const rowScaleIndexing = document.getElementById('row-scale-indexing');
  const lblStartHost = document.getElementById('lbl-start-host');
  const hintStartHost = document.getElementById('hint-start-host');
  const inputStartHost = document.getElementById('cfg-start-host');
  const lblVip = document.getElementById('lbl-vip');
  const hintVip = document.getElementById('hint-vip');
  const inputVip = document.getElementById('cfg-vip');
  const lblToken = document.getElementById('lbl-token');
  const inputToken = document.getElementById('cfg-token');
  const rowCniDomain = document.getElementById('row-cni-domain');
  const btnDeploy = document.getElementById('btn-start-deploy');

  const navStep3 = document.querySelector('#step-nav-3 .step-label, #step-nav-3 .h-step-title');
  const navStep4 = document.querySelector('#step-nav-4 .step-label, #step-nav-4 .h-step-title');
  const navStep5 = document.querySelector('#step-nav-5 .step-label, #step-nav-5 .h-step-title');

  const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');

  if (mode === 'scale') {
    if (title) title.innerText = isEn ? 'Add Nodes to Existing Cluster (Scale-Out)' : 'Mevcut Kümeye Düğüm Ekleme (Scale-Out)';
    if (desc) desc.innerText = isEn ? 'Specify existing API/Join address, Join Token, and the count of new Master/Worker nodes to add.' : 'Mevcut kümenizin API/Join adresini, Join Token\'ını ve eklemek istediğiniz yeni Master/Worker adetlerini belirleyin.';
    if (scaleBanner) scaleBanner.style.display = 'block';

    if (lblMaster) lblMaster.innerText = isEn ? 'Master Nodes to Add' : 'Eklenecek Master Sayısı';
    if (hintMaster) hintMaster.innerText = isEn ? 'Enter 0 if only adding Worker nodes' : 'Yalnızca Worker ekleyecekseniz 0 yazabilirsiniz';
    if (inputMaster) inputMaster.value = '0';

    if (lblWorker) lblWorker.innerText = isEn ? 'Worker Nodes to Add' : 'Eklenecek Worker Sayısı';
    if (hintWorker) hintWorker.innerText = isEn ? 'New worker nodes to join the cluster' : 'Kümeye dahil edilecek yeni işçi düğümleri';
    if (inputWorker) inputWorker.value = '2';

    if (inputVmid) inputVmid.value = '110';
    if (rowScaleIndexing) rowScaleIndexing.style.display = 'grid';

    if (lblStartHost) lblStartHost.innerText = isEn ? 'New Nodes Start Host IP' : 'Yeni Düğümler Başlangıç Host IP';
    if (hintStartHost) hintStartHost.innerText = isEn ? 'Must not conflict with existing IPs (e.g. 20 -> 10.0.10.20)' : 'Mevcut IP\'lerle çakışmamalı (Örn: 20 -> 10.0.10.20)';
    if (inputStartHost) inputStartHost.value = '20';

    if (lblVip) lblVip.innerText = isEn ? 'Existing Cluster API / Join Address (VIP or Master IP)' : 'Mevcut Küme API / Join Adresi (VIP veya Master IP)';
    if (hintVip) hintVip.style.display = 'block';
    if (inputVip) inputVip.placeholder = isEn ? '10.0.10.100 or First Master IP' : '10.0.10.100 veya İlk Master IP';

    if (lblToken) lblToken.innerText = isEn ? 'Existing Cluster Join Token (Required)' : 'Mevcut Küme Join Token (Zorunlu)';
    if (inputToken) inputToken.placeholder = isEn ? 'Contents of /var/lib/rancher/rke2/server/node-token' : 'Mevcut master /var/lib/rancher/rke2/server/node-token içeriği';

    if (rowCniDomain) rowCniDomain.style.display = 'none';

    if (navStep3) navStep3.innerText = isEn ? 'Node Sizing' : 'Düğüm Ayarları';
    if (navStep4) navStep4.innerText = isEn ? 'Scale Plan' : 'Ekleme Planı';
    if (navStep5) navStep5.innerText = isEn ? 'Node Rollout' : 'Düğüm Kurulumu';
    if (btnDeploy) btnDeploy.innerText = isEn ? '🚀 Deploy & Join Nodes to Cluster' : '🚀 Düğümleri Ekle & Kümeye Kat (Join)';
  } else {
    if (title) title.innerText = isEn ? 'Kubernetes Architecture & Sizing' : 'Kubernetes Mimarisi & Boyutlandırma';
    if (desc) desc.innerText = isEn ? 'Define Master and Worker counts, IP subnet, and high availability settings.' : 'Master ve Worker sayılarını, IP bloğunuzu ve yüksek erişilebilirlik ayarlarını belirleyin.';
    if (scaleBanner) scaleBanner.style.display = 'none';

    if (lblMaster) lblMaster.innerText = isEn ? 'Master (Control-Plane) Count' : 'Master (Control-Plane) Sayısı';
    if (hintMaster) hintMaster.innerText = isEn ? '3 recommended for HA etcd quorum' : 'HA etcd için 3 önerilir';
    if (inputMaster) inputMaster.value = '3';

    if (lblWorker) lblWorker.innerText = isEn ? 'Worker Count' : 'Worker Sayısı';
    if (hintWorker) hintWorker.innerText = isEn ? 'Carries application workloads' : 'Uygulama yüklerini taşır';
    if (inputWorker) inputWorker.value = '5';

    if (inputVmid) inputVmid.value = '100';
    if (rowScaleIndexing) rowScaleIndexing.style.display = 'none';

    if (lblStartHost) lblStartHost.innerText = isEn ? 'Start Host Number' : 'Başlangıç Host No';
    if (hintStartHost) hintStartHost.innerText = isEn ? 'First IP: 10.0.10.10' : 'İlk IP: 10.0.10.10';
    if (inputStartHost) inputStartHost.value = '10';

    if (lblVip) lblVip.innerText = isEn ? 'FortiGate VIP / Load Balancer IP' : 'FortiGate VIP / Load Balancer IP';
    if (hintVip) hintVip.style.display = 'none';
    if (inputVip) inputVip.placeholder = '10.0.10.100';

    if (lblToken) lblToken.innerText = isEn ? 'Cluster Secret Token' : 'Cluster Secret Token';
    if (inputToken) inputToken.placeholder = isEn ? 'Auto-generated if left blank' : 'Boş bırakılırsa otomatik üretilir';

    if (rowCniDomain) rowCniDomain.style.display = 'grid';

    if (navStep3) navStep3.innerText = isEn ? 'Cluster Sizing' : 'Küme Ayarları';
    if (navStep4) navStep4.innerText = isEn ? 'Topology Plan' : 'Dağıtım Planı';
    if (navStep5) navStep5.innerText = isEn ? 'Live Rollout' : 'Canlı Kurulum';
    if (btnDeploy) btnDeploy.innerText = isEn ? '🚀 Deploy Cluster' : '🚀 Kurulumu Başlat (Deploy Cluster)';
  }

  syncStepDisplay('master');
  syncStepDisplay('worker');
  updateLiveSummary();
}

// --- STEP 3 INTERACTIVE HELPERS ---
function stepCount(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  let val = (parseInt(input.value, 10) || 0) + delta;
  const min = parseInt(input.min, 10) || 0;
  const max = parseInt(input.max, 10) || 100;
  if (val < min) val = min;
  if (val > max) val = max;
  input.value = val;
  syncStepDisplay(inputId.includes('master') ? 'master' : 'worker');
  updateLiveSummary();
}

function setCount(inputId, value, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = value;
  const type = inputId.includes('master') ? 'master' : 'worker';
  syncStepDisplay(type);

  // Buton aktiflik durumunu guncelle
  const parent = btn ? btn.parentElement : null;
  if (parent) {
    parent.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }

  updateLiveSummary();
}

function syncStepDisplay(type) {
  const input = document.getElementById(`cfg-${type}-count`);
  const display = document.getElementById(`display-${type}-count`);
  if (input && display) {
    display.innerText = input.value;
  }
}

function setNodeSpecs(cores, ramMB, diskGB, btn) {
  const inputCores = document.getElementById('cfg-cores');
  const inputRam = document.getElementById('cfg-ram');
  const inputDisk = document.getElementById('cfg-disk');
  if (inputCores) inputCores.value = cores;
  if (inputRam) inputRam.value = ramMB;
  if (inputDisk) inputDisk.value = diskGB;

  if (btn && btn.parentElement) {
    btn.parentElement.querySelectorAll('.spec-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
  }
  updateLiveSummary();
}

function generateRandomToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'rke2-';
  for (let i = 0; i < 28; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const input = document.getElementById('cfg-token');
  if (input) {
    input.value = token;
    input.style.borderColor = 'var(--success)';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
  }
}

function togglePassVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = '🔒';
  } else {
    input.type = 'password';
    btn.innerText = '👁️';
  }
}

function updateLiveSummary() {
  const mCount = parseInt(document.getElementById('cfg-master-count')?.value, 10) || 0;
  const wCount = parseInt(document.getElementById('cfg-worker-count')?.value, 10) || 0;
  const cores = parseInt(document.getElementById('cfg-cores')?.value, 10) || 8;
  const ramMB = parseInt(document.getElementById('cfg-ram')?.value, 10) || 16384;
  const subnetBase = document.getElementById('cfg-subnet-base')?.value.trim() || '10.0.10';
  const startHost = document.getElementById('cfg-start-host')?.value.trim() || '10';

  const totalNodes = mCount + wCount;
  const totalCores = totalNodes * cores;
  const totalRamGB = Math.round((totalNodes * ramMB) / 1024);

  const sumNodes = document.getElementById('sum-total-nodes');
  const sumSpecs = document.getElementById('sum-total-specs');
  const sumHa = document.getElementById('sum-ha-status');
  const chipFirstIp = document.getElementById('chip-first-ip');

  if (sumNodes) {
    sumNodes.innerText = `${totalNodes} Düğüm (${mCount} Master + ${wCount} Worker)`;
  }
  if (sumSpecs) {
    sumSpecs.innerText = `${totalCores} vCPU / ${totalRamGB} GB RAM`;
  }
  if (sumHa) {
    if (mCount >= 3 && mCount % 2 !== 0) {
      sumHa.innerText = `✔ HA Quorum Aktif (${mCount} Master)`;
      sumHa.style.color = 'var(--success)';
    } else if (mCount === 1) {
      sumHa.innerText = '⚠️ Standalone (Tek Master)';
      sumHa.style.color = 'var(--warning)';
    } else if (mCount % 2 === 0 && mCount > 0) {
      sumHa.innerText = '⚠️ Çift Sayıda Master (etcd tek önerir)';
      sumHa.style.color = 'var(--warning)';
    } else if (mCount === 0) {
      sumHa.innerText = '➕ Worker Genişletme (Scale-Out)';
      sumHa.style.color = 'var(--primary-glow)';
    }
  }
  if (chipFirstIp) {
    chipFirstIp.innerText = `${subnetBase}.${startHost}`;
  }

  // Sidebar Canlı Telemetrisini Güncelle
  const sbNodes = document.getElementById('sidebar-nodes');
  const sbSpecs = document.getElementById('sidebar-specs');
  const sbHa = document.getElementById('sidebar-ha');
  if (sbNodes) sbNodes.innerText = `${mCount}M + ${wCount}W (${totalNodes} Node)`;
  if (sbSpecs) sbSpecs.innerText = `${totalCores} vCPU / ${totalRamGB} GB`;
  if (sbHa) {
    if (mCount >= 3 && mCount % 2 !== 0) {
      sbHa.innerText = '✔ HA Quorum Aktif';
      sbHa.style.color = 'var(--success-glow)';
    } else if (mCount === 0) {
      sbHa.innerText = '➕ Scale-Out';
      sbHa.style.color = 'var(--primary-glow)';
    } else {
      sbHa.innerText = '⚠️ Tekil / Çift Master';
      sbHa.style.color = 'var(--warning-glow)';
    }
  }
}

// --- STEP NAVIGATION ---
function goToStep(stepNumber) {
  document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.step-item, .h-step-item').forEach(el => el.classList.remove('active'));

  currentStep = stepNumber;
  const targetStep = document.getElementById(`step-${stepNumber}`);
  const targetNav = document.getElementById(`step-nav-${stepNumber}`);
  if (targetStep) targetStep.classList.add('active');
  if (targetNav) targetNav.classList.add('active');

  const stepTitles = {
    1: '01 • Altyapı & Kurulum Modu',
    2: '02 • Sunucu Keşfi & Kimlik Doğrulama',
    3: '03 • Kubernetes Mimarisi & Kaynaklar',
    4: '04 • Fiziksel Topoloji & Anti-Affinity',
    5: '05 • Canlı Dağıtım & Rollout'
  };
  const bTitle = document.getElementById('breadcrumb-step-title');
  if (bTitle && stepTitles[stepNumber]) {
    bTitle.innerText = stepTitles[stepNumber];
  }

  for (let i = 1; i <= 5; i++) {
    const nav = document.getElementById(`step-nav-${i}`);
    const statusPill = document.getElementById(`step-status-${i}`);
    if (nav) {
      if (i < stepNumber) {
        nav.classList.add('completed');
        if (statusPill) statusPill.innerText = 'Bitti';
      } else if (i === stepNumber) {
        nav.classList.remove('completed');
        if (statusPill) statusPill.innerText = 'Aktif';
      } else {
        nav.classList.remove('completed');
        if (statusPill) statusPill.innerText = 'Bekliyor';
      }
    }
  }

  // Dinamik ilerleme cubugunu guncelle (0%, 25%, 50%, 75%, 100%)
  const progressPercent = ((stepNumber - 1) / 4) * 100;
  const railFill = document.getElementById('stepper-rail-fill');
  if (railFill) {
    railFill.style.width = `${progressPercent}%`;
  }

  // Secili saglayici baslik ve form alanlarini her adim gecisinde guncelle
  applyProviderUI(selectedProvider);
}

// --- DYNAMIC PROVIDER UI CONTROLLER ---
function applyProviderUI(prov) {
  const brandBadge = document.getElementById('top-brand-badge');
  const title = document.getElementById('step2-title');
  const desc = document.getElementById('step2-desc');
  const lblHost = document.getElementById('lbl-host');
  const apiHost = document.getElementById('api-host');
  const lblHint = document.getElementById('lbl-hint');
  const port = document.getElementById('api-port');
  const lblUser = document.getElementById('lbl-user');
  const user = document.getElementById('api-user');
  const btnText = document.getElementById('conn-btn-text');
  const lblNodesPool = document.getElementById('lbl-nodes-pool');
  const lblTemplate = document.getElementById('lbl-template');
  const lblStorage = document.getElementById('lbl-storage');
  const connForm = document.getElementById('conn-form-container');
  const btnNext = document.getElementById('btn-step2-next');

  if (prov === 'hyperv') {
    const isEn = (typeof currentLanguage !== 'undefined' && currentLanguage === 'en');
    document.title = 'RKE2 & Cilium Cluster Hub - Microsoft Hyper-V';
    if (brandBadge) brandBadge.innerText = 'Cilium eBPF & Microsoft Hyper-V';
    if (title) title.innerText = isEn ? 'Microsoft Hyper-V Connection & Discovery' : 'Microsoft Hyper-V Bağlantısı & Keşif';
    if (desc) desc.innerText = isEn ? 'Connect via PowerShell / OpenSSH to discover Hyper-V virtual switches, host resources, and VHDX templates.' : 'PowerShell / OpenSSH ile bağlanarak Hyper-V sanal anahtarlarını (vSwitch), donanımı ve VHDX şablonlarını keşfedin.';
    if (lblHost) lblHost.innerText = isEn ? 'Hyper-V Host IP / Hostname (or localhost)' : 'Hyper-V Sunucu IP / Hostname (veya localhost)';
    if (apiHost) apiHost.placeholder = 'localhost veya 10.0.30.10';
    if (lblHint) {
      lblHint.innerHTML = isEn
        ? '💡 <strong>Tip:</strong> If running directly on the Hyper-V host machine, specify <strong>localhost</strong> to execute via local PowerShell without credentials. For remote Windows Server, provide Administrator user and SSH port (22).'
        : '💡 <strong>İpucu:</strong> Eğer bu dashboard doğrudan Hyper-V sunucusunun üzerinde çalışıyorsa IP kısmına <strong>localhost</strong> yazarak şifresiz yerel PowerShell ile bağlanabilirsiniz. Uzak Windows Server için Administrator hesabı ve SSH portu (22) kullanılır.';
    }
    if (port) port.value = '22';
    if (lblUser) lblUser.innerText = isEn ? 'Windows Administrator User' : 'Windows Yönetici Kullanıcısı';
    if (user) user.placeholder = 'Administrator veya ./Administrator';
    if (btnText && btnText.innerText.indexOf('⏳') === -1) btnText.innerText = isEn ? '⚡ Connect to Hyper-V & Discover' : '⚡ Hyper-V\'ye Bağlan & Keşfet';
    if (lblNodesPool) lblNodesPool.innerText = isEn ? 'Discovered Hyper-V Host & VMs' : 'Tespit Edilen Hyper-V Hostu & Sanal Makineler';
    if (lblTemplate) lblTemplate.innerText = isEn ? 'Target VHDX Template' : 'Klonlanacak Altın VHDX Şablonu (Template)';
    if (lblStorage) lblStorage.innerText = isEn ? 'Target Virtual Hard Disks Directory' : 'Hedef Sanal Disk Klasörü (Hyper-V Storage)';
    if (connForm) connForm.style.display = 'block';
    if (btnNext) btnNext.style.display = 'inline-flex';
  } else if (prov === 'vcenter') {
    document.title = 'RKE2 & Cilium Cluster Hub - VMware vCenter';
    if (brandBadge) brandBadge.innerText = 'Cilium eBPF & VMware vCenter';
    if (title) title.innerText = 'VMware vCenter / vSphere Bağlantısı & Keşif';
    if (desc) desc.innerText = 'vCenter REST API ile bağlanarak ESXi fiziksel hostları ve VM şablonlarını keşfedin.';
    if (lblHost) lblHost.innerText = 'vCenter Server IP / FQDN';
    if (apiHost) apiHost.placeholder = 'vcenter.shamssoftware.com veya 10.0.20.10';
    if (lblHint) {
      lblHint.innerHTML = '💡 <strong>İpucu:</strong> vCenter sunucusuna bağlandığınızda cluster altındaki <strong>tüm ESXi fiziksel sunucuları (host\'lar) ve VM şablonları</strong> otomatik listelenir.';
    }
    if (port) port.value = '443';
    if (lblUser) lblUser.innerText = 'vCenter Yönetici Kullanıcısı';
    if (user) user.placeholder = 'administrator@vsphere.local';
    if (btnText && btnText.innerText.indexOf('⏳') === -1) btnText.innerText = '⚡ vCenter\'a Bağlan & Hostları Keşfet';
    if (lblNodesPool) lblNodesPool.innerText = 'Tespit Edilen ESXi Fiziksel Sunucular (vSphere Host Pool)';
    if (lblTemplate) lblTemplate.innerText = 'Klonlanacak vSphere VM Şablonu (Template)';
    if (lblStorage) lblStorage.innerText = 'Hedef Datastore / Depolama Alanı (vSphere)';
    if (connForm) connForm.style.display = 'block';
    if (btnNext) btnNext.style.display = 'inline-flex';
  } else if (prov === 'proxmox') {
    document.title = 'RKE2 & Cilium Cluster Hub - Proxmox VE';
    if (brandBadge) brandBadge.innerText = 'Cilium eBPF & Proxmox VE';
    if (title) title.innerText = 'Proxmox VE Bağlantısı & Sunucu Keşfi';
    if (desc) desc.innerText = 'Proxmox REST API ile bağlanarak fiziksel node ve şablonları keşfedin.';
    if (lblHost) lblHost.innerText = 'Proxmox Sunucu IP / Hostname';
    if (apiHost) apiHost.placeholder = '10.0.20.1 veya 10.0.20.1, 10.0.20.2, 10.0.20.3, 10.0.20.4';
    if (lblHint) {
      lblHint.innerHTML = '💡 <strong>İpucu:</strong> Eğer 4 sunucunuz Proxmox Cluster (Datacenter) halindeyse <strong>sadece bir tanesinin IP\'sini girmeniz yeterlidir</strong>; sistem arka plandaki diğer tüm fiziksel sunucuları otomatik keşfeder. Sunucularınız henüz cluster değilse IP\'leri virgülle yazabilirsiniz.';
    }
    if (port) port.value = '8006';
    if (lblUser) lblUser.innerText = 'Proxmox Kullanıcı Adı';
    if (user) user.placeholder = 'root veya root@pam';
    if (btnText && btnText.innerText.indexOf('⏳') === -1) btnText.innerText = '⚡ Proxmox\'a Bağlan & Düğümleri Keşfet';
    if (lblNodesPool) lblNodesPool.innerText = 'Tespit Edilen Fiziksel Sunucular (Proxmox Node Pool)';
    if (lblTemplate) lblTemplate.innerText = 'Klonlanacak Cloud-Init Şablonu (Template)';
    if (lblStorage) lblStorage.innerText = 'Hedef Disk / Depolama Havuzu (Proxmox Storage)';
    if (connForm) connForm.style.display = 'block';
    if (btnNext) btnNext.style.display = 'inline-flex';
  } else {
    document.title = 'RKE2 & Cilium Cluster Hub - Mevcut Sunucular';
    if (brandBadge) brandBadge.innerText = 'Cilium eBPF & Bare-Metal';
    if (title) title.innerText = 'Mevcut / Manuel Sunucular (Bare-Metal)';
    if (desc) desc.innerText = 'Sanallaştırma API\'si olmadan halihazırda açık olan sunucu IP\'lerinizi tanımlayın.';
    if (connForm) connForm.style.display = 'none';
    if (btnNext) btnNext.style.display = 'inline-flex';
    discoveredNodes = [{ name: 'Default-Pool' }];
  }
}

// --- PROVIDER SELECTION ---
function selectProvider(prov) {
  selectedProvider = prov;
  document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`prov-${prov}`);
  if (card) card.classList.add('selected');

  applyProviderUI(prov);

  const discoveredArea = document.getElementById('discovered-nodes-area');
  if (discoveredArea) discoveredArea.style.display = 'none';
}

// --- PROVIDER API CONNECTION & DISCOVERY ---
async function connectProvider() {
  const host = document.getElementById('api-host').value.trim() || (selectedProvider === 'hyperv' ? 'localhost' : '');
  const port = document.getElementById('api-port').value.trim();
  const username = document.getElementById('api-user').value.trim();
  const password = document.getElementById('api-pass').value.trim();
  const btn = document.getElementById('btn-test-conn');
  const btnText = document.getElementById('conn-btn-text');

  const isLocalHyperV = (selectedProvider === 'hyperv' && (!host || host === 'localhost' || host === '127.0.0.1'));
  if (!isLocalHyperV && (!host || !password)) {
    alert('Lütfen sunucu IP adresi ve şifreyi giriniz!');
    return;
  }

  btnText.innerText = '⏳ Bağlanılıyor...';
  btn.disabled = true;

  try {
    let endpoint = '/api/providers/proxmox/connect';
    if (selectedProvider === 'vcenter') {
      endpoint = '/api/providers/vcenter/connect';
    } else if (selectedProvider === 'hyperv') {
      endpoint = '/api/providers/hyperv/connect';
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, port: parseInt(port, 10) || 22, username, password })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Bağlantı başarısız');
    }

    providerAuth = data.auth;
    const nodes = data.nodes || data.hosts || [];
    discoveredNodes = nodes;

    // Node kartlarini olustur
    renderNodeCards(nodes);

    // Template secim kutusunu doldur
    renderTemplates(data.templates || []);

    // Storage / Datastore secim kutusunu doldur
    renderStorages(data.storages || []);

    document.getElementById('discovered-nodes-area').style.display = 'block';
    btnText.innerText = '✅ Bağlantı Başarılı!';
    btn.style.borderColor = 'var(--success)';
  } catch (err) {
    alert(`Bağlantı Hatası: ${err.message}`);
    btnText.innerText = '⚡ Tekrar Dene';
  } finally {
    btn.disabled = false;
  }
}

function renderNodeCards(nodes) {
  const container = document.getElementById('nodes-cards-container');
  container.innerHTML = '';
  document.getElementById('nodes-count-badge').innerText = `${nodes.length} Fiziksel Node Aktif`;

  nodes.forEach(n => {
    const card = document.createElement('div');
    card.className = 'node-card';
    card.innerHTML = `
      <div class="node-title-row">
        <span class="node-name">${n.name}</span>
        <span class="node-online-badge">${n.status || 'ONLINE'}</span>
      </div>
      <div class="node-metric">
        <div class="metric-label">
          <span>CPU Kullanımı</span>
          <span>${n.cpu !== undefined ? n.cpu + '%' : 'Normal'}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${n.cpu || 20}%"></div>
        </div>
      </div>
      <div class="node-metric">
        <div class="metric-label">
          <span>RAM Durumu</span>
          <span>${n.memoryUsedGB ? n.memoryUsedGB + ' / ' + n.memoryTotalGB + ' GB' : 'Aktif'}</span>
        </div>
        <div class="metric-bar">
          <div class="metric-fill" style="width: ${n.memoryUsedGB ? Math.round((n.memoryUsedGB / n.memoryTotalGB) * 100) : 35}%"></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderTemplates(templates) {
  const select = document.getElementById('selected-template');
  select.innerHTML = '';

  if (templates.length === 0) {
    select.innerHTML = '<option value="manual">Şablon bulunamadı (Elle VM seçimi)</option>';
    return;
  }

  templates.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.vmid || t.vmId;
    opt.innerText = `${t.name} (ID: ${t.vmid || t.vmId}) - ${t.cpus || t.cpuCount || 2} CPU, ${t.memoryMB || 2048} MB RAM`;
    select.appendChild(opt);
  });
}

function renderStorages(storages) {
  const select = document.getElementById('selected-storage');
  if (!select) return;
  select.innerHTML = '';

  if (!storages || storages.length === 0) {
    select.innerHTML = '<option value="">Varsayılan Disk Havuzu (Default)</option>';
    return;
  }

  storages.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name || s.storage;
    opt.innerText = `${s.name || s.storage} (${s.availGB || 0} GB Boş / ${s.totalGB || 0} GB Toplam) [${s.type}]`;
    select.appendChild(opt);
  });
}

// --- DISTRIBUTION PREVIEW ---
async function prepareDistributionPreview() {
  const masterCount = parseInt(document.getElementById('cfg-master-count').value, 10) || 0;
  const workerCount = parseInt(document.getElementById('cfg-worker-count').value, 10) || 0;
  const startVmId = parseInt(document.getElementById('cfg-start-vmid').value, 10) || 100;
  const subnetBase = document.getElementById('cfg-subnet-base').value.trim();
  const startIpHost = parseInt(document.getElementById('cfg-start-host').value, 10) || 10;
  const startMasterNum = parseInt(document.getElementById('cfg-start-master-num') ? document.getElementById('cfg-start-master-num').value : 1, 10) || 1;
  const startWorkerNum = parseInt(document.getElementById('cfg-start-worker-num') ? document.getElementById('cfg-start-worker-num').value : 1, 10) || 1;
  const vipIp = document.getElementById('cfg-vip').value.trim();
  const clusterToken = document.getElementById('cfg-token').value.trim();

  if (operationMode === 'scale') {
    if (masterCount === 0 && workerCount === 0) {
      alert('Lütfen eklenecek en az 1 adet Master veya Worker sayısı giriniz.');
      return;
    }
    if (!vipIp) {
      alert('Lütfen mevcut kümenizin API / Join Adresini (VIP veya Master IP) giriniz.');
      return;
    }
    if (!clusterToken) {
      alert('Lütfen mevcut kümenizin Join Token\'ını (/var/lib/rancher/rke2/server/node-token) giriniz.');
      return;
    }
  }

  const physicalNodeNames = discoveredNodes.map(n => n.name);

  try {
    const res = await fetch('/api/cluster/preview-distribution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: operationMode,
        provider: selectedProvider,
        physicalNodes: physicalNodeNames,
        masterCount,
        workerCount,
        startMasterNum,
        startWorkerNum,
        startVmId,
        subnetBase,
        startIpHost
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    clusterDistribution = data.distribution;
    renderDistributionTable(clusterDistribution);
    goToStep(4);
  } catch (err) {
    alert(`Dağıtım planı oluşturulamadı: ${err.message}`);
  }
}

function renderDistributionTable(dist) {
  renderHostTopology(dist);

  const tbody = document.getElementById('distribution-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const physicalNodeNames = discoveredNodes.length > 0
    ? discoveredNodes.map(n => n.name)
    : [...new Set(dist.map(d => d.targetPhysicalNode))];

  dist.forEach(item => {
    const tr = document.createElement('tr');
    const isMaster = (item.type === 'Master');
    const isJoin = item.roleLabel && item.roleLabel.includes('Join');
    const badgeColor = isJoin
      ? 'background:rgba(52, 211, 153, 0.2); color:#34D399; border:1px solid rgba(52, 211, 153, 0.3);'
      : '';

    // Bu hostta baska master var mi kontrol et (Anti-affinity uyarisi)
    const mastersOnSameHost = dist.filter(d => d.type === 'Master' && d.targetPhysicalNode === item.targetPhysicalNode);
    const hasCollision = isMaster && mastersOnSameHost.length > 1;

    // Hedef Fiziksel Sunucu Hucre Icerigi (Tek node ise rozet, birden fazlaysa secim kutusu)
    let hostCellHtml = '';
    if (physicalNodeNames.length > 1) {
      let optionsHtml = '';
      physicalNodeNames.forEach(pNode => {
        optionsHtml += `<option value="${pNode}" ${pNode === item.targetPhysicalNode ? 'selected' : ''}>🖥️ ${pNode}</option>`;
      });
      hostCellHtml = `
        <select class="phys-select-cell" onchange="updateVmTargetHost('${item.name}', this.value)">
          ${optionsHtml}
        </select>
      `;
    } else {
      hostCellHtml = `<span class="phys-badge">🖥️ ${item.targetPhysicalNode}</span>`;
    }

    tr.innerHTML = `
      <td>
        <span class="role-badge ${isMaster ? 'role-master' : 'role-worker'}" ${isJoin ? `style="${badgeColor}"` : ''}>
          ${isMaster ? '👑 ' : '⚡ '}${item.roleLabel}
        </span>
      </td>
      <td style="font-weight:700; color:#fff;">${item.name}</td>
      <td><span style="font-family:'JetBrains Mono'; font-weight:600;">${item.vmId}</span></td>
      <td><span style="font-family:'JetBrains Mono'; color:var(--primary-glow); font-weight:600;">${item.ip}</span></td>
      <td>${hostCellHtml}</td>
      <td>
        ${hasCollision 
          ? `<span style="color:var(--warning); font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
               ⚠️ Aynı Host (${mastersOnSameHost.length} Master)
             </span>`
          : `<span style="color:var(--success); font-size:0.78rem; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
               ✔ Anti-Affinity Korumalı
             </span>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Fiziksel Sunucu (Host) Dağıtım Haritası - Profesyonel Kurumsal Görünüm
function renderHostTopology(dist) {
  const container = document.getElementById('host-topology-container');
  if (!container) return;
  container.innerHTML = '';

  const uniqueHosts = [...new Set(dist.map(d => d.targetPhysicalNode))];
  const physicalNodeNames = discoveredNodes.length > 0
    ? discoveredNodes.map(n => n.name)
    : uniqueHosts;

  const totalMasters = dist.filter(d => d.type === 'Master').length;
  const totalWorkers = dist.filter(d => d.type === 'Worker').length;
  
  // Anti-affinity kontrolü
  let globalCollision = false;
  uniqueHosts.forEach(h => {
    const mCount = dist.filter(d => d.targetPhysicalNode === h && d.type === 'Master').length;
    if (mCount > 1) globalCollision = true;
  });

  const badgeEl = document.getElementById('anti-affinity-badge');
  if (badgeEl) {
    if (globalCollision) {
      badgeEl.innerText = '⚠️ Anti-Affinity Uyarısı: Çoklu Master!';
      badgeEl.style.background = 'rgba(217, 119, 6, 0.15)';
      badgeEl.style.color = 'var(--warning-text)';
      badgeEl.style.borderColor = 'rgba(217, 119, 6, 0.3)';
    } else {
      badgeEl.innerText = '✔ Anti-Affinity: Korumalı';
      badgeEl.style.background = 'rgba(5, 150, 105, 0.15)';
      badgeEl.style.color = 'var(--success-text)';
      badgeEl.style.borderColor = 'rgba(5, 150, 105, 0.3)';
    }
  }

  // 1. ÜST ÖZET ÇUBUĞU (Kullanıcı Dostu & Sade)
  const summaryHud = document.createElement('div');
  summaryHud.className = 'host-summary-bar';
  summaryHud.innerHTML = `
    <div class="summary-metric">
      <span class="metric-label">Fiziksel Sunucu</span>
      <span class="metric-value">${uniqueHosts.length} Host</span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Toplam Sanal Makine</span>
      <span class="metric-value">${dist.length} VM</span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Master Dağılımı</span>
      <span class="metric-value ${globalCollision ? 'text-warning' : 'text-success'}">
        ${totalMasters} Master (${globalCollision ? 'Çakışma Var' : 'Farklı Hostlarda'})
      </span>
    </div>
    <div class="summary-metric">
      <span class="metric-label">Worker Sayısı</span>
      <span class="metric-value">${totalWorkers} Worker</span>
    </div>
  `;
  container.appendChild(summaryHud);

  // 2. FİZİKSEL HOST KARTLARI
  const grid = document.createElement('div');
  grid.className = 'host-topology-grid';

  uniqueHosts.forEach((hostName, idx) => {
    const vmsOnThisHost = dist.filter(d => d.targetPhysicalNode === hostName);
    const masters = vmsOnThisHost.filter(v => v.type === 'Master');
    const workers = vmsOnThisHost.filter(v => v.type === 'Worker');
    const hasCollision = masters.length > 1;

    const hostMeta = discoveredNodes.find(n => n.name === hostName);
    const hostIpStr = hostMeta && hostMeta.pveHost ? hostMeta.pveHost : (hostMeta && hostMeta.host ? hostMeta.host : `Host #${idx + 1}`);

    const card = document.createElement('div');
    card.className = `host-card ${hasCollision ? 'host-collision' : ''}`;

    let vmRowsHtml = '';
    if (vmsOnThisHost.length === 0) {
      vmRowsHtml = '<div class="empty-host-msg">Bu sunucuya atanmış sanal makine bulunmuyor.</div>';
    } else {
      vmsOnThisHost.forEach(vm => {
        const isM = (vm.type === 'Master');
        
        let selectOptionsHtml = '';
        physicalNodeNames.forEach(pNode => {
          selectOptionsHtml += `<option value="${pNode}" ${pNode === hostName ? 'selected' : ''}>${pNode}</option>`;
        });

        vmRowsHtml += `
          <div class="host-vm-row">
            <div class="vm-info">
              <span class="vm-badge ${isM ? 'master' : 'worker'}">${isM ? 'Master' : 'Worker'}</span>
              <span class="vm-name">${vm.name}</span>
            </div>
            <div class="vm-meta">
              <span class="vm-ip">${vm.ip}</span>
              <span class="vm-id">ID: ${vm.vmId}</span>
            </div>
            <div class="vm-actions">
              <label class="action-label">Taşı:</label>
              <select class="action-select" onchange="updateVmTargetHost('${vm.name}', this.value)">
                ${selectOptionsHtml}
              </select>
            </div>
          </div>
        `;
      });
    }

    card.innerHTML = `
      <div class="host-card-header">
        <div class="host-title-area">
          <span class="host-icon">🖥️</span>
          <div>
            <div class="host-name">${hostName}</div>
            <div class="host-ip">${hostIpStr}</div>
          </div>
        </div>
        <span class="host-count-badge">${vmsOnThisHost.length} VM</span>
      </div>

      ${hasCollision 
        ? `<div class="host-alert warning">
             ⚠️ <strong>Anti-Affinity Uyarısı:</strong> Bu fiziksel makinede ${masters.length} adet Master çalışıyor. HA güvenliği için Master'ları farklı hostlara dağıtmanız önerilir.
           </div>`
        : `<div class="host-alert success">
             ✔ <strong>Quorum Korumalı:</strong> ${masters.length === 1 ? '1 Master bu hostta güvenle izole.' : 'Yalnızca Worker düğümleri çalışıyor.'}
           </div>`
      }

      <div class="host-vm-list">
        ${vmRowsHtml}
      </div>

      <div class="host-card-footer">
        <span>Dağılım: ${masters.length} Master / ${workers.length} Worker</span>
        <span class="host-status-pill ${hasCollision ? 'warning' : 'success'}">
          ${hasCollision ? 'Çakışma Mevcut' : 'Dengeli'}
        </span>
      </div>
    `;

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

// Kullanıcı Tablodan VM'in Hedef Sunucusunu Değiştirdiğinde Çalışır
function updateVmTargetHost(vmName, newHost) {
  const targetItem = clusterDistribution.find(d => d.name === vmName);
  if (targetItem) {
    targetItem.targetPhysicalNode = newHost;
    // Topoloji kartlarini ve tablodaki statuleri aninda guncelle
    renderDistributionTable(clusterDistribution);
  }
}

// --- START DEPLOYMENT (WEBSOCKET STREAM) ---
async function startDeployment() {
  goToStep(5);

  const terminal = document.getElementById('terminal-output');
  terminal.innerHTML = '<div class="log-line cyan">[SYSTEM] Canlı WebSocket oturumu başlatılıyor...</div>';

  // WebSocket Baglantisi Ac
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(`${protocol}//${window.location.host}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'log') {
        const line = document.createElement('div');
        line.className = 'log-line';
        if (data.message.includes('BASARILI') || data.message.includes('TEBRIKLER')) line.classList.add('green');
        else if (data.message.includes('HATA')) line.classList.add('red');
        else if (data.message.includes('>>>') || data.message.includes('===')) line.classList.add('cyan');
        else if (data.message.includes('Uyari')) line.classList.add('yellow');

        line.innerText = data.message;
        terminal.appendChild(line);
        terminal.scrollTop = terminal.scrollHeight;
      } else if (data.type === 'progress') {
        const percent = Math.round((data.step / data.total) * 100);
        document.getElementById('progress-percent').innerText = `${percent}%`;
        document.getElementById('progress-fill').style.width = `${percent}%`;
      } else if (data.type === 'complete') {
        document.getElementById('term-status-badge').innerText = data.success ? 'Tamamlandı' : 'Hata';
        document.getElementById('term-status-badge').style.color = data.success ? 'var(--success)' : 'var(--danger)';
        if (data.success) {
          document.getElementById('final-btn-row').style.display = 'flex';
          const btnDl = document.getElementById('btn-download-kubeconfig');
          if (btnDl) btnDl.style.display = 'inline-flex';
          const btnRef = document.getElementById('btn-refresh-live');
          if (btnRef) btnRef.style.display = 'inline-flex';
          setTimeout(() => { fetchClusterLiveStatus(); }, 3000);
        }
      }
    } catch {}
  };

  // Deploy Request Gönder
  const templateId = document.getElementById('selected-template') ? document.getElementById('selected-template').value : null;
  const targetStorage = document.getElementById('selected-storage') ? document.getElementById('selected-storage').value : null;
  const diskSizeGB = document.getElementById('cfg-disk') ? parseInt(document.getElementById('cfg-disk').value, 10) : 60;
  const gateway = document.getElementById('cfg-gateway').value;
  const cores = parseInt(document.getElementById('cfg-cores').value, 10);
  const memoryMB = parseInt(document.getElementById('cfg-ram').value, 10);
  const sshUser = document.getElementById('cfg-ssh-user').value;
  const sshPass = document.getElementById('cfg-ssh-pass').value;
  const sshPublicKey = '';
  const vipIp = document.getElementById('cfg-vip').value.trim();
  const clusterToken = document.getElementById('cfg-token').value.trim();
  const cni = document.getElementById('cfg-cni').value;
  const maxPods = parseInt(document.getElementById('cfg-max-pods').value, 10);

  // Day-2 Operasyonları için kimlik bilgilerini sakla
  const masterNode = (clusterDistribution && clusterDistribution.find(d => d.type === 'Master')) || (clusterDistribution && clusterDistribution[0]);
  activeClusterMasterIp = masterNode ? masterNode.ip : '';
  activeClusterVip = vipIp;
  activeSshUser = sshUser;
  activeSshPass = sshPass;

  try {
    const res = await fetch('/api/cluster/deploy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: operationMode,
        provider: selectedProvider,
        auth: providerAuth,
        templateId,
        targetStorage,
        diskSizeGB,
        distribution: clusterDistribution,
        gateway,
        cores,
        memoryMB,
        sshUser,
        sshPass,
        sshPublicKey,
        vipIp,
        clusterToken,
        cni,
        maxPods
      })
    });

    const result = await res.json();
    if (!result.success) {
      alert(`Kurulum başlatılamadı: ${result.error}`);
    }
  } catch (err) {
    alert(`Deploy isteği başarısız: ${err.message}`);
  }
}

// --- TEMPLATE CREATION MODAL CONTROLLER ---
function openTemplateModal() {
  const modal = document.getElementById('template-modal');
  if (!modal) return;

  const tabsBar = document.getElementById('modal-tabs-bar');
  const tabAuto = document.getElementById('tab-auto-content');
  const tabManual = document.getElementById('tab-manual-content');
  const tabVcenter = document.getElementById('tab-vcenter-content');

  if (selectedProvider === 'vcenter') {
    if (tabsBar) tabsBar.style.display = 'none';
    if (tabAuto) tabAuto.style.display = 'none';
    if (tabManual) tabManual.style.display = 'none';
    if (tabVcenter) tabVcenter.style.display = 'block';
  } else {
    if (tabsBar) tabsBar.style.display = 'flex';
    if (tabAuto) tabAuto.style.display = 'block';
    if (tabManual) tabManual.style.display = 'none';
    if (tabVcenter) tabVcenter.style.display = 'none';

    // Storages listesini doldur
    const storageSelect = document.getElementById('tpl-storage');
    const existingStorageSelect = document.getElementById('selected-storage');
    if (storageSelect) {
      storageSelect.innerHTML = '';
      if (existingStorageSelect && existingStorageSelect.options.length > 0) {
        for (let i = 0; i < existingStorageSelect.options.length; i++) {
          const opt = existingStorageSelect.options[i];
          if (opt.value) {
            const newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.innerText = opt.innerText;
            storageSelect.appendChild(newOpt);
          }
        }
      }
      if (storageSelect.options.length === 0) {
        storageSelect.innerHTML = '<option value="local-lvm">local-lvm</option><option value="local-zfs">local-zfs</option>';
      }
    }

    updateSnippet();
  }

  modal.classList.add('active');
}

function copyVcenterOvaUrl() {
  const el = document.getElementById('vcenter-ova-url');
  if (el) {
    navigator.clipboard.writeText(el.innerText.trim()).then(() => {
      alert('OVA URL adresi kopyalandı! vCenter > Deploy OVF Template ekranına yapıştırabilirsiniz.');
    });
  }
}

function closeTemplateModal() {
  const modal = document.getElementById('template-modal');
  if (modal) modal.classList.remove('active');
}

function switchTemplateTab(tab) {
  const tabAuto = document.getElementById('tab-auto-content');
  const tabManual = document.getElementById('tab-manual-content');
  const btnAuto = document.getElementById('tab-btn-auto');
  const btnManual = document.getElementById('tab-btn-manual');

  if (tab === 'auto') {
    tabAuto.style.display = 'block';
    tabManual.style.display = 'none';
    btnAuto.classList.add('active');
    btnManual.classList.remove('active');
  } else {
    tabAuto.style.display = 'none';
    tabManual.style.display = 'block';
    btnAuto.classList.remove('active');
    btnManual.classList.add('active');
    updateSnippet();
  }
}

function updateSnippet() {
  const osVer = document.getElementById('tpl-os-version') ? document.getElementById('tpl-os-version').value : '22.04';
  const vmid = document.getElementById('tpl-vmid') ? document.getElementById('tpl-vmid').value : '9000';
  const storage = document.getElementById('tpl-storage') ? document.getElementById('tpl-storage').value : 'local-lvm';

  const imgUrl = osVer === '24.04'
    ? 'https://cloud-images.ubuntu.com/minimal/releases/noble/release/ubuntu-24.04-minimal-cloudimg-amd64.img'
    : 'https://cloud-images.ubuntu.com/minimal/releases/jammy/release/ubuntu-22.04-minimal-cloudimg-amd64.img';
  const imgName = osVer === '24.04' ? 'noble-minimal-cloudimg-amd64.img' : 'jammy-minimal-cloudimg-amd64.img';

  const snippet = `# --- Proxmox Shell'e Yapıştırın (Hızlı Ubuntu ${osVer} Minimal Cloud-Init, ~300 MB) ---
cd /tmp && curl -sSL -C - "${imgUrl}" -o "${imgName}"
qm destroy ${vmid} 2>/dev/null || true
qm create ${vmid} --name "ubuntu-${osVer.replace('.', '')}-cloudinit" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk ${vmid} "/tmp/${imgName}" ${storage}
DISK_VOL=$(qm config ${vmid} | awk '/^unused[0-9]:/ {print $2}' | head -n 1)
qm set ${vmid} --scsihw virtio-scsi-pci --scsi0 "$DISK_VOL"
qm set ${vmid} --ide2 ${storage}:cloudinit
qm set ${vmid} --boot c --bootdisk scsi0
qm set ${vmid} --serial0 socket --vga serial0
qm template ${vmid}
echo "=== TEBRIKLER: Template ${vmid} Başarıyla Oluşturuldu! ==="`;

  const box = document.getElementById('code-snippet-proxmox');
  if (box) box.innerText = snippet;
}

function copyTemplateSnippet() {
  const box = document.getElementById('code-snippet-proxmox');
  const status = document.getElementById('copy-status-text');
  if (box) {
    navigator.clipboard.writeText(box.innerText).then(() => {
      if (status) {
        status.innerText = '✔ Komut panoya kopyalandı! Proxmox >_ Shell ekranına yapıştırabilirsiniz.';
        setTimeout(() => { status.innerText = ''; }, 4000);
      }
    });
  }
}

function appendTemplateLog(msg) {
  const logContent = document.getElementById('tpl-log-content');
  if (!logContent) return;

  const clean = (msg || '').replace(/\r+/g, '\n').replace(/\.{5,}/g, '...');
  const lines = clean.split('\n');

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;
    if (line.startsWith('...') || line.match(/^[0-9]+K\s+\./)) return;

    const el = document.createElement('div');
    el.style.marginBottom = '3px';
    if (line.includes('===') || line.includes('>>>')) {
      el.style.color = '#38BDF8';
      el.style.fontWeight = '600';
    } else if (line.includes('TAMAMLANDI') || line.includes('BAŞARILI') || line.includes('tamamlandı')) {
      el.style.color = '#34D399';
      el.style.fontWeight = '700';
    } else if (line.includes('HATA') || line.includes('error')) {
      el.style.color = '#F87171';
    } else {
      el.style.color = '#CBD5E1';
    }
    el.innerText = line;
    logContent.appendChild(el);
  });

  logContent.scrollTop = logContent.scrollHeight;
}

async function executeCreateTemplate() {
  const host = document.getElementById('api-host').value.trim();
  const username = document.getElementById('api-user').value.trim() || 'root';
  const password = document.getElementById('api-pass').value.trim();
  const osVer = document.getElementById('tpl-os-version').value;
  const vmid = parseInt(document.getElementById('tpl-vmid').value, 10);
  const storage = document.getElementById('tpl-storage').value;
  const btn = document.getElementById('btn-create-tpl');
  const logBox = document.getElementById('tpl-log-box');
  const logContent = document.getElementById('tpl-log-content');

  if (!host || !password) {
    alert('Lütfen önce Proxmox sunucu IP adresini ve şifresini giriniz!');
    return;
  }

  btn.disabled = true;
  btn.innerText = '⏳ İndiriliyor & Kuruluyor...';
  logBox.style.display = 'block';
  logContent.innerHTML = '';
  appendTemplateLog(`[BAŞLATILDI] Proxmox (${host}) sunucusuna bağlanılıyor...`);

  // WebSocket Baglantisi Kontrol Et
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (!ws || ws.readyState !== 1) {
    ws = new WebSocket(`${protocol}//${window.location.host}`);
  }
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'template-log') {
        appendTemplateLog(data.message);
      }
    } catch {}
  };

  try {
    const res = await fetch('/api/templates/create-proxmox-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        username,
        password,
        templateId: vmid,
        storage,
        osVersion: osVer
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    appendTemplateLog(`\n[BAŞARILI] ${data.message}`);
    btn.innerText = '✅ Şablon Hazır!';

    // Ana ekrandaki template dropdown'ina ekle ve sec
    const select = document.getElementById('selected-template');
    if (select) {
      const opt = document.createElement('option');
      opt.value = data.templateId;
      opt.innerText = `${data.templateName} (ID: ${data.templateId}) - 2 CPU, 2048 MB RAM`;
      opt.selected = true;
      select.appendChild(opt);
    }

    setTimeout(() => {
      closeTemplateModal();
      btn.disabled = false;
      btn.innerText = '🚀 İndir & Şablonu Oluştur';
    }, 2500);
  } catch (err) {
    appendTemplateLog(`\n[HATA] ${err.message}\n💡 Alternatif: Proxmox Web GUI'den '>_ Shell' açarak ikinci sekmedeki komutu doğrudan yapıştırabilirsiniz.`);
    btn.disabled = false;
    btn.innerText = '⚡ Tekrar Dene';
  }
}
