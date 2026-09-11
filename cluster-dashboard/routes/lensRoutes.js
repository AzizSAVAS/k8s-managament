// ==============================================================================
// RKE2 CLUSTER HUB: LENS KUBERNETES IDE ROUTES
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

const express = require('express');
const router = express.Router();
const lensService = require('../services/lensService');

// 1. Get Kubernetes Resources by Kind & Namespace
router.get('/api/lens/resources', (req, res) => {
  try {
    const { kind = 'pods', namespace = '' } = req.query;
    const result = lensService.getResources(kind, namespace);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Resource Detailed Inspector (Lens Drawer Info & YAML)
router.get('/api/lens/resource-details', (req, res) => {
  try {
    const { kind = 'pod', namespace = 'default', name = '' } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Resource name is required.' });
    }
    const result = lensService.getResourceDetails(kind, namespace, name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Live Pod Logs
router.get('/api/lens/pod-logs', (req, res) => {
  try {
    const { namespace = 'default', podName = '', container = 'main-app', tail = 100 } = req.query;
    if (!podName) {
      return res.status(400).json({ success: false, error: 'Pod name is required.' });
    }
    const result = lensService.getPodLogs(namespace, podName, container, parseInt(tail, 10) || 100);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. In-Place YAML Apply
router.post('/api/lens/resource-yaml', (req, res) => {
  try {
    const { yaml } = req.body || {};
    const result = lensService.applyResourceYaml(yaml);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Scale Resource Replicas
router.post('/api/lens/scale', (req, res) => {
  try {
    const { kind = 'Deployment', namespace = 'default', name = '', replicas = 1 } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, error: 'Resource name is required.' });
    }
    const result = lensService.scaleResource(kind, namespace, name, replicas);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Zero-Downtime Rollout Restart
router.post('/api/lens/rollout-restart', (req, res) => {
  try {
    const { kind = 'Deployment', namespace = 'default', name = '' } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, error: 'Resource name is required.' });
    }
    const result = lensService.restartResource(kind, namespace, name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Safe Resource Delete
router.post('/api/lens/delete', (req, res) => {
  try {
    const { kind = 'Pod', namespace = 'default', name = '' } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, error: 'Resource name is required.' });
    }
    const result = lensService.deleteResource(kind, namespace, name);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Active Port-Forwards List
router.get('/api/lens/port-forwards', (req, res) => {
  try {
    const result = lensService.getActivePortForwards();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 9. Start Port-Forward Tunnel
router.post('/api/lens/port-forward', (req, res) => {
  try {
    const { namespace = 'default', resource = 'Pod/app', targetPort = 80, localPort = 8080 } = req.body || {};
    const result = lensService.startPortForward(namespace, resource, targetPort, localPort);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 10. Stop Port-Forward Tunnel
router.delete('/api/lens/port-forward/:id', (req, res) => {
  try {
    const { id } = req.params;
    const result = lensService.stopPortForward(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
