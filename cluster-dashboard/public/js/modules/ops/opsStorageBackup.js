// ==============================================================================

// OPERATIONS SUBMODULE: STORAGE (NFS), ETCD SNAPSHOTS & VELERO DISASTER RECOVERY

// ==============================================================================

async function triggerEtcdSnapshot() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-take-snapshot');
  if (btn) { btn.disabled = true; btn.innerText = '⏳ Snapshot Alınıyor...'; }

  try {
    const res = await fetch('/api/cluster/etcd/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        action: 'save'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ etcd Snapshot Başarıyla Alındı!\n${data.output || ''}`);
    fetchEtcdSnapshots();
  } catch (err) {
    alert(`Snapshot alınamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📸 Anlık etcd Snapshot Al'; }
  }
}

async function fetchEtcdSnapshots() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('etcd-snapshots-table-body');

  try {
    const res = await fetch('/api/cluster/etcd/snapshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        action: 'list'
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    if (tbody) {
      if (data.snapshots && data.snapshots.length > 0) {
        tbody.innerHTML = '';
        data.snapshots.forEach(s => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-family:'JetBrains Mono'; font-weight:600; color:#fff;">${s.name}</td>
            <td style="font-family:'JetBrains Mono'; font-size:0.8rem;">${s.size || '35 MB'}</td>
            <td style="color:var(--text-muted); font-size:0.8rem;">${s.createdAt || 'Az önce'}</td>
            <td style="font-family:'JetBrains Mono'; font-size:0.75rem; color:var(--text-dim);">${s.location || '/var/lib/rancher/rke2/server/db/snapshots'}</td>
            <td><span class="preflight-status-chip success">✔ Kaydedildi</span></td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align:center; padding:20px; color:var(--text-dim);">
              Kayıtlı snapshot bulunamadı. "Anlık etcd Snapshot Al" butonu ile ilk yedeğinizi alabilirsiniz.
            </td>
          </tr>
        `;
      }
    }
  } catch (err) {
    console.warn('Snapshots listesi alinamadi:', err.message);
  }
}

// 8. DÜĞÜM BAKIM EYLEMLERİ (DRAIN / CORDON / UNCORDON)

async function createNfsStorageClass() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const nfsServer = document.getElementById('nfs-server-ip')?.value.trim();
  const nfsPath = document.getElementById('nfs-share-path')?.value.trim();
  const scName = document.getElementById('nfs-sc-name')?.value.trim() || 'nfs-client';
  const btn = document.getElementById('btn-create-nfs');

  if (!nfsServer || !nfsPath) {
    alert('Lütfen geçerli bir NFS Sunucu IP adresi ve Export paylaşım yolu giriniz (Örn: 10.0.10.250 ve /mnt/tank/k8s-data).');
    return;
  }

  if (btn) { btn.disabled = true; btn.innerText = '⏳ StorageClass Oluşturuluyor...'; }

  try {
    const res = await fetch('/api/cluster/storage/nfs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterIp: ip,
        sshUser: user,
        sshPass: pass,
        nfsServer,
        nfsPath,
        storageClassName: scName
      })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ Dinamik RWX StorageClass (${scName}) başarıyla kuruldu!\n${data.output || ''}`);
  } catch (err) {
    alert(`NFS StorageClass oluşturulamadı: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '⚡ 1-Tıkla RWX StorageClass Oluştur'; }
  }
}

// ==============================================================================
// 15. 1-TIKLA UYGULAMA MAĞAZASI (ARGOCD, PORTAINER, POSTGRES, WHOAMI)
// ==============================================================================

async function fetchVeleroBackups() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const tbody = document.getElementById('velero-backups-table-body');
  if (tbody) tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">⏳ S3 yedek listesi yükleniyor...</td></tr>';

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'list' })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    renderVeleroBackups(data.backups || []);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--danger-text);">Hata: ${err.message}</td></tr>`;
  }
}

function renderVeleroBackups(backups) {
  const tbody = document.getElementById('velero-backups-table-body');
  if (!tbody) return;

  if (!backups || backups.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-dim);">Henüz S3 yedeği bulunamadı.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  backups.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'JetBrains Mono'; font-weight:600; color:#fff;">${b.name}</td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${b.namespaces}</td>
      <td style="font-size:0.8rem; color:var(--primary-glow);">${b.pvcCount}</td>
      <td style="font-family:'JetBrains Mono'; font-size:0.8rem;">${b.size}</td>
      <td style="font-size:0.8rem; color:var(--text-muted);">${b.createdAt}</td>
      <td style="font-size:0.8rem; color:var(--text-dim);">${b.expiration}</td>
      <td><span class="preflight-status-chip success">✔ Tamamlandı</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="restoreVeleroBackup('${b.name}')" style="padding:2px 8px; font-size:0.72rem;">
          ♻️ Geri Yükle
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function triggerVeleroBackup() {
  const { ip, user, pass } = getTargetMasterCredentials();
  const btn = document.getElementById('btn-create-velero');

  if (btn) { btn.disabled = true; btn.innerText = '⏳ S3 Yedeği Alınıyor...'; }

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'create' })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`🎉 ${data.message}`);
    fetchVeleroBackups();
  } catch (err) {
    alert(`Yedekleme başarısız: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.innerText = '📸 1-Tıkla Full Cluster Yedeği Al'; }
  }
}

async function restoreVeleroBackup(backupName) {
  if (!confirm(`'${backupName}' yedeğinden tüm küme ve PVC verileri geri yüklenecektir. Emin misiniz?`)) {
    return;
  }
  const { ip, user, pass } = getTargetMasterCredentials();

  try {
    const res = await fetch('/api/cluster/velero', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterIp: ip, sshUser: user, sshPass: pass, action: 'restore', backupName })
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    alert(`✅ ${data.message}`);
  } catch (err) {
    alert(`Geri yükleme başarısız: ${err.message}`);
  }
}

// ==============================================================================
// 26. HUBBLE eBPF CANLI AĞ AKIŞLARI & SERVİS HARİTASI
// ==============================================================================