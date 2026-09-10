// ==============================================================================
// RKE2 CLUSTER HUB: ENTERPRISE TOAST ALERT NOTIFICATION ENGINE
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

(function() {
  function createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    danger: '❌'
  };

  /**
   * Show an animated enterprise toast notification
   * @param {'success'|'info'|'warning'|'danger'} type 
   * @param {string} title 
   * @param {string} message 
   * @param {number} duration ms (default: 4500)
   */
  function showToast(type, title, message, duration = 4500) {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type || 'info'}`;

    const icon = ICONS[type] || 'ℹ️';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <div class="toast-title">${title || 'Sistem Bildirimi'}</div>
        <div class="toast-msg">${message || ''}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
      <div class="toast-progress" style="animation-duration: ${duration}ms"></div>
    `;

    container.appendChild(toast);

    // Trigger appear animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const timer = setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);

    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(timer);
      toast.classList.remove('show');
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 250);
    });
  }

  // Global Attachments
  window.showToast = showToast;
  console.log('[ToastAlerts] Enterprise Toast Alert Engine initialized.');
})();
