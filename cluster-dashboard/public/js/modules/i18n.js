// ==============================================================================
// Shamssoftware RKE2 Cluster Hub - Internationalization (i18n) Module
// Supported Languages: Turkish (TR) & English (EN)
// ==============================================================================

const translations = {
  tr: {
    // Topbar & Breadcrumb
    "breadcrumb_infra": "Altyapı Yönetimi",
    "breadcrumb_clusters": "RKE2 Kümeleri",
    "mode_portal": "Ana Giriş Portalı",
    "mode_wizard": "Kurulum Sihirbazı",
    "mode_operations": "Küme Yönetim & Operasyon",
    "nav_system_ready": "Sistem Hazır",

    // Sidebar: Portal Nav
    "sidebar_launchpad_title": "BAŞLANGIÇ MERKEZİ",
    "portal_nav_home": "Giriş Portalı",
    "portal_nav_wizard": "Yeni Küme Kurulumu",
    "portal_nav_scale": "Küme Genişletme (Scale)",
    "portal_nav_ops": "Küme Yönetim & Bakım",
    "portal_info_card_title": "⚡ SHAMSSOFTWARE HUB",
    "portal_info_card_desc": "Sıfırdan tam yedekli küme kurabilir veya çalışan kümenizi Day-2 masasıyla yönetebilirsiniz.",

    // Sidebar: Wizard Nav
    "sidebar_wizard_title": "Kurulum Aşamaları",
    "sidebar_exit_btn": "🏠 Çıkış",
    "step1_nav_sub": "01 / MOD",
    "step1_nav_title": "Altyapı & Mod",
    "step2_nav_sub": "02 / BAĞLANTI",
    "step2_nav_title": "Sunucu Keşfi",
    "step3_nav_sub": "03 / BOYUT",
    "step3_nav_title": "Küme Ayarları",
    "step4_nav_sub": "04 / TOPOLOJİ",
    "step4_nav_title": "Dağıtım Planı",
    "step5_nav_sub": "05 / KURULUM",
    "step5_nav_title": "Canlı Dağıtım",
    "status_active": "Aktif",
    "status_waiting": "Bekliyor",
    "status_completed": "Bitti",

    // Sidebar: Operations Nav
    "sidebar_ops_title": "Day-2 Yönetim Masası",
    "ops_nav_nodes": "Düğümler & Podlar",
    "ops_nav_addons": "Eklenti Kataloğu",
    "ops_nav_nfs": "Harici Depolama (NFS)",
    "ops_nav_apps": "Uygulama Mağazası",
    "ops_nav_smoke": "Smoke Test & Doğrulama",
    "ops_nav_fortigate": "FortiGate SLB & VIP",
    "ops_nav_cis": "CIS Güvenlik Denetimi",
    "ops_nav_rbac": "RBAC & Kubeconfig",
    "ops_nav_console": "Web kubectl / Shell",
    "ops_nav_netpol": "Cilium Ağ Güvenliği",
    "ops_nav_upgrade": "Sıfır Kesintili Yükseltme",
    "ops_nav_events": "Olay Akışı & Zaman Çizelgesi",
    "ops_nav_alerts": "Akıllı Alarm & Bildirimler",
    "ops_nav_rightsizing": "Kaynak & FinOps Tasarruf",
    "ops_nav_certs": "TLS / SSL Sertifikaları",
    "ops_nav_logs": "Canlı Pod Log Akışı",
    "ops_nav_velero": "Velero & S3 Yedekleme",
    "ops_nav_etcd": "etcd & Küme Bakımı",
    "ops_nav_hubble": "Hubble Servis Haritası",
    "ops_nav_doctor": "Akıllı Teşhis & Onarım",
    "ops_nav_trivy": "İmaj Güvenliği (CVE)",
    "ops_nav_cronjobs": "CronJob & Zamanlanmış",
    "ops_nav_topology": "Canlı Ağ Topolojisi",
    "ops_nav_helm": "Özel Helm Kataloğu",
    "ops_nav_chaos": "Kaos & HA Simülatörü",
    "ops_nav_audit": "Denetim Defteri (Audit)",
    "ops_nav_webhooks": "Slack / Teams Alarmları",
    "ops_nav_registry": "Özel Registry (Harbor)",
    "ops_nav_yaml_ide": "Canlı YAML IDE & Diff",
    "ops_nav_pod_files": "Pod Dosya Gezgini",
    "ops_nav_hpa_studio": "HPA & Ölçekleme Stüdyosu",
    "ops_nav_secrets_vault": "Secret & Config Kasası",
    "ops_nav_finops_calculator": "Bulut Maliyet & ROI",
    "ops_nav_cluster_failover": "Multi-Cluster DR / GSLB",

    // Sidebar: Footer
    "footer_copy": "© 2026 Shamssoftware<br>Tüm hakları saklıdır.",

    // Portal (Workspace Portal)
    "portal_badge": "🏛️ SHAMSSOFTWARE RKE2 & CILIUM HUB",
    "portal_title": "Shamssoftware Kubernetes Küme Portalı",
    "portal_subtitle": "Yüksek erişilebilir (HA) RKE2 & Cilium eBPF küme dağıtımı, canlı telemetri izleme, felaket kurtarma ve kurumsal Day-2 yaşam döngüsü yönetim masası.",
    "portal_prompt": "Bugün hangi operasyonu gerçekleştirmek istiyorsunuz?",

    "card1_chip": "SIFIRDAN KURULUM",
    "card1_title": "Yeni Küme Kurulumu",
    "card1_desc": "Proxmox VE, VMware vCenter veya Bare-Metal üzerinde 5 aşamalı akıllı sihirbaz ile sıfırdan tam yedekli RKE2 & Cilium eBPF kümesi kurun.",
    "card1_f1": "✔ Otomatik Proxmox & vCenter VM Sizing",
    "card1_f2": "✔ Anti-Affinity Çoklu Host Dağıtım Matrisi",
    "card1_f3": "✔ Cloud-Init Ubuntu 22.04 Altın Şablonları",
    "card1_f4": "✔ Canlı WebSocket Dağıtım Günlüğü",
    "card1_btn": "Kurulum Sihirbazını Başlat ➔",

    "card2_chip": "DAY-2 OPERASYON",
    "card2_title": "Küme Yönetim & Bakım Merkezi",
    "card2_desc": "Canlı üretim kümenizin telemetrisine, eBPF ağ güvenliğine, FinOps kaynak optimizasyonuna ve otomatik onarım araçlarına erişin.",
    "card2_f1": "✔ 22 Kurumsal Day-2 Operasyon Modülü",
    "card2_f2": "✔ Hubble eBPF Servis Haritası & Akış Analizi",
    "card2_f3": "✔ Velero S3 Tam Küme & PVC Yedekleme",
    "card2_f4": "✔ AI Doctor Kendi Kendini İyileştirme & FinOps",
    "card2_btn": "Operasyon Merkezine Gir ➔",

    "card3_chip": "KAPASİTE GENİŞLETME",
    "card3_title": "Küme Genişletme & Düğüm Ekleme",
    "card3_desc": "Çalışmakta olan mevcut RKE2 kümenize iş yükü talebine göre kesintisiz yeni Worker veya Master düğümleri dahil edin.",
    "card3_f1": "✔ Canlı Kümeye Sıfır Kesintili Scale-Out",
    "card3_f2": "✔ Otomatik Token & Join Script Üretimi",
    "card3_f3": "✔ Otomatik Yük Dengeleme Entegrasyonu",
    "card3_f4": "✔ Worker Kaynak Havuzunu Genişletme",
    "card3_btn": "Ölçekleme Modunu Aç ➔",

    "quick_connect_title": "Mevcut Canlı Kümeye Hızlı Bağlan",
    "quick_connect_desc": "Master IP ve SSH bilgilerini girerek doğrudan operasyon masasını canlı verilerle açabilirsiniz:",
    "quick_connect_ip_ph": "Master IP (Örn: 10.0.10.11)",
    "quick_connect_user_ph": "Kullanıcı (root)",
    "quick_connect_pass_ph": "SSH Şifresi",
    "quick_connect_btn": "⚡ Doğrudan Bağlan & Aç",

    // Step 1
    "step1_badge": "ADIM 01 / 05 • PLATFORM & KURULUM MODU",
    "step1_card_title": "Kubernetes Kurulum Modu & Altyapı Sağlayıcısı",
    "step1_card_desc": "İşlem hedefinizi (Sıfırdan tam yedekli HA küme veya çalışan kümeye scale-out genişletme) ve hedef sanallaştırma ortamını belirleyin.",
    "step1_mode_lbl": "🎯 Yapılacak İşlem Türünü Seçin",
    "mode_new_title": "Yeni Küme Kurulumu (İlk Kurulum)",
    "mode_new_desc": "Sıfırdan tam yedekli High-Availability (HA) Master & Worker kümesi oluşturun ve Cilium eBPF CNI'yı kurun.",
    "mode_scale_title": "Mevcut Kümeye Düğüm Ekle (Scale-Out)",
    "mode_scale_desc": "Çalışan bir RKE2 kümesine yeni Master (Control-Plane) veya Worker düğümleri dahil ederek kapasiteyi artırın.",
    "step1_prov_title": "Sanallaştırma / Altyapı Sağlayıcısı",
    "step1_prov_desc": "Yeni VM'lerin açılacağı platformu veya mevcut fiziksel/sanal sunucuları seçin.",
    "prov_proxmox_desc": "Proxmox REST API ile otomatik VM klonlama ve Cloud-Init",
    "prov_vcenter_desc": "VMware vSphere vCenter REST API ile OVA şablonu ve Otomasyon",
    "prov_hyperv_desc": "Windows Server / Windows 10/11 Hyper-V ile otomatik VHDX klonlama",
    "prov_manual_desc": "Önceden hazır Ubuntu 22.04 sunucularına doğrudan SSH ile kurulum",
    "btn_next_step2": "Sonraki Adım: Sunucu Keşfi ➔",

    // Ops Header
    "ops_live_badge": "● Canlı & Aktif",
    "ops_refresh_btn": "🔄 Canlı Durumu Yenile",
    "ops_download_kubeconfig": "📥 Kubeconfig İndir (.yaml)",
    "ops_kube_cmd_title": "💻 Lens, k9s & Terminal Bağlantı Komutu",
    "ops_kube_cmd_desc": "İndirdiğiniz kubeconfig dosyasını terminalinizde doğrudan kullanmak için:",
    "ops_copy_btn": "📋 Kopyala",
    "ops_tab_overview": "Genel Bakış & Düğümler",
    "ops_tab_addons": "Eklentiler",
    "ops_tab_storage": "Depolama (NFS)",
    "ops_tab_apps": "Uygulamalar",
    "ops_tab_smoke": "Smoke Test",
    "ops_tab_security": "FortiGate & Güvenlik"
  },

  en: {
    // Topbar & Breadcrumb
    "breadcrumb_infra": "Infrastructure Management",
    "breadcrumb_clusters": "RKE2 Clusters",
    "mode_portal": "Main Launchpad Portal",
    "mode_wizard": "Deployment Wizard",
    "mode_operations": "Cluster Operations Center",
    "nav_system_ready": "System Ready",

    // Sidebar: Portal Nav
    "sidebar_launchpad_title": "LAUNCHPAD PORTAL",
    "portal_nav_home": "Main Portal",
    "portal_nav_wizard": "New Cluster Deployment",
    "portal_nav_scale": "Cluster Scale-Out",
    "portal_nav_ops": "Day-2 Ops Management",
    "portal_info_card_title": "⚡ SHAMSSOFTWARE HUB",
    "portal_info_card_desc": "Deploy an enterprise HA cluster from scratch or manage your production cluster using the Day-2 console.",

    // Sidebar: Wizard Nav
    "sidebar_wizard_title": "Deployment Pipeline",
    "sidebar_exit_btn": "🏠 Exit",
    "step1_nav_sub": "01 / MODE",
    "step1_nav_title": "Infra & Mode",
    "step2_nav_sub": "02 / CONNECT",
    "step2_nav_title": "Server Discovery",
    "step3_nav_sub": "03 / SIZING",
    "step3_nav_title": "Cluster Sizing",
    "step4_nav_sub": "04 / TOPOLOGY",
    "step4_nav_title": "Topology Plan",
    "step5_nav_sub": "05 / DEPLOY",
    "step5_nav_title": "Live Rollout",
    "status_active": "Active",
    "status_waiting": "Waiting",
    "status_completed": "Done",

    // Sidebar: Operations Nav
    "sidebar_ops_title": "Day-2 Operations Desk",
    "ops_nav_nodes": "Nodes & Workloads",
    "ops_nav_addons": "Addon Catalog",
    "ops_nav_nfs": "External Storage (NFS)",
    "ops_nav_apps": "App Catalog / Store",
    "ops_nav_smoke": "Smoke Test & Validation",
    "ops_nav_fortigate": "FortiGate SLB & VIP",
    "ops_nav_cis": "CIS Benchmark Audit",
    "ops_nav_rbac": "RBAC & Kubeconfig",
    "ops_nav_console": "Web kubectl / Shell",
    "ops_nav_netpol": "Cilium Network Security",
    "ops_nav_upgrade": "Zero-Downtime Upgrade",
    "ops_nav_events": "Event Stream & Timeline",
    "ops_nav_alerts": "Smart Alerts & Notifications",
    "ops_nav_rightsizing": "FinOps & Rightsizing",
    "ops_nav_certs": "TLS / SSL Certificates",
    "ops_nav_logs": "Live Pod Log Stream",
    "ops_nav_velero": "Velero & S3 Backups",
    "ops_nav_etcd": "etcd Health & Snapshots",
    "ops_nav_hubble": "Hubble eBPF Map",
    "ops_nav_doctor": "AI Diagnostics & Fix",
    "ops_nav_trivy": "Image Security (CVE)",
    "ops_nav_cronjobs": "CronJobs & Schedules",
    "ops_nav_topology": "Live Topology Map",
    "ops_nav_helm": "Custom Helm Catalog",
    "ops_nav_chaos": "Chaos & HA Simulator",
    "ops_nav_audit": "Audit Trail & Logs",
    "ops_nav_webhooks": "Slack / Teams Alerts",
    "ops_nav_registry": "Private Registry (Harbor)",
    "ops_nav_yaml_ide": "Live YAML IDE & Diff",
    "ops_nav_pod_files": "Pod File Explorer",
    "ops_nav_hpa_studio": "HPA & Autoscaling Studio",
    "ops_nav_secrets_vault": "Secret & Config Vault",
    "ops_nav_finops_calculator": "Cloud Cost & ROI Matrix",
    "ops_nav_cluster_failover": "Multi-Cluster DR / GSLB",

    // Sidebar: Footer
    "footer_copy": "© 2026 Shamssoftware<br>All rights reserved.",

    // Portal (Workspace Portal)
    "portal_badge": "🏛️ SHAMSSOFTWARE RKE2 & CILIUM HUB",
    "portal_title": "Shamssoftware Kubernetes Cluster Portal",
    "portal_subtitle": "High-availability (HA) RKE2 & Cilium eBPF cluster deployment, live telemetry monitoring, disaster recovery, and enterprise Day-2 operations console.",
    "portal_prompt": "Which operation would you like to perform today?",

    "card1_chip": "DEPLOY FROM SCRATCH",
    "card1_title": "New Cluster Deployment",
    "card1_desc": "Deploy a complete high-availability RKE2 & Cilium eBPF cluster from scratch on Proxmox VE, VMware vCenter or Bare-Metal using a 5-step smart wizard.",
    "card1_f1": "✔ Automated Proxmox & vCenter VM Sizing",
    "card1_f2": "✔ Anti-Affinity Multi-Host Distribution Matrix",
    "card1_f3": "✔ Cloud-Init Ubuntu 22.04 Golden Templates",
    "card1_f4": "✔ Real-time WebSocket Deployment Log",
    "card1_btn": "Launch Setup Wizard ➔",

    "card2_chip": "DAY-2 OPERATIONS",
    "card2_title": "Cluster Operations & Maintenance",
    "card2_desc": "Access live production telemetry, Cilium eBPF network security, FinOps resource optimization, and automated self-healing tools.",
    "card2_f1": "✔ 22 Enterprise Day-2 Operations Modules",
    "card2_f2": "✔ Hubble eBPF Service Map & Flow Insights",
    "card2_f3": "✔ Velero S3 Full Cluster & PVC Backup",
    "card2_f4": "✔ AI Doctor Self-Healing & FinOps Insights",
    "card2_btn": "Enter Operations Center ➔",

    "card3_chip": "SCALE CAPACITY",
    "card3_title": "Cluster Scale-Out & Node Expansion",
    "card3_desc": "Seamlessly incorporate new Worker or Master nodes into your running RKE2 cluster to satisfy workload demands without interruption.",
    "card3_f1": "✔ Zero-Downtime Live Cluster Scale-Out",
    "card3_f2": "✔ Automated Join Token & Script Generator",
    "card3_f3": "✔ Automatic Load Balancer Pool Integration",
    "card3_f4": "✔ Worker Resource Pool Expansion",
    "card3_btn": "Open Scale-Out Mode ➔",

    "quick_connect_title": "Quick Connect to Live Cluster",
    "quick_connect_desc": "Provide Master IP and SSH credentials to immediately open the Day-2 management console with live telemetry:",
    "quick_connect_ip_ph": "Master IP (e.g. 10.0.10.11)",
    "quick_connect_user_ph": "User (root)",
    "quick_connect_pass_ph": "SSH Password",
    "quick_connect_btn": "⚡ Connect & Open Live",

    // Step 1
    "step1_badge": "STEP 01 / 05 • PLATFORM & DEPLOY MODE",
    "step1_card_title": "Kubernetes Deployment Mode & Infrastructure Provider",
    "step1_card_desc": "Specify your deployment objective (fresh HA cluster or scale-out existing cluster) and target virtualization infrastructure.",
    "step1_mode_lbl": "🎯 Select Operation Type",
    "mode_new_title": "New Cluster Deployment (Initial Setup)",
    "mode_new_desc": "Build a high-availability (HA) Master & Worker cluster from scratch with Cilium eBPF CNI.",
    "mode_scale_title": "Add Nodes to Cluster (Scale-Out)",
    "mode_scale_desc": "Expand an active RKE2 cluster by provisioning additional Master (Control-Plane) or Worker nodes.",
    "step1_prov_title": "Virtualization / Infrastructure Provider",
    "step1_prov_desc": "Select the target virtualization platform for automated VM cloning or specify bare-metal hosts.",
    "prov_proxmox_desc": "Automated VM cloning and Cloud-Init provisioning via Proxmox REST API",
    "prov_vcenter_desc": "VMware vSphere vCenter REST API with OVA Golden Templates and Automation",
    "prov_hyperv_desc": "Automated VHDX cloning & Gen2 VM provisioning via Hyper-V PowerShell",
    "prov_manual_desc": "Direct SSH deployment onto pre-installed Ubuntu 22.04 server instances",
    "btn_next_step2": "Next Step: Server Discovery ➔",

    // Ops Header
    "ops_live_badge": "● Live & Healthy",
    "ops_refresh_btn": "🔄 Refresh Live Status",
    "ops_download_kubeconfig": "📥 Download Kubeconfig (.yaml)",
    "ops_kube_cmd_title": "💻 Lens, k9s & CLI Connection Command",
    "ops_kube_cmd_desc": "To use the downloaded kubeconfig directly in your terminal:",
    "ops_copy_btn": "📋 Copy",
    "ops_tab_overview": "Overview & Nodes",
    "ops_tab_addons": "Addons",
    "ops_tab_storage": "Storage (NFS)",
    "ops_tab_apps": "Applications",
    "ops_tab_smoke": "Smoke Tests",
    "ops_tab_security": "FortiGate & Security"
  }
};

// ==============================================================================
// PHRASE DICTIONARY FOR GLOBAL DOM AUTO-TRANSLATION (TR <-> EN)
// ==============================================================================
const phraseDictionary = [
  // General & Buttons
  ["Sistem Hazır", "System Ready"],
  ["Aktif", "Active"],
  ["Bekliyor", "Waiting"],
  ["Bitti", "Done"],
  ["Kapat", "Close"],
  ["Geri", "Back"],
  ["Devam Et", "Continue"],
  ["İptal", "Cancel"],
  ["Kaydet", "Save"],
  ["Kopyala", "Copy"],
  ["Temizle", "Clear"],
  ["Yenile", "Refresh"],
  ["İndir", "Download"],
  ["Çıkış", "Exit"],
  ["Hazır", "Ready"],
  ["Yüklendi", "Installed"],
  ["Kuruluyor...", "Installing..."],
  ["Çalıştırılıyor...", "Running..."],
  ["Başarılı", "Successful"],
  ["Hata", "Error"],

  // Topbar & Operations Header
  ["Canlı Durumu Yenile", "Refresh Live Status"],
  ["🔄 Canlı Durumu Yenile", "🔄 Refresh Live Status"],
  ["📥 Kubeconfig İndir (.yaml)", "📥 Download Kubeconfig (.yaml)"],
  ["Kubeconfig İndir", "Download Kubeconfig"],
  ["● Canlı & Aktif", "● Live & Healthy"],
  ["Canlı & Aktif", "Live & Healthy"],
  ["💻 Lens, k9s & Terminal Bağlantı Komutu", "💻 Lens, k9s & CLI Connection Command"],
  ["İndirdiğiniz kubeconfig dosyasını terminalinizde doğrudan kullanmak için:", "To use the downloaded kubeconfig directly in your terminal:"],
  ["📋 Kopyala", "📋 Copy"],

  // Live Metrics & Telemetry Bar
  ["Kubernetes Sürümü", "Kubernetes Version"],
  ["Hazır Düğümler (Ready)", "Ready Nodes"],
  ["CNI Modeli", "CNI Model"],
  ["Toplam Pod Sayısı", "Total Pods Count"],
  ["🖥️ Küme Düğümleri & Bakım Yönetimi", "🖥️ Cluster Nodes & Maintenance Management"],
  ["💡 Düğüm üzerinde bakım yaparken 'Drain' ile iş yüklerini güvenle tahliye edebilirsiniz.", "💡 When maintaining a node, use 'Drain' to safely evict workloads to other nodes."],
  ["Düğüm Adı", "Node Name"],
  ["Rol", "Role"],
  ["Durum", "Status"],
  ["Dahili IP", "Internal IP"],
  ["Kubelet Versiyon", "Kubelet Version"],
  ["OS / Çekirdek", "OS / Kernel"],
  ["Bakım Eylemi", "Maintenance Action"],
  ["Canlı düğüm verisi çekmek için yukarıdaki \"🔄 Canlı Durumu Yenile\" butonuna tıklayınız.", "Click \"🔄 Refresh Live Status\" above to fetch live cluster telemetry."],
  ["🧩 Kritik Sistem Servisleri (kube-system)", "🧩 Critical System Services (kube-system)"],
  ["Pod bilgisi henüz alınamadı veya liste boş.", "Pod telemetry not received yet or cluster list is empty."],

  // Addons Catalog
  ["Kurumsal Kubernetes Eklenti Kataloğu (11 Eklenti)", "Enterprise Kubernetes Addon Catalog (11 Addons)"],
  ["Üretim ortamları için optimize edilmiş, tek tıkla kurulabilen ağ gözlemlenebilirliği, blok depolama, izleme, loglama ve güvenlik eklentileri.", "Production-grade, 1-click installable network observability, block storage, monitoring, logging, and security addons."],
  ["Tüm Eklentiler (11)", "All Addons (11)"],
  ["🌐 Ağ & LoadBalancer (2)", "🌐 Network & LoadBalancer (2)"],
  ["💾 Depolama & Veri (2)", "💾 Storage & Data (2)"],
  ["📊 Gözlemlenebilirlik (3)", "📊 Observability (3)"],
  ["🛡️ Güvenlik & Politika (3)", "🛡️ Security & Policy (3)"],
  ["⚖️ Ölçekleme & FinOps (1)", "⚖️ Scaling & FinOps (1)"],
  ["⚡ 1-Tıkla Aktif Et", "⚡ 1-Click Enable"],
  ["⚡ 1-Tıkla Kur", "⚡ 1-Click Install"],
  ["Longhorn Dağıtık Blok Depolama", "Longhorn Distributed Block Storage"],

  // Storage / NFS
  ["📂 Harici Depolama (NFS StorageClass)", "📂 External Storage (NFS StorageClass)"],
  ["Kurumsal NAS / SAN depolama alanınızı Kubernetes kümesine dinamik PV sağlayıcısı (NFS Subdir External Provisioner) olarak bağlayın.", "Connect your corporate NAS / SAN storage to Kubernetes as a dynamic PV provisioner."],
  ["NFS Sunucu IP Adresi", "NFS Server IP Address"],
  ["NFS Sunucu IP", "NFS Server IP"],
  ["Paylaşım Yolu (Export Path)", "Export Path"],
  ["StorageClass Adı", "StorageClass Name"],
  ["Varsayılan Depolama Yap (Default StorageClass)", "Set as Default StorageClass"],
  ["NFS StorageClass Oluştur & Kümeye Ekle", "Create NFS StorageClass & Apply"],

  // App Store
  ["🚀 Kurumsal Uygulama Mağazası (App Store)", "🚀 Enterprise Application Store"],
  ["Hazır manifestolar ve Helm şablonları ile tek tıkla dağıtım yapın.", "Deploy ready manifests and Helm charts with one click."],
  ["Uygulamayı Dağıt", "Deploy App"],
  ["⚡ 1-Tıkla Dağıt", "⚡ 1-Click Deploy"],

  // Smoke Test
  ["🧪 Uçtan Uca Küme Doğrulama & Smoke Test", "🧪 End-to-End Cluster Validation & Smoke Test"],
  ["Pod oluşturma, DNS çözümleme, servis yönlendirme ve depolama testleri.", "Pod creation, DNS resolution, service routing, and storage tests."],
  ["Smoke Testi Başlat", "Run Smoke Test"],
  ["⚡ Kapsamlı Smoke Testi Başlat", "⚡ Run Full Smoke Test"],

  // FortiGate
  ["🛡️ FortiGate Donanımsal Yük Dengeleyici (SLB) & VIP", "🛡️ FortiGate Hardware Load Balancer (SLB) & VIP"],
  ["FortiGate CLI Komutlarını Üret", "Generate FortiGate CLI Commands"],
  ["CLI Yapılandırmasını Üret", "Generate CLI Config"],

  // CIS Benchmark
  ["🔍 CIS Benchmark Kubernetes & RKE2 Güvenlik Denetimi", "🔍 CIS Benchmark Kubernetes & RKE2 Security Audit"],
  ["CIS Kural Denetimini Çalıştır", "Run CIS Compliance Scan"],
  ["⚡ CIS Benchmark Denetimini Başlat", "⚡ Run CIS Benchmark Audit"],

  // RBAC & Kubeconfig
  ["🔒 Rol Tabanlı Yetkilendirme (RBAC) & Kubeconfig Üretici", "🔒 Role-Based Access Control (RBAC) & Kubeconfig Generator"],
  ["Kullanıcı / Servis Hesabı Adı", "User / ServiceAccount Name"],
  ["Yetki Rolü", "Permission Role"],
  ["İzole Kubeconfig Üret & İndir", "Generate & Download Isolated Kubeconfig"],

  // Web Terminal / Console
  ["💻 Web Tabanlı Canlı kubectl & Shell Konsolu", "💻 Web-based Live kubectl & Shell Console"],
  ["Komutu Çalıştır", "Execute Command"],
  ["Hızlı Komutlar:", "Quick Commands:"],

  // etcd
  ["🗄️ etcd Veritabanı Sağlığı & Anlık Yedekleme (Snapshot)", "🗄️ etcd Database Health & Live Snapshot"],
  ["Manuel Snapshot Al", "Take Manual Snapshot"],
  ["⚡ Hemen Snapshot Al", "⚡ Take Instant Snapshot"],

  // Cilium Network Policy
  ["🌐 Cilium eBPF Ağ Güvenliği & NetworkPolicy Tasarlayıcı", "🌐 Cilium eBPF Network Security & Policy Designer"],
  ["Kümeye Uygula", "Apply to Cluster"],
  ["⚡ Politikayı Kümeye Uygula", "⚡ Apply Policy to Cluster"],

  // Zero-Downtime Upgrade
  ["🔄 Sıfır Kesintili Küme Versiyon Yükseltme (Rolling Upgrade)", "🔄 Zero-Downtime Cluster Version Upgrade (Rolling Upgrade)"],
  ["Hedef Sürüm", "Target Version"],
  ["Yükseltmeyi Başlat", "Start Rolling Upgrade"],

  // Events
  ["📜 Küme Olay Akışı & Zaman Çizelgesi (Events)", "📜 Cluster Event Stream & Timeline"],
  ["Olayları Yenile", "Refresh Events"],

  // Alerts
  ["🚨 Akıllı Alarm & Bildirim Entegrasyonları", "🚨 Smart Alerts & Notification Integrations"],
  ["Test Bildirimi Gönder", "Send Test Alert"],
  ["Ayarları Kaydet", "Save Settings"],

  // Rightsizing / FinOps
  ["📊 Kaynak Kullanımı & FinOps Tasarruf Analizi", "📊 Resource Usage & FinOps Savings Analysis"],
  ["Analizi Başlat", "Run Analysis"],

  // TLS & Certs
  ["🔐 TLS / SSL Sertifika Yönetimi & cert-manager", "🔐 TLS / SSL Certificate Management & cert-manager"],
  ["Sertifikaları Tara", "Scan Certificates"],

  // Pod Logs
  ["📜 Canlı Pod Log Akışı (Log Streaming)", "📜 Live Pod Log Stream (Log Streaming)"],
  ["Log Akışını Başlat", "Start Log Stream"],

  // Velero
  ["💾 Velero & S3 Tam Küme & PVC Felaket Kurtarma", "💾 Velero & S3 Full Cluster & PVC Disaster Recovery"],
  ["Tam Küme Yedeği Başlat", "Trigger Full Cluster Backup"],

  // Hubble
  ["🐝 Hubble eBPF Servis Haritası & Canlı Akış Analizi", "🐝 Hubble eBPF Service Map & Flow Insights"],
  ["Akışları Başlat", "Start Live Flow Stream"],

  // AI Doctor
  ["🤖 Akıllı Teşhis & Kendi Kendini Onarma (AI Doctor)", "🤖 Intelligent Diagnostics & Self-Healing (AI Doctor)"],
  ["Küme Sağlık Taraması Yap", "Run Health Diagnostic Scan"],

  // Trivy
  ["🛡️ Konteyner İmaj Güvenliği & CVE Zafiyet Taraması", "🛡️ Container Image Security & CVE Vulnerability Scan"],
  ["Zafiyet Taraması Başlat", "Start Vulnerability Scan"],

  // CronJobs
  ["⚡ CronJob & Zamanlanmış Görev Yönetimi", "⚡ CronJob & Scheduled Task Management"],
  ["CronJob'ları Listele", "List CronJobs"],

  // Wizard Steps (Steps 1 to 5)
  ["ADIM 01 / 05 • PLATFORM & KURULUM MODU", "STEP 01 / 05 • PLATFORM & DEPLOY MODE"],
  ["ADIM 02 / 05 • BAĞLANTI & SUNUCU KEŞFİ", "STEP 02 / 05 • CONNECTION & SERVER DISCOVERY"],
  ["ADIM 03 / 05 • KÜME MİMARİSİ & KAYNAKLAR", "STEP 03 / 05 • CLUSTER ARCHITECTURE & SIZING"],
  ["ADIM 04 / 05 • TOPOLOJİ & DAĞITIM MATRİSİ", "STEP 04 / 05 • TOPOLOGY & DISTRIBUTION MATRIX"],
  ["ADIM 05 / 05 • DAĞITIM & CANLI KURULUM", "STEP 05 / 05 • LIVE ROLLOUT & DEPLOYMENT"],
  ["Proxmox VE Bağlantısı & Sunucu Keşfi", "Proxmox VE Connection & Server Discovery"],
  ["API üzerinden bağlanarak ortamdaki aktif fiziksel sunucuları ve şablonları keşfedin.", "Connect via API to discover active physical hosts and templates."],
  ["Kubernetes Mimarisi & Boyutlandırma", "Kubernetes Architecture & Sizing"],
  ["Master ve Worker sayılarını, IP bloğunuzu ve yüksek erişilebilirlik ayarlarını belirleyin.", "Define Master/Worker counts, IP subnet, and high-availability settings."],
  ["Mevcut Kümeye Düğüm Ekleme (Scale-Out)", "Add Nodes to Existing Cluster (Scale-Out)"],
  ["Mevcut sunucular", "Bare-metal servers"],
  ["Mevcut Sunucular", "Existing Linux Servers"],
  ["Doğrudan SSH", "Direct SSH"],
  ["Halihazırda açık olan Linux sunucularınızın IP'lerini girerek kurun", "Deploy directly to running Linux instances via SSH credentials"],
  ["API v2 Entegrasyonu", "API v2 Integration"],
  ["vSphere 7/8 API", "vSphere 7/8 API"],
  ["İlk Kurulum", "Initial Setup"],
  ["Düğüm Ekleme", "Add Nodes"],
  ["Kullanıcı Adı", "Username"],
  ["Şifre", "Password"],
  ["Port", "Port"],
  ["⚡ Bağlan & Sunucuları Keşfet", "⚡ Connect & Discover Servers"],
  ["Tespit Edilen Fiziksel Sunucular (Node Pool)", "Discovered Physical Hosts (Node Pool)"],
  ["0 Node Aktif", "0 Active Nodes"],
  ["Klonlanacak Cloud-Init Şablonu (Template)", "Target Cloud-Init Template"],
  ["Hedef Disk / Depolama Havuzu (Storage)", "Target Disk / Storage Pool"],
  ["🪄 Şablon Yok mu? Otomatik Oluştur", "🪄 No Template? Auto-Create"],
  ["Küme Ayarlarına Geç ➔", "Proceed to Cluster Sizing ➔"],
  ["Küme Ayarlarına Geç &rarr;", "Proceed to Cluster Sizing &rarr;"],
  ["Dağıtım Planını Oluştur ➔", "Generate Deployment Plan ➔"],
  ["Dağıtım Planını Oluştur &rarr;", "Generate Deployment Plan &rarr;"],
  ["🚀 Kurulumu Başlat (Deploy Cluster)", "🚀 Launch Deployment (Deploy Cluster)"],
  ["🚀 Düğümleri Ekle & Kümeye Kat (Join)", "🚀 Deploy & Join Nodes to Cluster"],
  ["Master (Control-Plane) Sayısı", "Master (Control-Plane) Count"],
  ["HA etcd için 3 önerilir", "3 recommended for HA quorum"],
  ["Worker Sayısı", "Worker Count"],
  ["Uygulama yüklerini taşır", "Hosts application workloads"],
  ["Başlangıç Host No", "Start Host Number"],
  ["İlk IP: 10.0.10.10", "First IP: 10.0.10.10"],
  ["FortiGate VIP / Load Balancer IP", "FortiGate VIP / Load Balancer IP"],
  ["Cluster Secret Token", "Cluster Secret Token"],
  ["Boş bırakılırsa otomatik üretilir", "Auto-generated if left empty"],
  ["Düğüm Ayarları", "Node Settings"],
  ["Ekleme Planı", "Scale Plan"],
  ["Düğüm Kurulumu", "Node Rollout"],
  ["Canlı Kurulum", "Live Rollout"],
  ["Eklenecek Master Sayısı", "Master Nodes to Add"],
  ["Eklenecek Worker Sayısı", "Worker Nodes to Add"],
  ["Yeni Düğümler Başlangıç Host IP", "New Nodes Start Host IP"],
  ["Mevcut Küme API / Join Adresi (VIP veya Master IP)", "Existing Cluster API / Join Address (VIP or Master IP)"],
  ["Mevcut Küme Join Token (Zorunlu)", "Existing Cluster Join Token (Required)"],
  ["➕ Mevcut RKE2 Kümesine Düğüm Ekleme Modu Aktif", "➕ Add Nodes to Existing RKE2 Cluster Mode Active"],

  // Quick connect & Tooltips
  ["Master IP (Örn: 10.0.10.11)", "Master IP (e.g. 10.0.10.11)"],
  ["Kullanıcı (root)", "User (root)"],
  ["SSH Şifresi", "SSH Password"],
  ["⚡ Doğrudan Bağlan & Aç", "⚡ Connect & Open Live"],
  ["Yeni pod girişini engeller", "Prevents scheduling new pods"],
  ["Düğümü tekrar aktif eder", "Re-enables scheduling on node"],
  ["Podları diğer düğümlere tahliye eder", "Safely evicts pods to other nodes"],

  // Hyper-V Provider
  ["Microsoft Hyper-V Bağlantısı & Keşif", "Microsoft Hyper-V Connection & Discovery"],
  ["Microsoft Hyper-V Bağlantısı & Sunucu Keşfi", "Microsoft Hyper-V Connection & Server Discovery"],
  ["⚡ Hyper-V'ye Bağlan & Keşfet", "⚡ Connect to Hyper-V & Discover"],
  ["Tespit Edilen Hyper-V Hostu & Sanal Makineler", "Discovered Hyper-V Host & VMs"],
  ["Klonlanacak Altın VHDX Şablonu (Template)", "Target VHDX Template"],
  ["Hedef Sanal Disk Klasörü (Hyper-V Storage)", "Target Virtual Hard Disks Directory"],
  ["Windows Yönetici Kullanıcısı", "Windows Administrator User"],
  ["Hyper-V Sunucu IP / Hostname (veya localhost)", "Hyper-V Host IP / Hostname (or localhost)"]
];

let currentLanguage = localStorage.getItem('shams_cluster_lang') || 'tr';

function t(key) {
  const dict = translations[currentLanguage] || translations.tr;
  return dict[key] || translations.tr[key] || key;
}

// Global DOM Tree Auto-Translation (covers untagged texts and dynamic buttons)
function translateDomPhrases(targetLang) {
  const isEn = (targetLang === 'en');

  // Text Nodes Walker
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'code' || tag === 'pre') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach(node => {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!trimmed) return;

    for (const [trText, enText] of phraseDictionary) {
      if (isEn) {
        if (trimmed === trText) {
          node.nodeValue = raw.replace(trText, enText);
          break;
        }
      } else {
        if (trimmed === enText) {
          node.nodeValue = raw.replace(enText, trText);
          break;
        }
      }
    }
  });

  // Buttons & Inputs value / placeholder / title
  document.querySelectorAll('input, button, textarea').forEach(el => {
    const ph = el.getAttribute('placeholder');
    if (ph) {
      for (const [trText, enText] of phraseDictionary) {
        if (isEn && ph.includes(trText)) {
          el.setAttribute('placeholder', ph.replace(trText, enText));
        } else if (!isEn && ph.includes(enText)) {
          el.setAttribute('placeholder', ph.replace(enText, trText));
        }
      }
    }
    const title = el.getAttribute('title');
    if (title) {
      for (const [trText, enText] of phraseDictionary) {
        if (isEn && title.includes(trText)) {
          el.setAttribute('title', title.replace(trText, enText));
        } else if (!isEn && title.includes(enText)) {
          el.setAttribute('title', title.replace(enText, trText));
        }
      }
    }
  });
}

function setLanguage(lang) {
  if (lang !== 'tr' && lang !== 'en') lang = 'tr';
  currentLanguage = lang;
  window.currentLanguage = lang;
  localStorage.setItem('shams_cluster_lang', lang);
  document.documentElement.lang = lang;

  // Update language buttons state
  const btnTr = document.getElementById('btn-lang-tr');
  const btnEn = document.getElementById('btn-lang-en');
  if (btnTr) btnTr.classList.toggle('active', lang === 'tr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');

  // 1. Translate all explicit elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) {
      if (val.includes('<') && val.includes('>')) {
        el.innerHTML = val;
      } else {
        el.innerText = val;
      }
    }
  });

  // 2. Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.setAttribute('placeholder', val);
  });

  // 3. Translate titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.setAttribute('title', val);
  });

  // 4. Auto-translate remaining static DOM phrases
  translateDomPhrases(lang);

  // 5. Update active breadcrumb title based on workspace
  const breadcrumb = document.getElementById('breadcrumb-step-title');
  if (breadcrumb) {
    if (typeof currentGlobalWorkspace !== 'undefined') {
      if (currentGlobalWorkspace === 'portal') {
        breadcrumb.innerText = (lang === 'en') ? '00 • Launchpad Portal' : '00 • Karşılama & Başlangıç Portalı';
      } else if (currentGlobalWorkspace === 'wizard') {
        const isScale = (typeof operationMode !== 'undefined' && operationMode === 'scale');
        if (isScale) {
          breadcrumb.innerText = (lang === 'en') ? '01 • Node Scale-Out' : '01 • Düğüm Ekleme (Scale-Out)';
        } else {
          breadcrumb.innerText = (lang === 'en') ? '01 • Infra & Setup Mode' : '01 • Altyapı & Kurulum Modu';
        }
      } else if (currentGlobalWorkspace === 'operations') {
        breadcrumb.innerText = (lang === 'en') ? 'Day-2 • Cluster Operations Desk' : 'Day-2 • Küme Operasyon Masası';
      }
    }
  }

  // 6. Refresh active operations or wizard summaries if loaded
  if (typeof updateOpsHeaderBanner === 'function' && typeof currentGlobalWorkspace !== 'undefined' && currentGlobalWorkspace === 'operations') {
    updateOpsHeaderBanner();
  }
}

// Global helper exports
window.t = t;
window.setLanguage = setLanguage;

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLanguage);
});
