const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sshService = require('./sshService');

class Rke2Installer {
  /**
   * Hedef Linux sunucusunda calistirilacak 5 adimli kurulum payload'unu uretir
   */
  getPayload({ role, joinAddress, clusterToken, nodeIp, clusterDomain = 'k8s.local', cni = 'cilium', maxPods = 250 }) {
    const cleanJoin = (joinAddress || '').replace(/^https?:\/\//i, '').split(':')[0].trim();
    let configYaml = '';
    const serviceType = role === 'Worker' ? 'agent' : 'server';

    if (role === 'FirstMaster') {
      configYaml = `token: "${clusterToken}"
tls-san:
  - "${cleanJoin}"
  - "${clusterDomain}"
  - "${nodeIp}"
write-kubeconfig-mode: "0644"
cni: "${cni}"
etcd-expose-metrics: true
kubelet-arg:
  - "max-pods=${maxPods}"`;
    } else if (role === 'AdditionalMaster') {
      configYaml = `server: "https://${cleanJoin}:9345"
token: "${clusterToken}"
tls-san:
  - "${cleanJoin}"
  - "${clusterDomain}"
  - "${nodeIp}"
write-kubeconfig-mode: "0644"
cni: "${cni}"
kubelet-arg:
  - "max-pods=${maxPods}"`;
    } else {
      // Worker
      configYaml = `server: "https://${cleanJoin}:9345"
token: "${clusterToken}"
kubelet-arg:
  - "max-pods=${maxPods}"`;
    }

    return `set -e
echo "=== [1/5] Swap Kapatiliyor ==="
swapoff -a
sed -i '/ swap / s/^\\(.*\\)$/#\\1/g' /etc/fstab

echo "=== [2/5] Kernel Modulleri ve Cilium eBPF Hazirlaniyor ==="
cat <<'EOF_MOD' | tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF_MOD
modprobe overlay || true
modprobe br_netfilter || true
mount | grep /sys/fs/bpf || mount bpffs /sys/fs/bpf -t bpf || true

echo "=== [3/5] Sysctl Parametreleri (${maxPods} Pod & eBPF) Uygulaniyor ==="
cat <<'EOF_SYS' | tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
vm.max_map_count                    = 524288
fs.file-max                         = 2097152
net.core.somaxconn                  = 32768
EOF_SYS
sysctl --system || true

echo "=== [4/5] Paketler Kuruluyor (open-iscsi, chrony) ==="
apt-get update -qq && apt-get install -y -qq curl wget jq open-iscsi nfs-common chrony
systemctl enable --now iscsid || true
systemctl enable --now chrony || true

echo "=== [5/5] RKE2 ${role} Yapilandiriliyor ve Servis Baslatiliyor ==="
mkdir -p /etc/rancher/rke2/
cat <<'EOF_CONF' | tee /etc/rancher/rke2/config.yaml
${configYaml}
EOF_CONF

if [ "${serviceType}" = "agent" ]; then
    curl -sfL https://get.rke2.io | INSTALL_RKE2_TYPE="agent" sh -
    systemctl enable rke2-agent.service
    systemctl restart rke2-agent.service
else
    curl -sfL https://get.rke2.io | sh -
    systemctl enable rke2-server.service
    systemctl restart rke2-server.service
    
    export PATH=$PATH:/var/lib/rancher/rke2/bin
    echo 'export PATH=$PATH:/var/lib/rancher/rke2/bin' >> /root/.bashrc
    export KUBECONFIG=/etc/rancher/rke2/rke2.yaml
    echo 'export KUBECONFIG=/etc/rancher/rke2/rke2.yaml' >> /root/.bashrc
fi

echo "=== BASARILI: RKE2 ${role} Kurulumu Tamamlandi! ==="`;
  }

  /**
   * Node.js native SSH2 ile sifre veya anahtar uzerinden uzak sunucuda calistirir
   */
  async executeRemote({ nodeIp, sshUser = 'root', sshPass, payload, onLog }) {
    return sshService.execute({
      host: nodeIp,
      port: 22,
      username: sshUser,
      password: sshPass,
      command: payload,
      onLog
    });
  }
}

module.exports = new Rke2Installer();
