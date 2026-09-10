const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../../server');

describe('API Endpoints Integration Tests', () => {
  let testServer;
  let baseUrl;

  before(async () => {
    testServer = http.createServer(app);
    await new Promise(resolve => testServer.listen(0, '127.0.0.1', resolve));
    const port = testServer.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    if (testServer) {
      await new Promise(resolve => testServer.close(resolve));
    }
  });

  // 1. Static HTML serving
  it('GET / should serve compiled index.html with 200 OK', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes('RKE2'));
    assert.ok(text.includes('Shamssoftware'));
  });

  // 2. Auth Routes
  it('POST /api/auth/login with valid credentials should succeed and return token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.token.startsWith('shams-session-'));

    // Test GET /api/auth/me with the acquired token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${json.token}` }
    });
    assert.equal(meRes.status, 200);
    const meJson = await meRes.json();
    assert.equal(meJson.authenticated, true);
  });

  it('POST /api/auth/login with invalid credentials should return 401', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrongpassword' })
    });
    assert.equal(res.status, 401);
    const json = await res.json();
    assert.equal(json.success, false);
  });

  // 3. Advanced Studios API Endpoints
  it('GET /api/studios/gpu-telemetry should return 200 OK with GPU list', async () => {
    const res = await fetch(`${baseUrl}/api/studios/gpu-telemetry`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.gpus));
    assert.ok(json.gpus.length > 0);
  });

  it('GET /api/studios/holo-cluster should return 3D rack and beam topology', async () => {
    const res = await fetch(`${baseUrl}/api/studios/holo-cluster`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.racks));
    assert.ok(Array.isArray(json.packetBeams));
  });

  it('GET /api/studios/scan-secret-leaks should return masked leak list', async () => {
    const res = await fetch(`${baseUrl}/api/studios/scan-secret-leaks`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.leaks));
  });

  it('GET /api/studios/waf-telemetry should return eBPF live attack telemetry', async () => {
    const res = await fetch(`${baseUrl}/api/studios/waf-telemetry`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.countries));
    assert.ok(Array.isArray(json.attackTypes));
  });

  it('POST /api/studios/waf-block-country should update kernel drop rules', async () => {
    const res = await fetch(`${baseUrl}/api/studios/waf-block-country`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'US', blocked: true })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.message.includes('US'));
  });

  it('GET /api/studios/janitor-scan should find orphan and dead resources', async () => {
    const res = await fetch(`${baseUrl}/api/studios/janitor-scan`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.orphanItems));
    assert.ok(json.orphanItems.length > 0);
  });

  it('POST /api/studios/janitor-purge should reclaim disk and ram', async () => {
    const res = await fetch(`${baseUrl}/api/studios/janitor-purge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: ['orphan_pvc', 'dead_job'] })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.freedDiskGB > 0);
    assert.ok(json.purgedCount > 0);
  });

  it('GET /api/studios/time-machine-history should return revisions and diff', async () => {
    const res = await fetch(`${baseUrl}/api/studios/time-machine-history`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.revisions));
    assert.ok(json.revisions.length >= 2);
  });

  it('POST /api/studios/time-machine-rollback should rollback to target revision', async () => {
    const res = await fetch(`${baseUrl}/api/studios/time-machine-rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revision: 'rev-402' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.targetRevision, 'rev-402');
  });

  it('GET /api/studios/oscilloscope-data should return real-time wave metrics', async () => {
    const res = await fetch(`${baseUrl}/api/studios/oscilloscope-data`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(typeof json.cpuPercent === 'number');
    assert.ok(typeof json.memoryPercent === 'number');
    assert.ok(typeof json.diskIops === 'number');
  });
});
