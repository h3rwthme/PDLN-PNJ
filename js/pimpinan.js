/* ==========================================================================
   PDLN PNJ — EXECUTIVE PIMPINAN PORTAL (PIMPINAN.JS)
   Modul Tinjauan dan Disposisi Direktur Politeknik Negeri Jakarta
   Desain Human-Grade Akademik: Tenang, Formal Institusi PNJ, Bebas AI Slop
   ========================================================================== */

class PimpinanPortal {
  constructor() {
    this.searchQuery = '';
    this.filterMode = 'pending'; // 'pending' | 'history'
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('pimpinan-portal-root');
    if (!container) return;

    const currentUser = window.pndlStore.getCurrentUser() || {
      full_name: 'Dr. Sc. H. Zainal Nur Arifin, Dipl-Ing. HTL., M.T.',
      prodi: 'Direktur Politeknik Negeri Jakarta'
    };

    const apps = window.pndlStore.getApplications();
    const pendingCases = apps.filter(a => a.current_status === 'PIMPINAN_REVIEW');
    const historyCases = apps.filter(a => a.approved_by_pimpinan_id || a.current_status === 'DOCUMENT_GENERATED' || a.current_status === 'SRIKANDI_PROCESS' || a.current_status === 'SIGNED' || a.current_status === 'APPROVED' || a.current_status === 'CLOSED');

    container.innerHTML = `
      <div class="app-container motion-fade-in" style="padding-top: 24px; padding-bottom: 48px; max-width: 1200px; margin: 0 auto;">
        
        <!-- Clean Institutional Executive Header -->
        <div style="
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 24px 28px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        ">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: inline-flex; align-items: center; gap: 6px; background: #F1F5F9; color: #0A3A60; padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px;">
                ${Icons.building(13)} Disposisi Pimpinan Internal
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.02em;">
                Tinjauan Kebijakan &amp; Persetujuan Direktur PNJ
              </h1>
              <p style="font-size: 13.5px; color: #64748B; margin: 0; line-height: 1.5;">
                Pejabat Berwenang: <strong style="color: #0F172A;">${currentUser.full_name}</strong> • ${currentUser.prodi}
              </p>
            </div>

            <div style="display: flex; gap: 8px; align-items: center;">
              <button class="btn btn-secondary btn-sm" id="btn-pimpinan-refresh" style="font-weight: 600;">
                ${Icons.clock(14)} Segarkan
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-pimpinan-logout" style="font-weight: 600; color: #DC2626;">
                ${Icons.logout(14)} Keluar Sesi
              </button>
            </div>
          </div>
        </div>

        <!-- 3 Simple Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin-bottom: 24px;">
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 12px; font-weight: 700; color: #92400E; text-transform: uppercase; margin-bottom: 6px;">Menunggu Disposisi</div>
            <div style="font-size: 28px; font-weight: 800; color: #D97706; line-height: 1.1;">${pendingCases.length}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Usulan lolos verifikasi KUI</div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 12px; font-weight: 700; color: #047857; text-transform: uppercase; margin-bottom: 6px;">Telah Disahkan</div>
            <div style="font-size: 28px; font-weight: 800; color: #059669; line-height: 1.1;">${historyCases.length}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Surat tugas &amp; diteruskan ke SRIKANDI</div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <div style="font-size: 12px; font-weight: 700; color: #0A3A60; text-transform: uppercase; margin-bottom: 6px;">Total Pengajuan Terdaftar</div>
            <div style="font-size: 28px; font-weight: 800; color: #0A3A60; line-height: 1.1;">${apps.length}</div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Keseluruhan civitas PNJ</div>
          </div>
        </div>

        <!-- Segmented Tab Navigation -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">
          <button class="btn btn-sm ${this.filterMode === 'pending' ? 'btn-primary' : 'btn-secondary'}" id="tab-pimpinan-pending" style="font-weight: 700; ${this.filterMode === 'pending' ? 'background: #0A3A60; border-color: #0A3A60;' : ''}">
            ${Icons.clock(14)} Usulan Menunggu Disposisi (${pendingCases.length})
          </button>
          <button class="btn btn-sm ${this.filterMode === 'history' ? 'btn-primary' : 'btn-secondary'}" id="tab-pimpinan-history" style="font-weight: 700; ${this.filterMode === 'history' ? 'background: #0A3A60; border-color: #0A3A60;' : ''}">
            ${Icons.check(14)} Riwayat Berkas Selesai (${historyCases.length})
          </button>
        </div>

        <!-- Main Cases Feed -->
        ${this.filterMode === 'pending' ? this.renderPendingCases(pendingCases) : this.renderHistoryCases(historyCases)}

      </div>
    `;

    this.bindDynamicElements();
  }

  renderPendingCases(cases) {
    if (cases.length === 0) {
      return `
        <div style="
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
        ">
          <div style="color: #059669; margin-bottom: 12px;">${Icons.checkCircle(40)}</div>
          <h3 style="font-size: 16px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0;">
            Tidak Ada Usulan Menunggu Disposisi
          </h3>
          <p style="font-size: 13.5px; color: #64748B; margin: 0;">
            Semua usulan yang telah diverifikasi oleh KUI sudah selesai ditinjau oleh Direktur PNJ.
          </p>
        </div>
      `;
    }

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        ${cases.map(app => {
          const urgency = window.pndlStore.calculateUrgency(app.startDate || app.tanggal_mulai, app.current_status);

          return `
            <div style="
              background: #FFFFFF;
              border: 1px solid #E2E8F0;
              border-radius: 12px;
              padding: 24px 28px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            ">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-family: monospace; font-size: 12px; font-weight: 700; background: #F1F5F9; color: #0F172A; padding: 2px 8px; border-radius: 4px;">
                      ${app.case_id || app.id}
                    </span>
                    <span style="font-size: 11.5px; font-weight: 700; background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 4px;">
                      ${urgency.label} (${urgency.daysLeft} Hari Lagi)
                    </span>
                  </div>
                  <h3 style="font-size: 17px; font-weight: 800; color: #0F172A; margin: 0 0 4px 0;">
                    ${app.applicantName} — <span style="font-weight: 600; color: #334155;">${app.nama_kegiatan || app.purposeLabel || 'Program PDLN'}</span>
                  </h3>
                  <div style="font-size: 13px; color: #64748B;">
                    ${app.applicantRole || 'Mahasiswa'} • ${app.applicantDepartment || 'Teknik Informatika dan Komputer'}
                  </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center;">
                  <button class="btn btn-secondary btn-sm btn-pimpinan-reject" data-id="${app.case_id || app.id}" style="color: #DC2626; border-color: #FECACA; font-weight: 600;">
                    ${Icons.x(14)} Tolak / Tangguhkan
                  </button>
                  <button class="btn btn-primary btn-sm btn-pimpinan-approve" data-id="${app.case_id || app.id}" style="background: #0A3A60; border-color: #0A3A60; font-weight: 700; padding: 8px 18px;">
                    ${Icons.check(14)} Sahkan &amp; Teruskan ke SRIKANDI
                  </button>
                </div>
              </div>

              <!-- Information Grid -->
              <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 14px;
                background: #F8FAFC;
                border: 1px solid #E2E8F0;
                border-radius: 8px;
                padding: 14px 18px;
                margin-bottom: 14px;
              ">
                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Destinasi &amp; Mitra</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 2px;">
                    ${app.destinationCountry} (${app.destinationCity || '-'})
                  </div>
                  <div style="font-size: 12px; color: #64748B;">${app.hostInstitution}</div>
                </div>

                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Jadwal Pelaksanaan</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 2px;">
                    ${app.startDate || app.tanggal_mulai} s/d ${app.endDate || app.tanggal_selesai}
                  </div>
                  <div style="font-size: 12px; color: #64748B;">Durasi: ${app.durationDays} Hari Dinas</div>
                </div>

                <div>
                  <div style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase;">Sumber Pendanaan</div>
                  <div style="font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 2px;">
                    ${app.funding_scheme || app.fundingSource || 'Mandiri'}
                  </div>
                  <div style="font-size: 12px; color: #64748B;">${app.sponsorName || 'Dana Institusi / Sponsor'}</div>
                </div>
              </div>

              <!-- Output Note -->
              <div style="font-size: 12.5px; color: #334155; line-height: 1.5;">
                <strong style="color: #0F172A;">Rencana Tindak Lanjut &amp; Output bagi PNJ:</strong> 
                ${app.rencana_tindak_lanjut || 'Diseminasi keilmuan, publikasi karya ilmiah, dan penguatan jejaring kemitraan akademik internasional PNJ.'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderHistoryCases(cases) {
    if (cases.length === 0) {
      return `
        <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 36px; text-align: center; color: #64748B;">
          Belum ada riwayat berkas yang disahkan.
        </div>
      `;
    }

    return `
      <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #F8FAFC; border-bottom: 2px solid #0A3A60;">
                <th style="padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 700; color: #0A3A60;">CASE ID</th>
                <th style="padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 700; color: #0A3A60;">PEMOHON</th>
                <th style="padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 700; color: #0A3A60;">TUJUAN &amp; MITRA</th>
                <th style="padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 700; color: #0A3A60;">JADWAL</th>
                <th style="padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 700; color: #0A3A60;">STATUS DISPOSISI</th>
              </tr>
            </thead>
            <tbody>
              ${cases.map(item => `
                <tr style="border-bottom: 1px solid #E2E8F0;">
                  <td style="padding: 16px 18px; font-family: monospace; font-size: 12px; font-weight: 700; color: #0F172A;">
                    ${item.case_id || item.id}
                  </td>
                  <td style="padding: 16px 18px;">
                    <div style="font-weight: 700; color: #0F172A; font-size: 13.5px;">${item.applicantName}</div>
                    <div style="font-size: 11.5px; color: #64748B;">${item.applicantRole} • ${item.applicantNimNip}</div>
                  </td>
                  <td style="padding: 16px 18px;">
                    <div style="font-weight: 700; color: #0F172A; font-size: 13px;">${item.destinationCountry} (${item.destinationCity || '-'})</div>
                    <div style="font-size: 11.5px; color: #64748B;">${item.hostInstitution}</div>
                  </td>
                  <td style="padding: 16px 18px; font-size: 12.5px; color: #334155;">
                    ${item.startDate || item.tanggal_mulai}
                  </td>
                  <td style="padding: 16px 18px;">
                    <span style="
                      display: inline-block;
                      padding: 3px 10px;
                      border-radius: 4px;
                      font-size: 11.5px;
                      font-weight: 700;
                      background: #ECFDF5;
                      color: #065F46;
                    ">
                      ${item.statusLabel}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  bindEvents() {
    window.addEventListener('pndl:auth-changed', () => this.render());
  }

  bindDynamicElements() {
    const tabPending = document.getElementById('tab-pimpinan-pending');
    const tabHistory = document.getElementById('tab-pimpinan-history');
    if (tabPending) tabPending.onclick = () => { this.filterMode = 'pending'; this.render(); };
    if (tabHistory) tabHistory.onclick = () => { this.filterMode = 'history'; this.render(); };

    const btnRefresh = document.getElementById('btn-pimpinan-refresh');
    if (btnRefresh) btnRefresh.onclick = () => { this.render(); if (window.pndlApp) window.pndlApp.showToast('Data diperbarui.', 'info'); };

    const btnLogout = document.getElementById('btn-pimpinan-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        window.pndlStore.logout();
        window.location.href = 'index.html';
      };
    }

    // Approve Action
    document.querySelectorAll('.btn-pimpinan-approve').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const confirmMsg = 'Sahkan pertimbangan kebijakan Direktur PNJ untuk usulan ini? Sistem akan memicu tahap pembuatan naskah dinas Word dan registrasi persuratan SRIKANDI.';
        if (window.pndlApp && window.pndlApp.confirm) {
          window.pndlApp.confirm(confirmMsg, 'Persetujuan Direktur PNJ').then(yes => {
            if (yes) {
              window.pndlStore.pimpinanDecision(id, true);
              window.pndlApp.showToast('Usulan disetujui Direktur PNJ! Berkas berlanjut ke SRIKANDI.', 'success');
              this.render();
            }
          });
        } else {
          if (confirm(confirmMsg)) {
            window.pndlStore.pimpinanDecision(id, true);
            window.pndlApp.showToast('Usulan disetujui Direktur PNJ! Berkas berlanjut ke SRIKANDI.', 'success');
            this.render();
          }
        }
      };
    });

    // Reject Action
    document.querySelectorAll('.btn-pimpinan-reject').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const msg = 'Masukkan alasan pertimbangan penolakan / penangguhan pimpinan:';
        if (window.pndlApp && window.pndlApp.prompt) {
          window.pndlApp.prompt(msg, 'Perlu penyesuaian anggaran DIPA PNJ', 'Penolakan / Penangguhan Usulan').then(reason => {
            if (reason) {
              window.pndlStore.pimpinanDecision(id, false, reason);
              window.pndlApp.showToast('Keputusan pimpinan berhasil dicatat.', 'warning');
              this.render();
            }
          });
        } else {
          const reason = prompt(msg);
          if (reason) {
            window.pndlStore.pimpinanDecision(id, false, reason);
            window.pndlApp.showToast('Keputusan pimpinan berhasil dicatat.', 'warning');
            this.render();
          }
        }
      };
    });
  }
}

window.pndlPimpinan = new PimpinanPortal();
