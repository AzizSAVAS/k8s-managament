// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Multi-Cluster Manager Controller
// ==============================================================================

const MULTI_CLUSTER_STORAGE_KEY = 'shams_saved_clusters';

function getSavedClusters() {
  try {
    const raw = localStorage.getItem(MULTI_CLUSTER_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveClusters(clusters) {
  localStorage.setItem(MULTI_CLUSTER_STORAGE_KEY, JSON.stringify(clusters));
  refreshClusterDropdown();
}

function refreshClusterDropdown() {
  const select = document.getElementById('topbar-cluster-select');
  if (!select) return;

  const clusters = getSavedClusters();
  select.innerHTML = '';

  const activeIp = (typeof activeClusterMasterIp !== 'undefined') ? activeClusterMasterIp : '';

  // Primary active option
  const optDefault = document.createElement('option');
  optDefault.value = 'active';
  optDefault.innerText = activeIp ? `☸️ Aktif: ${activeIp}` : `☸️ Birincil Küme (Aktif)`;
  select.appendChild(optDefault);

  clusters.forEach((c, idx) => {
    const opt = document.createElement('option');
    opt.value = idx.toString();
    opt.innerText = `☸️ ${c.name} (${c.ip})`;
    select.appendChild(opt);
  });

  const optAdd = document.createElement('option');
  optAdd.value = '__add_new__';
  optAdd.innerText = '➕ Yeni Küme Kaydet...';
  select.appendChild(optAdd);
}

function handleClusterSelectChange(val) {
  if (val === '__add_new__') {
    openAddClusterModal();
    const select = document.getElementById('topbar-cluster-select');
    if (select) select.value = 'active';
    return;
  }

  if (val === 'active') {
    return;
  }

  const idx = parseInt(val, 10);
  const clusters = getSavedClusters();
  if (clusters[idx]) {
    const c = clusters[idx];
    activeClusterMasterIp = c.ip;
    activeClusterVip = c.vip || c.ip;
    activeSshUser = c.user || 'root';
    activeSshPass = c.pass || '';

    // Update banner & fetch live status
    if (typeof updateOpsHeaderBanner === 'function') updateOpsHeaderBanner();
    if (typeof fetchClusterLiveStatus === 'function') fetchClusterLiveStatus();

    alert(`"${c.name}" (${c.ip}) kümesine geçiş yapıldı! Telemetri güncelleniyor.`);
  }
}

function openAddClusterModal() {
  const modal = document.getElementById('modal-add-cluster');
  if (modal) modal.style.display = 'flex';
}

function closeAddClusterModal() {
  const modal = document.getElementById('modal-add-cluster');
  if (modal) modal.style.display = 'none';
}

function saveNewClusterProfile() {
  const name = document.getElementById('mc-cluster-name')?.value.trim();
  const ip = document.getElementById('mc-cluster-ip')?.value.trim();
  const vip = document.getElementById('mc-cluster-vip')?.value.trim() || ip;
  const user = document.getElementById('mc-cluster-user')?.value.trim() || 'root';
  const pass = document.getElementById('mc-cluster-pass')?.value || '';

  if (!name || !ip) {
    alert('Lütfen Küme Adı ve Master IP adresini giriniz!');
    return;
  }

  const clusters = getSavedClusters();
  clusters.push({ name, ip, vip, user, pass, createdAt: new Date().toISOString() });
  saveClusters(clusters);

  closeAddClusterModal();

  // Auto switch
  activeClusterMasterIp = ip;
  activeClusterVip = vip;
  activeSshUser = user;
  activeSshPass = pass;

  if (typeof updateOpsHeaderBanner === 'function') updateOpsHeaderBanner();
  if (typeof fetchClusterLiveStatus === 'function') fetchClusterLiveStatus();

  alert(`"${name}" kümesi başarıyla kaydedildi ve aktif edildi!`);
}

document.addEventListener('DOMContentLoaded', () => {
  refreshClusterDropdown();
});
