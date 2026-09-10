process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');

// Modular Route Controllers
const authRoutes = require('./routes/authRoutes');
const enterpriseRoutes = require('./routes/enterpriseRoutes');
const cloudStudioRoutes = require('./routes/cloudStudioRoutes');
const hyperCloudRoutes = require('./routes/hyperCloudRoutes');
const providerRoutes = require('./routes/providerRoutes');
const deployRoutes = require('./routes/deployRoutes');
const operationsRoutes = require('./routes/operationsRoutes');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Express Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// WebSocket Broadcast Helper
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// Mount Modular Routers
app.use(authRoutes);
app.use(enterpriseRoutes);
app.use(cloudStudioRoutes);
app.use(hyperCloudRoutes);
app.use(providerRoutes(broadcast));
app.use(deployRoutes(broadcast));
app.use(operationsRoutes);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` RKE2 Cluster Dashboard Calisiyor!`);
  console.log(` Web Arayuz: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
