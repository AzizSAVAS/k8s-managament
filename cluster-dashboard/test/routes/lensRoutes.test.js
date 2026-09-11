const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const { app } = require('../../server');

describe('LensRoutes Integration Tests', () => {
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

  it('GET /api/lens/resources should return list of resources', async () => {
    const res = await fetch(`${baseUrl}/api/lens/resources?kind=pods`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.items));
  });

  it('GET /api/lens/resource-details should return 400 when name is omitted', async () => {
    const res = await fetch(`${baseUrl}/api/lens/resource-details?kind=pod`);
    assert.equal(res.status, 400);
  });

  it('GET /api/lens/resource-details should return details and YAML when name is provided', async () => {
    const res = await fetch(`${baseUrl}/api/lens/resource-details?kind=pod&namespace=production&name=fintech-api-v2-7b9c6d48-8x2k1`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(json.overview);
    assert.ok(json.yaml);
  });

  it('GET /api/lens/pod-logs should return pod logs', async () => {
    const res = await fetch(`${baseUrl}/api/lens/pod-logs?namespace=production&podName=fintech-api-v2`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.ok(Array.isArray(json.lines));
  });

  it('POST /api/lens/resource-yaml should apply YAML manifest', async () => {
    const res = await fetch(`${baseUrl}/api/lens/resource-yaml`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ yaml: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: test' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('POST /api/lens/scale should scale resource replicas', async () => {
    const res = await fetch(`${baseUrl}/api/lens/scale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'Deployment', namespace: 'production', name: 'payment-gateway', replicas: 4 })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.replicas, 4);
  });

  it('POST /api/lens/rollout-restart should trigger restart', async () => {
    const res = await fetch(`${baseUrl}/api/lens/rollout-restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'Deployment', namespace: 'production', name: 'payment-gateway' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('POST /api/lens/delete should safely delete resource', async () => {
    const res = await fetch(`${baseUrl}/api/lens/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'Pod', namespace: 'default', name: 'legacy-data-sync-failed-92k1s' })
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
  });

  it('Port Forwarding lifecycle: GET, POST, DELETE', async () => {
    // 1. GET active port-forwards
    const getRes = await fetch(`${baseUrl}/api/lens/port-forwards`);
    assert.equal(getRes.status, 200);
    const getJson = await getRes.json();
    assert.equal(getJson.success, true);
    assert.ok(Array.isArray(getJson.portForwards));

    // 2. POST start port-forward
    const postRes = await fetch(`${baseUrl}/api/lens/port-forward`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ namespace: 'monitoring', resource: 'Service/grafana', targetPort: 3000, localPort: 13000 })
    });
    assert.equal(postRes.status, 200);
    const postJson = await postRes.json();
    assert.equal(postJson.success, true);
    const tunnelId = postJson.portForward.id;

    // 3. DELETE stop port-forward
    const delRes = await fetch(`${baseUrl}/api/lens/port-forward/${tunnelId}`, {
      method: 'DELETE'
    });
    assert.equal(delRes.status, 200);
    const delJson = await delRes.json();
    assert.equal(delJson.success, true);
    assert.equal(delJson.stopped, true);
  });
});
