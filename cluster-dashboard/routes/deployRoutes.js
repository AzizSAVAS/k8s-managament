const express = require('express');
const proxmoxService = require('../services/proxmoxService');
const vcenterService = require('../services/vcenterService');
const hypervService = require('../services/hypervService');
const rke2Installer = require('../services/rke2Installer');
const sshService = require('../services/sshService');
const clusterOpsService = require('../services/clusterOpsService');

module.exports = function(broadcast = () => {}) {
  const router = express.Router();
  let isDeploying = false;

  // 4. Kume Dagitim ve Anti-Affinity Onizleme Matrisi Uretici
  router.post('/api/cluster/preview-distribution', (req, res) => {
    try {
      const {
        mode = 'new',
        provider,
        physicalNodes = [],
        masterCount = 3,
        workerCount = 5,
        startMasterNum = 1,
        startWorkerNum = 1,
        startVmId = 100,
        vmPrefix = 'k8s',
        subnetBase = '10.0.10',
        startIpHost = 10,
        subnetCidr = '24'
      } = req.body;

      const distribution = [];
      let curVmId = parseInt(startVmId, 10);
      let curHost = parseInt(startIpHost, 10);
      const nodeCount = physicalNodes.length || 1;
      const isScale = (mode === 'scale');

      const mCount = parseInt(masterCount, 10) || 0;
      const sMasterNum = parseInt(startMasterNum, 10) || 1;

      // Master'lar (Anti-Affinity)
      for (let m = 0; m < mCount; m++) {
        const assignedPhysNode = physicalNodes[m % nodeCount] || 'Local';
        const masterIdx = isScale ? (sMasterNum + m) : (m + 1);
        const paddedIdx = masterIdx < 10 ? `0${masterIdx}` : `${masterIdx}`;

        distribution.push({
          type: 'Master',
          roleLabel: isScale 
            ? `Yeni Master #${masterIdx} (Join)`
            : (m === 0 ? 'First Master (Bootstrap)' : `Additional Master #${masterIdx}`),
          roleCode: isScale ? 'AdditionalMaster' : (m === 0 ? 'FirstMaster' : 'AdditionalMaster'),
          name: `${vmPrefix}-master-${paddedIdx}`,
          vmId: curVmId++,
          ip: `${subnetBase}.${curHost++}`,
          cidr: subnetCidr,
          targetPhysicalNode: assignedPhysNode
        });
      }

      // Worker'lar (Round-Robin)
      const wCount = parseInt(workerCount, 10) || 0;
      const sWorkerNum = parseInt(startWorkerNum, 10) || 1;

      for (let w = 0; w < wCount; w++) {
        const physIdx = (mCount + w) % nodeCount;
        const assignedPhysNode = physicalNodes[physIdx] || 'Local';
        const workerIdx = isScale ? (sWorkerNum + w) : (w + 1);
        const paddedIdx = workerIdx < 10 ? `0${workerIdx}` : `${workerIdx}`;

        distribution.push({
          type: 'Worker',
          roleLabel: isScale ? `Yeni Worker #${workerIdx} (Join)` : `Worker Node #${workerIdx}`,
          roleCode: 'Worker',
          name: `${vmPrefix}-worker-${paddedIdx}`,
          vmId: curVmId++,
          ip: `${subnetBase}.${curHost++}`,
          cidr: subnetCidr,
          targetPhysicalNode: assignedPhysNode
        });
      }

      res.json({ success: true, distribution });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Kume Kurulumunu Baslat (Async Job + WebSocket Live Stream)
  router.post('/api/cluster/deploy', async (req, res) => {
    if (isDeploying) {
      return res.status(409).json({ success: false, error: 'Halihazırda bir kurulum devam ediyor!' });
    }

    const {
      mode = 'new',
      provider,
      auth,
      templateId,
      targetStorage,
      diskSizeGB = 50,
      distribution = [],
      gateway,
      cores = 8,
      memoryMB = 16384,
      sshUser = 'root',
      sshPass,
      sshPublicKey,
      vipIp,
      clusterToken,
      clusterDomain = 'k8s.local',
      cni = 'cilium',
      maxPods = 250
    } = req.body;

    isDeploying = true;
    res.json({ success: true, message: 'Kurulum baslatildi, canli loglar WebSocket uzerinden aktariliyor.' });

    (async () => {
      const totalSteps = distribution.length;
      let currentStep = 0;

      const log = (msg) => {
        broadcast({ type: 'log', message: msg });
      };

      const setProgress = (step, total, msg) => {
        broadcast({ type: 'progress', step, total, message: msg });
      };

      try {
        const isScale = (mode === 'scale');
        const cleanVip = (vipIp || '').replace(/^https?:\/\//i, '').split(':')[0].trim();

        log('====================================================');
        if (isScale) {
          log(`[BASLATILDI] RKE2 Düğüm Ekleme (Scale-Out) (${provider.toUpperCase()})`);
          log(`Mevcut Küme API/Join Adresi: ${cleanVip}:9345`);
          log(`Eklenecek Düğümler: Toplam ${distribution.length} (Master: ${distribution.filter(d => d.type === 'Master').length}, Worker: ${distribution.filter(d => d.type === 'Worker').length})`);
        } else {
          log(`[BASLATILDI] RKE2 & Cilium Kume Kurulumu (${provider.toUpperCase()})`);
          log(`Toplam Düğüm: ${distribution.length} (Master: ${distribution.filter(d => d.type === 'Master').length}, Worker: ${distribution.filter(d => d.type === 'Worker').length})`);
          log(`VIP / LB: ${cleanVip} | CNI: ${cni} | MaxPods: ${maxPods}`);
        }
        if (targetStorage) log(`Hedef Disk Havuzu: ${targetStorage} | VM Disk Boyutu: ${diskSizeGB} GB`);
        log('====================================================');

        // ASAMA 1: PROXMOX / VCENTER UZERINDE VM'LERI KLONLA VE AC
        if (provider === 'proxmox' && auth && templateId) {
          log('\n>>> [ASAMA 1] Proxmox Uzerinde VM Klonlama ve Cloud-Init Yapilandirmasi Basliyor...');
          for (const node of distribution) {
            log(`\n-> [VM Klonlama] ${node.name} (ID: ${node.vmId}) -> Fiziksel Node: [${node.targetPhysicalNode}] ${targetStorage ? '-> Storage: [' + targetStorage + ']' : ''}`);
            
            await proxmoxService.cloneVM({
              host: auth.host,
              port: auth.port,
              ticket: auth.ticket,
              csrfToken: auth.csrfToken,
              sourceNode: auth.sourceNode || node.targetPhysicalNode,
              targetNode: node.targetPhysicalNode,
              templateId,
              newVmId: node.vmId,
              vmName: node.name,
              storage: targetStorage
            });

            if (diskSizeGB && parseInt(diskSizeGB, 10) > 0) {
              await proxmoxService.resizeDisk({
                host: auth.host,
                port: auth.port,
                ticket: auth.ticket,
                csrfToken: auth.csrfToken,
                node: node.targetPhysicalNode,
                vmid: node.vmId,
                sizeGB: diskSizeGB
              });
            }

            await proxmoxService.configCloudInit({
              host: auth.host,
              port: auth.port,
              ticket: auth.ticket,
              csrfToken: auth.csrfToken,
              node: node.targetPhysicalNode,
              vmid: node.vmId,
              cores,
              memoryMB,
              ipCidr: `${node.ip}/${node.cidr || 24}`,
              gateway,
              sshUser,
              sshPass,
              sshPublicKey
            });

            await proxmoxService.startVM({
              host: auth.host,
              port: auth.port,
              ticket: auth.ticket,
              csrfToken: auth.csrfToken,
              node: node.targetPhysicalNode,
              vmid: node.vmId
            });

            log(`   [ACILDI] ${node.name} baslatildi.`);
          }

          log('\nTum VM\'ler acildi. Isletim sistemlerinin ve IP\'lerin oturmasi icin 25 saniye bekleniyor...');
          await new Promise(r => setTimeout(r, 25000));
        }

        // ASAMA 1.2: HYPER-V UZERINDE VM'LERI KLONLA VE AC
        if (provider === 'hyperv') {
          log('\n>>> [ASAMA 1] Hyper-V Üzerinde Generation 2 Sanal Makineler Klonlanıyor ve Başlatılıyor...');
          for (const node of distribution) {
            log(`\n-> [Hyper-V VM Klonlama] ${node.name} -> Hedef Disk: [${targetStorage || 'C:\\HyperV\\Virtual Hard Disks'}]`);
            
            await hypervService.provisionVM({
              host: auth ? auth.host : 'localhost',
              port: auth ? auth.port : 22,
              username: auth ? auth.username : 'Administrator',
              password: auth ? auth.password : '',
              isLocal: auth ? auth.isLocal : true,
              vmName: node.name,
              templatePath: templateId,
              targetStoragePath: targetStorage || 'C:\\HyperV\\Virtual Hard Disks',
              vswitchName: (auth && auth.switchName) || 'Default Switch',
              cores: cores || 4,
              memoryMB: memoryMB || 8192,
              diskSizeGB: diskSizeGB || 50,
              ipAddress: node.ip,
              gateway,
              sshUser,
              sshPass,
              onLog: log
            });
          }
          log('\nHyper-V üzerinde tüm sanal makineler başarıyla oluşturuldu ve başlatıldı. Ağ servislerinin oturması için 25 saniye bekleniyor...');
          await new Promise(r => setTimeout(r, 25000));
        }

        // ASAMA 2: RKE2 KURULUM / JOIN PAYLOAD'LARINI CALISTIR
        log(isScale 
          ? '\n>>> [ASAMA 2] Yeni Düğümler Mevcut RKE2 Kümesine Dahil Ediliyor...' 
          : '\n>>> [ASAMA 2] RKE2 & Cilium eBPF Kurulumu Baslatiliyor...');

        const firstMaster = distribution.find(d => d.roleCode === 'FirstMaster') || distribution[0];
        const effectiveVip = cleanVip || (firstMaster ? firstMaster.ip : '');

        for (const node of distribution) {
          currentStep++;
          setProgress(currentStep, totalSteps, `${node.name} (${node.ip}) ${isScale ? 'kümeye ekleniyor' : 'kuruluyor'}...`);
          log(`\n------------------------------------------------------------`);
          log(`[${currentStep}/${totalSteps}] ${node.roleLabel} -> ${node.name} (${node.ip})`);

          const payload = rke2Installer.getPayload({
            role: node.roleCode,
            joinAddress: effectiveVip,
            clusterToken,
            nodeIp: node.ip,
            clusterDomain,
            cni,
            maxPods
          });

          await rke2Installer.executeRemote({
            nodeIp: node.ip,
            sshUser,
            sshPass,
            payload,
            onLog: (line) => log(`[${node.name}] ${line}`)
          });
        }

        log('\n====================================================');
        if (isScale) {
          log(`🎉 TEBRİKLER! ${distribution.length} adet yeni düğüm mevcut RKE2 kümesine başarıyla dahil edildi!`);
          log('Kümenizi doğrulamak için herhangi bir master sunucuda şunu çalıştırın:');
          log('   kubectl get nodes -o wide');
        } else {
          log('🎉 TEBRIKLER! RKE2 & CILIUM KUBERNETES KUMESI HAZIR!');
          log(`Cluster Token: ${clusterToken}`);
          log(`Yonetim Kubeconfig: ${firstMaster ? firstMaster.ip : ''}:/etc/rancher/rke2/rke2.yaml`);
        }
        log('====================================================');

        broadcast({ type: 'complete', success: true });
      } catch (err) {
        log(`\n❌ [KRITIK HATA] İşlem sırasında hata oluştu: ${err.message}`);
        broadcast({ type: 'complete', success: false, error: err.message });
      } finally {
        isDeploying = false;
      }
    })();
  });

  // 1. Pre-Flight Ağ & Donanım Doğrulama Motoru
  router.post('/api/cluster/preflight-check', async (req, res) => {
    try {
      const { ips, gateway, dns, provider, storage, auth, vmCount, diskGB } = req.body;
      const result = await clusterOpsService.preflightCheck({
        ips: ips || [],
        gateway,
        dns,
        provider,
        storage,
        auth,
        vmCount: vmCount || 1,
        diskGB: diskGB || 40
      });
      res.json({ success: true, ...result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Kubeconfig Dosyasını Çekme ve İndirme
  router.post('/api/cluster/kubeconfig', async (req, res) => {
    try {
      const { masterIp, sshUser, sshPass, publicVip } = req.body;
      const configYaml = await clusterOpsService.getKubeconfig({ masterIp, sshUser, sshPass, publicVip });
      res.json({ success: true, kubeconfig: configYaml });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3.0 Canlı Kümeye Hızlı Bağlan & Canlı Log Akışı
  router.post('/api/cluster/quick-connect', async (req, res) => {
    const { masterIp, sshUser = 'root', sshPass, sshPort = 22 } = req.body;
    if (!masterIp) {
      return res.status(400).json({ success: false, error: 'Master sunucu IP adresi zorunludur.' });
    }

    const log = (msg) => broadcast({ type: 'quick-connect-log', message: msg });

    try {
      log(`\n============================================================`);
      log(`[SSH BAĞLANTISI] ${sshUser}@${masterIp}:${sshPort} adresine bağlanılıyor...`);

      const osCmd = `cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d '"' || uname -sr`;
      const osRes = await sshService.execCapture({
        host: masterIp,
        port: parseInt(sshPort, 10) || 22,
        username: sshUser,
        password: sshPass,
        command: osCmd
      });

      const osName = (osRes.stdout || '').trim() || 'Linux Host';
      log(`[SİSTEM] ✔ Kimlik doğrulama başarılı! İşletim Sistemi: ${osName}`);

      log(`[RKE2] Küme servis durumu denetleniyor...`);
      const serviceCmd = `systemctl is-active rke2-server 2>/dev/null || echo "inactive"`;
      const serviceRes = await sshService.execCapture({
        host: masterIp,
        port: parseInt(sshPort, 10) || 22,
        username: sshUser,
        password: sshPass,
        command: serviceCmd
      });
      const sState = (serviceRes.stdout || '').trim();
      log(`[RKE2] rke2-server servisi: ${sState === 'active' ? '✔ Aktif (Running)' : '⚠️ ' + sState}`);

      log(`[KUBECTL] Küme düğümleri taranıyor...`);
      const cleanPass = (sshPass || '').replace(/'/g, "'\\''");
      const testNodesCmd = `
KUBECTL_BIN="/var/lib/rancher/rke2/bin/kubectl"
[ ! -x "$KUBECTL_BIN" ] && command -v kubectl >/dev/null 2>&1 && KUBECTL_BIN="$(which kubectl)"
KCFG="/etc/rancher/rke2/rke2.yaml"
[ ! -f "$KCFG" ] && [ -f "$HOME/.kube/config" ] && KCFG="$HOME/.kube/config"
RUN_PREFIX=""
[ "$(id -u)" -ne 0 ] && RUN_PREFIX="echo '${cleanPass}' | sudo -S "
\${RUN_PREFIX} \$KUBECTL_BIN --kubeconfig \$KCFG get nodes --no-headers 2>/dev/null || echo "ERR_NODES"
`;
      const nodesRes = await sshService.execCapture({
        host: masterIp,
        port: parseInt(sshPort, 10) || 22,
        username: sshUser,
        password: sshPass,
        command: testNodesCmd
      });

      const rawNodes = (nodesRes.stdout || '').trim().split('\n').filter(l => l.trim() && !l.includes('ERR_NODES'));
      if (rawNodes.length > 0) {
        log(`[KUBECTL] ✔ ${rawNodes.length} adet düğüm tespit edildi:`);
        rawNodes.forEach(n => {
          const parts = n.split(/\s+/);
          log(`   • ${parts[0]} - Durum: ${parts[1]} - Roller: ${parts[2] || 'none'} - Versiyon: ${parts[4] || ''}`);
        });
      } else {
        const errHint = (nodesRes.stderr || '').trim();
        if (errHint) {
          log(`[KUBECTL] ⚠️ Kubectl çıktısı: ${errHint}`);
        } else {
          log(`[KUBECTL] ℹ️ Düğümler henüz listelenemedi (rke2-server servisi başlamakta olabilir).`);
        }
      }

      const testPodCmd = `
KUBECTL_BIN="/var/lib/rancher/rke2/bin/kubectl"
[ ! -x "$KUBECTL_BIN" ] && command -v kubectl >/dev/null 2>&1 && KUBECTL_BIN="$(which kubectl)"
KCFG="/etc/rancher/rke2/rke2.yaml"
[ ! -f "$KCFG" ] && [ -f "$HOME/.kube/config" ] && KCFG="$HOME/.kube/config"
RUN_PREFIX=""
[ "$(id -u)" -ne 0 ] && RUN_PREFIX="echo '${cleanPass}' | sudo -S "
\${RUN_PREFIX} \$KUBECTL_BIN --kubeconfig \$KCFG get pods -A --no-headers 2>/dev/null | wc -l || echo "0"
`;
      const podRes = await sshService.execCapture({
        host: masterIp,
        port: parseInt(sshPort, 10) || 22,
        username: sshUser,
        password: sshPass,
        command: testPodCmd
      });
      const podCount = (podRes.stdout || '').trim();
      log(`[PODLAR] ✔ Kümede toplam ${podCount} adet pod aktif.`);

      log(`[BAŞARILI] 🎉 Küme bağlantısı tamamlandı. Yönetim Masası açılıyor...`);
      log(`============================================================\n`);

      res.json({
        success: true,
        masterIp,
        osName,
        nodeCount: rawNodes.length,
        podCount: parseInt(podCount, 10) || 0,
        message: 'Canlı küme bağlantısı başarıyla sağlandı.'
      });
    } catch (err) {
      log(`❌ [BAĞLANTI HATASI] ${masterIp} adresine bağlanırken hata oluştu: ${err.message}`);
      if (err.message && err.message.includes('All configured authentication methods failed')) {
        log(`\n💡 [KİMLİK DOĞRULAMA İPUÇLARI]:`);
        log(`   • Şifrenin doğruluğundan emin olun.`);
        log(`   • Ubuntu/Debian sistemlerde 'root' kullanıcısına şifreli giriş varsayılan olarak kapalıdır.`);
        log(`     Kullanıcı adı kutusuna 'ubuntu' veya kurulumda belirlediğiniz kullanıcı adını yazmayı deneyebilirsiniz.`);
        log(`   • Eğer 'root' ile giriş yapmak istiyorsanız sunucu konsolunda root girişini açabilirsiniz:`);
        log(`     sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config && sudo systemctl restart ssh`);
      }
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
};
