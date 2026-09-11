// ==============================================================================
// RKE2 CLUSTER HUB: LENS KUBERNETES IDE SERVICE
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

class LensService {
  constructor() {
    this.activePortForwards = [
      {
        id: 'pf-8080-3000',
        resource: 'Pod/monitoring/grafana-5d468b75f-x9l2k',
        namespace: 'monitoring',
        targetPort: 3000,
        localPort: 8080,
        status: 'Active (Tunneling)',
        uptime: '2 sa 14 dk',
        bytesTransferred: '42.8 MB',
        localUrl: 'http://localhost:8080'
      },
      {
        id: 'pf-9090-9090',
        resource: 'Service/monitoring/prometheus-k8s',
        namespace: 'monitoring',
        targetPort: 9090,
        localPort: 9090,
        status: 'Active (Tunneling)',
        uptime: '45 dk',
        bytesTransferred: '18.4 MB',
        localUrl: 'http://localhost:9090'
      }
    ];

    this.mockResources = {
      pods: [
        {
          name: 'fintech-api-v2-7b9c6d48-8x2k1',
          namespace: 'production',
          status: 'Running',
          ready: '1/1',
          restarts: 0,
          cpu: '45m',
          memory: '184Mi',
          node: 'rke2-worker-01',
          ip: '10.42.3.44',
          age: '3d 14h'
        },
        {
          name: 'payment-gateway-6cbcf47b9-k5s8d',
          namespace: 'production',
          status: 'Running',
          ready: '1/1',
          restarts: 1,
          cpu: '82m',
          memory: '312Mi',
          node: 'rke2-worker-02',
          ip: '10.42.4.89',
          age: '3d 14h'
        },
        {
          name: 'redis-ha-cluster-0',
          namespace: 'production',
          status: 'Running',
          ready: '1/1',
          restarts: 0,
          cpu: '15m',
          memory: '128Mi',
          node: 'rke2-worker-03',
          ip: '10.42.5.12',
          age: '12d 8h'
        },
        {
          name: 'cilium-agent-4j9kx',
          namespace: 'kube-system',
          status: 'Running',
          ready: '1/1',
          restarts: 0,
          cpu: '35m',
          memory: '240Mi',
          node: 'rke2-cp-01',
          ip: '192.168.10.11',
          age: '14d 2h'
        },
        {
          name: 'coredns-rke2-coredns-586b59c4-d4b9c',
          namespace: 'kube-system',
          status: 'Running',
          ready: '1/1',
          restarts: 0,
          cpu: '18m',
          memory: '48Mi',
          node: 'rke2-cp-01',
          ip: '10.42.0.8',
          age: '14d 2h'
        },
        {
          name: 'hubble-relay-668ff7c5bd-w892v',
          namespace: 'hubble-system',
          status: 'Running',
          ready: '1/1',
          restarts: 0,
          cpu: '12m',
          memory: '64Mi',
          node: 'rke2-worker-01',
          ip: '10.42.3.22',
          age: '7d 1h'
        },
        {
          name: 'prometheus-k8s-0',
          namespace: 'monitoring',
          status: 'Running',
          ready: '2/2',
          restarts: 0,
          cpu: '120m',
          memory: '840Mi',
          node: 'rke2-worker-03',
          ip: '10.42.5.33',
          age: '10d 6h'
        },
        {
          name: 'legacy-data-sync-failed-92k1s',
          namespace: 'default',
          status: 'CrashLoopBackOff',
          ready: '0/1',
          restarts: 14,
          cpu: '0m',
          memory: '12Mi',
          node: 'rke2-worker-02',
          ip: '10.42.4.102',
          age: '4h 12m'
        }
      ],
      deployments: [
        {
          name: 'fintech-api-v2',
          namespace: 'production',
          replicas: '3/3',
          upToDate: 3,
          available: 3,
          strategy: 'RollingUpdate (maxSurge: 25%)',
          conditions: 'Available: True • Progressing: True',
          age: '14d'
        },
        {
          name: 'payment-gateway',
          namespace: 'production',
          replicas: '5/5',
          upToDate: 5,
          available: 5,
          strategy: 'RollingUpdate',
          conditions: 'Available: True • Progressing: True',
          age: '14d'
        },
        {
          name: 'hubble-ui',
          namespace: 'hubble-system',
          replicas: '2/2',
          upToDate: 2,
          available: 2,
          strategy: 'RollingUpdate',
          conditions: 'Available: True',
          age: '7d'
        }
      ],
      statefulsets: [
        {
          name: 'redis-ha-cluster',
          namespace: 'production',
          ready: '3/3',
          replicas: 3,
          service: 'redis-ha-discovery',
          age: '12d'
        },
        {
          name: 'prometheus-k8s',
          namespace: 'monitoring',
          ready: '2/2',
          replicas: 2,
          service: 'prometheus-k8s',
          age: '10d'
        }
      ],
      daemonsets: [
        {
          name: 'cilium',
          namespace: 'kube-system',
          desired: 6,
          current: 6,
          ready: 6,
          upToDate: 6,
          nodeSelector: 'kubernetes.io/os: linux',
          age: '14d'
        },
        {
          name: 'node-exporter',
          namespace: 'monitoring',
          desired: 6,
          current: 6,
          ready: 6,
          upToDate: 6,
          nodeSelector: 'All Nodes',
          age: '10d'
        }
      ],
      services: [
        {
          name: 'fintech-api-service',
          namespace: 'production',
          type: 'ClusterIP',
          clusterIp: '10.43.120.45',
          externalIp: '10.0.10.100 (FortiGate VIP)',
          ports: '80:31844/TCP, 443:32443/TCP',
          age: '14d'
        },
        {
          name: 'payment-gateway-service',
          namespace: 'production',
          type: 'ClusterIP',
          clusterIp: '10.43.180.12',
          externalIp: '<None>',
          ports: '8443/TCP',
          age: '14d'
        },
        {
          name: 'kube-dns',
          namespace: 'kube-system',
          type: 'ClusterIP',
          clusterIp: '10.43.0.10',
          externalIp: '<None>',
          ports: '53/UDP, 53/TCP, 9153/TCP',
          age: '14d'
        }
      ],
      ingresses: [
        {
          name: 'production-api-ingress',
          namespace: 'production',
          hosts: 'api.shamssoftware.com',
          class: 'cilium (eBPF Ingress Controller)',
          address: '10.0.10.100',
          tls: 'api-tls-secret (cert-manager / Let\'s Encrypt)',
          age: '14d'
        },
        {
          name: 'hubble-dashboard-ingress',
          namespace: 'hubble-system',
          hosts: 'hubble.cluster.local',
          class: 'cilium',
          address: '10.0.10.100',
          tls: '<None>',
          age: '7d'
        }
      ],
      configmaps: [
        {
          name: 'fintech-runtime-config',
          namespace: 'production',
          dataCount: 4,
          keys: 'app.env, features.json, log.level, db.pool',
          age: '14d'
        },
        {
          name: 'cilium-config',
          namespace: 'kube-system',
          dataCount: 38,
          keys: 'bpf-ct-global-any-max, enable-ipv4, tunnel, hubble',
          age: '14d'
        }
      ],
      secrets: [
        {
          name: 'api-tls-secret',
          namespace: 'production',
          type: 'kubernetes.io/tls',
          dataCount: 2,
          keys: 'tls.crt (2.4 KB), tls.key (1.7 KB)',
          age: '14d'
        },
        {
          name: 'postgres-db-credentials',
          namespace: 'production',
          type: 'Opaque',
          dataCount: 3,
          keys: 'POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB',
          age: '14d'
        }
      ],
      pvcs: [
        {
          name: 'data-redis-ha-cluster-0',
          namespace: 'production',
          status: 'Bound',
          volume: 'pvc-89ab12cd-34ef-56gh-78ij',
          capacity: '20 GiB',
          storageClass: 'nfs-client-ha',
          accessModes: 'ReadWriteOnce',
          age: '12d'
        },
        {
          name: 'prometheus-k8s-db-prometheus-k8s-0',
          namespace: 'monitoring',
          status: 'Bound',
          volume: 'pvc-45ef67gh-89ij-01kl-23mn',
          capacity: '100 GiB',
          storageClass: 'nfs-client-ha',
          accessModes: 'ReadWriteOnce',
          age: '10d'
        }
      ]
    };
  }

  // 1. Kaynak Listeleme
  getResources(kind = 'pods', namespace = '') {
    const key = kind.toLowerCase();
    const list = this.mockResources[key] || [];

    if (!namespace || namespace === 'all' || namespace === '__all__') {
      return {
        success: true,
        kind,
        namespace: 'all',
        totalCount: list.length,
        items: list
      };
    }

    const filtered = list.filter(item => (item.namespace || '').toLowerCase() === namespace.toLowerCase());
    return {
      success: true,
      kind,
      namespace,
      totalCount: filtered.length,
      items: filtered
    };
  }

  // 2. İnteraktif Kaynak İnceleme (Lens Inspector Drawer)
  getResourceDetails(kind = 'pod', namespace = 'production', name = 'fintech-api-v2-7b9c6d48-8x2k1') {
    const yamlManifest = `apiVersion: apps/v1
kind: ${kind === 'pod' ? 'Pod' : kind.charAt(0).toUpperCase() + kind.slice(1)}
metadata:
  name: ${name}
  namespace: ${namespace}
  uid: "f94d1b82-9c44-48e2-98c0-7814b62e49a1"
  creationTimestamp: "2026-09-08T06:14:22Z"
  labels:
    app.kubernetes.io/name: ${name.split('-')[0]}
    app.kubernetes.io/instance: release-v2.4
    app.kubernetes.io/managed-by: Helm
    environment: production
    security.cilium.io/policy: strict-egress
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
    deployment.kubernetes.io/revision: "4"
spec:
  containers:
  - name: main-app
    image: "registry.shamssoftware.com/fintech/api:v2.4.1"
    imagePullPolicy: IfNotPresent
    ports:
    - containerPort: 8080
      name: http
      protocol: TCP
    - containerPort: 9090
      name: metrics
      protocol: TCP
    resources:
      requests:
        cpu: "100m"
        memory: "256Mi"
      limits:
        cpu: "500m"
        memory: "512Mi"
    livenessProbe:
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 15
      periodSeconds: 10
status:
  phase: Running
  conditions:
  - type: Initialized
    status: "True"
  - type: Ready
    status: "True"
  - type: ContainersReady
    status: "True"
  - type: PodScheduled
    status: "True"
  hostIP: 192.168.10.21
  podIP: 10.42.3.44`;

    return {
      success: true,
      kind,
      name,
      namespace,
      overview: {
        uid: 'f94d1b82-9c44-48e2-98c0-7814b62e49a1',
        created: '3 gün önce (2026-09-08 09:14)',
        controlledBy: 'ReplicaSet/fintech-api-v2-7b9c6d48',
        node: 'rke2-worker-01 (192.168.10.21)',
        ip: '10.42.3.44',
        qosClass: 'Burstable',
        status: 'Running'
      },
      labels: [
        { key: 'app.kubernetes.io/name', value: name.split('-')[0] },
        { key: 'app.kubernetes.io/instance', value: 'release-v2.4' },
        { key: 'environment', value: 'production' },
        { key: 'security.cilium.io/policy', value: 'strict-egress' }
      ],
      annotations: [
        { key: 'prometheus.io/scrape', value: 'true' },
        { key: 'prometheus.io/port', value: '9090' }
      ],
      metrics: {
        cpuUsage: '45m',
        cpuRequest: '100m',
        cpuLimit: '500m',
        cpuPercent: 9,
        memoryUsage: '184 MiB',
        memoryRequest: '256 MiB',
        memoryLimit: '512 MiB',
        memoryPercent: 36
      },
      containers: [
        {
          name: 'main-app',
          image: 'registry.shamssoftware.com/fintech/api:v2.4.1',
          state: 'Running (Ready)',
          restarts: 0,
          ports: '8080/TCP (http), 9090/TCP (metrics)'
        }
      ],
      events: [
        { type: 'Normal', reason: 'Pulled', message: 'Container image "registry.shamssoftware.com/fintech/api:v2.4.1" already present on machine', age: '3 gün önce' },
        { type: 'Normal', reason: 'Created', message: 'Created container main-app', age: '3 gün önce' },
        { type: 'Normal', reason: 'Started', message: 'Started container main-app', age: '3 gün önce' }
      ],
      yaml: yamlManifest
    };
  }

  // 3. Canlı Pod Log Akışı
  getPodLogs(namespace = 'production', podName = 'fintech-api-v2', container = 'main-app', tail = 100) {
    const logs = [
      `[2026-09-11 09:20:10.112] [INFO] [main-app] Starting HTTP listener on :8080 (PID: 1)`,
      `[2026-09-11 09:20:10.155] [INFO] [main-app] Connected to PostgreSQL pool: max_connections=25, active=4`,
      `[2026-09-11 09:20:10.201] [INFO] [main-app] Redis cache cluster ready (sentinel mode): 3 nodes discovered`,
      `[2026-09-11 09:20:15.000] [INFO] [main-app] Health probe GET /healthz HTTP/1.1 from 10.42.0.1 - 200 OK (0.4ms)`,
      `[2026-09-11 09:21:04.220] [INFO] [main-app] POST /api/v2/payments/authorize from 10.42.4.89 - 201 Created (14.2ms)`,
      `[2026-09-11 09:21:14.331] [INFO] [main-app] GET /metrics HTTP/1.1 from 10.42.5.33:9090 - 200 OK (1.1ms)`,
      `[2026-09-11 09:22:01.884] [INFO] [main-app] eBPF socket acceleration active: zero-copy TCP stream engaged`
    ];

    return {
      success: true,
      podName,
      namespace,
      container,
      tailLines: tail,
      lines: logs
    };
  }

  // 4. Canlı YAML Uygulama (In-Place Edit & Apply)
  applyResourceYaml(yamlString) {
    if (!yamlString || typeof yamlString !== 'string') {
      return { success: false, error: 'Geçersiz veya boş YAML manifestosu.' };
    }
    return {
      success: true,
      message: 'YAML manifestosu kümeye başarıyla uygulandı (configured).'
    };
  }

  // 5. Replicas Ölçekleme (Scale)
  scaleResource(kind = 'Deployment', namespace = 'production', name = 'fintech-api-v2', replicas = 3) {
    const repNum = parseInt(replicas, 10);
    const dep = (this.mockResources.deployments || []).find(d => d.name === name && d.namespace === namespace);
    if (dep) {
      dep.replicas = `${repNum}/${repNum}`;
      dep.upToDate = repNum;
      dep.available = repNum;
    }
    return {
      success: true,
      kind,
      name,
      namespace,
      replicas: repNum,
      message: `'${name}' kaynağı başarıyla ${repNum} replikaya ölçeklendi.`
    };
  }

  // 6. Sıfır Kesintili Yeniden Başlatma (Rollout Restart)
  restartResource(kind = 'Deployment', namespace = 'production', name = 'fintech-api-v2') {
    return {
      success: true,
      kind,
      name,
      namespace,
      restartedAt: new Date().toISOString(),
      message: `'${name}' için sıfır kesintili rollout restart başlatıldı.`
    };
  }

  // 7. Güvenli Kaynak Silme (Safe Delete)
  deleteResource(kind = 'Pod', namespace = 'production', name = 'fintech-api-v2') {
    return {
      success: true,
      kind,
      name,
      namespace,
      message: `'${name}' (${kind}) nesnesi kümeden başarıyla silindi.`
    };
  }

  // 8. Port-Forwarding Yönetimi
  getActivePortForwards() {
    return {
      success: true,
      count: this.activePortForwards.length,
      portForwards: this.activePortForwards
    };
  }

  startPortForward(namespace = 'default', resource = 'Pod/app', targetPort = 80, localPort = 8080) {
    const existing = this.activePortForwards.find(p => p.localPort === parseInt(localPort, 10));
    if (existing) {
      return { success: false, error: `Yerel port ${localPort} zaten başka bir tünel tarafından kullanılıyor.` };
    }

    const newPf = {
      id: `pf-${localPort}-${targetPort}`,
      resource,
      namespace,
      targetPort: parseInt(targetPort, 10),
      localPort: parseInt(localPort, 10),
      status: 'Active (Tunneling)',
      uptime: 'Az önce',
      bytesTransferred: '0 KB',
      localUrl: `http://localhost:${localPort}`
    };

    this.activePortForwards.push(newPf);
    return {
      success: true,
      portForward: newPf,
      message: `Port yönlendirme başlatıldı: localhost:${localPort} ➔ ${resource}:${targetPort}`
    };
  }

  stopPortForward(id) {
    const initialLen = this.activePortForwards.length;
    this.activePortForwards = this.activePortForwards.filter(p => p.id !== id);
    return {
      success: true,
      stopped: initialLen > this.activePortForwards.length,
      message: `Port tüneli #${id} başarıyla sonlandırıldı.`
    };
  }
}

module.exports = new LensService();
