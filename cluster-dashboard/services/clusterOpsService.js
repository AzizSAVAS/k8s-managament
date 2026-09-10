/**
 * ==============================================================================
 * RKE2 & CILIUM CLUSTER OPS: UNIFIED FACADE GATEWAY
 * ==============================================================================
 * Kurumsal mimari deseni (Facade Pattern):
 * Tüm alt operasyonları (Düğüm/Sağlık, Ağ/Güvenlik, Depolama/Yedekleme,
 * Uyum/Sertifikasyon ve İş Yükü/Otomasyon) tek bir temiz giriş noktasında birleştirir.
 */
const nodeAndHealthOps = require('./operations/nodeAndHealthOps');
const networkSecurityOps = require('./operations/networkSecurityOps');
const storageAndBackupOps = require('./operations/storageAndBackupOps');
const securityComplianceOps = require('./operations/securityComplianceOps');
const workloadAutomationOps = require('./operations/workloadAutomationOps');

class ClusterOpsService {
  // 1. DÜĞÜM & SAĞLIK OPERASYONLARI
  getClusterLiveStatus(params) {
    return nodeAndHealthOps.getClusterLiveStatus(params);
  }

  manageNode(params) {
    return nodeAndHealthOps.manageNode(params);
  }

  getClusterEvents(params) {
    return nodeAndHealthOps.getClusterEvents(params);
  }

  execQuickCommand(params) {
    return nodeAndHealthOps.execQuickCommand(params);
  }

  // 2. AĞ & GÜVENLİK OPERASYONLARI
  generateFortigateConfig(params) {
    return networkSecurityOps.generateFortigateConfig(params);
  }

  generateCiliumNetworkPolicy(params) {
    return networkSecurityOps.generateCiliumNetworkPolicy(params);
  }

  applyCiliumNetworkPolicy(params) {
    return networkSecurityOps.applyCiliumNetworkPolicy(params);
  }

  getHubbleNetworkFlows(params) {
    return networkSecurityOps.getHubbleNetworkFlows(params);
  }

  // 3. DEPOLAMA & YEDEKLEME OPERASYONLARI
  installNfsProvisioner(params) {
    return storageAndBackupOps.installNfsProvisioner(params);
  }

  manageEtcd(params) {
    return storageAndBackupOps.manageEtcd(params);
  }

  manageVeleroBackup(params) {
    return storageAndBackupOps.manageVeleroBackup(params);
  }

  // 4. GÜVENLİK & UYUMLULUK OPERASYONLARI
  runCisBenchmark(params) {
    return securityComplianceOps.runCisBenchmark(params);
  }

  generateRbacKubeconfig(params) {
    return securityComplianceOps.generateRbacKubeconfig(params);
  }

  scanContainerVulnerabilities(params) {
    return securityComplianceOps.scanContainerVulnerabilities(params);
  }

  getTlsCertificates(params) {
    return securityComplianceOps.getTlsCertificates(params);
  }

  createClusterIssuer(params) {
    return securityComplianceOps.createClusterIssuer(params);
  }

  // 5. İŞ YÜKÜ & OTOMASYON OPERASYONLARI
  installAddon(params) {
    return workloadAutomationOps.installAddon(params);
  }

  deployQuickApp(params) {
    return workloadAutomationOps.deployQuickApp(params);
  }

  executeClusterRollingUpgrade(params) {
    return workloadAutomationOps.executeClusterRollingUpgrade(params);
  }

  streamPodLogs(params) {
    return workloadAutomationOps.streamPodLogs(params);
  }

  analyzeClusterRightsizing(params) {
    return workloadAutomationOps.analyzeClusterRightsizing(params);
  }

  diagnoseClusterIssues(params) {
    return workloadAutomationOps.diagnoseClusterIssues(params);
  }

  healClusterIssue(params) {
    return workloadAutomationOps.healClusterIssue(params);
  }

  getCronJobs(params) {
    return workloadAutomationOps.getCronJobs(params);
  }

  manageCronJob(params) {
    return workloadAutomationOps.manageCronJob(params);
  }

  sendTestAlert(params) {
    return workloadAutomationOps.sendTestAlert(params);
  }
}

module.exports = new ClusterOpsService();
