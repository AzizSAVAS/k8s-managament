const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const simulationService = require('../../services/simulationService');

describe('SimulationService Unit Tests', () => {
  it('should return simulated nodes with CPU, memory, and roles', () => {
    const nodes = simulationService.getSimulatedNodes();
    assert.ok(Array.isArray(nodes));
    assert.equal(nodes.length, 6);
    assert.ok(nodes[0].name.startsWith('rke2-'));
    assert.equal(nodes[0].status, 'Ready');
    assert.ok(nodes[0].cpu.endsWith('%'));
    assert.ok(nodes[0].mem.endsWith('%'));
  });

  it('should return realistic running pods across namespaces', () => {
    const pods = simulationService.getSimulatedPods();
    assert.ok(Array.isArray(pods));
    assert.ok(pods.length >= 8);
    const namespaces = new Set(pods.map(p => p.namespace));
    assert.ok(namespaces.has('kube-system'));
    assert.ok(namespaces.has('production'));
  });

  it('should generate simulated Hubble L7 flows and verdicts', () => {
    const flows = simulationService.getSimulatedHubbleFlows();
    assert.ok(Array.isArray(flows));
    assert.equal(flows.length, 15);
    assert.ok(['FORWARDED', 'DROPPED'].includes(flows[0].verdict));
    assert.ok(flows[0].latency.endsWith('ms'));
  });

  it('should provide security scan vulnerability report from Trivy', () => {
    const trivy = simulationService.getSimulatedTrivy();
    assert.equal(trivy.success, true);
    assert.ok(Array.isArray(trivy.vulnerabilities));
    assert.ok(trivy.vulnerabilities.length > 0);
    assert.ok(trivy.vulnerabilities[0].cve.startsWith('CVE-'));
  });

  it('should provide AI Doctor diagnosis with remediations and scores', () => {
    const doc = simulationService.getSimulatedDoctorDiagnosis();
    assert.ok(typeof doc.score === 'number');
    assert.ok(Array.isArray(doc.issues));
    assert.ok(doc.issues.length > 0);
    assert.ok(doc.issues[0].canSelfHeal);
  });

  it('should provide real-time cluster event logs', () => {
    const events = simulationService.getSimulatedEvents();
    assert.ok(Array.isArray(events));
    assert.ok(events.length > 0);
    assert.ok(events[0].reason);
  });
});
