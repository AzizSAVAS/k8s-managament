const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const advancedStudioService = require('../../services/advancedStudioService');

describe('AdvancedStudioService Unit Tests', () => {
  it('should return valid GPU & AI telemetry', () => {
    const data = advancedStudioService.getGpuTelemetry();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.gpus));
    assert.ok(data.gpus.length > 0);
    assert.equal(data.gpus[0].id, 0);
    assert.ok(data.gpus[0].vramTotalGB > 0);
  });

  it('should return 3D Holographic cluster topology data', () => {
    const data = advancedStudioService.getHoloClusterData();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.racks));
    assert.ok(data.racks.length >= 2);
    assert.ok(Array.isArray(data.packetBeams));
  });

  it('should return Bare Metal IPMI & thermal node data', () => {
    const data = advancedStudioService.getBareMetalNodes();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.servers));
    assert.ok(data.servers[0].chassis.length > 0);
    assert.ok(data.servers[0].powerDrawWatts > 0);
  });

  it('should return Flamegraph CPU profiling data', () => {
    const data = advancedStudioService.getFlamegraphData();
    assert.equal(data.success, true);
    assert.ok(data.root);
    assert.equal(data.root.name, 'all_cpu_cycles');
    assert.ok(Array.isArray(data.root.children));
  });

  it('should return Edge Mesh autonomous branch sites', () => {
    const data = advancedStudioService.getEdgeSites();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.sites));
    assert.ok(data.sites.length > 0);
  });

  it('should manage live migration state transitions', () => {
    const initial = advancedStudioService.getMigrationStatus();
    assert.equal(initial.success, true);
    assert.ok(Array.isArray(initial.phases));

    const triggered = advancedStudioService.startMigrationSim('Node-01', 'Node-02');
    assert.equal(triggered.success, true);
    const activeStatus = advancedStudioService.getMigrationStatus();
    assert.equal(activeStatus.active, true);
  });

  it('should scan for secret leaks and mask sensitive values', () => {
    const data = advancedStudioService.scanSecretLeaks();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.leaks));
    assert.ok(data.leaks.length > 0);
    assert.ok(data.leaks[0].maskedValue.includes('***') || data.leaks[0].maskedValue.includes('...'));
  });

  it('should return eBPF WAF telemetry and block/unblock countries', () => {
    const data = advancedStudioService.getWafTelemetry();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.countries));
    assert.ok(Array.isArray(data.attackTypes));

    const blockRes = advancedStudioService.blockWafCountry('CN', true);
    assert.equal(blockRes.success, true);
    assert.match(blockRes.message, /CN/);

    const unblockRes = advancedStudioService.blockWafCountry('CN', false);
    assert.equal(unblockRes.success, true);
  });

  it('should scan zombie resources and purge them cleanly', () => {
    const scan = advancedStudioService.scanJanitor();
    assert.equal(scan.success, true);
    assert.ok(Array.isArray(scan.orphanItems));
    assert.ok(scan.orphanItems.length > 0);
    assert.ok(scan.reclaimableDiskGB > 0);

    const purge = advancedStudioService.purgeJanitor(['orphan_pvc', 'dead_job']);
    assert.equal(purge.success, true);
    assert.ok(purge.freedDiskGB > 0);
    assert.ok(purge.purgedCount > 0);
  });

  it('should provide YAML time machine revisions and rollback', () => {
    const history = advancedStudioService.getTimeMachineHistory();
    assert.equal(history.success, true);
    assert.ok(Array.isArray(history.revisions));
    assert.ok(history.revisions.length >= 2);
    assert.ok(history.revisions[0].diffAdded);

    const rollback = advancedStudioService.rollbackTimeMachine('rev-402');
    assert.equal(rollback.success, true);
    assert.equal(rollback.targetRevision, 'rev-402');
  });

  it('should return real-time oscilloscope performance metrics', () => {
    const data = advancedStudioService.getOscilloscopeData();
    assert.equal(data.success, true);
    assert.ok(typeof data.cpuPercent === 'number');
    assert.ok(typeof data.memoryPercent === 'number');
    assert.ok(typeof data.diskIops === 'number');
    assert.ok(typeof data.networkMbps === 'number');
  });
});
