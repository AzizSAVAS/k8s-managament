const express = require('express');
const router = express.Router();

const AUTH_USERS = [
  { username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin', role: 'cluster-admin', name: 'Aziz SAVAŞ' },
  { username: 'devops', password: process.env.DEVOPS_PASSWORD || 'devops', role: 'devops-engineer', name: 'DevOps Mühendisi' },
  { username: 'auditor', password: process.env.AUDITOR_PASSWORD || 'auditor', role: 'security-auditor', name: 'Güvenlik Denetçisi' }
];

router.post('/api/auth/login', (req, res) => {
  const { username, password, role } = req.body || {};
  const user = AUTH_USERS.find(u => u.username.toLowerCase() === (username || '').toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, error: 'Kullanıcı adı veya şifre hatalı!' });
  }
  const token = `shams-session-${Buffer.from(user.username + ':' + Date.now()).toString('base64')}`;
  res.json({
    success: true,
    token,
    user: {
      username: user.username,
      name: user.name,
      role: role || user.role
    }
  });
});

router.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer shams-session-')) {
    return res.status(401).json({ success: false, error: 'Yetkisiz erişim' });
  }
  res.json({ success: true, authenticated: true });
});

module.exports = router;
