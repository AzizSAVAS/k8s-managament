const express = require('express');
const router = express.Router();
const clusterOpsService = require('../services/clusterOpsService');
const aiCopilotService = require('../services/aiCopilotService');

// 3. Canlı Küme Düğüm ve Pod Durumları (Day-2 Monitoring)
router.post('/api/cluster/live-status', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const status = await clusterOpsService.getClusterLiveStatus({ masterIp, sshUser, sshPass });
    res.json(status);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. 1-Tıkla Kurumsal Eklenti Kurulumu
router.post('/api/cluster/addons/install', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, addonName } = req.body;
    const result = await clusterOpsService.installAddon({ masterIp, sshUser, sshPass, addonName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. etcd Snapshot / Yedekleme Operasyonları
router.post('/api/cluster/etcd/snapshot', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, action = 'save' } = req.body;
    const result = await clusterOpsService.manageEtcd({ masterIp, sshUser, sshPass, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Düğüm Bakım & Drenaj (Drain / Cordon)
router.post('/api/cluster/nodes/action', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, nodeName, action } = req.body;
    const result = await clusterOpsService.manageNode({ masterIp, sshUser, sshPass, nodeName, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Infrastructure-as-Code (YAML) Dışa Aktarma
router.post('/api/cluster/export-spec', (req, res) => {
  try {
    const yaml = clusterOpsService.exportClusterSpec(req.body);
    res.json({ success: true, yaml });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Otomatik Küme Doğrulayıcısı (Smoke Test)
router.post('/api/cluster/smoke-test', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.runSmokeTest({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. FortiGate SLB / VIP Yapılandırma Üretici
router.post('/api/cluster/fortigate-config', (req, res) => {
  try {
    const { vipIp, masterIps, workerIps, clusterName } = req.body;
    const result = clusterOpsService.generateFortigateConfig({ vipIp, masterIps, workerIps, clusterName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. CIS Benchmark Güvenlik Raporu (kube-bench)
router.post('/api/cluster/cis-benchmark', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.runCisBenchmark({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Day-2 Web Tabanlı Hızlı Komut Çalıştırıcı
router.post('/api/cluster/quick-command', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, command } = req.body;
    const result = await clusterOpsService.execQuickCommand({ masterIp, sshUser, sshPass, command });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. Harici NFS Dinamik RWX StorageClass Kurulumu
router.post('/api/cluster/storage/nfs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, nfsServer, nfsPath, storageClassName } = req.body;
    const result = await clusterOpsService.installNfsProvisioner({ masterIp, sshUser, sshPass, nfsServer, nfsPath, storageClassName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. Hızlı Uygulama Dağıtıcısı (ArgoCD, Portainer, Postgres, Whoami)
router.post('/api/cluster/apps/deploy', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, appName } = req.body;
    const result = await clusterOpsService.deployQuickApp({ masterIp, sshUser, sshPass, appName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. Rol Tabanlı Kısıtlı Kubeconfig Üretici (RBAC)
router.post('/api/cluster/rbac/generate', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, username, namespace, role, publicVip } = req.body;
    const result = await clusterOpsService.generateRbacKubeconfig({ masterIp, sshUser, sshPass, username, namespace, role, publicVip });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Cilium NetworkPolicy Manifest Üretici & Uygulayıcı
router.post('/api/cluster/netpol/generate', (req, res) => {
  try {
    const result = clusterOpsService.generateCiliumNetworkPolicy(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cluster/netpol/apply', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, policyYaml } = req.body;
    const result = await clusterOpsService.applyCiliumNetworkPolicy({ masterIp, sshUser, sshPass, policyYaml });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. Sıfır Kesintili Rolling Upgrade Orkestratörü
router.post('/api/cluster/upgrade/start', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, currentVersion, targetVersion } = req.body;
    const result = await clusterOpsService.executeClusterRollingUpgrade({ masterIp, sshUser, sshPass, currentVersion, targetVersion });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. Canlı Olay Akışı & Zaman Çizelgesi (Cluster Events)
router.post('/api/cluster/events', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace } = req.body;
    const result = await clusterOpsService.getClusterEvents({ masterIp, sshUser, sshPass, namespace });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. Akıllı Alarm & Bildirim Testi (Telegram / Slack / Webhook)
router.post('/api/cluster/alerts/test', async (req, res) => {
  try {
    const { channel, webhookUrl, telegramBotToken, telegramChatId, alertName } = req.body;
    const result = await clusterOpsService.sendTestAlert({ channel, webhookUrl, telegramBotToken, telegramChatId, alertName });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. Kaynak Sıkılaştırma & FinOps Tasarruf Analizi (Rightsizing)
router.post('/api/cluster/rightsizing', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.analyzeClusterRightsizing({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. TLS / SSL Sertifikaları & Cert-Manager
router.post('/api/cluster/certs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.getTlsCertificates({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cluster/certs/issuer', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, email, type } = req.body;
    const result = await clusterOpsService.createClusterIssuer({ masterIp, sshUser, sshPass, email, type });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. Canlı Pod Log Akışı & Hata Ayıklayıcı
router.post('/api/cluster/logs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace, podName, tailLines, previous } = req.body;
    const result = await clusterOpsService.streamPodLogs({ masterIp, sshUser, sshPass, namespace, podName, tailLines, previous });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 22. Velero & S3 Tam Küme ve PVC Yedekleme
router.post('/api/cluster/velero', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, action, backupName, s3Bucket, s3Endpoint } = req.body;
    const result = await clusterOpsService.manageVeleroBackup({ masterIp, sshUser, sshPass, action, backupName, s3Bucket, s3Endpoint });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 23. Hubble eBPF Ağ Akışları & Servis Haritası
router.post('/api/cluster/hubble/flows', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace, verdict } = req.body;
    const result = await clusterOpsService.getHubbleNetworkFlows({ masterIp, sshUser, sshPass, namespace, verdict });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 24. K8s Akıllı Teşhis (AI Doctor)
router.post('/api/cluster/doctor/diagnose', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.diagnoseClusterIssues({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cluster/doctor/heal', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, issueId, actionKey } = req.body;
    const result = await clusterOpsService.healClusterIssue({ masterIp, sshUser, sshPass, issueId, actionKey });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 25. Konteyner İmaj Güvenlik Açığı & CVE Tarayıcısı (Trivy)
router.post('/api/cluster/trivy/scan', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass } = req.body;
    const result = await clusterOpsService.scanContainerVulnerabilities({ masterIp, sshUser, sshPass });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 26. Kubernetes CronJob & Zamanlanmış Görev Hub
router.post('/api/cluster/cronjobs', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, namespace } = req.body;
    const result = await clusterOpsService.getCronJobs({ masterIp, sshUser, sshPass, namespace });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/api/cluster/cronjobs/manage', async (req, res) => {
  try {
    const { masterIp, sshUser, sshPass, name, namespace, action } = req.body;
    const result = await clusterOpsService.manageCronJob({ masterIp, sshUser, sshPass, name, namespace, action });
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. Shams AI K8s Copilot Endpoint
router.post('/api/ai/copilot', async (req, res) => {
  try {
    const { prompt, action, context, targetMaster } = req.body;
    const result = await aiCopilotService.processPrompt({ prompt, action, context, targetMaster });
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
