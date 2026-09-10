// ==============================================================================
// RKE2 CLUSTER HUB: DEMO SIMULATOR COORDINATOR (FRONTEND)
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

(function() {
  let isDemoMode = false;

  function initDemoMode() {
    // Check saved state in localStorage
    const saved = localStorage.getItem('rke2_demo_mode');
    if (saved === 'true') {
      setDemoMode(true, false);
    }
  }

  function setDemoMode(enable, showNotification = true) {
    isDemoMode = !!enable;
    localStorage.setItem('rke2_demo_mode', isDemoMode ? 'true' : 'false');

    const toggleBtn = document.getElementById('btn-toggle-demo-mode');
    if (toggleBtn) {
      if (isDemoMode) {
        toggleBtn.classList.add('active');
        toggleBtn.innerHTML = '🟣 <span class="demo-btn-label">Demo Simülasyonu</span>';
        toggleBtn.title = 'Demo Modu Aktif: Tıklayarak Canlı Küme Moduna Geçin';
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.innerHTML = '🟢 <span class="demo-btn-label">Canlı Küme</span>';
        toggleBtn.title = 'Canlı Küme Modu Aktif: Tıklayarak Simülasyon Moduna Geçin';
      }
    }

    if (showNotification && typeof showToast === 'function') {
      if (isDemoMode) {
        showToast('info', '🟣 Demo Modu Devrede', 'Tüm 40 Day-2 modülü ve eBPF telemetrisi canlı simülatör verileriyle besleniyor.');
      } else {
        showToast('success', '🟢 Canlı Mod Devrede', 'Gerçek RKE2 küme sunucusu ve Hypervisor API bağlantıları dinleniyor.');
      }
    }

    // Refresh currently visible tab data if in operations view
    if (typeof fetchClusterLiveStatus === 'function') {
      fetchClusterLiveStatus();
    }
  }

  function toggleDemoMode() {
    setDemoMode(!isDemoMode, true);
  }

  function isDemoActive() {
    return isDemoMode;
  }

  // Interceptors for operations fetch functions
  const origFetch = window.fetch;
  window.fetch = async function(url, options) {
    if (isDemoMode && typeof url === 'string') {
      if (url.includes('/api/cluster/live-status')) {
        return origFetch('/api/demo/status', options);
      }
      if (url.includes('/api/cluster/hubble-flows')) {
        return origFetch('/api/demo/hubble-flows', options);
      }
      if (url.includes('/api/cluster/trivy-scan')) {
        return origFetch('/api/demo/trivy-scan', options);
      }
      if (url.includes('/api/cluster/doctor-diagnosis')) {
        return origFetch('/api/demo/doctor-diagnosis', options);
      }
      if (url.includes('/api/cluster/doctor-heal')) {
        return origFetch('/api/demo/doctor-heal', options);
      }
      if (url.includes('/api/cluster/events')) {
        return origFetch('/api/demo/events', options);
      }
    }
    return origFetch(url, options);
  };

  // Attach to window
  window.toggleDemoMode = toggleDemoMode;
  window.setDemoMode = setDemoMode;
  window.isDemoActive = isDemoActive;

  document.addEventListener('DOMContentLoaded', initDemoMode);
  console.log('[DemoMode] Simulation Coordinator initialized.');
})();
