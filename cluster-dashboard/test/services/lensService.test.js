const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const lensService = require('../../services/lensService');

describe('LensService Unit Tests', () => {
  it('should list pods across all namespaces by default', () => {
    const result = lensService.getResources('pods', 'all');
    assert.equal(result.success, true);
    assert.ok(Array.isArray(result.items));
    assert.ok(result.totalCount > 0);
  });

  it('should filter resources by specific namespace', () => {
    const result = lensService.getResources('pods', 'production');
    assert.equal(result.success, true);
    assert.ok(result.items.length > 0);
    result.items.forEach(item => {
      assert.equal(item.namespace, 'production');
    });
  });

  it('should list other Kubernetes resource kinds (deployments, services, configmaps)', () => {
    const deploys = lensService.getResources('deployments');
    assert.equal(deploys.success, true);
    assert.ok(deploys.items.length > 0);

    const svcs = lensService.getResources('services');
    assert.equal(svcs.success, true);
    assert.ok(svcs.items.length > 0);

    const cms = lensService.getResources('configmaps');
    assert.equal(cms.success, true);
    assert.ok(cms.items.length > 0);
  });

  it('should return detailed resource manifest, metrics, containers, and YAML', () => {
    const details = lensService.getResourceDetails('pod', 'production', 'fintech-api-v2-7b9c6d48-8x2k1');
    assert.equal(details.success, true);
    assert.equal(details.name, 'fintech-api-v2-7b9c6d48-8x2k1');
    assert.ok(details.overview);
    assert.ok(details.metrics);
    assert.ok(Array.isArray(details.containers));
    assert.ok(Array.isArray(details.events));
    assert.ok(typeof details.yaml === 'string');
    assert.ok(details.yaml.includes('kind: Pod'));
  });

  it('should return simulated live pod log lines', () => {
    const logs = lensService.getPodLogs('production', 'fintech-api-v2', 'main-app', 50);
    assert.equal(logs.success, true);
    assert.ok(Array.isArray(logs.lines));
    assert.ok(logs.lines.length > 0);
  });

  it('should validate and apply in-place YAML manifests', () => {
    const emptyRes = lensService.applyResourceYaml('');
    assert.equal(emptyRes.success, false);

    const validRes = lensService.applyResourceYaml('apiVersion: v1\nkind: Pod');
    assert.equal(validRes.success, true);
  });

  it('should scale deployment replicas', () => {
    const res = lensService.scaleResource('Deployment', 'production', 'fintech-api-v2', 6);
    assert.equal(res.success, true);
    assert.equal(res.replicas, 6);
  });

  it('should trigger zero-downtime rollout restart', () => {
    const res = lensService.restartResource('Deployment', 'production', 'fintech-api-v2');
    assert.equal(res.success, true);
    assert.ok(res.restartedAt);
  });

  it('should safely delete resource', () => {
    const res = lensService.deleteResource('Pod', 'production', 'fintech-api-v2-7b9c6d48-8x2k1');
    assert.equal(res.success, true);
  });

  it('should manage port-forward tunnels (start, list, stop)', () => {
    const listInitial = lensService.getActivePortForwards();
    assert.equal(listInitial.success, true);
    assert.ok(listInitial.count >= 2);

    // Start new tunnel
    const startRes = lensService.startPortForward('default', 'Pod/custom-app', 80, 18080);
    assert.equal(startRes.success, true);
    assert.equal(startRes.portForward.localPort, 18080);

    // Starting duplicate port should fail
    const dupRes = lensService.startPortForward('default', 'Pod/other-app', 80, 18080);
    assert.equal(dupRes.success, false);

    // Stop tunnel
    const stopRes = lensService.stopPortForward(startRes.portForward.id);
    assert.equal(stopRes.success, true);
    assert.equal(stopRes.stopped, true);
  });
});
