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
    "prov_manual_desc": "Önceden hazır Ubuntu 22.04 sunucularına doğrudan SSH ile kurulum",
    "btn_next_step2": "Sonraki Adım: Sunucu Keşfi ➔",

    // Ops Header
    "ops_live_badge": "● Canlı & Aktif",
    "ops_refresh_btn": "🔄 Canlı Durumu Yenile",
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
    "ops_nav_alerts": "Smart Alerts & Alerts",
    "ops_nav_rightsizing": "FinOps & Rightsizing",
    "ops_nav_certs": "TLS / SSL Certificates",
    "ops_nav_logs": "Live Pod Log Stream",
    "ops_nav_velero": "Velero & S3 Backups",
    "ops_nav_etcd": "etcd Health & Snapshots",
    "ops_nav_hubble": "Hubble eBPF Map",
    "ops_nav_doctor": "AI Diagnostics & Fix",
    "ops_nav_trivy": "Image Security (CVE)",
    "ops_nav_cronjobs": "CronJobs & Schedules",

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
    "prov_manual_desc": "Direct SSH deployment onto pre-installed Ubuntu 22.04 server instances",
    "btn_next_step2": "Next Step: Server Discovery ➔",

    // Ops Header
    "ops_live_badge": "● Live & Healthy",
    "ops_refresh_btn": "🔄 Refresh Live Status",
    "ops_tab_overview": "Overview & Nodes",
    "ops_tab_addons": "Addons",
    "ops_tab_storage": "Storage (NFS)",
    "ops_tab_apps": "Applications",
    "ops_tab_smoke": "Smoke Tests",
    "ops_tab_security": "FortiGate & Security"
  }
};

let currentLanguage = localStorage.getItem('shams_cluster_lang') || 'tr';

function t(key) {
  const dict = translations[currentLanguage] || translations.tr;
  return dict[key] || translations.tr[key] || key;
}

function setLanguage(lang) {
  if (lang !== 'tr' && lang !== 'en') lang = 'tr';
  currentLanguage = lang;
  localStorage.setItem('shams_cluster_lang', lang);
  document.documentElement.lang = lang;

  // Update language buttons state
  const btnTr = document.getElementById('btn-lang-tr');
  const btnEn = document.getElementById('btn-lang-en');
  if (btnTr) btnTr.classList.toggle('active', lang === 'tr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');

  // Translate all elements with data-i18n
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

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const val = t(key);
    if (val) el.setAttribute('placeholder', val);
  });

  // Translate titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    const val = t(key);
    if (val) el.setAttribute('title', val);
  });

  // Update active breadcrumb title based on workspace
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
}

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLanguage);
});
