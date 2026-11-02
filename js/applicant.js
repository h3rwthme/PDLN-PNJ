/* ==========================================================================
   PDLN PNJ — APPLICANT PORTAL (APPLICANT.JS)
   Portal Pengajuan Perjalanan Dinas Luar Negeri Mahasiswa & Dosen PNJ
   ========================================================================== */

class ApplicantPortal {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.activeApp = null;
    this.routeData = {
      origin: 'Depok (Politeknik Negeri Jakarta)',
      destinationCountry: 'Korea Selatan',
      destinationCity: 'Seoul',
      hostInstitution: 'Seoul National University of Science and Technology',
      startDate: '2026-10-15',
      endDate: '2027-02-28',
      purpose: 'student_exchange',
      purposeLabel: 'Pertukaran Mahasiswa (Student Exchange)',
      fundingSource: 'sponsor_eksternal',
      sponsorName: 'Global Korea Scholarship (GKS)',
      isCooperation: true,
      cooperationName: 'MoU PNJ - SeoulTech 2024-2029'
    };
    this.wizardDocs = {
      paspor: null,
      surat_undangan: null,
      sptjm: null,
      bukti_pendanaan: null
    };
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const user = window.pndlStore.getCurrentUser();
    if (!user) return;

    const apps = window.pndlStore.getUserApplications(user.id);
    this.activeApp = apps[0] || null;

    const container = document.getElementById('applicant-portal-root');
    if (!container) return;

    container.innerHTML = `
      <!-- Beranda Pemohon -->
      <div id="applicant-view-dashboard">
        
        <!-- Header Bersih & Aksi Utama -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">Portal Layanan PDLN</h2>
            <p style="font-size: 13.5px; color: #64748B; margin: 0;">Kelola permohonan dinas luar negeri, pantau status berkas resmi, dan pelaporan LPJ PNJ.</p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm" id="btn-open-self-templates" style="font-weight: 600;">
              ${Icons.fileText(14)}
              <span>Unduh Template</span>
            </button>
            <button class="btn btn-primary btn-sm" id="btn-new-application-main" style="font-weight: 700; background: #0A3A60; border-color: #0A3A60; padding: 8px 16px;">
              ${Icons.plus(15)}
              <span>Buat Pengajuan Baru</span>
            </button>
          </div>
        </div>

        <!-- 1. Banner Kelengkapan Profil (Otomatis hilang jika 100%) -->
        ${this.renderProfileCompletenessBanner(user)}

        <!-- 2. Status Berkas Pengajuan Aktif (Hanya jika ada) -->
        ${this.activeApp ? this.renderDossierTicket(this.activeApp) : ''}

        <!-- 3. Riwayat Seluruh Pengajuan -->
        ${this.renderHistoryTable(apps)}
      </div>

      <!-- View Lengkapi Profil -->
      <div id="applicant-view-profile" style="display: none;">
        ${this.renderProfileView(user)}
      </div>

      <!-- View Form Wizard Pengajuan PDLN -->
      <div id="applicant-view-wizard" style="display: none;">
        ${this.renderWizardView(user)}
      </div>

      <!-- LPJ Submission Modal Container -->
      <div id="lpj-modal-container"></div>
    `;

    this.bindDynamicElements();
  }

  // 1. KAI Route Selection Card
  renderKaiRouteCard() {
    const days = this.calculateDays(this.routeData.startDate, this.routeData.endDate);

    return `
      <div class="kai-route-card motion-slide-up" style="margin-bottom: 24px;">
        <div class="kai-route-top">
          <div class="kai-route-title">
            ${Icons.plane(20, 'text-brand')}
            <span>Rencanakan Perjalanan Dinas Luar Negeri Baru</span>
          </div>
          <span class="badge badge-source">
            ${Icons.check(12)} Pra-Pengajuan KUI PNJ
          </span>
        </div>

        <!-- Segmented Activity Selector -->
        <div class="kai-segmented-tabs">
          <button class="kai-segment-btn ${this.routeData.purpose === 'student_exchange' ? 'active' : ''}" data-purpose="student_exchange">
            Student Exchange / IISMA
          </button>
          <button class="kai-segment-btn ${this.routeData.purpose === 'conference' ? 'active' : ''}" data-purpose="conference">
            Konferensi Ilmiah
          </button>
          <button class="kai-segment-btn ${this.routeData.purpose === 'research' ? 'active' : ''}" data-purpose="research">
            Riset Kolaborasi
          </button>
          <button class="kai-segment-btn ${this.routeData.purpose === 'training' ? 'active' : ''}" data-purpose="training">
            Pelatihan Vokasi
          </button>
        </div>

        <!-- Origin -> Destination Grid -->
        <div class="kai-grid">
          <div class="kai-location-box" id="btn-origin-box">
            <div class="kai-loc-label">
              ${Icons.building(14)}
              <span>Kampus Asal</span>
            </div>
            <div class="kai-loc-city">PNJ Depok</div>
            <div class="kai-loc-host">Politeknik Negeri Jakarta</div>
          </div>

          <button class="kai-swap-btn" id="btn-swap-route" title="Tukar rute">
            ${Icons.swap(18)}
          </button>

          <div class="kai-location-box" id="btn-open-dest-sheet">
            <div class="kai-loc-label">
              ${Icons.mapPin(14)}
              <span>Negara & Mitra Tujuan</span>
            </div>
            <div class="kai-loc-city" id="label-dest-city">${this.routeData.destinationCity} (${this.routeData.destinationCountry})</div>
            <div class="kai-loc-host" id="label-dest-host">${this.routeData.hostInstitution}</div>
          </div>
        </div>

        <!-- Date Bar & Duration Counter -->
        <div class="kai-date-grid">
          <div class="kai-date-box">
            <div class="kai-date-label">
              ${Icons.calendar(14)}
              <span>Tanggal Berangkat</span>
            </div>
            <input type="date" id="kai-input-start" class="kai-date-input" value="${this.routeData.startDate}">
          </div>

          <div class="kai-date-box">
            <div class="kai-date-label">
              ${Icons.calendar(14)}
              <span>Tanggal Kepulangan</span>
            </div>
            <input type="date" id="kai-input-end" class="kai-date-input" value="${this.routeData.endDate}">
          </div>

          <div class="kai-duration-badge" id="kai-duration-display">
            ${Icons.clock(15)}
            <span>${days} Hari Dinas</span>
          </div>
        </div>

        <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button class="btn btn-primary" id="btn-start-kai-apply" style="width: 100%; max-width: 260px;">
            ${Icons.arrowRight(16)}
            Isi Formulir Lengkap PDLN
          </button>
        </div>
      </div>
    `;
  }

  // 2. Active Application Dossier Ticket (with Full Lifecycle & Urgency)
  renderDossierTicket(app) {
    const urgency = window.pndlStore.calculateUrgency(app.startDate || app.tanggal_mulai, app.current_status);
    const isRevision = app.current_status === 'REVISION';
    const isApproved = app.current_status === 'APPROVED';
    const isLpjSubmitted = app.current_status === 'LPJ_SUBMITTED';
    const isClosed = app.current_status === 'CLOSED';

    const urgencyBadgeClass = urgency.level === 'CRITICAL' ? 'badge-urgency-critical' :
                             urgency.level === 'URGENT' ? 'badge-urgency-urgent' :
                             urgency.level === 'WARNING' ? 'badge-urgency-warning' : 'badge-urgency-normal';

    const urgencyText = isClosed ? urgency.label : `${urgency.label} (${urgency.daysLeft} Hari Lagi)`;

    return `
      <div class="dossier-ticket motion-slide-up" style="margin-bottom: 24px;">
        
        <!-- Dossier Top Bar -->
        <div class="dossier-top">
          <div class="dossier-route">
            <div class="dossier-node">
              <h3>PNJ DEPOK</h3>
              <p>POLITEKNIK NEGERI JAKARTA</p>
            </div>
            <div class="dossier-arrow">
              ${Icons.arrowRight(20)}
            </div>
            <div class="dossier-node">
              <h3>${(app.destinationCity || app.kota_tujuan || 'TUJUAN').toUpperCase()}</h3>
              <p>${(app.destinationCountry || app.negara_tujuan || 'NEGARA').toUpperCase()}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span class="badge ${urgencyBadgeClass}">
              ${urgencyText}
            </span>
            <span class="badge ${isApproved || isClosed ? 'badge-verified' : isRevision ? 'badge-revision' : 'badge-review'}">
              <span class="badge-dot"></span>
              ${app.statusLabel}
            </span>
          </div>
        </div>

        <!-- Dossier Body -->
        <div class="dossier-body">
          <div class="dossier-grid">
            <div class="dossier-item">
              <span>Nomor Case ID</span>
              <div>${app.case_id || app.id}</div>
            </div>
            <div class="dossier-item">
              <span>Pemohon</span>
              <div>${app.applicantName}</div>
            </div>
            <div class="dossier-item">
              <span>Institusi Mitra</span>
              <div>${app.hostInstitution || app.institusi_tujuan}</div>
            </div>
            <div class="dossier-item">
              <span>Jadwal Perjalanan</span>
              <div>${app.startDate || app.tanggal_mulai} s/d ${app.endDate || app.tanggal_selesai}</div>
            </div>
          </div>

          <div class="dossier-tear"></div>

          <!-- 5-Step Visual Progress Tracker -->
          <div style="margin-bottom: 20px;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--neutral-400); letter-spacing: 0.5px; margin-bottom: 12px;">
              Tahapan Alur Berkas Resmi
            </div>
            <div class="timeline-tracker">
              <!-- Step 1: Usulan Masuk -->
              <div class="timeline-step completed">
                <div class="timeline-step-dot">${Icons.check(12)}</div>
                <div class="timeline-step-text">1. Usulan Masuk</div>
              </div>

              <!-- Step 2: Verifikasi KUI / Revisi -->
              <div class="timeline-step ${isRevision ? 'active' : (!isRevision && app.progress > 40) ? 'completed' : 'active'}">
                <div class="timeline-step-dot">${(!isRevision && app.progress > 40) ? Icons.check(12) : '2'}</div>
                <div class="timeline-step-text">${isRevision ? '2. Perlu Revisi' : '2. Verifikasi KUI'}</div>
              </div>

              <!-- Step 3: Direktur PNJ -->
              <div class="timeline-step ${(!isRevision && app.progress >= 65) ? 'completed' : (!isRevision && app.progress >= 50) ? 'active' : ''}">
                <div class="timeline-step-dot">${(!isRevision && app.progress >= 65) ? Icons.check(12) : '3'}</div>
                <div class="timeline-step-text">3. Direktur PNJ</div>
              </div>

              <!-- Step 4: SRIKANDI (TTE) -->
              <div class="timeline-step ${(!isRevision && app.progress >= 85) ? 'completed' : (!isRevision && app.progress >= 70) ? 'active' : ''}">
                <div class="timeline-step-dot">${(!isRevision && app.progress >= 85) ? Icons.check(12) : '4'}</div>
                <div class="timeline-step-text">4. SRIKANDI (TTE)</div>
              </div>

              <!-- Step 5: SP Kemensetneg -->
              <div class="timeline-step ${isApproved || isClosed ? 'completed' : (!isRevision && app.progress >= 90) ? 'active' : ''}">
                <div class="timeline-step-dot">${(isApproved || isClosed) ? Icons.check(12) : '5'}</div>
                <div class="timeline-step-text">5. SP Kemensetneg</div>
              </div>
            </div>
          </div>

          <!-- Alert Revisi Spesifik -->
          ${isRevision ? `
            <div class="alert-revision-clean motion-slide-up" style="margin-bottom: 16px;">
              <div class="alert-revision-title">
                ${Icons.alertCircle(18)}
                <span>KUI PNJ Meminta Perbaikan Berkas:</span>
              </div>
              <div class="alert-revision-desc">
                ${app.revisionNote || 'Mohon unggah ulang dokumen yang diminta.'}
              </div>
              <div style="margin-top: 12px; display: flex; gap: 10px;">
                <button class="btn btn-primary btn-sm btn-action-open-resubmit" data-appid="${app.case_id || app.id}">
                  ${Icons.upload(14)}
                  Unggah Perbaikan Berkas Sekarang
                </button>
              </div>
            </div>
          ` : ''}

          <!-- SP Terbit Callout & LPJ Submission Button -->
          ${isApproved ? `
            <div class="card" style="padding: 16px 20px; background: #f0fdf4; border: 1px solid #bbf7d0; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h4 style="font-size: 14px; font-weight: 800; color: #166534; margin: 0 0 4px 0;">
                    Surat Persetujuan (SP) Kemensetneg Resmi Terbit!
                  </h4>
                  <p style="font-size: 12px; color: #15803d; margin: 0;">
                    Selamat, perjalanan dinas Anda telah diizinkan. Silakan unduh dokumen SP dan unggah Laporan Pertanggungjawaban (LPJ) setelah kegiatan berakhir.
                  </p>
                </div>
                <button class="btn btn-primary btn-sm btn-open-lpj-modal" data-appid="${app.case_id || app.id}" style="background: #16a34a; border-color: #16a34a;">
                  ${Icons.upload(14)}
                  Unggah LPJ & SPPD
                </button>
              </div>
            </div>
          ` : ''}

          <!-- Footer Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm btn-generate-docx" data-appid="${app.case_id || app.id}" style="background: #f0f9ff; border-color: #bae6fd; color: #0369a1; font-weight: 600;">
              ${Icons.fileText(15)}
              Format Word (.docx)
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderProfileCompletenessBanner(user) {
    const completeness = window.pndlStore.calculateProfileCompleteness(user.id);
    // Jika sudah 100% lengkap, sembunyikan total banner ini agar dashboard bersih
    if (completeness >= 100) {
      return '';
    }

    const profile = window.pndlStore.getUserProfile(user.id) || {};

    // Cek field spesifik yang belum diisi
    const missing = [];
    if (!profile.nik) missing.push('NIK');
    if (!profile.nomor_paspor || !profile.passport_expiry) missing.push('Data Paspor');
    if (!profile.no_telepon) missing.push('No. WhatsApp');
    if (!profile.emergency_name || !profile.emergency_phone) missing.push('Kontak Darurat');

    const descText = `Mohon lengkapi ${missing.join(', ')} agar proses pengajuan berkas tidak perlu diketik manual.`;

    return `
      <div class="card motion-slide-up" style="margin-bottom: 24px; padding: 18px 24px; border-left: 4px solid var(--pnj-blue, #0A3A60);">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: var(--brand-subtle); color: var(--brand-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${Icons.user(22)}
            </div>
            <div>
              <h4 style="font-size: 14.5px; font-weight: 800; color: var(--neutral-950); margin: 0 0 3px 0;">
                Kelengkapan Profil PNJ: <span style="color: #0A3A60;">${completeness}% Lengkap</span>
              </h4>
              <p style="font-size: 12.5px; color: var(--neutral-500); margin: 0;">
                ${descText}
              </p>
            </div>
          </div>
          <button class="btn btn-primary btn-sm btn-nav-profile" style="font-weight: 700;">
            Lengkapi Data Sekarang
          </button>
        </div>
      </div>
    `;
  }

  renderHistoryTable(apps) {
    if (!apps || apps.length === 0) {
      return `
        <div class="card motion-slide-up" style="margin-top: 24px;">
          <div class="card-header">
            <div>
              <h3 class="card-title">Riwayat Berkas Pengajuan PDLN</h3>
              <p class="card-subtitle">Daftar seluruh pra-pengajuan yang terdaftar pada sistem internal KUI PNJ.</p>
            </div>
          </div>
          <div style="padding: 32px; text-align: center; color: var(--neutral-400);">
            Belum ada riwayat pengajuan permohonan dinas luar negeri.
          </div>
        </div>
      `;
    }

    return `
      <div class="card motion-slide-up" style="margin-top: 24px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Riwayat Berkas Pengajuan PDLN Anda</h3>
            <p class="card-subtitle">Daftar seluruh pra-pengajuan yang terdaftar pada sistem internal KUI PNJ.</p>
          </div>
        </div>
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="padding: 12px 18px;">No. Pengajuan</th>
                <th style="padding: 12px 18px;">Tujuan &amp; Mitra</th>
                <th style="padding: 12px 18px;">Kegiatan</th>
                <th style="padding: 12px 18px;">Status Berkas</th>
                <th style="padding: 12px 18px;">Urgensi</th>
              </tr>
            </thead>
            <tbody>
              ${apps.map(a => {
                const urgency = window.pndlStore.calculateUrgency(a.startDate || a.tanggal_mulai, a.current_status);
                return `
                  <tr>
                    <td style="padding: 16px 18px;">
                      <div style="font-weight: 800; color: #0A3A60; font-size: 13.5px;">${a.case_id || a.id}</div>
                      <div style="font-size: 11.5px; color: #64748B; margin-top: 2px;">${a.submittedAt || a.created_at}</div>
                    </td>
                    <td style="padding: 16px 18px;">
                      <div style="font-weight: 700; color: #0F172A; font-size: 13.5px;">${a.destinationCountry} — ${a.destinationCity}</div>
                      <div style="font-size: 12px; color: #64748B; margin-top: 2px;">${a.hostInstitution}</div>
                    </td>
                    <td style="padding: 16px 18px;">
                      <span style="font-weight: 600; color: #334155; font-size: 13px;">${a.purposeLabel}</span>
                    </td>
                    <td style="padding: 16px 18px;">
                      <span class="badge ${a.current_status === 'APPROVED' || a.current_status === 'CLOSED' ? 'badge-verified' : a.current_status === 'REVISION' ? 'badge-revision' : 'badge-review'}">
                        ${a.statusLabel}
                      </span>
                    </td>
                    <td style="padding: 16px 18px;">
                      <span class="badge ${urgency.level === 'CRITICAL' ? 'badge-urgency-critical' : urgency.level === 'URGENT' ? 'badge-urgency-urgent' : 'badge-source'}">
                        ${urgency.label}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  renderProfileView(user) {
    const profile = window.pndlStore.getUserProfile(user.id) || {};

    return `
      <div class="card motion-slide-up" style="max-width: 800px; margin: 0 auto;">
        <div class="card-header">
          <div>
            <h3 class="card-title">Profil Akademik Pemohon (Single Sign-On PNJ)</h3>
            <p class="card-subtitle">Data resmi institusi terverifikasi kampus PNJ, otomatis digunakan pada seluruh formulir.</p>
          </div>
          <button class="btn btn-secondary btn-sm btn-back-dashboard">
            ${Icons.arrowLeft(14)} Kembali
          </button>
        </div>

        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--neutral-400); letter-spacing: 0.5px; margin-bottom: 12px;">
          1. Data Terverifikasi Kampus PNJ (Hanya-Baca)
        </div>

        <div class="form-grid" style="margin-bottom: 24px;">
          <div class="verified-field-box">
            <div class="verified-field-info">
              <span class="verified-field-label">NIM / NIP</span>
              <span class="verified-field-val">${user.identity_number || user.nim_nip}</span>
            </div>
            <span class="badge badge-source">${Icons.check(11)} Terverifikasi SSO</span>
          </div>
          <div class="verified-field-box">
            <div class="verified-field-info">
              <span class="verified-field-label">Nama Lengkap</span>
              <span class="verified-field-val">${user.full_name || user.name}</span>
            </div>
            <span class="badge badge-source">${Icons.check(11)} Terverifikasi SSO</span>
          </div>
          <div class="verified-field-box">
            <div class="verified-field-info">
              <span class="verified-field-label">Jurusan</span>
              <span class="verified-field-val">${user.unit_department || user.jurusan}</span>
            </div>
            <span class="badge badge-source">${Icons.check(11)} Terverifikasi SSO</span>
          </div>
          <div class="verified-field-box">
            <div class="verified-field-info">
              <span class="verified-field-label">Program Studi</span>
              <span class="verified-field-val">${user.prodi}</span>
            </div>
            <span class="badge badge-source">${Icons.check(11)} Terverifikasi SSO</span>
          </div>
        </div>

        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--neutral-400); letter-spacing: 0.5px; margin-bottom: 12px;">
          2. Data Paspor & Kontak Mandiri (Dapat Diperbarui)
        </div>

        <form id="form-edit-profile">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Email Kampus Resmi</label>
              <input type="email" class="form-control" value="${user.email}" disabled>
            </div>
            <div class="form-group">
              <label class="form-label">Nomor WhatsApp / HP Aktif <span class="required">*</span></label>
              <input type="tel" id="prof-phone" class="form-control" value="${profile.no_telepon || ''}" required>
            </div>
            <div class="form-group">
              <label class="form-label">NIK (Nomor Induk Kependudukan)</label>
              <input type="text" id="prof-nik" class="form-control" value="${profile.nik || ''}" placeholder="16 digit NIK">
            </div>
            <div class="form-group">
              <label class="form-label">Nomor Paspor RI (Aktif)</label>
              <input type="text" id="prof-passport" class="form-control" value="${profile.nomor_paspor || ''}" placeholder="Contoh: B1234567">
            </div>
            <div class="form-group">
              <label class="form-label">Masa Berlaku Paspor</label>
              <input type="date" id="prof-passport-exp" class="form-control" value="${profile.passport_expiry || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Nama Kontak Darurat</label>
              <input type="text" id="prof-emer-name" class="form-control" value="${profile.emergency_name || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">No. HP Kontak Darurat</label>
              <input type="tel" id="prof-emer-phone" class="form-control" value="${profile.emergency_phone || ''}">
            </div>
          </div>

          <div style="text-align: right; margin-top: 16px;">
            <button type="submit" class="btn btn-primary">
              Simpan Profil Mandiri
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // 3. Form Wizard Pengajuan PDLN with Auto-completeness check
  renderWizardView(user) {
    return `
      <div style="max-width: 860px; margin: 0 auto;">
        
        <!-- Step Indicator Top Bar -->
        <div class="card motion-slide-up" style="padding: 16px 24px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13.5px;">
              <span class="badge badge-review">Langkah ${this.currentStep} dari ${this.totalSteps}</span>
              <span id="wizard-step-title">
                ${this.currentStep === 1 ? '1. Konfirmasi Profil & Rute Perjalanan' : this.currentStep === 2 ? '2. Sumber Pendanaan & Kemitraan' : '3. Unggah Berkas & Validasi Kelengkapan'}
              </span>
            </div>
            <button class="btn btn-secondary btn-sm btn-back-dashboard">
              ${Icons.x(14)} Batalkan
            </button>
          </div>
        </div>

        <div class="card motion-scale-in">
          
          <!-- Step 1: Profil & Rute -->
          <div class="step-pane ${this.currentStep === 1 ? 'active' : ''}" id="step-1">
            <div class="card-header">
              <div>
                <h3 class="card-title">1. Data Pemohon & Rencana Kunjungan</h3>
                <p class="card-subtitle">Data pemohon ditarik otomatis dari akun SSO PNJ tanpa perlu diketik ulang.</p>
              </div>
            </div>

            <div class="form-grid" style="margin-bottom: 20px;">
              <div class="verified-field-box">
                <div class="verified-field-info">
                  <span class="verified-field-label">Nama Pemohon</span>
                  <span class="verified-field-val">${user.full_name || user.name}</span>
                </div>
                <span class="badge badge-source">${Icons.check(11)} Profil SSO</span>
              </div>
              <div class="verified-field-box">
                <div class="verified-field-info">
                  <span class="verified-field-label">NIM / NIP</span>
                  <span class="verified-field-val">${user.identity_number || user.nim_nip}</span>
                </div>
                <span class="badge badge-source">${Icons.check(11)} Profil SSO</span>
              </div>
              <div class="form-group">
                <label class="form-label">Negara Tujuan <span class="required">*</span></label>
                <input type="text" id="wiz-dest-country" class="form-control" value="${this.routeData.destinationCountry}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Kota Tujuan <span class="required">*</span></label>
                <input type="text" id="wiz-dest-city" class="form-control" value="${this.routeData.destinationCity}" required>
              </div>
              <div class="form-group" style="grid-column: 1 / -1;">
                <label class="form-label">Institusi / Universitas / Lembaga Mitra Tujuan <span class="required">*</span></label>
                <input type="text" id="wiz-host-inst" class="form-control" value="${this.routeData.hostInstitution}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tanggal Mulai Dinas <span class="required">*</span></label>
                <input type="date" id="wiz-start-date" class="form-control" value="${this.routeData.startDate}" required>
              </div>
              <div class="form-group">
                <label class="form-label">Tanggal Selesai Dinas <span class="required">*</span></label>
                <input type="date" id="wiz-end-date" class="form-control" value="${this.routeData.endDate}" required>
              </div>
            </div>
          </div>

          <!-- Step 2: Kerjasama & Pembiayaan -->
          <div class="step-pane ${this.currentStep === 2 ? 'active' : ''}" id="step-2">
            <div class="card-header">
              <div>
                <h3 class="card-title">2. Aspek Kerjasama & Sumber Pendanaan</h3>
                <p class="card-subtitle">Informasi keabsahan kemitraan institusi dan pembiayaan dinas.</p>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Apakah perjalanan dinas ini berbasis MoU/MoA resmi PNJ?</label>
              <div style="display: flex; gap: 20px; margin-top: 8px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px;">
                  <input type="radio" name="wiz-coop" value="yes" ${this.routeData.isCooperation ? 'checked' : ''}>
                  <strong>Ya, terdapat MoU/MoA aktif</strong>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13.5px;">
                  <input type="radio" name="wiz-coop" value="no" ${!this.routeData.isCooperation ? 'checked' : ''}>
                  <strong>Bukan Kerjasama Resmi</strong>
                </label>
              </div>
            </div>

            <div id="wiz-coop-name-box" class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Nama Dokumen / Nomor MoU Mitra</label>
              <input type="text" id="wiz-coop-name" class="form-control" value="${this.routeData.cooperationName}">
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Sumber Pembiayaan <span class="required">*</span></label>
              <select id="wiz-funding-source" class="form-control">
                <option value="sponsor_eksternal" ${this.routeData.fundingSource === 'sponsor_eksternal' ? 'selected' : ''}>Sponsor / Beasiswa Eksternal</option>
                <option value="pnj" ${this.routeData.fundingSource === 'pnj' ? 'selected' : ''}>DIPA PNJ</option>
                <option value="pribadi" ${this.routeData.fundingSource === 'pribadi' ? 'selected' : ''}>Biaya Mandiri / Pribadi</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Nama Lembaga Pendukung / Sponsor / Mata Anggaran</label>
              <input type="text" id="wiz-sponsor-name" class="form-control" value="${this.routeData.sponsorName}">
            </div>

            <div class="form-group">
              <label class="form-label">Rencana Tindak Lanjut & Output bagi PNJ <span class="required">*</span></label>
              <textarea id="wiz-followup" class="form-control" rows="3" placeholder="Contoh: Publikasi paper Scopus, transfer SKS kurikulum OBE, kerjasama riset lanjutan...">Diseminasi hasil kegiatan dan transfer keilmuan ke jurusan.</textarea>
            </div>
          </div>

          <!-- Step 3: Berkas Dokumen & Validasi Kelengkapan -->
          <div class="step-pane ${this.currentStep === 3 ? 'active' : ''}" id="step-3">
            <div class="card-header">
              <div>
                <h3 class="card-title">3. Dokumen Persyaratan Digital & Checklist Kelengkapan</h3>
                <p class="card-subtitle">Format didukung: PDF (Maks. 5MB per berkas). Sistem memeriksa kelengkapan secara otomatis.</p>
              </div>
            </div>

            <!-- Upload Row 1: Paspor -->
            <div class="verified-field-box" style="margin-bottom: 12px;">
              <div>
                <strong style="font-size: 13.5px;">1. Scan Paspor RI (Aktif min. 6 bulan) <span class="required">*</span></strong>
                <div style="font-size: 12px; color: var(--neutral-500);" id="lbl-file-paspor">
                  ${this.wizardDocs.paspor ? this.wizardDocs.paspor.name : 'Paspor_RI_Aktif.pdf (1.2 MB)'}
                </div>
              </div>
              <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                ${Icons.upload(13)} Ganti File
                <input type="file" class="mock-upload-input" data-doc="paspor" style="display: none;">
              </label>
            </div>

            <!-- Upload Row 2: LoA -->
            <div class="verified-field-box" style="margin-bottom: 12px;">
              <div>
                <strong style="font-size: 13.5px;">2. Surat Undangan Resmi / Letter of Acceptance (LoA) <span class="required">*</span></strong>
                <div style="font-size: 12px; color: var(--neutral-500);" id="lbl-file-loa">
                  ${this.wizardDocs.surat_undangan ? this.wizardDocs.surat_undangan.name : 'LoA_Undangan_Mitra.pdf (2.4 MB)'}
                </div>
              </div>
              <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                ${Icons.upload(13)} Ganti File
                <input type="file" class="mock-upload-input" data-doc="surat_undangan" style="display: none;">
              </label>
            </div>

            <!-- Upload Row 3: SPTJM -->
            <div class="verified-field-box" style="margin-bottom: 12px;">
              <div>
                <strong style="font-size: 13.5px;">3. SPTJM Bermaterai Rp10.000 <span class="required">*</span></strong>
                <div style="font-size: 12px; color: var(--neutral-500);" id="lbl-file-sptjm">
                  ${this.wizardDocs.sptjm ? this.wizardDocs.sptjm.name : 'SPTJM_Bermaterai.pdf (850 KB)'}
                </div>
              </div>
              <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
                ${Icons.upload(13)} Ganti File
                <input type="file" class="mock-upload-input" data-doc="sptjm" style="display: none;">
              </label>
            </div>

            <!-- Pre-submission Completeness Verification Box -->
            <div class="card" style="padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; margin-top: 18px;">
              <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">
                ${Icons.checkCircle(14, 'text-brand')} Status Validasi Kelengkapan Berkas (100% Wajib untuk Submit)
              </h4>
              <div id="completeness-checklist-feed" style="font-size: 12px; color: var(--neutral-700); line-height: 1.6;">
                <div>${Icons.check(12)} Data Rute & Destinasi: Lengkap</div>
                <div>${Icons.check(12)} Skema Sumber Pendanaan: Lengkap</div>
                <div>${Icons.check(12)} Dokumen Paspor, LoA, & SPTJM: Terpenuhi</div>
              </div>
            </div>

            <div style="background: var(--neutral-50); border: 1px solid var(--neutral-200); padding: 14px; border-radius: var(--radius-md); margin-top: 18px;">
              <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-size: 12.5px;">
                <input type="checkbox" id="wiz-consent" checked style="margin-top: 3px;">
                <span>Saya menyatakan dengan sesungguhnya bahwa seluruh data dan dokumen yang saya berikan adalah benar dan sah sesuai ketentuan Politeknik Negeri Jakarta dan Kemensetneg RI.</span>
              </label>
            </div>
          </div>

          <!-- Wizard Footer Controls -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--neutral-100);">
            <button class="btn btn-secondary btn-wiz-prev" ${this.currentStep === 1 ? 'disabled style="opacity: 0.5;"' : ''}>
              ${Icons.arrowLeft(14)} Sebelumnya
            </button>
            <button class="btn btn-primary btn-wiz-next">
              ${this.currentStep === this.totalSteps ? 'Kirim Permohonan PDLN' : 'Lanjutkan ' + Icons.arrowRight(14)}
            </button>
          </div>

        </div>
      </div>
    `;
  }

  // Calculate days between two dates
  calculateDays(start, end) {
    if (!start || !end) return 1;
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }

  switchSubView(viewName) {
    const dash = document.getElementById('applicant-view-dashboard');
    const prof = document.getElementById('applicant-view-profile');
    const wiz = document.getElementById('applicant-view-wizard');

    if (dash) dash.style.display = viewName === 'dashboard' ? 'block' : 'none';
    if (prof) prof.style.display = viewName === 'profile' ? 'block' : 'none';
    if (wiz) wiz.style.display = viewName === 'wizard' ? 'block' : 'none';
  }

  // Modal Unggah LPJ & SPPD
  openLpjModal(appId) {
    const modalContainer = document.getElementById('lpj-modal-container');
    if (!modalContainer) return;

    const app = window.pndlStore.getApplicationById(appId);
    if (!app) return;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="lpj-modal">
        <div class="modal-content" style="max-width: 640px;">
          <div class="sheet-drag-handle"></div>
          <div class="card-header" style="padding: 18px 24px; background: #15803d; color: var(--white); margin: 0;">
            <div>
              <h3 class="card-title" style="color: var(--white);">
                ${Icons.fileText(18)} Unggah Laporan Pertanggungjawaban (LPJ) & SPPD
              </h3>
              <p class="card-subtitle" style="color: #bbf7d0;">
                Kasus: <strong>${app.case_id || app.id}</strong> — ${app.applicantName}
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-lpj-modal" style="color: var(--white); background: rgba(255,255,255,0.2); border: none;">
              ${Icons.x(14)}
            </button>
          </div>

          <form id="form-submit-lpj" style="padding: 24px;">
            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Tim / Delegasi yang Bertugas</label>
              <input type="text" id="lpj-team" class="form-control" value="${app.applicantName}" required>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Ringkasan Materi & Capaian Kegiatan <span class="required">*</span></label>
              <textarea id="lpj-materi" class="form-control" rows="3" placeholder="Jelaskan ringkasan presentasi/kegiatan dinas luar negeri..." required></textarea>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Rencana Tindak Lanjut & Rekomendasi bagi PNJ <span class="required">*</span></label>
              <textarea id="lpj-followup" class="form-control" rows="2" placeholder="Transfer keilmuan, kerjasama riset, modul ajar OBE..." required></textarea>
            </div>

            <div class="form-group" style="margin-bottom: 14px;">
              <label class="form-label">Total Realisasi Biaya Perjalanan Dinas (Rp) <span class="required">*</span></label>
              <input type="number" id="lpj-cost" class="form-control" placeholder="Contoh: 28500000" required>
            </div>

            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label">Unggah File Laporan Kegiatan PDF & Bukti SPPD</label>
              <div class="verified-field-box">
                <div>
                  <strong style="font-size: 13px;">Laporan_Kegiatan_${app.case_id || app.id}.pdf</strong>
                  <div style="font-size: 11.5px; color: var(--neutral-500);">PDF Resmi bermaterai dan kuitansi pendukung.</div>
                </div>
                <span class="badge badge-source">${Icons.check(11)} Siap Kirim</span>
              </div>
            </div>

            <div style="text-align: right; display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-cancel-lpj">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm" style="background: #15803d; border-color: #15803d;">
                ${Icons.upload(14)} Serahkan LPJ ke KUI PNJ
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const close = () => {
      const el = document.getElementById('lpj-modal');
      if (el) el.remove();
    };

    document.getElementById('btn-close-lpj-modal').onclick = close;
    document.getElementById('btn-cancel-lpj').onclick = close;

    document.getElementById('form-submit-lpj').onsubmit = (e) => {
      e.preventDefault();
      const team = document.getElementById('lpj-team').value.trim();
      const materi = document.getElementById('lpj-materi').value.trim();
      const followup = document.getElementById('lpj-followup').value.trim();
      const cost = document.getElementById('lpj-cost').value;

      window.pndlStore.submitLpj(app.case_id || app.id, {
        tim_bertugas: team,
        materi_kegiatan: materi,
        tindak_lanjut: followup,
        total_realisasi_biaya: cost
      });

      window.pndlApp.showToast('Laporan Pertanggungjawaban (LPJ) berhasil diserahkan ke KUI PNJ!', 'success');
      close();
      this.render();
    };
  }

  bindEvents() {
    window.addEventListener('pndl:user-changed', () => this.render());
    window.addEventListener('pndl:profile-updated', () => this.render());
    window.addEventListener('pndl:auth-changed', () => this.render());
  }

  bindDynamicElements() {
    // Self service templates
    const btnSelfTemplates = document.getElementById('btn-open-self-templates');
    if (btnSelfTemplates) {
      btnSelfTemplates.onclick = () => {
        if (window.pndlWord) window.pndlWord.openTemplateModal();
      };
    }

    // Nav to profile
    document.querySelectorAll('.btn-nav-profile').forEach(b => {
      b.onclick = () => this.switchSubView('profile');
    });

    // Back to dashboard
    document.querySelectorAll('.btn-back-dashboard').forEach(b => {
      b.onclick = () => this.switchSubView('dashboard');
    });

    // Main New Application button
    const btnNewApp = document.getElementById('btn-new-application-main');
    if (btnNewApp) {
      btnNewApp.onclick = () => {
        this.currentStep = 1;
        this.switchSubView('wizard');
      };
    }

    // KAI start apply
    const btnStartKai = document.getElementById('btn-start-kai-apply');
    if (btnStartKai) {
      btnStartKai.onclick = () => {
        this.currentStep = 1;
        this.switchSubView('wizard');
      };
    }

    // KAI Activity Segments
    document.querySelectorAll('.kai-segment-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.kai-segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.routeData.purpose = btn.dataset.purpose;
        this.routeData.purposeLabel = btn.textContent.trim();
      };
    });

    // Profile form submit
    const formProfile = document.getElementById('form-edit-profile');
    if (formProfile) {
      formProfile.onsubmit = (e) => {
        e.preventDefault();
        const user = window.pndlStore.getCurrentUser();
        if (!user) return;

        const phone = document.getElementById('prof-phone').value.trim();
        const nik = document.getElementById('prof-nik').value.trim();
        const passport = document.getElementById('prof-passport').value.trim();
        const passportExp = document.getElementById('prof-passport-exp').value;
        const emerName = document.getElementById('prof-emer-name').value.trim();
        const emerPhone = document.getElementById('prof-emer-phone').value.trim();

        window.pndlStore.updateProfile(user.id, {
          no_telepon: phone,
          nik,
          nomor_paspor: passport,
          passport_expiry: passportExp,
          emergency_name: emerName,
          emergency_phone: emerPhone
        });

        window.pndlApp.showToast('Data profil mandiri berhasil disimpan!', 'success');
        this.switchSubView('dashboard');
      };
    }

    // LPJ Modal trigger
    document.querySelectorAll('.btn-open-lpj-modal').forEach(btn => {
      btn.onclick = () => {
        this.openLpjModal(btn.dataset.appid);
      };
    });

    // Resubmit trigger
    document.querySelectorAll('.btn-action-open-resubmit').forEach(btn => {
      btn.onclick = () => {
        const defaultDoc = 'Paspor_Andi_Pratama_Clear300DPI.pdf';
        const msg = 'Silakan konfirmasi nama berkas PDF paspor yang sudah diperbaiki sesuai catatan KUI:';

        if (window.pndlApp && window.pndlApp.prompt) {
          window.pndlApp.prompt(msg, defaultDoc, 'Unggah Ulang Scan Paspor').then(docName => {
            if (docName) {
              window.pndlStore.resubmitRevision(btn.dataset.appid, 'paspor', docName);
              window.pndlApp.showToast('Dokumen perbaikan berhasil dikirim ke KUI PNJ!', 'success');
              this.render();
            }
          });
        } else {
          const docName = prompt(msg, defaultDoc);
          if (docName) {
            window.pndlStore.resubmitRevision(btn.dataset.appid, 'paspor', docName);
            window.pndlApp.showToast('Dokumen perbaikan berhasil dikirim ke KUI PNJ!', 'success');
            this.render();
          }
        }
      };
    });

    // Generate Word .docx ticket button
    document.querySelectorAll('.btn-generate-docx').forEach(btn => {
      btn.onclick = () => {
        const app = window.pndlStore.getApplicationById(btn.dataset.appid);
        if (window.pndlWord && app) window.pndlWord.openTemplateModal(app);
      };
    });

    // Wizard Previous Button
    const btnWizPrev = document.querySelector('.btn-wiz-prev');
    if (btnWizPrev) {
      btnWizPrev.onclick = () => {
        if (this.currentStep > 1) {
          this.currentStep--;
          this.switchSubView('wizard');
          this.render();
        }
      };
    }

    // Wizard Next / Submit Button with Automatic Completeness Check
    const btnWizNext = document.querySelector('.btn-wiz-next');
    if (btnWizNext) {
      btnWizNext.onclick = () => {
        if (this.currentStep === 1) {
          const country = document.getElementById('wiz-dest-country').value.trim();
          const city = document.getElementById('wiz-dest-city').value.trim();
          const host = document.getElementById('wiz-host-inst').value.trim();
          const start = document.getElementById('wiz-start-date').value;
          const end = document.getElementById('wiz-end-date').value;

          if (!country || !city || !host || !start || !end) {
            window.pndlApp.showToast('Mohon lengkapi seluruh field rute perjalanan wajib!', 'warning');
            return;
          }

          this.routeData.destinationCountry = country;
          this.routeData.destinationCity = city;
          this.routeData.hostInstitution = host;
          this.routeData.startDate = start;
          this.routeData.endDate = end;

          this.currentStep = 2;
          this.render();
          this.switchSubView('wizard');
        } else if (this.currentStep === 2) {
          const funding = document.getElementById('wiz-funding-source').value;
          const sponsor = document.getElementById('wiz-sponsor-name').value.trim();
          const followup = document.getElementById('wiz-followup').value.trim();

          this.routeData.fundingSource = funding;
          this.routeData.sponsorName = sponsor;
          this.routeData.followUpPlan = followup;

          this.currentStep = 3;
          this.render();
          this.switchSubView('wizard');
        } else if (this.currentStep === 3) {
          const consent = document.getElementById('wiz-consent');
          if (consent && !consent.checked) {
            window.pndlApp.showToast('Anda wajib menyetujui pernyataan kebenaran berkas!', 'warning');
            return;
          }

          // Validation completeness engine
          const newApp = window.pndlStore.createApplication({
            destinationCountry: this.routeData.destinationCountry,
            destinationCity: this.routeData.destinationCity,
            hostInstitution: this.routeData.hostInstitution,
            startDate: this.routeData.startDate,
            endDate: this.routeData.endDate,
            purpose: this.routeData.purpose,
            purposeLabel: this.routeData.purposeLabel,
            fundingSource: this.routeData.fundingSource,
            sponsorName: this.routeData.sponsorName,
            isCooperation: this.routeData.isCooperation,
            cooperationName: this.routeData.cooperationName,
            followUpPlan: this.routeData.followUpPlan
          });

          window.pndlApp.showToast(`Pengajuan PDLN berhasil dikirim! (ID: ${newApp.case_id})`, 'success');
          this.currentStep = 1;
          this.switchSubView('dashboard');
          this.render();
        }
      };
    }
  }
}

window.pndlApplicant = new ApplicantPortal();