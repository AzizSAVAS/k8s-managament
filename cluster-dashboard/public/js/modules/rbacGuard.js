// ==============================================================================
// RKE2 CLUSTER HUB: ROLE-BASED ACCESS CONTROL (RBAC GUARD)
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

(function() {
  const ROLES = {
    ADMIN: 'cluster-admin',
    OPERATOR: 'devops-operator',
    VIEWER: 'security-viewer'
  };

  let currentRole = localStorage.getItem('rke2_user_role') || ROLES.ADMIN;

  function setRole(role, notify = true) {
    if (!Object.values(ROLES).includes(role)) {
      role = ROLES.ADMIN;
    }
    currentRole = role;
    localStorage.setItem('rke2_user_role', currentRole);

    updateRbacUI();

    if (notify && typeof showToast === 'function') {
      const labels = {
        'cluster-admin': '🔑 Cluster Admin (Tam Yetkili)',
        'devops-operator': '🛠️ DevOps Operator (Operasyonel)',
        'security-viewer': '👁️ Security Viewer (Salt-Okunur)'
      };
      showToast('info', 'Yetki Rolü Güncellendi', `Aktif Rol: ${labels[currentRole] || currentRole}`);
    }
  }

  function updateRbacUI() {
    const roleBadge = document.getElementById('topbar-user-role');
    if (roleBadge) {
      roleBadge.innerText = currentRole;
      roleBadge.style.cursor = 'pointer';
      roleBadge.title = 'Tıklayarak rolü değiştirin (Admin / Operator / Viewer)';
      roleBadge.onclick = cycleRole;
    }

    const isViewer = currentRole === ROLES.VIEWER;
    const isOperator = currentRole === ROLES.OPERATOR;

    // Destructive actions disabled for viewer or operator
    const destructiveButtons = [
      'btn-upgrade-cluster',
      'btn-drain-node',
      'btn-cordon-node',
      'btn-chaos-attack',
      'btn-delete-backup'
    ];

    destructiveButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        if (isViewer) {
          btn.disabled = true;
          btn.setAttribute('data-rbac-disabled', 'true');
          btn.title = 'Yetki Kısıtlaması: Bu eylemi yalnızca Cluster Admin gerçekleştirebilir.';
        } else {
          btn.disabled = false;
          btn.removeAttribute('data-rbac-disabled');
          btn.title = '';
        }
      }
    });

    // Also guard buttons with class .rbac-admin-only
    document.querySelectorAll('.rbac-admin-only').forEach(el => {
      if (isViewer || isOperator) {
        el.disabled = true;
        el.style.opacity = '0.5';
        el.style.pointerEvents = 'none';
      } else {
        el.disabled = false;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      }
    });
  }

  function cycleRole() {
    if (currentRole === ROLES.ADMIN) {
      setRole(ROLES.OPERATOR);
    } else if (currentRole === ROLES.OPERATOR) {
      setRole(ROLES.VIEWER);
    } else {
      setRole(ROLES.ADMIN);
    }
  }

  function getCurrentRole() {
    return currentRole;
  }

  // Attach to window
  window.setRole = setRole;
  window.cycleRole = cycleRole;
  window.getCurrentRole = getCurrentRole;
  window.updateRbacUI = updateRbacUI;

  document.addEventListener('DOMContentLoaded', () => {
    updateRbacUI();
  });

  console.log('[RBAC Guard] Role-Based Access Control initialized.');
})();
