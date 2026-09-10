// ==============================================================================
// RKE2 CLUSTER HUB: DEMO & SIMULATOR API ROUTES
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

const express = require('express');
const router = express.Router();
const sim = require('../services/simulationService');

router.get('/status', (req, res) => {
  res.json({
    success: true,
    mode: 'simulation',
    clusterName: 'shamssoftware-rke2-production',
    ciliumVersion: 'v1.15.6 (eBPF Native)',
    rke2Version: 'v1.30.2+rke2r1',
    nodes: sim.getSimulatedNodes(),
    pods: sim.getSimulatedPods(),
    totalNodes: 6,
    readyNodes: 6,
    totalPods: 10,
    runningPods: 10
  });
});

router.get('/hubble-flows', (req, res) => {
  res.json({
    success: true,
    mode: 'simulation',
    flows: sim.getSimulatedHubbleFlows()
  });
});

router.get('/trivy-scan', (req, res) => {
  res.json(sim.getSimulatedTrivy());
});

router.get('/doctor-diagnosis', (req, res) => {
  res.json({
    success: true,
    mode: 'simulation',
    diagnosis: sim.getSimulatedDoctorDiagnosis()
  });
});

router.post('/doctor-heal', (req, res) => {
  const { actionKey } = req.body;
  res.json({
    success: true,
    mode: 'simulation',
    message: `[AI Doctor Healed] '${actionKey || 'auto-tuning'}' kuralı başarıyla işletildi. eBPF harita parametreleri dengelendi.`
  });
});

router.get('/events', (req, res) => {
  res.json({
    success: true,
    mode: 'simulation',
    events: sim.getSimulatedEvents()
  });
});

module.exports = router;
