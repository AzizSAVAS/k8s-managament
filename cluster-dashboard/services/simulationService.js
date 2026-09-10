// ==============================================================================
// RKE2 CLUSTER HUB: REALISTIC DEMO & SIMULATION ENGINE
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

class SimulationService {
  constructor() {
    this.startTime = Date.now();
  }

  getSimulatedNodes() {
    return [
      { name: 'rke2-cp-01', ip: '192.168.10.11', role: 'Control Plane / Master', status: 'Ready', cpu: `${Math.floor(22 + Math.random() * 15)}%`, mem: `${Math.floor(58 + Math.random() * 8)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' },
      { name: 'rke2-cp-02', ip: '192.168.10.12', role: 'Control Plane / Master', status: 'Ready', cpu: `${Math.floor(20 + Math.random() * 12)}%`, mem: `${Math.floor(55 + Math.random() * 6)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' },
      { name: 'rke2-cp-03', ip: '192.168.10.13', role: 'Control Plane / Master', status: 'Ready', cpu: `${Math.floor(24 + Math.random() * 14)}%`, mem: `${Math.floor(59 + Math.random() * 7)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' },
      { name: 'rke2-worker-01', ip: '192.168.10.21', role: 'Worker Node', status: 'Ready', cpu: `${Math.floor(35 + Math.random() * 25)}%`, mem: `${Math.floor(65 + Math.random() * 12)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' },
      { name: 'rke2-worker-02', ip: '192.168.10.22', role: 'Worker Node', status: 'Ready', cpu: `${Math.floor(42 + Math.random() * 20)}%`, mem: `${Math.floor(70 + Math.random() * 10)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' },
      { name: 'rke2-worker-03', ip: '192.168.10.23', role: 'Worker Node', status: 'Ready', cpu: `${Math.floor(38 + Math.random() * 18)}%`, mem: `${Math.floor(62 + Math.random() * 11)}%`, kubelet: 'v1.30.2+rke2r1', os: 'Ubuntu 24.04 LTS' }
    ];
  }

  getSimulatedPods() {
    return [
      { namespace: 'kube-system', name: 'cilium-agent-4j9kx', ready: '1/1', status: 'Running', restarts: 0, age: '14d', node: 'rke2-cp-01', ip: '192.168.10.11' },
      { namespace: 'kube-system', name: 'cilium-operator-79c86-x9zkl', ready: '1/1', status: 'Running', restarts: 0, age: '14d', node: 'rke2-cp-02', ip: '10.42.1.18' },
      { namespace: 'kube-system', name: 'coredns-rke2-coredns-586b59c4-d4b9c', ready: '1/1', status: 'Running', restarts: 0, age: '14d', node: 'rke2-cp-01', ip: '10.42.0.8' },
      { namespace: 'kube-system', name: 'etcd-rke2-cp-01', ready: '1/1', status: 'Running', restarts: 0, age: '14d', node: 'rke2-cp-01', ip: '192.168.10.11' },
      { namespace: 'hubble-system', name: 'hubble-relay-668ff7c5bd-w892v', ready: '1/1', status: 'Running', restarts: 0, age: '7d', node: 'rke2-worker-01', ip: '10.42.3.22' },
      { namespace: 'hubble-system', name: 'hubble-ui-84cfbbdc64-v7kpt', ready: '2/2', status: 'Running', restarts: 0, age: '7d', node: 'rke2-worker-02', ip: '10.42.4.15' },
      { namespace: 'production', name: 'fintech-api-v2-5d468b75f-2c78s', ready: '1/1', status: 'Running', restarts: 1, age: '3d', node: 'rke2-worker-01', ip: '10.42.3.44' },
      { namespace: 'production', name: 'payment-gateway-6cbcf47b9-k5s8d', ready: '1/1', status: 'Running', restarts: 0, age: '3d', node: 'rke2-worker-02', ip: '10.42.4.89' },
      { namespace: 'production', name: 'redis-ha-cluster-0', ready: '1/1', status: 'Running', restarts: 0, age: '12d', node: 'rke2-worker-03', ip: '10.42.5.12' },
      { namespace: 'monitoring', name: 'prometheus-k8s-0', ready: '2/2', status: 'Running', restarts: 0, age: '10d', node: 'rke2-worker-03', ip: '10.42.5.33' }
    ];
  }

  getSimulatedHubbleFlows() {
    const verdicts = ['FORWARDED', 'FORWARDED', 'FORWARDED', 'FORWARDED', 'DROPPED'];
    const protocols = ['HTTP/1.1 200 OK', 'HTTP/2 GET', 'DNS Query A', 'gRPC Stream', 'TCP SYN'];
    const services = [
      { src: 'production/fintech-api-v2', dst: 'production/payment-gateway:8443' },
      { src: 'production/payment-gateway', dst: 'production/redis-ha-cluster:6379' },
      { src: 'kube-system/cilium-operator', dst: 'kube-system/kube-apiserver:6443' },
      { src: 'external/unknown-scanner-bot', dst: 'production/fintech-api-v2:80' },
      { src: 'monitoring/prometheus', dst: 'production/fintech-api-v2:9090' }
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const s = services[Math.floor(Math.random() * services.length)];
      const verdict = s.src.includes('scanner') ? 'DROPPED' : verdicts[Math.floor(Math.random() * verdicts.length)];
      const latency = (Math.random() * 4 + 0.3).toFixed(2);
      return {
        timestamp: new Date(Date.now() - (i * 2400)).toLocaleTimeString(),
        source: s.src,
        destination: s.dst,
        proto: protocols[Math.floor(Math.random() * protocols.length)],
        verdict: verdict,
        latency: `${latency}ms`,
        rule: verdict === 'DROPPED' ? 'CiliumClusterwideNetworkPolicy: default-deny-ingress' : 'AllowedByRule: allow-cross-tier-l7'
      };
    });
  }

  getSimulatedTrivy() {
    return {
      success: true,
      scannedAt: new Date().toISOString(),
      summary: { total: 4, critical: 0, high: 1, medium: 2, low: 1 },
      vulnerabilities: [
        { cve: 'CVE-2024-21626', pkg: 'runc (1.1.10-0ubuntu1)', severity: 'HIGH', fixedIn: '1.1.12-0ubuntu1', description: 'Leaky file descriptor allows container breakout via /proc/self/fd.' },
        { cve: 'CVE-2024-6387', pkg: 'openssh-server (8.9p1)', severity: 'MEDIUM', fixedIn: '8.9p1-3ubuntu0.10', description: 'RegreSSHion signal handler race condition in OpenSSH daemon.' },
        { cve: 'CVE-2023-44487', pkg: 'golang.org/x/net (v0.14.0)', severity: 'MEDIUM', fixedIn: 'v0.17.0', description: 'HTTP/2 Rapid Reset DDoS attack vector in net/http server.' },
        { cve: 'CVE-2023-39325', pkg: 'libssl3 (3.0.2)', severity: 'LOW', fixedIn: '3.0.2-0ubuntu1.12', description: 'Truncation of cryptographic initialization vector in TLS handshakes.' }
      ]
    };
  }

  getSimulatedDoctorDiagnosis() {
    return {
      healthy: false,
      score: 91,
      lastDiagnosed: new Date().toLocaleTimeString(),
      issues: [
        {
          id: 'DOC-1082',
          severity: 'warning',
          category: 'Cilium eBPF Map Capacity',
          description: 'Cilium eBPF conntrack tablosu %78 doluluk oranına ulaştı. 60.000 aktif TCP soketi gözlemleniyor.',
          remedy: 'Otomatik sysctl net.core.bpf_jit_limit artırımı ve conntrack-gc sıklaştırması uygulanabilir.',
          canSelfHeal: true,
          actionKey: 'heal-cilium-bpf'
        },
        {
          id: 'DOC-1083',
          severity: 'info',
          category: 'CoreDNS Query Latency',
          description: 'DNS çözümleme yanıt süreleri p99 değeri 14ms seviyesinde, ek CoreDNS pod replikası tavsiye edilir.',
          remedy: 'CoreDNS HPA (Horizontal Pod Autoscaler) devreye sokulabilir.',
          canSelfHeal: true,
          actionKey: 'scale-coredns'
        }
      ]
    };
  }

  getSimulatedEvents() {
    return [
      { time: '10 saniye önce', type: 'Normal', reason: 'Scheduled', object: 'Pod/fintech-api-v2-5d468b75f-2c78s', message: 'Successfully assigned production/fintech-api-v2-5d468b75f-2c78s to rke2-worker-01' },
      { time: '45 saniye önce', type: 'Normal', reason: 'Pulled', object: 'Pod/payment-gateway-6cbcf47b9-k5s8d', message: 'Container image "registry.shamssoftware.com/payment:v2.4" already present on machine' },
      { time: '2 dakika önce', type: 'Warning', reason: 'NetworkPolicyDrop', object: 'CiliumEndpoint/unknown-scanner-bot', message: 'Policy drop: Traffic from 185.220.101.5 to fintech-api:80 blocked by Cilium L3/L4 rule' },
      { time: '5 dakika önce', type: 'Normal', reason: 'SnapshotSuccess', object: 'EtcdCluster/rke2-etcd', message: 'Automated 6-hour Etcd cluster snapshot stored to S3 backup target successfully' }
    ];
  }
}

module.exports = new SimulationService();
