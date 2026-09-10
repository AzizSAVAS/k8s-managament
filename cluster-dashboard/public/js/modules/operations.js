// ==============================================================================

// RKE2 CLUSTER HUB: DAY-2 CORE ROUTER & ORCHESTRATION CONTROLLER

// Shamssoftware & Aziz SAVAS Enterprise Architecture

// ==============================================================================



function switchDay2Tab(tabName) {
  const tabs = ['terminal', 'live-nodes', 'smoke', 'fortigate', 'addons', 'cis', 'console', 'etcd'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tab-btn-${t}`);
    const pane = document.getElementById(`day2-pane-${t}`);
    if (btn) btn.classList.remove('active');
    if (pane) pane.style.display = 'none';
  });

  const activeBtn = document.getElementById(`tab-btn-${tabName}`);
  const activePane = document.getElementById(`day2-pane-${tabName}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (activePane) activePane.style.display = 'block';

  if (tabName === 'live-nodes') {
    fetchClusterLiveStatus();
  } else if (tabName === 'fortigate') {
    fetchFortigateConfig();
  } else if (tabName === 'cis') {
    runCisBenchmark();
  } else if (tabName === 'etcd') {
    fetchEtcdSnapshots();
  }
}

// 5. CANLI KÜME DURUMU ÇEK (KUBECTL GET NODES / PODS)

function updateOpsHeaderBanner() {
  const masterIpEl = document.getElementById('ops-header-master-ip');
  const vipEl = document.getElementById('ops-header-vip');
  const { ip } = getTargetMasterCredentials();
  const vip = (document.getElementById('cfg-vip') ? document.getElementById('cfg-vip').value.trim() : '') || '10.0.10.100';

  if (masterIpEl) masterIpEl.innerText = `${ip}:6443`;
  if (vipEl) vipEl.innerText = vip;

  const expCmd = document.getElementById('kubeconfig-export-cmd');
  if (expCmd) {
    expCmd.innerText = `export KUBECONFIG=~/Downloads/rke2-cluster.yaml && kubectl --server=https://${vip}:6443 --insecure-skip-tls-verify get nodes -o wide`;
  }
}

function copyKubeconfigCmd() {
  const expCmd = document.getElementById('kubeconfig-export-cmd');
  if (expCmd) {
    navigator.clipboard.writeText(expCmd.innerText).then(() => {
      alert('Kubectl export komutu panoya kopyalandı!');
    });
  }
}



function switchOpsView(viewName) {
  if (typeof switchGlobalView === 'function' && currentGlobalWorkspace !== 'operations') {
    switchGlobalView('operations');
  }
  activeOpsPane = viewName;
  // Sidebar butonlarının aktif durumunu güncelle
  document.querySelectorAll('.ops-nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.getElementById(`ops-nav-${viewName}`);
  if (navItem) navItem.classList.add('active');

  // Pane içeriklerini göster / gizle
  document.querySelectorAll('.ops-view-pane').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const targetPane = document.getElementById(`ops-pane-${viewName}`);
  if (targetPane) {
    targetPane.classList.add('active');
    targetPane.style.display = 'block';
  }

  // Görüntüye göre otomatik tetikleyiciler
  if (viewName === 'nodes') {
    fetchClusterLiveStatus();
  } else if (viewName === 'fortigate') {
    fetchFortigateConfig();
  } else if (viewName === 'etcd') {
    fetchEtcdSnapshots();
  } else if (viewName === 'netpol') {
    if (!currentNetPolYaml) generateNetworkPolicyYaml();
  } else if (viewName === 'events') {
    fetchClusterEvents();
  } else if (viewName === 'rightsizing') {
    fetchRightsizingAnalysis();
  } else if (viewName === 'certs') {
    fetchTlsCertificates();
  } else if (viewName === 'logs') {
    fetchPodLogStream();
  } else if (viewName === 'velero') {
    fetchVeleroBackups();
  } else if (viewName === 'hubble') {
    fetchHubbleFlows();
  } else if (viewName === 'doctor') {
    fetchDoctorDiagnosis();
  } else if (viewName === 'trivy') {
    fetchTrivyScan();
  } else if (viewName === 'cronjobs') {
    fetchCronJobs();
  } else if (viewName === 'topology') {
    if (typeof fetchTopologyGraph === 'function') fetchTopologyGraph();
  } else if (viewName === 'helm') {
    if (typeof fetchHelmCatalog === 'function') fetchHelmCatalog();
  } else if (viewName === 'audit') {
    if (typeof fetchAuditTrail === 'function') fetchAuditTrail();
  } else if (viewName === 'yaml-ide') {
    if (typeof loadYamlTemplate === 'function') loadYamlTemplate('deployment');
  } else if (viewName === 'pod-files') {
    if (typeof fetchPodFiles === 'function') fetchPodFiles('/app');
  } else if (viewName === 'secrets-vault') {
    if (typeof fetchVaultSecrets === 'function') fetchVaultSecrets();
  } else if (viewName === 'finops-calculator') {
    if (typeof calculateFinOpsSavings === 'function') calculateFinOpsSavings();
  } else if (viewName === 'gitops') {
    if (typeof fetchGitOpsApps === 'function') fetchGitOpsApps();
  } else if (viewName === 'canary-traffic') {
    if (typeof fetchTrafficSplit === 'function') fetchTrafficSplit();
  } else if (viewName === 'policy-engine') {
    if (typeof fetchPolicies === 'function') fetchPolicies();
  } else if (viewName === 'pod-terminal') {
    if (typeof clearPodTerminal === 'function') clearPodTerminal();
  } else if (viewName === 'log-anomaly-ai') {
    if (typeof fetchLogAnomalies === 'function') fetchLogAnomalies();
  } else if (viewName === 'executive-report') {
    if (typeof fetchExecutiveReport === 'function') fetchExecutiveReport();
  } else if (viewName === 'ai-gpu') {
    if (typeof fetchGpuTelemetry === 'function') fetchGpuTelemetry();
  } else if (viewName === 'holo-cluster') {
    if (typeof initHoloCluster === 'function') initHoloCluster();
  } else if (viewName === 'bare-metal') {
    if (typeof fetchBareMetalNodes === 'function') fetchBareMetalNodes();
  } else if (viewName === 'flamegraph') {
    if (typeof fetchFlamegraphProfile === 'function') fetchFlamegraphProfile();
  } else if (viewName === 'edge-mesh') {
    if (typeof fetchEdgeSites === 'function') fetchEdgeSites();
  } else if (viewName === 'cluster-migrate') {
    if (typeof fetchMigrationPlan === 'function') fetchMigrationPlan();
  }
}

function filterSidebarOpsModules(query) {
  const q = (query || '').toLowerCase().trim();
  const navItems = document.querySelectorAll('#sidebar-ops-nav .ops-nav-item');
  navItems.forEach(item => {
    const text = item.innerText.toLowerCase();
    item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
  });
}

// ==============================================================================
// 14. HARİCİ NFS DEPOLAMA (DYNAMIC RWX PROVISIONER)
// ==============================================================================



// Global exports confirmation

console.log("[Operations Hub] Core Router and 40 Day-2 modules loaded successfully.");