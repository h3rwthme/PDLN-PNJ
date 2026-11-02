/* ==========================================================================
   PDLN PNJ — DEDICATED KUI OPERATOR & ADMIN PORTAL (KUI.JS)
   Panel Verifikator Berkas & Administrator Kantor Urusan Internasional PNJ
   ========================================================================== */

class KuiPortal {
  constructor() {
    this.currentNavTab = 'dashboard'; // 'dashboard' | 'upcoming' | 'analytics' | 'master' | 'audit'
    this.currentFilter = 'all';
    this.searchQuery = '';
    this.activeReviewApp = null;
    this.masterCategory = 'all';
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const container = document.getElementById('kui-portal-root');
    if (!container) return;

    const apps = window.pndlStore.getApplications();
    const stats = window.pndlStore.getAdminStats();
    const currentUser = window.pndlStore.getCurrentUser() || { full_name: 'Siti Rahmawati, M.Ed.', role: 'kui_admin' };
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

    const initials = (currentUser.full_name || 'Admin')
      .split(' ')
      .map(w => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

    const roleName = currentUser.role === 'kui_admin' ? 'KUI Administrator' :
                     currentUser.role === 'kui_operator' ? 'KUI Operator' :
                     currentUser.role === 'pimpinan' ? 'Pimpinan / Direktur' : 'Petugas KUI';

    container.innerHTML = `
      <div class="admin-layout">
        <!-- 1. LEFT SIDEBAR (270px) -->
        <aside class="admin-sidebar">
          <div class="admin-brand" style="align-items: center; gap: 12px; margin-bottom: 28px;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, var(--kui-teal), #06343b); border: 2px solid rgba(255, 255, 255, 0.25); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 15px; color: #FFFFFF; letter-spacing: 0.5px; flex-shrink: 0;">
              ${initials}
            </div>
            <div style="min-width: 0;">
              <h1 style="font-size: 14.5px; font-weight: 700; color: #FFFFFF; line-height: 1.25; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${currentUser.full_name}
              </h1>
              <p style="margin: 3px 0 0; color: #bfe7ea; font-size: 11px; font-weight: 500; letter-spacing: 0.2px;">
                ${roleName}
              </p>
            </div>
          </div>

          <div style="flex: 1;">
            <div class="admin-nav-label">Menu Utama</div>
            <button class="admin-nav-btn ${this.currentNavTab === 'dashboard' ? 'active' : ''}" id="kui-tab-dash">
              ${Icons.home(15)}
              <span>Pengajuan Kasus</span>
            </button>
            <button class="admin-nav-btn ${this.currentNavTab === 'upcoming' ? 'active' : ''}" id="kui-tab-upcoming">
              ${Icons.clock(15)}
              <span>Keberangkatan (${stats.upcoming.filter(u => u.urgencyLevel === 'CRITICAL' || u.urgencyLevel === 'URGENT').length})</span>
            </button>
            <button class="admin-nav-btn ${this.currentNavTab === 'analytics' ? 'active' : ''}" id="kui-tab-analytics">
              ${Icons.ticket(15)}
              <span>Laporan &amp; Analitik</span>
            </button>
            <button class="admin-nav-btn ${this.currentNavTab === 'master' ? 'active' : ''}" id="kui-tab-master">
              ${Icons.building(15)}
              <span>Master Data</span>
            </button>
            <button class="admin-nav-btn ${this.currentNavTab === 'audit' ? 'active' : ''}" id="kui-tab-audit">
              ${Icons.shield(15)}
              <span>Audit Log</span>
            </button>

            <div class="admin-nav-label" style="margin-top: 14px;">Layanan</div>
            <button class="admin-nav-btn" id="btn-admin-nav-mobility">
              ${Icons.plane(15)}
              <span>Form Mobilitas</span>
            </button>
            <button class="admin-nav-btn" id="btn-admin-nav-word">
              ${Icons.fileText(15)}
              <span>Template Word</span>
            </button>
          </div>

          <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.12);">
            <button class="btn btn-danger btn-sm" id="btn-admin-logout" style="width: 100%;">
              ${Icons.logout(14)}
              <span>Keluar Sesi KUI</span>
            </button>
          </div>
        </aside>

        <!-- 2. MAIN CONTENT AREA -->
        <main class="admin-main">
          <!-- Topbar -->
          <header class="admin-topbar">
            <div>
              <h2>Portal Kontrol KUI — Perjalanan Dinas Luar Negeri PNJ</h2>
              <p id="admin-last-update">${nowStr}</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="btn btn-secondary btn-sm" id="btn-admin-refresh">
                ${Icons.clock(14)} Refresh
              </button>
              <button class="btn btn-primary btn-sm btn-export-all">
                ${Icons.fileText(14)} Ekspor CSV / Laporan
              </button>
            </div>
          </header>

          <section class="admin-content">
            ${this.renderSubTabContent(apps, stats)}
          </section>
        </main>
      </div>

      <!-- Split Review & Action Modal Container -->
      <div id="admin-split-modal-container"></div>
    `;

    this.bindDynamicElements();
  }

  renderSubTabContent(apps, stats) {
    if (this.currentNavTab === 'upcoming') {
      return this.renderUpcomingDeparturesView(stats);
    } else if (this.currentNavTab === 'analytics') {
      return this.renderAnalyticsView(apps, stats);
    } else if (this.currentNavTab === 'master') {
      return this.renderMasterDataView();
    } else if (this.currentNavTab === 'audit') {
      return this.renderAuditTrailView();
    }
    // Default: Dashboard Case Management
    return this.renderDashboardView(apps, stats);
  }

  // =========================================================================
  // SUB-TAB 1: CASE MANAGEMENT DASHBOARD
  // =========================================================================
  renderDashboardView(apps, stats) {
    return `
      <!-- Hero Banner -->
      <div class="admin-hero motion-slide-up">
        <div>
          <h3 style="font-size: 22px; font-weight: 800; color: #07343a; margin-bottom: 6px;">
            Pusat Verifikasi & Disposisi Kasus PDLN PNJ
          </h3>
          <p style="color: var(--neutral-600); font-size: 13px; line-height: 1.6; max-width: 720px; margin: 0;">
            Pusat kendali pra-pengajuan KUI PNJ: verifikasi kelayakan dokumen, disposisi persetujuan Direktur PNJ, integrasi naskah dinas SRIKANDI, pendaftaran portal kementerian (PINTAS), hingga verifikasi LPJ.
          </p>
        </div>
        <div class="admin-hero-card">
          <div class="big">${stats.total}</div>
          <span>Total Permohonan Terdaftar</span>
        </div>
      </div>

      <!-- 6 Metrics Grid -->
      <div class="admin-stats-grid motion-slide-up" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
        <div class="admin-stat" style="border-left: 3px solid var(--status-review-text);">
          <h4>Menunggu Review</h4>
          <div class="num" style="color: var(--status-review-text);">${stats.pendingReview}</div>
          <small>Perlu Verifikasi KUI</small>
        </div>
        <div class="admin-stat" style="border-left: 3px solid #dc2626;">
          <h4>Perlu Revisi</h4>
          <div class="num" style="color: #dc2626;">${stats.revisionReq}</div>
          <small>Menunggu Pemohon</small>
        </div>
        <div class="admin-stat" style="border-left: 3px solid #d97706;">
          <h4>Tinjauan Direktur</h4>
          <div class="num" style="color: #d97706;">${stats.pimpinanReview}</div>
          <small>Persetujuan Kebijakan</small>
        </div>
        <div class="admin-stat" style="border-left: 3px solid #0284c7;">
          <h4>SRIKANDI / TTE</h4>
          <div class="num" style="color: #0284c7;">${stats.srikandiProcess + stats.readySetneg}</div>
          <small>Naskah Dinas Sah</small>
        </div>
        <div class="admin-stat" style="border-left: 3px solid #8b5cf6;">
          <h4>PINTAS Setneg</h4>
          <div class="num" style="color: #8b5cf6;">${stats.pintasSubmitted}</div>
          <small>Evaluasi Kementerian</small>
        </div>
        <div class="admin-stat" style="border-left: 3px solid var(--status-verified-text);">
          <h4>SP Sah & Selesai</h4>
          <div class="num" style="color: var(--status-verified-text);">${stats.approved + stats.closed}</div>
          <small>Izin Terbit & LPJ</small>
        </div>
      </div>

      <!-- Table of Applications -->
      ${this.renderApplicationsTable(apps)}
    `;
  }

  renderApplicationsTable(apps) {
    let filtered = apps;

    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'review') {
        filtered = filtered.filter(a => a.current_status === 'KUI_REVIEW' || a.current_status === 'SUBMITTED');
      } else if (this.currentFilter === 'revision') {
        filtered = filtered.filter(a => a.current_status === 'REVISION');
      } else if (this.currentFilter === 'pimpinan') {
        filtered = filtered.filter(a => a.current_status === 'PIMPINAN_REVIEW');
      } else if (this.currentFilter === 'srikandi') {
        filtered = filtered.filter(a => a.current_status === 'SRIKANDI_PROCESS' || a.current_status === 'SIGNED' || a.current_status === 'DOCUMENT_GENERATED');
      } else if (this.currentFilter === 'pintas') {
        filtered = filtered.filter(a => a.current_status === 'PINTAS_SUBMITTED');
      } else if (this.currentFilter === 'approved') {
        filtered = filtered.filter(a => a.current_status === 'APPROVED' || a.current_status === 'LPJ_SUBMITTED');
      } else if (this.currentFilter === 'closed') {
        filtered = filtered.filter(a => a.current_status === 'CLOSED');
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => 
        (a.applicantName && a.applicantName.toLowerCase().includes(q)) ||
        (a.case_id && a.case_id.toLowerCase().includes(q)) ||
        (a.applicantNimNip && a.applicantNimNip.includes(q)) ||
        (a.destinationCountry && a.destinationCountry.toLowerCase().includes(q)) ||
        (a.hostInstitution && a.hostInstitution.toLowerCase().includes(q)) ||
        (a.funding_scheme && a.funding_scheme.toLowerCase().includes(q))
      );
    }

    return `
      <div class="card motion-slide-up" id="admin-table-panel">
        <div class="card-header">
          <div>
            <h3 class="card-title">Database Pengajuan PDLN (Lifecycle Penuh)</h3>
            <p class="card-subtitle">Pemeriksaan terpadu 15 tahapan alur resmi internal PNJ hingga clearance kementerian.</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.print()">
            ${Icons.ticket(14)} Cetak Daftar
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div style="display: flex; gap: 12px; margin-bottom: 18px; flex-wrap: wrap;">
          <div style="position: relative; flex: 1; min-width: 260px;">
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--neutral-400);">
              ${Icons.search(15)}
            </span>
            <input type="text" id="admin-search-input" class="form-control" style="padding-left: 36px;" placeholder="Cari Case ID, nama pemohon, NIP/NIM, negara, mitra..." value="${this.searchQuery}">
          </div>

          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'all' ? 'btn-primary' : ''}" data-f="all">Semua (${apps.length})</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'review' ? 'btn-primary' : ''}" data-f="review">Review</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'revision' ? 'btn-primary' : ''}" data-f="revision">Revisi</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'pimpinan' ? 'btn-primary' : ''}" data-f="pimpinan">Pimpinan</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'srikandi' ? 'btn-primary' : ''}" data-f="srikandi">SRIKANDI</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'pintas' ? 'btn-primary' : ''}" data-f="pintas">PINTAS</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'approved' ? 'btn-primary' : ''}" data-f="approved">SP Sah</button>
            <button class="btn btn-secondary btn-sm ${this.currentFilter === 'closed' ? 'btn-primary' : ''}" data-f="closed">Arsip</button>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%;">
            <thead>
              <tr>
                <th style="width: 140px;">No. Pengajuan</th>
                <th style="width: 220px;">Pemohon PNJ</th>
                <th>Tujuan &amp; Mitra</th>
                <th style="width: 130px;">Pendanaan</th>
                <th style="width: 180px;">Status Berkas</th>
                <th style="width: 110px; text-align: center;">Jadwal</th>
                <th style="width: 100px; text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align: center; padding: 32px; color: var(--neutral-400);">
                    Tidak ditemukan pengajuan dengan kriteria yang dipilih.
                  </td>
                </tr>
              ` : filtered.map(a => {
                const urgency = window.pndlStore.calculateUrgency(a.startDate || a.tanggal_mulai, a.current_status);
                const urgencyBadgeClass = urgency.level === 'CRITICAL' ? 'badge-urgency-critical' :
                                         urgency.level === 'URGENT' ? 'badge-urgency-urgent' :
                                         urgency.level === 'ARCHIVED' ? 'badge-draft' :
                                         urgency.level === 'WARNING' ? 'badge-urgency-warning' : 'badge-urgency-normal';

                return `
                  <tr>
                    <td>
                      <strong style="color: var(--brand-primary);">${a.case_id || a.id}</strong>
                      <div style="font-size: 11px; color: var(--neutral-400); margin-top: 2px;">${(a.submittedAt || a.created_at || '').split(' ')[0]}</div>
                    </td>
                    <td>
                      <strong>${a.applicantName}</strong>
                      <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${a.applicantRole} • ${a.applicantNimNip}</div>
                    </td>
                    <td>
                      <div><strong>${a.destinationCountry}</strong> — ${a.destinationCity}</div>
                      <div style="font-size: 11px; color: var(--neutral-500); margin-top: 2px;">${a.hostInstitution}</div>
                    </td>
                    <td>
                      <span class="badge badge-source">${a.funding_scheme || a.fundingSource}</span>
                    </td>
                    <td>
                      <span class="badge ${a.current_status === 'APPROVED' || a.current_status === 'CLOSED' ? 'badge-verified' : a.current_status === 'REVISION' ? 'badge-revision' : 'badge-review'}">
                        ${a.statusLabel}
                      </span>
                    </td>
                    <td style="text-align: center;">
                      <span class="badge ${urgencyBadgeClass}">
                        ${urgency.label}
                      </span>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm btn-open-split-modal" data-id="${a.case_id || a.id}" style="padding: 5px 12px; font-weight: 600;">
                        Tinjau
                      </button>
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

  // =========================================================================
  // SUB-TAB 2: UPCOMING DEPARTURE MONITORING
  // =========================================================================
  renderUpcomingDeparturesView(stats) {
    const list = stats.upcoming;

    return `
      <div class="motion-slide-up">
        <div class="section-intro-card">
          <div>
            <span class="badge badge-urgency-critical">${Icons.clock(12)} Prioritas Batas Waktu</span>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--brand-primary); margin: 8px 0 4px 0;">
              Monitoring Keberangkatan Terdekat (Upcoming Departures)
            </h2>
            <p style="font-size: 13px; color: var(--neutral-600); margin: 0; max-width: 780px; line-height: 1.6;">
              Pengajuan diurutkan otomatis berdasarkan tanggal keberangkatan terdekat. Sistem memberikan indikator risiko (CRITICAL, URGENT, WARNING) untuk memastikan seluruh proses izin selesai sebelum jadwal keberangkatan delegasi.
            </p>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>Prioritas / Sisa Waktu</th>
                  <th>Tanggal Berangkat</th>
                  <th>Pemohon</th>
                  <th>Tujuan & Kegiatan</th>
                  <th>Status Administrasi</th>
                  <th>Aksi Cepat</th>
                </tr>
              </thead>
              <tbody>
                ${list.map(item => {
                  const urgencyClass = item.urgencyLevel === 'CRITICAL' ? 'badge-urgency-critical' :
                                       item.urgencyLevel === 'URGENT' ? 'badge-urgency-urgent' :
                                       item.urgencyLevel === 'WARNING' ? 'badge-urgency-warning' : 'badge-urgency-normal';

                  return `
                    <tr style="${item.urgencyLevel === 'CRITICAL' ? 'background: #fff5f5;' : item.urgencyLevel === 'URGENT' ? 'background: #fffbeb;' : ''}">
                      <td>
                        <span class="badge ${urgencyClass}">
                          ${item.urgencyLabel} (${item.daysLeft} Hari Lagi)
                        </span>
                      </td>
                      <td>
                        <strong style="font-size: 13px;">${item.startDate || item.tanggal_mulai}</strong><br>
                        <span style="font-size: 11px; color: var(--neutral-500);">s/d ${item.endDate || item.tanggal_selesai}</span>
                      </td>
                      <td>
                        <strong>${item.applicantName}</strong><br>
                        <span style="font-size: 11px; color: var(--neutral-400);">${item.applicantRole} • ${item.applicantNimNip}</span>
                      </td>
                      <td>
                        <strong>${item.destinationCountry}</strong> (${item.destinationCity})<br>
                        <span style="font-size: 11px; color: var(--neutral-500);">${item.hostInstitution}</span>
                      </td>
                      <td>
                        <span class="badge ${item.current_status === 'APPROVED' || item.current_status === 'CLOSED' ? 'badge-verified' : item.current_status === 'REVISION' ? 'badge-revision' : 'badge-review'}">
                          ${item.statusLabel}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-secondary btn-sm btn-open-split-modal" data-id="${item.case_id || item.id}">
                          Buka Kasus
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUB-TAB 3: ANALYTICS & REPORTING
  // =========================================================================
  renderAnalyticsView(apps, stats) {
    return `
      <div class="motion-slide-up">
        <div class="section-intro-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="badge badge-source">${Icons.ticket(12)} Dashboard Analitik PDLN</span>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--brand-primary); margin: 8px 0 4px 0;">
                Analitik Mobilitas & Efisiensi Alur Kerja KUI PNJ
              </h2>
              <p style="font-size: 13px; color: var(--neutral-600); margin: 0; max-width: 780px; line-height: 1.6;">
                Visualisasi data distribusi destinasi, perbandingan sumber pembiayaan, rata-rata waktu pemrosesan antar tahapan workflow, serta identifikasi titik hambatan (bottleneck).
              </p>
            </div>
            <button class="btn btn-primary btn-sm btn-export-all">
              ${Icons.fileText(14)} Unduh Laporan Eksekutif (.csv)
            </button>
          </div>
        </div>

        <!-- 4 Analytic Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 24px;">
          
          <!-- Chart 1: Distribusi Negara Tujuan -->
          <div class="card" style="padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Distribusi Negara Destinasi PDLN</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${Object.entries(stats.countryDist).map(([country, count]) => {
                const pct = Math.round((count / stats.total) * 100);
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                      <strong>${country}</strong>
                      <span>${count} Berkas (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--neutral-100); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${pct}%; height: 100%; background: var(--brand-primary); border-radius: 4px;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Chart 2: Sumber Pendanaan -->
          <div class="card" style="padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Skema Pembiayaan Perjalanan</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${Object.entries(stats.fundingDist).map(([scheme, count]) => {
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return `
                  <div>
                    <div style="display: flex; justify-content: space-between; font-size: 12.5px; margin-bottom: 4px;">
                      <strong>${scheme}</strong>
                      <span>${count} Pengajuan (${pct}%)</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: var(--neutral-100); border-radius: 4px; overflow: hidden;">
                      <div style="width: ${pct}%; height: 100%; background: var(--kui-teal); border-radius: 4px;"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Chart 3: Analisis Rata-Rata Waktu Proses & Bottleneck -->
          <div class="card" style="padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Rata-rata Waktu Proses & Titik Hambatan (Bottleneck)</h4>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div class="verified-field-box">
                <div>
                  <strong>Tahap 1: Verifikasi Berkas KUI</strong>
                  <div style="font-size: 11.5px; color: var(--neutral-500);">Evaluasi paspor, LoA, dan SPTJM</div>
                </div>
                <span class="badge badge-source">1.8 Hari Kerja</span>
              </div>
              <div class="verified-field-box">
                <div>
                  <strong>Tahap 2: Tinjauan Direktur PNJ</strong>
                  <div style="font-size: 11.5px; color: var(--neutral-500);">Pertimbangan kebijakan & persetujuan</div>
                </div>
                <span class="badge badge-source">2.1 Hari Kerja</span>
              </div>
              <div class="verified-field-box" style="border-left: 3px solid #d97706; background: #fffdf5;">
                <div>
                  <strong style="color: #b45309;">Tahap 3: Persuratan TTE SRIKANDI (Titik Antre)</strong>
                  <div style="font-size: 11.5px; color: var(--neutral-500);">Antrean registrasi & penandatanganan</div>
                </div>
                <span class="badge badge-review">3.4 Hari Kerja (Tertinggi)</span>
              </div>
              <div class="verified-field-box">
                <div>
                  <strong>Tahap 4: Penerbitan SP Kemensetneg</strong>
                  <div style="font-size: 11.5px; color: var(--neutral-500);">Izin clearance nasional</div>
                </div>
                <span class="badge badge-source">6.2 Hari Kerja</span>
              </div>
            </div>
          </div>

          <!-- Chart 4: Kategori Alasan Revisi Berkas -->
          <div class="card" style="padding: 20px;">
            <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Frekuensi Penyebab Revisi Berkas</h4>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                  <span>Masa Berlaku Paspor Kurang dari 6 Bulan</span>
                  <strong>48%</strong>
                </div>
                <div style="height: 6px; background: var(--neutral-100); border-radius: 3px;"><div style="width: 48%; height: 100%; background: #dc2626; border-radius: 3px;"></div></div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                  <span>Hasil Scan Buram / Terpotong (MRZ tidak terbaca)</span>
                  <strong>32%</strong>
                </div>
                <div style="height: 6px; background: var(--neutral-100); border-radius: 3px;"><div style="width: 32%; height: 100%; background: #f59e0b; border-radius: 3px;"></div></div>
              </div>
              <div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
                  <span>SPTJM Belum Ditandatangani di Atas Materai Rp10.000</span>
                  <strong>20%</strong>
                </div>
                <div style="height: 6px; background: var(--neutral-100); border-radius: 3px;"><div style="width: 20%; height: 100%; background: #3b82f6; border-radius: 3px;"></div></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUB-TAB 4: MASTER DATA MANAGEMENT
  // =========================================================================
  renderMasterDataView() {
    const configs = window.pndlStore.getMasterConfigs(this.masterCategory);

    return `
      <div class="motion-slide-up">
        <div class="section-intro-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
            <div>
              <span class="badge badge-source">${Icons.building(12)} Konfigurasi Institusi</span>
              <h2 style="font-size: 20px; font-weight: 800; color: var(--brand-primary); margin: 8px 0 4px 0;">
                Pengelolaan Master Data & Konfigurasi KUI Admin
              </h2>
              <p style="font-size: 13px; color: var(--neutral-600); margin: 0; max-width: 780px; line-height: 1.6;">
                KUI Admin berhak mengelola master negara, kota tujuan, jenis kegiatan perjalanan, template dokumen resmi Word, dan aturan batas waktu urgensi. Setiap perubahan otomatis tercatat di Audit Trail.
              </p>
            </div>
            <button class="btn btn-primary btn-sm" id="btn-add-master-config">
              ${Icons.plus ? Icons.plus(14) : '+'} Tambah Data Master
            </button>
          </div>
        </div>

        <!-- Filter Categories -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
          <button class="btn btn-secondary btn-sm ${this.masterCategory === 'all' ? 'btn-primary' : ''}" data-cat="all">Semua Kategori</button>
          <button class="btn btn-secondary btn-sm ${this.masterCategory === 'MASTER_NEGARA' ? 'btn-primary' : ''}" data-cat="MASTER_NEGARA">Master Negara & Kota</button>
          <button class="btn btn-secondary btn-sm ${this.masterCategory === 'MASTER_KEGIATAN' ? 'btn-primary' : ''}" data-cat="MASTER_KEGIATAN">Master Jenis Kegiatan</button>
          <button class="btn btn-secondary btn-sm ${this.masterCategory === 'URGENCY_RULE' ? 'btn-primary' : ''}" data-cat="URGENCY_RULE">Aturan Urgensi & Deadline</button>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Kode / Nama Pengaturan</th>
                  <th>Nilai / Detail Aturan</th>
                  <th>Status</th>
                  <th>Aksi Admin</th>
                </tr>
              </thead>
              <tbody>
                ${configs.map(c => `
                  <tr>
                    <td><span class="badge badge-source">${c.config_category}</span></td>
                    <td><strong>${c.code_or_name}</strong></td>
                    <td style="font-size: 12px; color: var(--neutral-600);">${c.file_or_link_path}</td>
                    <td>
                      <span class="badge ${c.is_active ? 'badge-verified' : 'badge-revision'}">
                        ${c.is_active ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm btn-toggle-master" data-id="${c.id_master}">
                        ${c.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SUB-TAB 5: AUDIT TRAIL VIEWER
  // =========================================================================
  renderAuditTrailView() {
    const logs = window.pndlStore.getAuditTrails();

    return `
      <div class="motion-slide-up">
        <div class="section-intro-card">
          <div>
            <span class="badge badge-source">${Icons.shield(12)} Kepatuhan & Keamanan Audit</span>
            <h2 style="font-size: 20px; font-weight: 800; color: var(--brand-primary); margin: 8px 0 4px 0;">
              Audit Trail Sistem (Rekam Jejak Kepatuhan Tidak Dapat Diubah)
            </h2>
            <p style="font-size: 13px; color: var(--neutral-600); margin: 0; max-width: 780px; line-height: 1.6;">
              Mencatat secara permanen setiap perubahan status usulan, pengunggahan dokumen, verifikasi operator, persetujuan pimpinan, serta pembaruan data sistem.
            </p>
          </div>
        </div>

        <div class="card" style="padding: 0; overflow: hidden;">
          <div style="overflow-x: auto;">
            <table class="data-table" style="width: 100%;">
              <thead>
                <tr>
                  <th>Waktu (WIB)</th>
                  <th>Aktor</th>
                  <th>Case ID</th>
                  <th>Aktivitas Perubahan</th>
                  <th>Status Sebelum & Sesudah</th>
                  <th>Rincian Keterangan</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(log => `
                  <tr>
                    <td style="font-size: 11.5px; white-space: nowrap;">${log.timestamp}</td>
                    <td><strong>${log.actor_name}</strong></td>
                    <td><span class="badge badge-source">${log.case_id}</span></td>
                    <td><strong>${log.action_name}</strong></td>
                    <td style="font-size: 11.5px;">
                      ${log.status_before && log.status_before !== '-' ? `
                        <span style="color: var(--neutral-500);">${log.status_before}</span>
                        ${Icons.arrowRight(11)}
                        <strong style="color: var(--brand-primary);">${log.status_after}</strong>
                      ` : (log.status_after && log.status_after !== '-' ? `
                        <strong style="color: var(--brand-primary);">${log.status_after}</strong>
                      ` : `
                        <span style="color: var(--neutral-400); font-style: italic;">Tidak ada transisi</span>
                      `)}
                    </td>
                    <td style="font-size: 11px; color: var(--neutral-600); max-width: 280px;">${log.change_details || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // SPLIT REVIEW & DISPOSITION MODAL
  // =========================================================================
  openSplitReviewModal(app) {
    const modalContainer = document.getElementById('admin-split-modal-container');
    if (!modalContainer) return;

    const urgency = window.pndlStore.calculateUrgency(app.startDate || app.tanggal_mulai);
    const tracking = (window.pndlStore.data.official_trackings && window.pndlStore.data.official_trackings[app.case_id || app.id]) || {};
    const lpj = (window.pndlStore.data.case_lpj_reports && window.pndlStore.data.case_lpj_reports[app.case_id || app.id]) || null;

    modalContainer.innerHTML = `
      <div class="modal-overlay" id="admin-review-modal">
        <div class="modal-content" style="max-width: 1020px;">
          <div class="sheet-drag-handle"></div>
          
          <!-- Modal Header -->
          <div class="card-header" style="padding: 18px 24px; margin-bottom: 0; background: var(--neutral-900); color: var(--white);">
            <div>
              <h3 class="card-title" style="color: var(--white); display: flex; align-items: center; gap: 8px;">
                ${Icons.shield(18)} Ruang Verifikasi & Disposisi Kasus: ${app.applicantName}
              </h3>
              <p class="card-subtitle" style="color: var(--neutral-300);">
                ID Kasus: <strong>${app.case_id || app.id}</strong> • ${app.applicantRole} (${app.applicantNimNip}) • Tujuan: ${app.destinationCountry}
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-split-modal" style="color: var(--white); background: rgba(255,255,255,0.15); border: none;">
              ${Icons.x(14)}
            </button>
          </div>

          <!-- Modal Scrollable Body -->
          <div style="padding: 24px; overflow-y: auto; max-height: calc(88vh - 120px);">
            <div class="split-review-layout">
              
              <!-- Left Side: Data, Documents & Tracking Status -->
              <div>
                
                <!-- Brief Info Card -->
                <div class="verified-field-box" style="margin-bottom: 14px;">
                  <div>
                    <span style="font-size: 11px; color: var(--neutral-400);">Agenda & Tujuan Dinas Luar Negeri</span>
                    <div style="font-weight: 700; font-size: 14px;">${app.purposeLabel} — ${app.destinationCountry} (${app.destinationCity})</div>
                    <div style="font-size: 12px; color: var(--neutral-500);">${app.hostInstitution} • ${app.startDate || app.tanggal_mulai} s/d ${app.endDate || app.tanggal_selesai} (${app.durationDays} hari)</div>
                    <div style="font-size: 11.5px; color: var(--brand-primary); margin-top: 4px;">Skema Pendanaan: <strong>${app.funding_scheme || app.fundingSource}</strong> ${app.sponsorName ? `(${app.sponsorName})` : ''}</div>
                  </div>
                  <span class="badge ${urgency.level === 'CRITICAL' ? 'badge-urgency-critical' : urgency.level === 'URGENT' ? 'badge-urgency-urgent' : 'badge-source'}">
                    ${urgency.label}
                  </span>
                </div>

                <!-- 1. Document Verification Checklist -->
                <h4 style="font-size: 13.5px; font-weight: 700; margin-bottom: 10px;">Pemeriksaan Dokumen Persyaratan Digital:</h4>
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
                  ${app.documents ? Object.keys(app.documents).map(key => {
                    const doc = app.documents[key];
                    return `
                      <div class="verified-field-box" style="flex-direction: column; align-items: stretch; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                          <div>
                            <strong style="font-size: 13px;">${key.toUpperCase().replace('_', ' ')}</strong>: 
                            <span style="font-size: 12px; color: var(--neutral-500);">${doc.name} (${doc.size || 'PDF Valid'})</span>
                          </div>
                          <span class="badge ${doc.status === 'verified' || doc.review_status === 'VALID' ? 'badge-verified' : doc.status === 'revision_required' ? 'badge-revision' : 'badge-review'}">
                            ${doc.statusLabel}
                          </span>
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 8px;">
                          <button class="btn btn-secondary btn-sm" onclick="window.pndlApp.showToast('Membuka pratinjau dokumen: ${doc.name}', 'info')">
                            ${Icons.eye(13)} Pratinjau
                          </button>
                        </div>
                      </div>
                    `;
                  }).join('') : '<p style="font-size: 12px; color: var(--neutral-400);">Belum ada dokumen digital yang tersimpan.</p>'}
                </div>

                <!-- 2. Official Tracking History (SRIKANDI & PINTAS) -->
                <div class="card" style="padding: 14px; margin-bottom: 16px; background: #f8fafc;">
                  <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 8px;">Rekam Jejak Persuratan & Kementerian Resmi:</h4>
                  <div style="font-size: 12px; line-height: 1.6; color: var(--neutral-700);">
                    <div>• <strong>SRIKANDI Ref:</strong> ${tracking.srikandi_ref_no || 'Belum diajukan ke SRIKANDI'}</div>
                    <div>• <strong>No. Surat Resmi:</strong> ${tracking.nomor_surat_resmi || '-'} (${tracking.tanggal_surat || '-'})</div>
                    <div>• <strong>Dokumen TTE:</strong> ${tracking.srikandi_signed_doc_path ? `<span class="text-success">${tracking.srikandi_signed_doc_path} (TTE Sah)</span>` : 'Belum diunggah'}</div>
                    <div>• <strong>Tiket PINTAS:</strong> ${tracking.pintas_ref_id || 'Belum didaftarkan ke portal kementerian'}</div>
                    <div>• <strong>SP Kemensetneg:</strong> ${tracking.final_sp_doc_path ? `<span class="text-success">${tracking.final_sp_doc_path} (Terbit Resmi)</span>` : 'Menunggu clearance'}</div>
                  </div>
                </div>

                <!-- 3. LPJ Report Status if Available -->
                ${lpj ? `
                  <div class="card" style="padding: 14px; background: #f0fdf4; border: 1px solid #bbf7d0;">
                    <h4 style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 6px;">Laporan Pertanggungjawaban (LPJ) Diserahkan Pemohon:</h4>
                    <div style="font-size: 11.5px; color: #14532d; line-height: 1.5;">
                      <div>• Tim: ${lpj.tim_bertugas}</div>
                      <div>• Realisasi Anggaran: <strong>Rp${Number(lpj.total_realisasi_biaya).toLocaleString('id-ID')}</strong></div>
                      <div>• Berkas Laporan: ${lpj.file_laporan_kegiatan} | SPPD: ${lpj.file_sppd}</div>
                      <div>• Status LPJ: <strong>${lpj.lpj_status}</strong></div>
                    </div>
                  </div>
                ` : ''}

              </div>

              <!-- Right Side: Workflow Actions Console -->
              <div>
                
                <!-- Action Group 1: Verifikasi & Revisi KUI -->
                <div class="card" style="margin-bottom: 14px; padding: 16px;">
                  <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">1. Tindakan Verifikasi KUI</h4>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-primary btn-sm btn-action-verify-kui" data-id="${app.case_id || app.id}">
                      ${Icons.check(14)} Loloskan & Teruskan ke Direktur PNJ
                    </button>
                    <button class="btn btn-secondary btn-sm btn-action-req-rev" data-id="${app.case_id || app.id}" style="color: #dc2626; border-color: #fca5a5;">
                      ${Icons.alertCircle(14)} Minta Revisi Berkas ke Pemohon
                    </button>
                    <button class="btn btn-secondary btn-sm btn-action-gen-word" data-id="${app.case_id || app.id}" style="background: #f0f9ff; border-color: #bae6fd; color: #0369a1;">
                      ${Icons.fileText(14)} Generate Draf Naskah Dinas (.docx)
                    </button>
                  </div>
                </div>

                <!-- Action Group 2: Persuratan SRIKANDI -->
                <div class="card" style="margin-bottom: 14px; padding: 16px;">
                  <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">2. Persuratan SRIKANDI (Naskah Dinas)</h4>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary btn-sm btn-action-srikandi-reg" data-id="${app.case_id || app.id}">
                      ${Icons.globe(14)} Catat No. Registrasi SRIKANDI
                    </button>
                    <button class="btn btn-secondary btn-sm btn-action-srikandi-signed" data-id="${app.case_id || app.id}">
                      ${Icons.checkCircle(14)} Catat No. Surat & Upload TTE Sah
                    </button>
                  </div>
                </div>

                <!-- Action Group 3: Kementerian PINTAS & SP Setneg -->
                <div class="card" style="margin-bottom: 14px; padding: 16px;">
                  <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">3. Portal Kementerian (PINTAS & Setneg)</h4>
                  <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button class="btn btn-secondary btn-sm btn-action-pintas-submit" data-id="${app.case_id || app.id}">
                      ${Icons.clock(14)} Daftarkan Usulan ke PINTAS
                    </button>
                    <button class="btn btn-secondary btn-sm btn-action-sp-setneg" data-id="${app.case_id || app.id}" style="color: var(--kui-teal); border-color: #99f6e4;">
                      ${Icons.shield(14)} Catat Keputusan & Upload SP Resmi
                    </button>
                  </div>
                </div>

                <!-- Action Group 4: LPJ & Penutupan Kasus -->
                <div class="card" style="margin-bottom: 14px; padding: 16px;">
                  <h4 style="font-size: 13px; font-weight: 700; margin-bottom: 10px;">4. Verifikasi LPJ & Arsipkan</h4>
                  <button class="btn btn-secondary btn-sm btn-action-close-case" data-id="${app.case_id || app.id}" style="width: 100%; color: #15803d; border-color: #86efac;">
                    ${Icons.checkCircle(14)} Sahkan LPJ & Tutup Kasus (CLOSED)
                  </button>
                </div>

                <!-- STRICTLY CONFIDENTIAL INTERNAL NOTES -->
                <div class="internal-note-box">
                  <div class="internal-note-header">
                    <span style="display: flex; align-items: center; gap: 6px;">
                      ${Icons.lock(14)} CATATAN RAHASIA INTERNAL KUI
                    </span>
                    <span class="internal-note-badge">RAHASIA</span>
                  </div>
                  <p style="font-size: 11px; color: #92400e; margin-bottom: 8px;">
                    Catatan ini khusus internal KUI, tidak dapat dibaca oleh mahasiswa/dosen.
                  </p>

                  <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; max-height: 120px; overflow-y: auto;">
                    ${app.internalNotes && app.internalNotes.length > 0 ? app.internalNotes.map(n => `
                      <div style="background: var(--white); border: 1px solid #fed7aa; border-radius: var(--radius-sm); padding: 8px 10px; font-size: 11.5px; color: #431407;">
                        <div>${n.text}</div>
                        <div style="font-size: 9.5px; color: #9a3412; margin-top: 3px;">${n.author} • ${n.createdAt}</div>
                      </div>
                    `).join('') : '<div style="font-size: 11px; color: #9a3412; font-style: italic;">Belum ada catatan internal.</div>'}
                  </div>

                  <textarea id="modal-internal-note-text" class="form-control" rows="2" placeholder="Tulis catatan rahasia koordinasi..." style="font-size: 12px; margin-bottom: 8px;"></textarea>
                  <button class="btn btn-secondary btn-sm" id="btn-save-modal-note" data-id="${app.case_id || app.id}" style="width: 100%;">
                    Simpan Catatan Internal
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      const el = document.getElementById('admin-review-modal');
      if (el) el.remove();
    };

    document.getElementById('btn-close-split-modal').onclick = close;

    // 1. Action: Verify KUI -> Pimpinan
    document.querySelector('.btn-action-verify-kui').onclick = () => {
      if (confirm('Loloskan berkas internal dan teruskan ke Direktur PNJ untuk pertimbangan kebijakan?')) {
        window.pndlStore.verifyByKui(app.case_id || app.id);
        window.pndlApp.showToast('Berkas berhasil diverifikasi dan diteruskan ke Direktur PNJ!', 'success');
        close();
        this.render();
      }
    };

    // 2. Action: Request Revision
    document.querySelector('.btn-action-req-rev').onclick = () => {
      const note = prompt('Tuliskan catatan detail berkas yang harus diperbaiki oleh pemohon:', 'Scan paspor buram / terpotong.');
      if (note) {
        window.pndlStore.requestRevision(app.case_id || app.id, ['paspor'], note);
        window.pndlApp.showToast('Permintaan revisi berhasil dikirim ke pemohon!', 'warning');
        close();
        this.render();
      }
    };

    // 3. Action: Generate Word .docx
    document.querySelector('.btn-action-gen-word').onclick = () => {
      if (window.pndlWord) {
        close();
        window.pndlWord.openTemplateModal(app);
      } else {
        window.pndlApp.showToast('Menghasilkan draf dokumen Word naskah dinas...', 'success');
      }
    };

    // 4. Action: Srikandi Registration
    document.querySelector('.btn-action-srikandi-reg').onclick = () => {
      const ref = prompt('Masukkan Nomor Registrasi Naskah Dinas dari aplikasi SRIKANDI:', `SRK-PNJ-2026-${Date.now().toString().slice(-4)}`);
      if (ref) {
        window.pndlStore.recordSrikandiProcess(app.case_id || app.id, ref);
        window.pndlApp.showToast(`Registrasi SRIKANDI berhasil dicatat (${ref})!`, 'success');
        close();
        this.render();
      }
    };

    // 5. Action: Srikandi Signed TTE
    document.querySelector('.btn-action-srikandi-signed').onclick = () => {
      const noSurat = prompt('Masukkan Nomor Surat Resmi PNJ:', '1088/PL3/TU/2026');
      if (noSurat) {
        const tgl = prompt('Masukkan Tanggal Surat:', new Date().toISOString().substring(0, 10));
        window.pndlStore.recordSrikandiSigned(app.case_id || app.id, noSurat, tgl, 'Dr. Sc. H. Zainal Nur Arifin (Direktur PNJ)', `Surat_Pengantar_TTE_${app.case_id || app.id}.pdf`);
        window.pndlApp.showToast('Nomor surat dan dokumen TTE sah berhasil disimpan!', 'success');
        close();
        this.render();
      }
    };

    // 6. Action: PINTAS Submission
    document.querySelector('.btn-action-pintas-submit').onclick = () => {
      const pintasRef = prompt('Masukkan Nomor Registrasi / Tiket Portal Kementerian (PINTAS/Setneg):', `PINTAS-KEMEN-2026-${Date.now().toString().slice(-5)}`);
      if (pintasRef) {
        window.pndlStore.recordPintasSubmitted(app.case_id || app.id, pintasRef, new Date().toISOString().substring(0, 10));
        window.pndlApp.showToast(`Pendaftaran ke portal kementerian tercatat (${pintasRef})!`, 'success');
        close();
        this.render();
      }
    };

    // 7. Action: SP Setneg Clearance
    document.querySelector('.btn-action-sp-setneg').onclick = () => {
      const isApproved = confirm('Pilih OK jika Surat Persetujuan (SP) TERBIT SAH, atau CANCEL jika DITOLAK kementerian:');
      if (isApproved) {
        const spDoc = prompt('Nama/Nomor file Surat Persetujuan (SP) Kemensetneg:', `SP_Kemensetneg_${app.case_id || app.id}_B32.pdf`);
        window.pndlStore.recordKementerianDecision(app.case_id || app.id, true, spDoc);
        window.pndlApp.showToast('Surat Persetujuan (SP) Kemensetneg resmi terbit!', 'success');
      } else {
        const reason = prompt('Alasan penolakan dari kementerian:', 'Persyaratan administratif belum terpenuhi.');
        if (reason) {
          window.pndlStore.recordKementerianDecision(app.case_id || app.id, false, '', reason);
          window.pndlApp.showToast('Status penolakan kementerian berhasil dicatat.', 'warning');
        }
      }
      close();
      this.render();
    };

    // 8. Action: LPJ & Close Case
    document.querySelector('.btn-action-close-case').onclick = () => {
      if (confirm('Sahkan Laporan Pertanggungjawaban (LPJ) dan tutup kasus secara permanen (CLOSED)?')) {
        window.pndlStore.verifyLpjAndClose(app.case_id || app.id);
        window.pndlApp.showToast('Kasus berhasil ditutup dan diarsipkan secara permanen!', 'success');
        close();
        this.render();
      }
    };

    // Save internal confidential note
    document.getElementById('btn-save-modal-note').onclick = () => {
      const text = document.getElementById('modal-internal-note-text').value.trim();
      if (!text) return;
      window.pndlStore.addInternalNote(app.case_id || app.id, text);
      window.pndlApp.showToast('Catatan rahasia internal KUI berhasil disimpan!', 'success');
      this.openSplitReviewModal(window.pndlStore.getApplicationById(app.case_id || app.id));
    };
  }

  bindEvents() {
    window.addEventListener('pndl:mobility-changed', () => this.render());
    window.addEventListener('pndl:profile-updated', () => this.render());
  }

  bindDynamicElements() {
    // Navigation Tabs in Sidebar
    const tabDash = document.getElementById('kui-tab-dash');
    const tabUpcoming = document.getElementById('kui-tab-upcoming');
    const tabAnalytics = document.getElementById('kui-tab-analytics');
    const tabMaster = document.getElementById('kui-tab-master');
    const tabAudit = document.getElementById('kui-tab-audit');

    if (tabDash) tabDash.onclick = () => { this.currentNavTab = 'dashboard'; this.render(); };
    if (tabUpcoming) tabUpcoming.onclick = () => { this.currentNavTab = 'upcoming'; this.render(); };
    if (tabAnalytics) tabAnalytics.onclick = () => { this.currentNavTab = 'analytics'; this.render(); };
    if (tabMaster) tabMaster.onclick = () => { this.currentNavTab = 'master'; this.render(); };
    if (tabAudit) tabAudit.onclick = () => { this.currentNavTab = 'audit'; this.render(); };

    // Refresh & Logout
    const btnRefresh = document.getElementById('btn-admin-refresh');
    if (btnRefresh) btnRefresh.onclick = () => { this.render(); window.pndlApp.showToast('Data diperbarui.', 'info'); };

    const btnLogout = document.getElementById('btn-admin-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        window.pndlStore.logout();
        window.location.href = 'index.html';
      };
    }

    // Export CSV / Report
    document.querySelectorAll('.btn-export-all').forEach(b => {
      b.onclick = () => {
        const apps = window.pndlStore.getApplications();
        const headers = ['Case ID', 'Pemohon', 'NIP/NIM', 'Peran', 'Negara Tujuan', 'Mitra', 'Mulai', 'Selesai', 'Status', 'Pendanaan'];
        const rows = apps.map(a => [
          a.case_id || a.id,
          `"${a.applicantName}"`,
          `"${a.applicantNimNip}"`,
          a.applicantRole,
          a.destinationCountry,
          `"${a.hostInstitution}"`,
          a.startDate || a.tanggal_mulai,
          a.endDate || a.tanggal_selesai,
          a.statusLabel,
          a.funding_scheme || a.fundingSource
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Laporan_PDLN_PNJ_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.pndlApp.showToast('Laporan CSV berhasil diunduh!', 'success');
      };
    });

    // Sub-modules triggers
    const btnNavMob = document.getElementById('btn-admin-nav-mobility');
    if (btnNavMob) {
      btnNavMob.onclick = () => {
        // Alihkan tampilan ke modul Form Catat Mobilitas
        const kuiRoot = document.getElementById('kui-portal-root');
        const mobilityRoot = document.getElementById('mobility-portal-root');
        if (kuiRoot) kuiRoot.style.display = 'none';
        if (mobilityRoot) {
          mobilityRoot.style.display = 'block';
          window.pndlMobility.render();
          window.scrollTo(0, 0);
        }
      };
    }

    const btnNavWord = document.getElementById('btn-admin-nav-word');
    if (btnNavWord) {
      btnNavWord.onclick = () => {
        if (window.pndlWord) window.pndlWord.openTemplateModal();
      };
    }

    // Filter Buttons in Table
    document.querySelectorAll('[data-f]').forEach(btn => {
      btn.onclick = () => {
        this.currentFilter = btn.dataset.f;
        this.render();
      };
    });

    // Search input
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        const panel = document.getElementById('admin-table-panel');
        if (panel) {
          const apps = window.pndlStore.getApplications();
          panel.outerHTML = this.renderApplicationsTable(apps);
          this.bindDynamicElements();
        }
      };
    }

    // Open Modal
    document.querySelectorAll('.btn-open-split-modal').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const app = window.pndlStore.getApplicationById(id);
        if (app) this.openSplitReviewModal(app);
      };
    });

    // Master Data Category Buttons
    document.querySelectorAll('[data-cat]').forEach(btn => {
      btn.onclick = () => {
        this.masterCategory = btn.dataset.cat;
        this.render();
      };
    });

    // Master Data Toggle
    document.querySelectorAll('.btn-toggle-master').forEach(btn => {
      btn.onclick = () => {
        const id = Number(btn.dataset.id);
        window.pndlStore.toggleMasterConfig(id);
        window.pndlApp.showToast('Status master data diubah.', 'info');
        this.render();
      };
    });

    // Master Data Add Trigger
    const btnAddMaster = document.getElementById('btn-add-master-config');
    if (btnAddMaster) {
      btnAddMaster.onclick = () => {
        const cat = prompt('Pilih Kategori (MASTER_NEGARA / MASTER_KEGIATAN / URGENCY_RULE):', 'MASTER_NEGARA');
        if (cat) {
          const name = prompt('Nama Item / Negara / Kegiatan:', 'Prancis');
          const val = prompt('Rincian / Kota / Aturan:', 'Paris, Lyon, Marseille');
          if (name && val) {
            window.pndlStore.addMasterConfig(cat, name, val);
            window.pndlApp.showToast('Master data berhasil ditambahkan!', 'success');
            this.render();
          }
        }
      };
    }
  }
}

window.pndlKui = new KuiPortal();
