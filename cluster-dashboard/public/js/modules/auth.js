// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Authentication & RBAC Session Module
// ==============================================================================

const AUTH_STORAGE_KEY = 'shams_k8s_auth_session';

function initAuth() {
  const session = getStoredSession();
  if (session && session.token && session.user) {
    applyAuthenticatedState(session.user);
  } else {
    showLoginScreen();
  }
}

function getStoredSession() {
  try {
    const rawLocal = localStorage.getItem(AUTH_STORAGE_KEY);
    if (rawLocal) return JSON.parse(rawLocal);
    const rawSession = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (rawSession) return JSON.parse(rawSession);
  } catch (e) {
    console.error('Session parse error:', e);
  }
  return null;
}

function showLoginScreen() {
  const loginScreen = document.getElementById('app-login-screen');
  const appLayout = document.querySelector('.app-layout');
  const fabCopilot = document.getElementById('fab-ai-copilot');

  if (loginScreen) loginScreen.style.display = 'flex';
  if (appLayout) appLayout.style.display = 'none';
  if (fabCopilot) fabCopilot.style.display = 'none';
}

function applyAuthenticatedState(user) {
  const loginScreen = document.getElementById('app-login-screen');
  const appLayout = document.querySelector('.app-layout');
  const fabCopilot = document.getElementById('fab-ai-copilot');

  if (loginScreen) {
    loginScreen.style.opacity = '0';
    loginScreen.style.transition = 'opacity 0.25s ease-out';
    setTimeout(() => {
      loginScreen.style.display = 'none';
      loginScreen.style.opacity = '1';
    }, 250);
  }

  if (appLayout) {
    appLayout.style.display = 'flex';
    appLayout.style.animation = 'fadeIn 0.3s ease-out';
  }

  if (fabCopilot) {
    fabCopilot.style.display = 'flex';
  }

  updateTopbarUserProfile(user);
}

function updateTopbarUserProfile(user) {
  if (!user) return;
  const usernameEl = document.getElementById('topbar-username');
  const userRoleEl = document.getElementById('topbar-user-role');
  const userAvatarEl = document.getElementById('topbar-user-avatar');

  if (usernameEl) usernameEl.innerText = user.username || 'admin';
  if (userRoleEl) userRoleEl.innerText = user.role || 'cluster-admin';
  if (userAvatarEl) {
    const initials = (user.name || user.username || 'AS')
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    userAvatarEl.innerText = initials || 'AS';
  }
}

async function handleLoginSubmit(event) {
  if (event) event.preventDefault();

  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const roleSelect = document.getElementById('login-role');
  const rememberCheckbox = document.getElementById('login-remember');
  const errorAlert = document.getElementById('login-error-alert');
  const errorText = document.getElementById('login-error-text');
  const submitBtn = document.getElementById('btn-login-submit');
  const submitText = document.getElementById('btn-login-text');
  const submitSpinner = document.getElementById('btn-login-spinner');

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const role = roleSelect ? roleSelect.value : 'cluster-admin';
  const remember = rememberCheckbox ? rememberCheckbox.checked : true;

  if (errorAlert) errorAlert.style.display = 'none';

  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.innerText = 'Giriş Yapılıyor...';
  if (submitSpinner) submitSpinner.style.display = 'inline-block';

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role })
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Giriş başarısız oldu!');
    }

    const sessionData = {
      token: data.token,
      user: data.user,
      loginTime: new Date().toISOString()
    };

    if (remember) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    }

    applyAuthenticatedState(data.user);

  } catch (err) {
    if (errorAlert && errorText) {
      errorText.innerText = err.message || 'Kullanıcı adı veya şifre geçersiz!';
      errorAlert.style.display = 'flex';
    }
  } finally {
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.innerText = 'Platforma Giriş Yap ➔';
    if (submitSpinner) submitSpinner.style.display = 'none';
  }
}

function fillDemoCredentials(username, password, role) {
  const uInput = document.getElementById('login-username');
  const pInput = document.getElementById('login-password');
  const rSelect = document.getElementById('login-role');
  const errorAlert = document.getElementById('login-error-alert');

  if (errorAlert) errorAlert.style.display = 'none';
  if (uInput) uInput.value = username;
  if (pInput) pInput.value = password;
  if (rSelect && role) rSelect.value = role;

  const form = document.getElementById('login-form');
  if (form) {
    handleLoginSubmit(new Event('submit'));
  }
}

function togglePasswordVisibility() {
  const pInput = document.getElementById('login-password');
  if (!pInput) return;
  pInput.type = (pInput.type === 'password') ? 'text' : 'password';
}

function handleLogout() {
  if (confirm('Oturumu kapatmak istediğinizden emin misiniz?')) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    showLoginScreen();
  }
}

// Global Exports
window.initAuth = initAuth;
window.handleLoginSubmit = handleLoginSubmit;
window.fillDemoCredentials = fillDemoCredentials;
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLogout = handleLogout;

// Run auth check on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});
