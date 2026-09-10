// ==============================================================================

// WIZARD SUBMODULE: VM TEMPLATES & GOLDEN IMAGE GENERATOR

// Shamssoftware & Aziz SAVAS Enterprise Architecture

// ==============================================================================

function openTemplateModal() {
  const modal = document.getElementById('template-modal');
  if (!modal) return;

  const tabsBar = document.getElementById('modal-tabs-bar');
  const tabAuto = document.getElementById('tab-auto-content');
  const tabManual = document.getElementById('tab-manual-content');
  const tabVcenter = document.getElementById('tab-vcenter-content');

  if (selectedProvider === 'vcenter') {
    if (tabsBar) tabsBar.style.display = 'none';
    if (tabAuto) tabAuto.style.display = 'none';
    if (tabManual) tabManual.style.display = 'none';
    if (tabVcenter) tabVcenter.style.display = 'block';
  } else {
    if (tabsBar) tabsBar.style.display = 'flex';
    if (tabAuto) tabAuto.style.display = 'block';
    if (tabManual) tabManual.style.display = 'none';
    if (tabVcenter) tabVcenter.style.display = 'none';

    // Storages listesini doldur
    const storageSelect = document.getElementById('tpl-storage');
    const existingStorageSelect = document.getElementById('selected-storage');
    if (storageSelect) {
      storageSelect.innerHTML = '';
      if (existingStorageSelect && existingStorageSelect.options.length > 0) {
        for (let i = 0; i < existingStorageSelect.options.length; i++) {
          const opt = existingStorageSelect.options[i];
          if (opt.value) {
            const newOpt = document.createElement('option');
            newOpt.value = opt.value;
            newOpt.innerText = opt.innerText;
            storageSelect.appendChild(newOpt);
          }
        }
      }
      if (storageSelect.options.length === 0) {
        storageSelect.innerHTML = '<option value="local-lvm">local-lvm</option><option value="local-zfs">local-zfs</option>';
      }
    }

    updateSnippet();
  }

  modal.classList.add('active');
}

function copyVcenterOvaUrl() {
  const el = document.getElementById('vcenter-ova-url');
  if (el) {
    navigator.clipboard.writeText(el.innerText.trim()).then(() => {
      alert('OVA URL adresi kopyalandı! vCenter > Deploy OVF Template ekranına yapıştırabilirsiniz.');
    });
  }
}

function closeTemplateModal() {
  const modal = document.getElementById('template-modal');
  if (modal) modal.classList.remove('active');
}

function switchTemplateTab(tab) {
  const tabAuto = document.getElementById('tab-auto-content');
  const tabManual = document.getElementById('tab-manual-content');
  const btnAuto = document.getElementById('tab-btn-auto');
  const btnManual = document.getElementById('tab-btn-manual');

  if (tab === 'auto') {
    tabAuto.style.display = 'block';
    tabManual.style.display = 'none';
    btnAuto.classList.add('active');
    btnManual.classList.remove('active');
  } else {
    tabAuto.style.display = 'none';
    tabManual.style.display = 'block';
    btnAuto.classList.remove('active');
    btnManual.classList.add('active');
    updateSnippet();
  }
}

function updateSnippet() {
  const osVer = document.getElementById('tpl-os-version') ? document.getElementById('tpl-os-version').value : '22.04';
  const vmid = document.getElementById('tpl-vmid') ? document.getElementById('tpl-vmid').value : '9000';
  const storage = document.getElementById('tpl-storage') ? document.getElementById('tpl-storage').value : 'local-lvm';

  const imgUrl = osVer === '24.04'
    ? 'https://cloud-images.ubuntu.com/minimal/releases/noble/release/ubuntu-24.04-minimal-cloudimg-amd64.img'
    : 'https://cloud-images.ubuntu.com/minimal/releases/jammy/release/ubuntu-22.04-minimal-cloudimg-amd64.img';
  const imgName = osVer === '24.04' ? 'noble-minimal-cloudimg-amd64.img' : 'jammy-minimal-cloudimg-amd64.img';

  const snippet = `# --- Proxmox Shell'e Yapıştırın (Hızlı Ubuntu ${osVer} Minimal Cloud-Init, ~300 MB) ---
cd /tmp && curl -sSL -C - "${imgUrl}" -o "${imgName}"
qm destroy ${vmid} 2>/dev/null || true
qm create ${vmid} --name "ubuntu-${osVer.replace('.', '')}-cloudinit" --memory 2048 --cores 2 --net0 virtio,bridge=vmbr0
qm importdisk ${vmid} "/tmp/${imgName}" ${storage}
DISK_VOL=$(qm config ${vmid} | awk '/^unused[0-9]:/ {print $2}' | head -n 1)
qm set ${vmid} --scsihw virtio-scsi-pci --scsi0 "$DISK_VOL"
qm set ${vmid} --ide2 ${storage}:cloudinit
qm set ${vmid} --boot c --bootdisk scsi0
qm set ${vmid} --serial0 socket --vga serial0
qm template ${vmid}
echo "=== TEBRIKLER: Template ${vmid} Başarıyla Oluşturuldu! ==="`;

  const box = document.getElementById('code-snippet-proxmox');
  if (box) box.innerText = snippet;
}

function copyTemplateSnippet() {
  const box = document.getElementById('code-snippet-proxmox');
  const status = document.getElementById('copy-status-text');
  if (box) {
    navigator.clipboard.writeText(box.innerText).then(() => {
      if (status) {
        status.innerText = '✔ Komut panoya kopyalandı! Proxmox >_ Shell ekranına yapıştırabilirsiniz.';
        setTimeout(() => { status.innerText = ''; }, 4000);
      }
    });
  }
}

function appendTemplateLog(msg) {
  const logContent = document.getElementById('tpl-log-content');
  if (!logContent) return;

  const clean = (msg || '').replace(/\r+/g, '\n').replace(/\.{5,}/g, '...');
  const lines = clean.split('\n');

  lines.forEach(rawLine => {
    const line = rawLine.trim();
    if (!line) return;
    if (line.startsWith('...') || line.match(/^[0-9]+K\s+\./)) return;

    const el = document.createElement('div');
    el.style.marginBottom = '3px';
    if (line.includes('===') || line.includes('>>>')) {
      el.style.color = '#38BDF8';
      el.style.fontWeight = '600';
    } else if (line.includes('TAMAMLANDI') || line.includes('BAŞARILI') || line.includes('tamamlandı')) {
      el.style.color = '#34D399';
      el.style.fontWeight = '700';
    } else if (line.includes('HATA') || line.includes('error')) {
      el.style.color = '#F87171';
    } else {
      el.style.color = '#CBD5E1';
    }
    el.innerText = line;
    logContent.appendChild(el);
  });

  logContent.scrollTop = logContent.scrollHeight;
}

async function executeCreateTemplate() {
  const host = document.getElementById('api-host').value.trim();
  const username = document.getElementById('api-user').value.trim() || 'root';
  const password = document.getElementById('api-pass').value.trim();
  const osVer = document.getElementById('tpl-os-version').value;
  const vmid = parseInt(document.getElementById('tpl-vmid').value, 10);
  const storage = document.getElementById('tpl-storage').value;
  const btn = document.getElementById('btn-create-tpl');
  const logBox = document.getElementById('tpl-log-box');
  const logContent = document.getElementById('tpl-log-content');

  if (!host || !password) {
    alert('Lütfen önce Proxmox sunucu IP adresini ve şifresini giriniz!');
    return;
  }

  btn.disabled = true;
  btn.innerText = '⏳ İndiriliyor & Kuruluyor...';
  logBox.style.display = 'block';
  logContent.innerHTML = '';
  appendTemplateLog(`[BAŞLATILDI] Proxmox (${host}) sunucusuna bağlanılıyor...`);

  // WebSocket Baglantisi Kontrol Et
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  if (!ws || ws.readyState !== 1) {
    ws = new WebSocket(`${protocol}//${window.location.host}`);
  }
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'template-log') {
        appendTemplateLog(data.message);
      }
    } catch {}
  };

  try {
    const res = await fetch('/api/templates/create-proxmox-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        username,
        password,
        templateId: vmid,
        storage,
        osVersion: osVer
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    appendTemplateLog(`\n[BAŞARILI] ${data.message}`);
    btn.innerText = '✅ Şablon Hazır!';

    // Ana ekrandaki template dropdown'ina ekle ve sec
    const select = document.getElementById('selected-template');
    if (select) {
      const opt = document.createElement('option');
      opt.value = data.templateId;
      opt.innerText = `${data.templateName} (ID: ${data.templateId}) - 2 CPU, 2048 MB RAM`;
      opt.selected = true;
      select.appendChild(opt);
    }

    setTimeout(() => {
      closeTemplateModal();
      btn.disabled = false;
      btn.innerText = '🚀 İndir & Şablonu Oluştur';
    }, 2500);
  } catch (err) {
    appendTemplateLog(`\n[HATA] ${err.message}\n💡 Alternatif: Proxmox Web GUI'den '>_ Shell' açarak ikinci sekmedeki komutu doğrudan yapıştırabilirsiniz.`);
    btn.disabled = false;
    btn.innerText = '⚡ Tekrar Dene';
  }
}
