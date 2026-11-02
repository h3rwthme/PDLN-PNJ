/* ==========================================================================
   PDLN PNJ — FORM PENCATATAN MOBILITAS 3-STEP WIZARD (MOBILITY-FORM.JS)
   1. Tujuan & Agenda
   2. Jadwal & Anggota Delegasi
   3. Sumber Dana & Konfirmasi
   ========================================================================== */

class MobilityFormView {
  constructor() {
    this.currentStep = 1;
    this.currentDirection = 'outbound'; // 'outbound' (keluar) | 'inbound' (masuk)
    this.currentCategory = 'mahasiswa';  // 'mahasiswa' | 'dosen'
    this.formData = {
      title: '',
      dept: 'Teknik Informatika dan Komputer',
      country: '',
      city: '',
      institution: '',
      startDate: '2026-10-15',
      endDate: '2026-11-15',
      funding: 'sponsor_eksternal',
      sponsor: '',
      notes: ''
    };
    this.participants = [
      { name: '', idNum: '', role: 'Ketua Delegasi', prodi: '' }
    ];
    this.isSubmitting = false; // NFR P0: Double-submit lock
    this.draftKey = 'mobility_wizard';
  }

  init() {
    this.loadDraftIfAvailable();
  }

  // NFR P0: Load Draft Recovery
  loadDraftIfAvailable() {
    if (!window.pndlStore) return;
    const draft = window.pndlStore.getFormDraft(this.draftKey);
    if (draft && draft.data) {
      if (draft.data.formData) this.formData = Object.assign(this.formData, draft.data.formData);
      if (draft.data.participants && draft.data.participants.length > 0) {
        this.participants = draft.data.participants;
      }
      if (draft.data.currentDirection) this.currentDirection = draft.data.currentDirection;
      if (draft.data.currentCategory) this.currentCategory = draft.data.currentCategory;
    }
  }

  // NFR P0: Tangkap ketikan live saat itu juga agar pindah tab tidak hilang
  captureCurrentStepInputs() {
    if (this.currentStep === 1) {
      const title = document.getElementById('mob-title')?.value;
      const dept = document.getElementById('mob-dept')?.value;
      const country = document.getElementById('mob-country')?.value;
      const city = document.getElementById('mob-city')?.value;
      const inst = document.getElementById('mob-institution')?.value;
      if (title !== undefined) this.formData.title = title;
      if (dept !== undefined) this.formData.dept = dept;
      if (country !== undefined) this.formData.country = country;
      if (city !== undefined) this.formData.city = city;
      if (inst !== undefined) this.formData.institution = inst;
    } else if (this.currentStep === 2) {
      const start = document.getElementById('mob-start-date')?.value;
      const end = document.getElementById('mob-end-date')?.value;
      if (start !== undefined) this.formData.startDate = start;
      if (end !== undefined) this.formData.endDate = end;
      this.syncInputsToState();
    } else if (this.currentStep === 3) {
      const funding = document.getElementById('mob-funding')?.value;
      const sponsor = document.getElementById('mob-sponsor')?.value;
      const notes = document.getElementById('mob-notes')?.value;
      if (funding !== undefined) this.formData.funding = funding;
      if (sponsor !== undefined) this.formData.sponsor = sponsor;
      if (notes !== undefined) this.formData.notes = notes;
    }
    this.triggerAutoSave();
  }

  // NFR P0: Auto-Save Draft
  triggerAutoSave() {
    if (!window.pndlStore) return;
    window.pndlStore.saveFormDraft(this.draftKey, {
      formData: this.formData,
      participants: this.participants,
      currentDirection: this.currentDirection,
      currentCategory: this.currentCategory
    });
    const indicator = document.getElementById('draft-indicator-badge');
    if (indicator) {
      indicator.innerHTML = `${Icons.check(11)} Draf tersimpan otomatis`;
      indicator.style.opacity = '1';
    }
  }

  calculateDuration() {
    if (!this.formData.startDate || !this.formData.endDate) return '1 Hari Dinas';
    const s = new Date(this.formData.startDate);
    const e = new Date(this.formData.endDate);
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      return `${days} Hari Dinas`;
    }
    return '1 Hari Dinas';
  }

  render(prefillOptions = {}) {
    this.loadDraftIfAvailable();
    if (prefillOptions.category) this.currentCategory = prefillOptions.category;
    if (prefillOptions.direction) this.currentDirection = prefillOptions.direction;

    const stats = window.pndlStore.getMobilityStats();
    const user = window.pndlStore.getCurrentUser();
    // Hanya Operator & Admin KUI yang boleh melihat banner statistik & tombol Berita Acara Word / Kembali ke KUI
    const isOnlyKuiStaff = user && (user.role === 'kui_admin' || user.role === 'kui_operator');

    // Auto default first participant to current logged-in user
    if (this.participants.length === 1 && !this.participants[0].name && user) {
      this.participants[0] = {
        name: user.full_name || user.name,
        idNum: user.identity_number || user.nim_nip,
        role: user.role === 'dosen' ? 'Dosen Pembimbing' : 'Ketua Delegasi',
        prodi: user.prodi || 'Teknik Informatika'
      };
    }

    // Top Stats Banner (Hanya muncul jika yang login adalah Staf/Admin KUI)
    const statsBannerHtml = isOnlyKuiStaff ? `
      <div class="mobility-stats-banner" style="margin-bottom: 24px;">
        <div class="ms-banner-header">
          <div>
            <span class="badge badge-source">${Icons.globe(12)} Monitoring Neraca Mobilitas PNJ</span>
            <h2 style="font-size: 18px; font-weight: 800; color: var(--brand-primary); margin: 6px 0 2px 0;">
              Rekapitulasi Orang Keluar &amp; Masuk
            </h2>
            <p style="font-size: 12px; color: var(--neutral-600); margin: 0;">
              Statistik agregat mobilitas internasional civitas akademika PNJ.
            </p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn btn-secondary btn-sm" id="btn-back-to-kui-panel">
              ${Icons.arrowLeft(14)} Kembali ke Panel KUI
            </button>
            <button class="btn btn-primary btn-sm" id="btn-export-all-mobility-word" style="background: var(--brand-primary); color: #fff;">
              ${Icons.fileText(14)} Buat Berita Acara Word (.docx)
            </button>
          </div>
        </div>

        <div class="mobility-stats-grid">
          <div class="mobility-counter-card out">
            <div class="m-card-top">
              <div class="m-badge out">${Icons.plane(12)} <span>KELUAR</span></div>
              <div class="m-total out">${stats.totalOutbound} <small>Orang</small></div>
            </div>
            <div class="m-card-breakdown">
              <div class="m-sub-item"><span>Mahasiswa:</span> <strong>${stats.mhsOutbound} Orang</strong></div>
              <div class="m-sub-item"><span>Dosen/Tendik:</span> <strong>${stats.dosenOutbound} Orang</strong></div>
            </div>
          </div>
          <div class="mobility-counter-card in">
            <div class="m-card-top">
              <div class="m-badge in">${Icons.building(12)} <span>MASUK</span></div>
              <div class="m-total in">${stats.totalInbound} <small>Orang</small></div>
            </div>
            <div class="m-card-breakdown">
              <div class="m-sub-item"><span>Mahasiswa Asing:</span> <strong>${stats.mhsInbound} Orang</strong></div>
              <div class="m-sub-item"><span>Dosen Asing:</span> <strong>${stats.dosenInbound} Orang</strong></div>
            </div>
          </div>
          <div class="mobility-counter-card summary">
            <div class="m-card-top">
              <div class="m-badge summary">TOTAL</div>
              <div class="m-total summary">${stats.totalMobility} <small>Total</small></div>
            </div>
            <div class="m-card-breakdown">
              <div class="m-sub-item"><span>Net Balance:</span> <strong>${stats.netBalance > 0 ? '+' : ''}${stats.netBalance} Orang</strong></div>
              <div class="m-sub-item"><span>Status:</span> <strong style="color: #059669;">Target IKU 8 Tercapai</strong></div>
            </div>
          </div>
        </div>
      </div>
    ` : '';

    const html = `
      <div class="mobility-form-container motion-fade-in" style="max-width: 860px; margin: 0 auto; padding-bottom: 40px;">
        
        ${statsBannerHtml}

        <!-- Header Card -->
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
              Catat Mobilitas Internasional
            </h2>
            <p style="font-size: 13.5px; color: #64748B; margin: 0;">
              Ikuti 3 langkah mudah berikut untuk melaporkan keberangkatan delegasi atau kunjungan tamu mitra PNJ.
            </p>
          </div>
          <div id="draft-indicator-badge" style="
            font-size: 12px; font-weight: 600; color: #059669;
            background: #ECFDF5; border: 1px solid #A7F3D0;
            padding: 4px 10px; border-radius: 20px;
            display: inline-flex; align-items: center; gap: 5px;
            transition: opacity 0.3s;
          ">
            ${Icons.check(11)} Draf tersimpan otomatis
          </div>
        </div>

        <!-- 3-Step Clean Progress Header -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;">
          <div style="background: ${this.currentStep >= 1 ? '#F0F9FF' : '#F8FAFC'}; border: 1.5px solid ${this.currentStep >= 1 ? '#0A3A60' : '#E2E8F0'}; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 1 ? '#0A3A60' : '#CBD5E1'}; color: #FFFFFF; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${this.currentStep > 1 ? Icons.check(14) : '1'}
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: ${this.currentStep >= 1 ? '#0A3A60' : '#94A3B8'};">Langkah 1</div>
              <div style="font-size: 13px; font-weight: 700; color: #0F172A;">Tujuan &amp; Agenda</div>
            </div>
          </div>

          <div style="background: ${this.currentStep >= 2 ? '#F0F9FF' : '#F8FAFC'}; border: 1.5px solid ${this.currentStep >= 2 ? '#0A3A60' : '#E2E8F0'}; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 2 ? '#0A3A60' : '#CBD5E1'}; color: #FFFFFF; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${this.currentStep > 2 ? Icons.check(14) : '2'}
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: ${this.currentStep >= 2 ? '#0A3A60' : '#94A3B8'};">Langkah 2</div>
              <div style="font-size: 13px; font-weight: 700; color: #0F172A;">Jadwal &amp; Peserta</div>
            </div>
          </div>

          <div style="background: ${this.currentStep >= 3 ? '#F0F9FF' : '#F8FAFC'}; border: 1.5px solid ${this.currentStep >= 3 ? '#0A3A60' : '#E2E8F0'}; border-radius: 8px; padding: 12px 14px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${this.currentStep >= 3 ? '#0A3A60' : '#CBD5E1'}; color: #FFFFFF; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${this.currentStep === 3 ? '3' : '3'}
            </div>
            <div>
              <div style="font-size: 10.5px; font-weight: 700; text-transform: uppercase; color: ${this.currentStep >= 3 ? '#0A3A60' : '#94A3B8'};">Langkah 3</div>
              <div style="font-size: 13px; font-weight: 700; color: #0F172A;">Sumber Dana &amp; Kirim</div>
            </div>
          </div>
        </div>

        <!-- Card Form Box -->
        <div class="card" style="padding: 28px; border: 1px solid #E2E8F0; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          ${this.renderStepContent()}
        </div>

      </div>
    `;

    const root = document.getElementById('mobility-portal-root');
    if (root) {
      root.innerHTML = html;
      this.bindEvents();
    }
    return html;
  }

  renderStepContent() {
    if (this.currentStep === 1) {
      return `
        <!-- LANGKAH 1: TUJUAN & AGENDA -->
        <div>
          <!-- Direction Tabs -->
          <div style="display: flex; gap: 10px; margin-bottom: 24px;">
            <button type="button" class="btn ${this.currentDirection === 'outbound' ? 'btn-primary' : 'btn-secondary'} btn-sm btn-mob-dir" data-dir="outbound" style="flex: 1; padding: 10px; font-weight: 700;">
              ${Icons.plane(15)}
              <span>Orang Keluar (Outbound PDLN)</span>
            </button>
            <button type="button" class="btn ${this.currentDirection === 'inbound' ? 'btn-primary' : 'btn-secondary'} btn-sm btn-mob-dir" data-dir="inbound" style="flex: 1; padding: 10px; font-weight: 700;">
              ${Icons.building(15)}
              <span>Orang Masuk (Tamu Asing ke PNJ)</span>
            </button>
          </div>

          <!-- Kategori Delegasi -->
          <div style="margin-bottom: 20px;">
            <label class="form-label" style="font-weight: 700; font-size: 13px; margin-bottom: 8px;">
              Siapa yang Melakukan Mobilitas? <span class="required">*</span>
            </label>
            <div style="display: flex; gap: 12px;">
              <label class="radio-card ${this.currentCategory === 'mahasiswa' ? 'selected' : ''}" style="flex: 1; padding: 10px 14px; border-radius: 8px;">
                <input type="radio" name="mob-category" value="mahasiswa" ${this.currentCategory === 'mahasiswa' ? 'checked' : ''}>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${Icons.user(16)}
                  <span style="font-size: 13px;"><strong>Mahasiswa</strong> (Exchange / Lomba / Magang)</span>
                </div>
              </label>
              <label class="radio-card ${this.currentCategory === 'dosen' ? 'selected' : ''}" style="flex: 1; padding: 10px 14px; border-radius: 8px;">
                <input type="radio" name="mob-category" value="dosen" ${this.currentCategory === 'dosen' ? 'checked' : ''}>
                <div style="display: flex; align-items: center; gap: 8px;">
                  ${Icons.building(16)}
                  <span style="font-size: 13px;"><strong>Dosen / Tendik</strong> (Konferensi / Riset)</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Nama Agenda & Jurusan -->
          <div class="form-row-2" style="margin-bottom: 16px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 12.5px;">Nama Program / Kegiatan <span class="required">*</span></label>
              <input type="text" id="mob-title" class="form-control" value="${this.formData.title}" placeholder="Contoh: Student Exchange Fall 2026 atau Konferensi IEEE" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 12.5px;">Jurusan / Unit PNJ <span class="required">*</span></label>
              <select id="mob-dept" class="form-control">
                <option value="Teknik Informatika dan Komputer" ${this.formData.dept === 'Teknik Informatika dan Komputer' ? 'selected' : ''}>Teknik Informatika dan Komputer</option>
                <option value="Teknik Mesin" ${this.formData.dept === 'Teknik Mesin' ? 'selected' : ''}>Teknik Mesin</option>
                <option value="Teknik Elektro" ${this.formData.dept === 'Teknik Elektro' ? 'selected' : ''}>Teknik Elektro</option>
                <option value="Teknik Sipil" ${this.formData.dept === 'Teknik Sipil' ? 'selected' : ''}>Teknik Sipil</option>
                <option value="Teknik Grafika dan Penerbitan" ${this.formData.dept === 'Teknik Grafika dan Penerbitan' ? 'selected' : ''}>Teknik Grafika dan Penerbitan</option>
                <option value="Akuntansi" ${this.formData.dept === 'Akuntansi' ? 'selected' : ''}>Akuntansi</option>
                <option value="Administrasi Niaga" ${this.formData.dept === 'Administrasi Niaga' ? 'selected' : ''}>Administrasi Niaga</option>
                <option value="Kantor Urusan Internasional" ${this.formData.dept === 'Kantor Urusan Internasional' ? 'selected' : ''}>Kantor Urusan Internasional (KUI)</option>
              </select>
            </div>
          </div>

          <!-- Destinasi & Mitra -->
          <div class="form-row-2" style="margin-bottom: 24px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 12.5px;">${this.currentDirection === 'outbound' ? 'Negara & Kota Tujuan' : 'Negara & Kota Asal'} <span class="required">*</span></label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <input type="text" id="mob-country" class="form-control" value="${this.formData.country}" placeholder="Negara (misal: Jepang)" required>
                <input type="text" id="mob-city" class="form-control" value="${this.formData.city}" placeholder="Kota (misal: Tokyo)" required>
              </div>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 12.5px;">${this.currentDirection === 'outbound' ? 'Lembaga / Perguruan Tinggi Mitra' : 'Lembaga Asal Tamu'} <span class="required">*</span></label>
              <input type="text" id="mob-institution" class="form-control" value="${this.formData.institution}" placeholder="Contoh: Tokyo Institute of Technology" required>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn btn-primary" id="btn-step1-next" style="font-weight: 700; padding: 10px 24px; background: #0A3A60; border-color: #0A3A60;">
              Lanjut ke Jadwal &amp; Peserta →
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 2) {
      return `
        <!-- LANGKAH 2: JADWAL & ANGGOTA DELEGASI -->
        <div>
          <!-- Jadwal Pelaksanaan -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 18px; margin-bottom: 24px;">
            <div style="font-size: 13.5px; font-weight: 700; color: #0F172A; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
              ${Icons.calendar(15)} Waktu Keberangkatan &amp; Kepulangan
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 160px; gap: 14px; align-items: end;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Tanggal Berangkat <span class="required">*</span></label>
                <input type="date" id="mob-start-date" class="form-control" value="${this.formData.startDate}" required>
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Tanggal Kembali <span class="required">*</span></label>
                <input type="date" id="mob-end-date" class="form-control" value="${this.formData.endDate}" required>
              </div>
              <div>
                <label class="form-label" style="font-size: 12px; margin-bottom: 4px;">Total Durasi</label>
                <div class="departure-duration-display" id="mob-duration-badge" style="padding: 9px 12px; border-radius: 6px; font-weight: 700; text-align: center;">
                  ${Icons.clock(13)}
                  <span id="mob-duration-text">${this.calculateDuration()}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Daftar Anggota Rombongan -->
          <div style="margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <div>
                <h4 style="font-size: 14.5px; font-weight: 800; color: #0F172A; margin: 0;">
                  Daftar Nama yang Berangkat (${this.participants.length} Orang)
                </h4>
                <p style="font-size: 12px; color: #64748B; margin: 2px 0 0 0;">
                  Data utama otomatis terisi dari akun Anda. Klik tambah jika bepergian bersama rombongan.
                </p>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-add-participant-row" style="font-weight: 600;">
                ${Icons.plus(13)} Tambah Orang
              </button>
            </div>

            <div style="border: 1px solid #E2E8F0; border-radius: 8px; overflow-x: auto;">
              <table class="data-table" style="width: 100%;">
                <thead>
                  <tr style="background: #F8FAFC;">
                    <th style="width: 35px; text-align: center; padding: 10px;">No</th>
                    <th style="padding: 10px 12px;">Nama Lengkap</th>
                    <th style="width: 170px; padding: 10px 12px;">NIM / NIP / Paspor</th>
                    <th style="width: 160px; padding: 10px 12px;">Peran</th>
                    <th style="width: 170px; padding: 10px 12px;">Prodi / Unit</th>
                    <th style="width: 45px; text-align: center; padding: 10px;"></th>
                  </tr>
                </thead>
                <tbody id="participant-tbody">
                  ${this.renderParticipantRows()}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 18px; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn btn-secondary" id="btn-step2-prev" style="font-weight: 600;">
              ← Kembali
            </button>
            <button type="button" class="btn btn-primary" id="btn-step2-next" style="font-weight: 700; padding: 10px 24px; background: #0A3A60; border-color: #0A3A60;">
              Lanjut ke Sumber Dana →
            </button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 3) {
      return `
        <!-- LANGKAH 3: BIAYA & KONFIRMASI -->
        <div>
          <!-- Sumber Dana -->
          <div class="form-row-2" style="margin-bottom: 20px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 13px;">Sumber Pembiayaan <span class="required">*</span></label>
              <select id="mob-funding" class="form-control">
                <option value="sponsor_eksternal" ${this.formData.funding === 'sponsor_eksternal' ? 'selected' : ''}>Beasiswa Eksternal / Sponsor</option>
                <option value="pnj" ${this.formData.funding === 'pnj' ? 'selected' : ''}>DIPA Politeknik Negeri Jakarta</option>
                <option value="kerjasama" ${this.formData.funding === 'kerjasama' ? 'selected' : ''}>Hibah Kerjasama Bilateral Mitra</option>
                <option value="mandiri" ${this.formData.funding === 'mandiri' ? 'selected' : ''}>Mandiri / Biaya Sendiri</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label" style="font-weight: 600; font-size: 13px;">Nama Sponsor / Beasiswa / Keterangan Dana <span class="required">*</span></label>
              <input type="text" id="mob-sponsor" class="form-control" value="${this.formData.sponsor}" placeholder="Contoh: Beasiswa IISMA / Mandiri (Tabungan Pribadi)" required>
            </div>
          </div>

          <!-- Catatan Tambahan -->
          <div class="form-group" style="margin-bottom: 24px;">
            <label class="form-label" style="font-weight: 600; font-size: 13px;">Catatan Tambahan (Opsional)</label>
            <textarea id="mob-notes" class="form-control" rows="2" placeholder="Tuliskan keterangan pendukung bila ada...">${this.formData.notes}</textarea>
          </div>

          <!-- Ringkasan Konfirmasi -->
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px; margin-bottom: 24px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #0F172A; margin: 0 0 10px 0;">
              Ringkasan Data yang Akan Disimpan:
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
              <div><span style="color: #64748B;">Agenda:</span> <strong>${this.formData.title || 'Belum diisi'}</strong></div>
              <div><span style="color: #64748B;">Tujuan:</span> <strong>${this.formData.country || '-'}, ${this.formData.city || '-'}</strong></div>
              <div><span style="color: #64748B;">Mitra:</span> <strong>${this.formData.institution || '-'}</strong></div>
              <div><span style="color: #64748B;">Jadwal:</span> <strong>${this.formData.startDate} s/d ${this.formData.endDate} (${this.calculateDuration()})</strong></div>
              <div><span style="color: #64748B;">Jumlah Anggota:</span> <strong>${this.participants.length} Orang</strong></div>
              <div><span style="color: #64748B;">Ketua / Pemohon:</span> <strong>${this.participants[0]?.name || '-'}</strong></div>
            </div>
          </div>

          <!-- Navigation & Submit -->
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 18px; border-top: 1px solid #E2E8F0;">
            <button type="button" class="btn btn-secondary" id="btn-step3-prev" style="font-weight: 600;">
              ← Kembali
            </button>
            <button type="button" class="btn btn-primary" id="btn-submit-final" style="font-weight: 700; padding: 10px 28px; background: #0A3A60; border-color: #0A3A60;">
              ${Icons.checkCircle(16)} Simpan &amp; Selesaikan Laporan
            </button>
          </div>
        </div>
      `;
    }
  }

  renderParticipantRows() {
    return this.participants.map((p, idx) => `
      <tr data-idx="${idx}">
        <td style="text-align: center; font-weight: 700; color: #64748B; font-size: 12px; padding: 8px;">${idx + 1}</td>
        <td style="padding: 8px;">
          <input type="text" class="form-control inp-p-name" data-idx="${idx}" placeholder="Nama..." value="${p.name}" required style="font-size: 12.5px; padding: 6px 8px;">
        </td>
        <td style="padding: 8px;">
          <input type="text" class="form-control inp-p-id" data-idx="${idx}" placeholder="NIM / NIP / Paspor" value="${p.idNum}" required style="font-size: 12.5px; padding: 6px 8px;">
        </td>
        <td style="padding: 8px;">
          <select class="form-control inp-p-role" data-idx="${idx}" style="font-size: 12px; padding: 6px;">
            <option value="Ketua Delegasi" ${p.role === 'Ketua Delegasi' ? 'selected' : ''}>Ketua Delegasi</option>
            <option value="Anggota Delegasi" ${p.role === 'Anggota Delegasi' ? 'selected' : ''}>Anggota Delegasi</option>
            <option value="Dosen Pembimbing" ${p.role === 'Dosen Pembimbing' ? 'selected' : ''}>Dosen Pembimbing</option>
            <option value="Peserta Lomba" ${p.role === 'Peserta Lomba' ? 'selected' : ''}>Peserta Lomba</option>
          </select>
        </td>
        <td style="padding: 8px;">
          <input type="text" class="form-control inp-p-prodi" data-idx="${idx}" placeholder="Prodi / Asal" value="${p.prodi}" style="font-size: 12.5px; padding: 6px 8px;">
        </td>
        <td style="text-align: center; padding: 8px;">
          ${this.participants.length > 1 ? `
            <button type="button" class="btn btn-secondary btn-xs btn-remove-p-row" data-idx="${idx}" title="Hapus" style="color: #DC2626; padding: 4px 6px;">
              ${Icons.x(12)}
            </button>
          ` : `
            <span style="color: #94A3B8; font-size: 11px;">Utama</span>
          `}
        </td>
      </tr>
    `).join('');
  }

  saveStep1Data() {
    const title = document.getElementById('mob-title')?.value.trim();
    const dept = document.getElementById('mob-dept')?.value;
    const country = document.getElementById('mob-country')?.value.trim();
    const city = document.getElementById('mob-city')?.value.trim();
    const inst = document.getElementById('mob-institution')?.value.trim();

    if (!title || !country || !city || !inst) {
      if (window.pndlApp && window.pndlApp.alert) {
        window.pndlApp.alert('Mohon lengkapi Nama Program, Negara, Kota, dan Lembaga Mitra sebelum lanjut ke langkah berikutnya.', 'Form Belum Lengkap');
      } else {
        alert('Mohon lengkapi Nama Program, Negara, Kota, dan Lembaga Mitra sebelum lanjut.');
      }
      return false;
    }

    this.formData.title = title;
    this.formData.dept = dept;
    this.formData.country = country;
    this.formData.city = city;
    this.formData.institution = inst;
    this.triggerAutoSave();
    return true;
  }

  saveStep2Data() {
    const start = document.getElementById('mob-start-date')?.value;
    const end = document.getElementById('mob-end-date')?.value;

    if (!start || !end) {
      if (window.pndlApp && window.pndlApp.alert) {
        window.pndlApp.alert('Mohon tentukan tanggal keberangkatan dan tanggal kepulangan dinas.', 'Jadwal Belum Lengkap');
      } else {
        alert('Mohon tentukan tanggal berangkat dan kembali.');
      }
      return false;
    }

    this.formData.startDate = start;
    this.formData.endDate = end;
    this.syncInputsToState();

    if (this.participants.some(p => !p.name.trim() || !p.idNum.trim())) {
      if (window.pndlApp && window.pndlApp.alert) {
        window.pndlApp.alert('Mohon pastikan seluruh baris anggota delegasi telah terisi Nama Lengkap dan NIM/NIP.', 'Data Peserta Belum Lengkap');
      } else {
        alert('Mohon lengkapi Nama dan NIM/NIP untuk setiap anggota rombongan.');
      }
      return false;
    }

    this.triggerAutoSave();
    return true;
  }

  saveStep3Data() {
    this.formData.funding = document.getElementById('mob-funding')?.value || 'sponsor_eksternal';
    const sponsor = document.getElementById('mob-sponsor')?.value.trim();
    this.formData.notes = document.getElementById('mob-notes')?.value.trim() || '';

    if (!sponsor) {
      if (window.pndlApp && window.pndlApp.alert) {
        window.pndlApp.alert('Nama Sponsor / Beasiswa / Keterangan Sumber Dana wajib diisi (misal: Beasiswa IISMA, DIPA PNJ, atau Biaya Mandiri).', 'Sumber Dana Belum Diisi');
      } else {
        alert('Nama Sponsor / Beasiswa / Keterangan Sumber Dana wajib diisi.');
      }
      return false;
    }

    this.formData.sponsor = sponsor;
    return true;
  }

  bindEvents() {
    // Tangkap ketikan live saat user ngetik di input mana pun
    const allInputs = document.querySelectorAll('.mobility-form-container input, .mobility-form-container select, .mobility-form-container textarea');
    allInputs.forEach(el => {
      el.addEventListener('input', () => this.captureCurrentStepInputs());
      el.addEventListener('change', () => this.captureCurrentStepInputs());
    });

    // Direction tabs
    document.querySelectorAll('.btn-mob-dir').forEach(btn => {
      btn.onclick = () => {
        this.captureCurrentStepInputs();
        this.currentDirection = btn.dataset.dir;
        this.updateView();
      };
    });

    // Category radio
    document.querySelectorAll('input[name="mob-category"]').forEach(r => {
      r.onchange = (e) => {
        this.captureCurrentStepInputs();
        this.currentCategory = e.target.value;
        this.updateView();
      };
    });

    // Keyboard Enter Support -> Lanjut ke langkah selanjutnya
    const formInputs = document.querySelectorAll('.mobility-form-container input:not([type="radio"])');
    formInputs.forEach(inp => {
      inp.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.currentStep === 1) {
            const nextBtn = document.getElementById('btn-step1-next');
            if (nextBtn) nextBtn.click();
          } else if (this.currentStep === 2) {
            const nextBtn = document.getElementById('btn-step2-next');
            if (nextBtn) nextBtn.click();
          } else if (this.currentStep === 3) {
            const submitBtn = document.getElementById('btn-submit-final');
            if (submitBtn) submitBtn.click();
          }
        }
      };
    });

    // Step 1 -> Next
    const btnS1Next = document.getElementById('btn-step1-next');
    if (btnS1Next) {
      btnS1Next.onclick = () => {
        if (this.saveStep1Data()) {
          this.currentStep = 2;
          this.updateView();
        }
      };
    }

    // Step 2 -> Prev & Next
    const btnS2Prev = document.getElementById('btn-step2-prev');
    if (btnS2Prev) {
      btnS2Prev.onclick = () => {
        this.saveStep2Data();
        this.currentStep = 1;
        this.updateView();
      };
    }
    const btnS2Next = document.getElementById('btn-step2-next');
    if (btnS2Next) {
      btnS2Next.onclick = () => {
        if (this.saveStep2Data()) {
          this.currentStep = 3;
          this.updateView();
        }
      };
    }

    // Step 3 -> Prev & Submit
    const btnS3Prev = document.getElementById('btn-step3-prev');
    if (btnS3Prev) {
      btnS3Prev.onclick = () => {
        this.saveStep3Data();
        this.currentStep = 2;
        this.updateView();
      };
    }

    // Add row in Step 2
    const btnAddRow = document.getElementById('btn-add-participant-row');
    if (btnAddRow) {
      btnAddRow.onclick = () => {
        this.syncInputsToState();
        this.participants.push({ name: '', idNum: '', role: 'Anggota Delegasi', prodi: '' });
        this.refreshTable();
      };
    }

    // Dates duration calculate
    const startInp = document.getElementById('mob-start-date');
    const endInp = document.getElementById('mob-end-date');
    const updateDur = () => {
      if (startInp && endInp) {
        this.formData.startDate = startInp.value;
        this.formData.endDate = endInp.value;
        const txt = document.getElementById('mob-duration-text');
        if (txt) txt.textContent = this.calculateDuration();
      }
    };
    if (startInp) startInp.onchange = updateDur;
    if (endInp) endInp.onchange = updateDur;

    // Final Submit with NFR P0: Double-Submit Protection
    const btnSubmit = document.getElementById('btn-submit-final');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        if (this.isSubmitting) return;
        if (!this.saveStep3Data()) return;

        this.isSubmitting = true;
        const originalBtnHtml = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.7';
        btnSubmit.style.cursor = 'not-allowed';
        btnSubmit.innerHTML = `Menyimpan Data...`;

        try {
          const newRecord = window.pndlStore.addMobilityRecord({
            type: this.currentDirection,
            category: this.currentCategory,
            title: this.formData.title,
            department: this.formData.dept,
            leaderName: this.participants[0]?.name || 'Pemohon',
            participantCount: this.participants.length,
            participants: this.participants,
            destinationCountry: this.formData.country,
            destinationCity: this.formData.city,
            hostInstitution: this.formData.institution,
            startDate: this.formData.startDate,
            endDate: this.formData.endDate,
            durationDays: parseInt(this.calculateDuration()) || 1,
            fundingSource: this.formData.funding,
            sponsorName: this.formData.sponsor,
            notes: this.formData.notes
          });

          // NFR P0: Bersihkan draft setelah submit berhasil
          if (window.pndlStore) window.pndlStore.clearFormDraft(this.draftKey);

          if (window.pndlApp && window.pndlApp.showToast) {
            window.pndlApp.showToast(
              `Sukses mencatat ${this.participants.length} orang ${this.currentDirection === 'outbound' ? 'keluar' : 'masuk'}!`,
              'success'
            );
          }

          // Reset state & back to step 1
          this.currentStep = 1;
          this.formData.title = '';
          this.formData.country = '';
          this.formData.city = '';
          this.formData.institution = '';
          this.formData.sponsor = '';
          this.formData.notes = '';
          this.updateView();

          if (window.pndlApp && window.pndlApp.confirm) {
            window.pndlApp.confirm(
              'Data mobilitas berhasil dicatat ke sistem! Apakah Anda ingin langsung membuat dan mengunduh berkas Surat Tugas / Berita Acara (.docx)?',
              'Laporan Tersimpan'
            ).then(yes => {
              if (yes && window.pndlWord) {
                window.pndlWord.openTemplateModal(
                  this.currentDirection === 'outbound' ? 'surat_tugas' : 'berita_acara_mobilitas',
                  null,
                  newRecord.id
                );
              }
            });
          }
        } catch (err) {
          console.error('[Mobility Submit Error]:', err);
          if (window.pndlApp && window.pndlApp.alert) {
            window.pndlApp.alert('Terjadi kendala saat menyimpan. Data draf Anda tetap aman.', 'Gagal Menyimpan');
          }
        } finally {
          this.isSubmitting = false;
        }
      };
    }

    // Back to KUI
    const btnBackKUI = document.getElementById('btn-back-to-kui-panel');
    if (btnBackKUI) {
      btnBackKUI.onclick = () => {
        const kuiRoot = document.getElementById('kui-portal-root');
        const mobilityRoot = document.getElementById('mobility-portal-root');
        if (mobilityRoot) mobilityRoot.style.display = 'none';
        if (kuiRoot) {
          kuiRoot.style.display = 'block';
          window.pndlKui.render();
          window.scrollTo(0, 0);
        }
      };
    }

    // Export all to Word
    const btnWordAll = document.getElementById('btn-export-all-mobility-word');
    if (btnWordAll) {
      btnWordAll.onclick = () => {
        if (window.pndlWord) window.pndlWord.openTemplateModal();
      };
    }

    this.bindTableInputs();
  }

  syncInputsToState() {
    document.querySelectorAll('.inp-p-name').forEach(inp => {
      const idx = parseInt(inp.dataset.idx);
      if (this.participants[idx]) this.participants[idx].name = inp.value;
    });
    document.querySelectorAll('.inp-p-id').forEach(inp => {
      const idx = parseInt(inp.dataset.idx);
      if (this.participants[idx]) this.participants[idx].idNum = inp.value;
    });
    document.querySelectorAll('.inp-p-role').forEach(inp => {
      const idx = parseInt(inp.dataset.idx);
      if (this.participants[idx]) this.participants[idx].role = inp.value;
    });
    document.querySelectorAll('.inp-p-prodi').forEach(inp => {
      const idx = parseInt(inp.dataset.idx);
      if (this.participants[idx]) this.participants[idx].prodi = inp.value;
    });
  }

  bindTableInputs() {
    document.querySelectorAll('.btn-remove-p-row').forEach(btn => {
      btn.onclick = () => {
        this.syncInputsToState();
        const idx = parseInt(btn.dataset.idx);
        this.participants.splice(idx, 1);
        this.refreshTable();
      };
    });
  }

  refreshTable() {
    const tbody = document.getElementById('participant-tbody');
    if (tbody) tbody.innerHTML = this.renderParticipantRows();
    this.bindTableInputs();
  }

  updateView() {
    this.loadDraftIfAvailable();
    const root = document.getElementById('mobility-portal-root');
    if (root) {
      root.innerHTML = this.render();
      this.bindEvents();
    }
  }
}

window.pndlMobility = new MobilityFormView();
