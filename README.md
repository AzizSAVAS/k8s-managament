# ☸️ Shamssoftware RKE2 & Kubernetes Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Kubernetes-RKE2-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes RKE2" />
  <img src="https://img.shields.io/badge/Networking-Cilium%20eBPF-F48024?style=for-the-badge&logo=cilium&logoColor=white" alt="Cilium eBPF" />
  <img src="https://img.shields.io/badge/Virtualization-Proxmox%20%7C%20vCenter%20%7C%20Hyper--V-E57000?style=for-the-badge&logo=windows&logoColor=white" alt="Proxmox, vCenter and Hyper-V" />
  <img src="https://img.shields.io/badge/Platform-NodeJS%20v18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/UI-Cyber%20Glass%20Dark-8A2BE2?style=for-the-badge" alt="UI" />
  <img src="https://img.shields.io/badge/Language-TR%20%7C%20EN-blue?style=for-the-badge" alt="Multi-Language" />
</p>

---

## 🌟 Overview

**Shamssoftware RKE2 & Kubernetes Cluster Manager** is an enterprise-grade control center designed to orchestrate, monitor, deploy, and secure Kubernetes clusters across bare-metal and hybrid virtualized environments (**Proxmox VE**, **VMware vCenter** & **Microsoft Hyper-V**).

Equipped with real-time WebSocket-based SSH streaming, automated RKE2 provisioning, Cilium eBPF network visualization, and multi-language support (**English & Türkçe**), it provides system administrators and DevOps engineers with seamless cluster lifecycle operations.

---

## 🚀 Key Features

### 📡 1. Real-time Cluster Observability & Quick Connect
* **Live Telemetry:** Instant extraction of node health, roles, IP allocations, OS kernels, and pod distribution using native JSON parser pipelines.
* **WebSocket SSH Terminal:** Built-in web terminal with PAM / Keyboard-Interactive authentication for remote administration without leaving the browser.
* **Auto Privilege Escalation:** Seamless non-root user execution (`sudo` integration) for secure environments.

### 🏗️ 2. Automated RKE2 & CNI Deployment
* **One-Click RKE2 Cluster Setup:** Automated deployment of master/control-plane and worker nodes with custom token generation.
* **Cilium eBPF Engine:** Native integration with Cilium CNI, Hubble observability, transparent WireGuard encryption, and L7 traffic policies.
* **Ingress & MetalLB:** Quick-deploy MetalLB IP pools and Ingress-NGINX controllers.

### ☁️ 3. Infrastructure & Virtualization Providers
* **Proxmox VE:** Automatic VM discovery, template cloning, CPU/RAM resource allocation, and QEMU guest agent telemetry.
* **VMware vCenter:** Datacenter inventory tracking, ESXi host status, and automated cluster node provisioning.
* **Microsoft Hyper-V:** PowerShell / OpenSSH automation, Generation 2 VM provisioning, dynamic memory allocation, and VHDX template cloning.

### 🛡️ 4. Security, Hardening & Compliance
* **CIS Benchmark Auditing:** Built-in hardening checks for Kubernetes & RKE2 configurations.
* **Secrets & RBAC Governance:** Inspect service accounts, TLS certificate expirations, and secret rotation schedules.

### 🎨 5. Modern Cyber-Glass Interface & Localization
* **Compact Glassmorphism UI:** Ultra-modern dark-mode design optimized for high-density monitoring.
* **Bilingual Support (🇹🇷 Türkçe / 🇬🇧 English):** Instant runtime translation across all navigation elements, modals, charts, and operational logs.

---

## 🏗️ Architecture & Topology

```
+---------------------------------------------------------------------------------+
|                    Shamssoftware Cluster Hub (Browser UI)                       |
|               [ Glassmorphism UI | Multi-Language | WS Console ]                |
+---------------------------------------+-----------------------------------------+
                                        | HTTP / WebSocket (:5050)
+---------------------------------------v-----------------------------------------+
|                          Node.js & Express Core Engine                          |
|  +---------------------+  +--------------------+  +--------------------------+  |
|  |     SSH Service     |  | Proxmox & vCenter  |  | Operations & Health APIs |  |
|  |  (ssh2 / WS Stream) |  |    Integrations    |  |  (JSON kubectl Pipelines)|  |
|  +----------+----------+  +---------+----------+  +------------+-------------+  |
+-------------|-----------------------|--------------------------|----------------+
              | SSH / Sudo            | REST APIs                | Kubectl CLI
              v                       v                          v
   +--------------------+   +-------------------+   +----------------------------+
   |  RKE2 Master Node  |   |  Proxmox VE Node  |   |    Cilium / Hubble CNI     |
   | (HA Control Plane) |   |  VMware vCenter   |   |   (eBPF Network / Sec)     |
   +--------------------+   +-------------------+   +----------------------------+
              |
              +---------------------> RKE2 Worker Nodes
```

---

## 📦 Project Structure

```
rke2/
├── cluster-dashboard/
│   ├── public/                 # Modern Frontend
│   │   ├── css/style.css       # Cyber-glass theme & responsive design
│   │   └── js/
│   │       ├── app.js          # Core UI controller & tab switcher
│   │       ├── i18n.js         # TR / EN localization dictionaries
│   │       └── modules/        # Modular dashboards (Operations, Proxmox, etc.)
│   ├── services/               # Backend Service Layer
│   │   ├── sshService.js       # Resilient SSH & PAM WebSocket terminal
│   │   ├── proxmoxService.js   # Proxmox VE API adapter
│   │   ├── vcenterService.js   # VMware vCenter API adapter
│   │   ├── rke2Installer.js    # Multi-node RKE2 installer
│   │   └── operations/         # Node health, security, and workload ops
│   ├── server.js               # Express & WebSocket orchestration server
│   └── package.json            # Node.js dependencies & scripts
├── start-dashboard.bat         # Single-click launcher for Windows
└── .gitignore                  # Security-first ignore file (keys/configs protected)
```

---

## ⚡ Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) **v18.x or higher**
* Modern Web Browser (Chrome, Edge, Firefox, Brave)
* Target servers with SSH access enabled (Ubuntu, Debian, RHEL, or Rocky Linux)

### 1. Clone the Repository
```bash
git clone https://github.com/AzizSAVAS/k8s-managament.git
cd k8s-managament/cluster-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Platform

#### 🪟 Windows (Single-Click):
Double click `start-dashboard.bat` or run:
```cmd
start-dashboard.bat
```

#### 🐧 Linux / macOS:
```bash
node server.js
```

### 4. Access the Dashboard
Open your browser and navigate to:
```
http://localhost:5050
```

---

## 🔒 Security Best Practices

* **Zero-Leak Policy:** `.gitignore` is pre-configured to strictly prevent staging or committing:
  - Private Keys (`*.pem`, `*.key`, `id_rsa*`, `id_ed25519*`)
  - Certificates (`*.crt`, `*.pfx`, `*.p12`)
  - Kubeconfigs (`kubeconfig*`, `rke2*.yaml`, `k3s.yaml`)
  - Environment files (`.env*`)
* **PAM & Non-Root Execution:** All remote operations run through an isolated bash wrapper (`do_k8s`) with controlled privilege escalation.

---

## 🌍 Localization (i18n)

The application includes an instant runtime language switcher located in the top-right header:
* 🇹🇷 **Türkçe** (Tam yerelleştirilmiş arayüz ve sistem logları)
* 🇬🇧 **English** (Full enterprise localization)

---

## 👨‍💻 Developed by

Crafted with ❤️ by **[Shamssoftware](https://shamssoftware.com)** & **Aziz SAVAŞ**.

* **Repository:** [AzizSAVAS/k8s-managament](https://github.com/AzizSAVAS/k8s-managament)
* **License:** MIT License
