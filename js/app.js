/* ==========================================================================
   PDLN PNJ — APP ROUTER & AUTH ENGINE (APP.JS)
   Sistem Pengelolaan Perjalanan Dinas Luar Negeri Politeknik Negeri Jakarta
   ========================================================================== */

class App {
  constructor() {
    this.toastContainer = null;
    this.currentMainView = 'dashboard';
  }

  init() {
    this.initErrorBoundary();
    this.createToastContainer();
    this.bindEvents();

    // Initialize sub-modules
    if (window.pndlApplicant) window.pndlApplicant.init();
    if (window.pndlPimpinan) window.pndlPimpinan.init();
    if (window.pndlKui) window.pndlKui.init();
    if (window.pndlBot) window.pndlBot.init();
    if (window.pndlWord) window.pndlWord.init();
    if (window.pndlDiagrams) window.pndlDiagrams.init();
    if (window.pndlMobility) window.pndlMobility.init();

    this.routeViews();
    this.updateNotificationBadge();
  }

  switchToView(viewName, options = {}) {
    // Tangkap data aktif jika berpindah dari tab mobilitas
    if (this.currentMainView === 'mobility' && window.pndlMobility) {
      window.pndlMobility.captureCurrentStepInputs();
    }

    this.currentMainView = viewName;
    const applicantRoot = document.getElementById('applicant-portal-root');
    const mobilityRoot = document.getElementById('mobility-portal-root');
    const pimpinanRoot = document.getElementById('pimpinan-portal-root');
    const kuiRoot = document.getElementById('kui-portal-root');

    // Update desktop nav buttons
    document.querySelectorAll('.desktop-nav-menu .nav-link-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update mobile bottom bar
    document.querySelectorAll('.mobile-bottom-bar .mobile-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === (viewName === 'dashboard' ? 'home' : viewName));
    });

    // Hide all main portal roots first
    if (applicantRoot) applicantRoot.style.display = 'none';
    if (mobilityRoot) mobilityRoot.style.display = 'none';
    if (pimpinanRoot) pimpinanRoot.style.display = 'none';
    if (kuiRoot) kuiRoot.style.display = 'none';

    if (viewName === 'dashboard') {
      const user = window.pndlStore.getCurrentUser();
      if (user && user.role === 'pimpinan') {
        if (pimpinanRoot) {
          pimpinanRoot.style.display = 'block';
          window.pndlPimpinan.render();
        }
      } else if (user && (user.role === 'kui_admin' || user.role === 'kui_operator')) {
        if (kuiRoot) {
          kuiRoot.style.display = 'block';
          window.pndlKui.render();
        }
      } else {
        if (applicantRoot) {
          applicantRoot.style.display = 'block';
          window.pndlApplicant.render();
        }
      }
    } else if (viewName === 'mobility') {
      if (mobilityRoot) {
        mobilityRoot.style.display = 'block';
        if (options.category) window.pndlMobility.currentCategory = options.category;
        window.pndlMobility.render();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // NFR P0: Global Client-Side Error Boundary (Mencegah White-Screen Fatal)
  initErrorBoundary() {
    window.onerror = (message, source, lineno, colno, error) => {
      console.error('[PDLN Error Boundary Caught]:', message, error);
      // Hindari memblokir user jika error non-kritis (misal script ekstensi browser)
      if (source && (source.includes('extension') || source.includes('chrome-extension'))) {
        return;
      }
      this.showToast('Terjadi kendala minor sistem. Halaman tetap dapat digunakan.', 'warning');
    };

    window.onunhandledrejection = (event) => {
      console.warn('[PDLN Unhandled Rejection Caught]:', event.reason);
    };
  }

  createToastContainer() {
    let el = document.getElementById('toast-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast-root';
      el.className = 'toast-container';
      document.body.appendChild(el);
    }
    this.toastContainer = el;
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} toast-enter`;

    const iconSvg = type === 'success' ? Icons.checkCircle(16, 'text-success') :
                    type === 'warning' ? Icons.alertCircle(16, 'text-warning') :
                    Icons.fileText(16, 'text-brand');

    toast.innerHTML = `
      <span>${iconSvg}</span>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 220);
    }, 3200);
  }

  // Custom Modern Modal Dialog (Pengganti alert() & confirm() bawaan browser)
  showDialog({
    title = 'Pemberitahuan Sistem',
    message = '',
    type = 'info', // 'info', 'warning', 'danger', 'success'
    confirmText = 'OK',
    cancelText = null, // null jika alert satu tombol
    onConfirm = () => {},
    onCancel = () => {}
  }) {
    // Buat root dialog jika belum ada
    let dialogOverlay = document.getElementById('custom-pndl-dialog');
    if (dialogOverlay) dialogOverlay.remove();

    dialogOverlay = document.createElement('div');
    dialogOverlay.id = 'custom-pndl-dialog';
    dialogOverlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.15s ease-out;
    `;

    const iconBg = type === 'warning' ? '#FEF3C7' :
                   type === 'danger' ? '#FEE2E2' :
                   type === 'success' ? '#DCFCE7' : '#E0F2FE';

    const iconColor = type === 'warning' ? '#D97706' :
                     type === 'danger' ? '#DC2626' :
                     type === 'success' ? '#16A34A' : '#0284C7';

    const iconSvg = type === 'warning' ? Icons.alertCircle(24) :
                    type === 'danger' ? Icons.alertCircle(24) :
                    type === 'success' ? Icons.checkCircle(24) : Icons.fileText(24);

    const isConfirm = !!cancelText;

    dialogOverlay.innerHTML = `
      <div style="
        background: #FFFFFF;
        border-radius: 14px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        max-width: 440px;
        width: 100%;
        overflow: hidden;
        border: 1px solid #E2E8F0;
        animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <div style="padding: 24px;">
          <div style="display: flex; gap: 16px; align-items: flex-start;">
            <div style="
              width: 44px; height: 44px; border-radius: 10px;
              background: ${iconBg}; color: ${iconColor};
              display: flex; align-items: center; justify-content: center;
              flex-shrink: 0;
            ">
              ${iconSvg}
            </div>
            <div style="flex: 1;">
              <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 800; color: #0F172A; line-height: 1.3;">
                ${title}
              </h3>
              <div style="font-size: 13.5px; color: #475569; line-height: 1.55;">
                ${message}
              </div>
            </div>
          </div>
        </div>

        <div style="
          padding: 12px 20px;
          background: #F8FAFC;
          border-top: 1px solid #E2E8F0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        ">
          ${isConfirm ? `
            <button type="button" class="btn btn-secondary btn-sm" id="btn-dlg-cancel" style="font-weight: 600; padding: 7px 16px; border-radius: 6px;">
              ${cancelText}
            </button>
          ` : ''}
          <button type="button" class="btn btn-primary btn-sm" id="btn-dlg-confirm" style="
            font-weight: 700;
            padding: 7px 18px;
            border-radius: 6px;
            background: ${type === 'danger' ? '#DC2626' : '#0A3A60'};
            border-color: ${type === 'danger' ? '#DC2626' : '#0A3A60'};
          ">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(dialogOverlay);

    const closeDialog = () => {
      dialogOverlay.remove();
    };

    const confirmBtn = document.getElementById('btn-dlg-confirm');
    if (confirmBtn) {
      confirmBtn.focus();
      confirmBtn.onclick = () => {
        closeDialog();
        onConfirm();
      };
    }

    const cancelBtn = document.getElementById('btn-dlg-cancel');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        closeDialog();
        onCancel();
      };
    }
  }

  // Shortcut alert cantik
  alert(message, title = 'Perhatian') {
    return new Promise((resolve) => {
      this.showDialog({
        title,
        message,
        type: 'warning',
        confirmText: 'Mengerti',
        onConfirm: resolve
      });
    });
  }

  // Shortcut confirm cantik
  confirm(message, title = 'Konfirmasi Tindakan', type = 'info') {
    return new Promise((resolve) => {
      this.showDialog({
        title,
        message,
        type,
        confirmText: 'Lanjutkan',
        cancelText: 'Batal',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  }

  // Shortcut prompt input modern (Pengganti prompt() browser)
  prompt(message, defaultValue = '', title = 'Unggah Dokumen Perbaikan') {
    return new Promise((resolve) => {
      let dialogOverlay = document.getElementById('custom-pndl-dialog');
      if (dialogOverlay) dialogOverlay.remove();

      dialogOverlay = document.createElement('div');
      dialogOverlay.id = 'custom-pndl-dialog';
      dialogOverlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(4px);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: fadeIn 0.15s ease-out;
      `;

      dialogOverlay.innerHTML = `
        <div style="
          background: #FFFFFF;
          border-radius: 14px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          max-width: 460px;
          width: 100%;
          overflow: hidden;
          border: 1px solid #E2E8F0;
          animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          <div style="padding: 24px;">
            <div style="display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px;">
              <div style="
                width: 44px; height: 44px; border-radius: 10px;
                background: #E0F2FE; color: #0284C7;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0;
              ">
                ${Icons.upload(22)}
              </div>
              <div style="flex: 1;">
                <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 800; color: #0F172A;">
                  ${title}
                </h3>
                <div style="font-size: 13px; color: #64748B; line-height: 1.5;">
                  ${message}
                </div>
              </div>
            </div>

            <div>
              <label style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; display: block;">
                Nama Berkas PDF Baru:
              </label>
              <input type="text" id="dlg-prompt-input" value="${defaultValue}" style="
                width: 100%;
                padding: 10px 12px;
                border: 1.5px solid #CBD5E1;
                border-radius: 8px;
                font-size: 13.5px;
                font-family: inherit;
                outline: none;
                box-sizing: border-box;
                color: #0F172A;
                transition: border-color 0.15s;
              " onfocus="this.style.borderColor='#0A3A60'" onblur="this.style.borderColor='#CBD5E1'">
            </div>
          </div>

          <div style="
            padding: 14px 20px;
            background: #F8FAFC;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          ">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-prompt-cancel" style="font-weight: 600; padding: 7px 16px;">
              Batal
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-prompt-confirm" style="
              font-weight: 700;
              padding: 7px 20px;
              background: #0A3A60;
              border-color: #0A3A60;
            ">
              Kirim Perbaikan
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(dialogOverlay);

      const inp = document.getElementById('dlg-prompt-input');
      if (inp) {
        inp.focus();
        inp.select();
        inp.onkeydown = (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = inp.value.trim();
            dialogOverlay.remove();
            resolve(val || null);
          } else if (e.key === 'Escape') {
            dialogOverlay.remove();
            resolve(null);
          }
        };
      }

      document.getElementById('btn-prompt-confirm').onclick = () => {
        const val = inp ? inp.value.trim() : '';
        dialogOverlay.remove();
        resolve(val || null);
      };

      document.getElementById('btn-prompt-cancel').onclick = () => {
        dialogOverlay.remove();
        resolve(null);
      };
    });
  }

  renderNavbar(user, isAdminMode) {
    const navBar = document.getElementById('main-navbar');
    const mobileBar = document.getElementById('mobile-bottom-bar');
    const mainFooter = document.getElementById('main-footer');
    const chatbotRoot = document.getElementById('chatbot-root');
    const navName = document.getElementById('nav-user-name');
    const navRole = document.getElementById('nav-user-role');
    const navAvatar = document.getElementById('nav-user-avatar');
    const mainWrapper = document.getElementById('main-content-wrapper');
    const appPortalContainer = document.getElementById('app-portal-container');
    const mobilityRoot = document.getElementById('mobility-portal-root');

    const isUserAdminOrOperator = user && (user.role === 'kui_admin' || user.role === 'kui_operator');
    const isUserPimpinan = user && user.role === 'pimpinan';
    // Hanya Admin/Operator KUI yang menggunakan Dedicated Workspace (kui-portal-root di luar app-portal-container)
    const isDedicatedDashboard = !!user && (isAdminMode || isUserAdminOrOperator);

    if (!user) {
      if (navBar) navBar.style.display = 'none';
      if (mobileBar) {
        mobileBar.style.display = 'none';
        mobileBar.classList.add('is-hidden');
      }
      if (mainFooter) mainFooter.style.display = 'none';
      if (chatbotRoot) chatbotRoot.style.display = 'none';
      if (mobilityRoot) mobilityRoot.style.display = 'none';
      if (mainWrapper) mainWrapper.style.padding = '';
      if (appPortalContainer) appPortalContainer.style.display = '';
      return;
    }

    if (isDedicatedDashboard) {
      if (navBar) navBar.style.display = 'none';
      if (mobileBar) {
        mobileBar.style.display = 'none';
        mobileBar.classList.add('is-hidden');
      }
      if (mainFooter) mainFooter.style.display = 'none';
      if (chatbotRoot) chatbotRoot.style.display = 'none';
      if (mainWrapper) mainWrapper.style.padding = '0';
      if (appPortalContainer) appPortalContainer.style.display = 'none';
      return;
    }

    // Role Mahasiswa / Dosen: Pastikan form rekap mobilitas KUI tidak pernah bocor
    if (mobilityRoot) mobilityRoot.style.display = 'none';

    if (navBar) navBar.style.display = 'block';
    if (mainWrapper) mainWrapper.style.padding = '';
    if (appPortalContainer) appPortalContainer.style.display = '';
    if (mobileBar) {
      mobileBar.style.display = '';
      mobileBar.classList.remove('is-hidden');
    }
    if (mainFooter) mainFooter.style.display = 'block';
    if (chatbotRoot) chatbotRoot.style.display = 'block';

    if (navName) navName.textContent = user.full_name || user.name;
    if (navRole) {
      navRole.textContent = user.role === 'dosen' ? 'Dosen Tetap' :
                            user.role === 'pimpinan' ? 'Direktur PNJ' :
                            user.role === 'kui_operator' ? 'KUI Operator' :
                            user.role === 'kui_admin' ? 'KUI Admin' : 'Mahasiswa Aktif';
    }
    if (navAvatar) navAvatar.textContent = user.avatar || 'PNJ';

    this.updateNotificationBadge();
  }

  // Notification Center Updates
  updateNotificationBadge() {
    const user = window.pndlStore.getCurrentUser();
    const badgeEl = document.getElementById('notif-badge-count');
    if (!badgeEl) return;

    if (!user) {
      badgeEl.style.display = 'none';
      return;
    }

    const notifs = window.pndlStore.getNotifications(user.id);
    const unread = notifs.filter(n => !n.is_read).length;

    badgeEl.textContent = unread;
    badgeEl.style.display = unread > 0 ? 'flex' : 'none';
  }

  toggleNotificationDrawer() {
    const drawer = document.getElementById('notif-drawer');
    if (!drawer) return;

    if (drawer.style.display === 'block') {
      drawer.style.display = 'none';
      return;
    }

    const user = window.pndlStore.getCurrentUser();
    const notifs = user ? window.pndlStore.getNotifications(user.id) : [];

    drawer.innerHTML = `
      <div class="notif-header">
        <strong style="font-size: 13px; color: var(--neutral-900); display: flex; align-items: center; gap: 6px;">
          ${Icons.shield(14)} Notifikasi Sistem PDLN
        </strong>
        <button class="btn btn-secondary btn-sm" id="btn-mark-all-read" style="font-size: 10.5px; padding: 2px 8px;">
          Tandai Dibaca
        </button>
      </div>

      <div class="notif-feed-list">
        ${notifs.length === 0 ? `
          <div style="padding: 24px; text-align: center; color: var(--neutral-400); font-size: 12px;">
            Belum ada notifikasi baru.
          </div>
        ` : notifs.map(n => `
          <div class="notif-feed-item ${n.is_read ? '' : 'unread'}">
            <div class="notif-item-title">${n.title}</div>
            <div class="notif-item-msg">${n.message}</div>
            <div class="notif-item-meta">
              <span>${n.created_at}</span>
              ${n.is_email_sent ? `<span style="color: #0284c7; font-weight: 600;">${Icons.check(10)} Email Terkirim</span>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    drawer.style.display = 'block';

    const btnMark = document.getElementById('btn-mark-all-read');
    if (btnMark && user) {
      btnMark.onclick = () => {
        window.pndlStore.markAllNotificationsRead(user.id);
        this.updateNotificationBadge();
        drawer.style.display = 'none';
        this.showToast('Semua notifikasi ditandai sudah dibaca.', 'info');
      };
    }
  }

  // Sesi pengguna institusional PNJ


  renderAuthView(isAdminPage) {
    const authRoot = document.getElementById('auth-portal-root');
    if (!authRoot) return;

    authRoot.innerHTML = `
      <div class="auth-page motion-fade-in">
        <div class="auth-card">
          <!-- Visual Side -->
          <div class="auth-visual">
            <img src="assets/hero_travel.jpg" alt="PNJ Travel Portal" class="auth-visual-img">
            <div class="auth-visual-content">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                <div style="background: white; padding: 4px; border-radius: 8px; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
                  <img src="assets/logo_pnj.png" alt="PNJ Logo" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
                <span style="font-weight: 800; font-size: 13px; letter-spacing: 1px; color: var(--white);">POLITEKNIK NEGERI JAKARTA</span>
              </div>

              <div class="auth-visual-tag">
                ${Icons.shield(14)} Sistem Internal PDLN PNJ Berdasarkan 162 FR
              </div>
              <h2 class="auth-visual-title">
                ${isAdminPage ? 'Portal Kontrol Administrator & Operator KUI' : 'Portal Pra-Pengajuan & Verifikasi PDLN'}
              </h2>
              <p class="auth-visual-desc">
                Portal resmi pemrosesan izin dinas luar negeri terpadu: Pra-pengajuan internal civitas, verifikasi KUI, disposisi Direktur PNJ, naskah dinas SRIKANDI, hingga clearance Setneg RI.
              </p>
            </div>
            <div style="font-size: 11px; color: var(--neutral-400); position: relative; z-index: 2;">
              Kantor Urusan Internasional (KUI) PNJ &copy; 2026
            </div>
          </div>

          <!-- Form Login Side -->
          <div class="auth-form-side">
            <div class="auth-header">
              <h2>${isAdminPage ? 'Login Operator & Admin KUI' : 'Masuk Akun SSO PNJ'}</h2>
              <p>${isAdminPage ? 'Gunakan akun berwenang verifikasi institusi PNJ.' : 'Gunakan akun Single Sign-On (SSO) resmi Politeknik Negeri Jakarta.'}</p>
            </div>

            <!-- Quick Demo Testing Chips (Styled as Professional Role Badges) -->
            <div class="demo-accounts-box">
              <div class="demo-accounts-title">Simulasi Role Civitas:</div>
              <div class="demo-chips">
                <button class="demo-chip-btn" data-login-user="mhs-1" title="Masuk sebagai Mahasiswa Aktif">
                  ${Icons.user(13)} Mahasiswa
                </button>
                <button class="demo-chip-btn" data-login-user="dosen-1" title="Masuk sebagai Dosen">
                  ${Icons.building(13)} Dosen
                </button>
                <button class="demo-chip-btn" data-login-user="kui-admin" title="Masuk sebagai Operator KUI">
                  ${Icons.shield(13)} Operator KUI
                </button>
                <button class="demo-chip-btn" data-login-user="pimpinan-1" title="Masuk sebagai Direktur PNJ">
                  ${Icons.building(13)} Direktur
                </button>
              </div>
            </div>

            <form id="form-login-manual">
              <div class="form-group">
                <label class="form-label">NIM / NIP / Username SSO</label>
                <input type="text" id="login-identifier" class="form-control" value="20260001" required>
              </div>
              <div class="form-group">
                <label class="form-label">Kata Sandi</label>
                <input type="password" id="login-password" class="form-control" value="password" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 4px;">
                ${Icons.shield(15)} Masuk Akun SSO PNJ
              </button>
            </form>

            <div style="margin-top: 16px; text-align: center; font-size: 11.5px; color: var(--neutral-400);">
              Layanan Terpadu Single Sign-On (SSO) Politeknik Negeri Jakarta
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind demo chips
    document.querySelectorAll('.demo-chip-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const uid = btn.dataset.loginUser;
        window.pndlStore.quickLogin(uid);
        const user = window.pndlStore.getCurrentUser();
        this.showToast(`Login berhasil sebagai ${user.full_name}`, 'success');
        if (user.role === 'kui_admin' || user.role === 'kui_operator') {
          window.location.search = '?page=admin';
        } else if (user.role === 'pimpinan') {
          window.location.search = '?page=pimpinan';
        } else {
          window.location.search = '?page=user';
        }
      };
    });

    // Manual login form
    const form = document.getElementById('form-login-manual');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const idVal = document.getElementById('login-identifier')?.value;
        const passVal = document.getElementById('login-password')?.value;
        const res = window.pndlStore.login(idVal, passVal);
        if (res.success) {
          this.showToast(`Selamat datang, ${res.user.full_name}!`, 'success');
          if (res.user.role === 'kui_admin' || res.user.role === 'kui_operator') {
            window.location.search = '?page=admin';
          } else if (res.user.role === 'pimpinan') {
            window.location.search = '?page=pimpinan';
          } else {
            window.location.search = '?page=user';
          }
        } else {
          this.showToast(res.message, 'warning');
        }
      };
    }
  }

  routeViews() {
    const isAdminPage = window.pndlStore.isPageAdmin();
    const isPimpinanPage = window.pndlStore.isPagePimpinan();
    const isMobilityPage = window.pndlStore.isPageMobility();
    const user = window.pndlStore.getCurrentUser();

    const authRoot = document.getElementById('auth-portal-root');
    const applicantRoot = document.getElementById('applicant-portal-root');
    const mobilityRoot = document.getElementById('mobility-portal-root');
    const pimpinanRoot = document.getElementById('pimpinan-portal-root');
    const kuiRoot = document.getElementById('kui-portal-root');

    this.renderNavbar(user, isAdminPage);

    if (!user) {
      if (authRoot) authRoot.style.display = 'block';
      if (applicantRoot) applicantRoot.style.display = 'none';
      if (mobilityRoot) mobilityRoot.style.display = 'none';
      if (pimpinanRoot) pimpinanRoot.style.display = 'none';
      if (kuiRoot) kuiRoot.style.display = 'none';
      this.renderAuthView(isAdminPage);
      return;
    }

    if (authRoot) authRoot.style.display = 'none';

    // Route based on role or URL parameters
    if (isMobilityPage) {
      if (applicantRoot) applicantRoot.style.display = 'none';
      if (pimpinanRoot) pimpinanRoot.style.display = 'none';
      if (kuiRoot) kuiRoot.style.display = 'none';
      if (mobilityRoot) {
        mobilityRoot.style.display = 'block';
        window.pndlMobility.render();
      }
    } else if (isAdminPage || user.role === 'kui_admin' || user.role === 'kui_operator') {
      if (applicantRoot) applicantRoot.style.display = 'none';
      if (mobilityRoot) mobilityRoot.style.display = 'none';
      if (pimpinanRoot) pimpinanRoot.style.display = 'none';
      if (kuiRoot) kuiRoot.style.display = 'block';
      window.pndlKui.render();
    } else if (isPimpinanPage || user.role === 'pimpinan') {
      if (applicantRoot) applicantRoot.style.display = 'none';
      if (mobilityRoot) mobilityRoot.style.display = 'none';
      if (kuiRoot) kuiRoot.style.display = 'none';
      if (pimpinanRoot) {
        pimpinanRoot.style.display = 'block';
        window.pndlPimpinan.render();
      }
    } else {
      if (pimpinanRoot) pimpinanRoot.style.display = 'none';
      if (kuiRoot) kuiRoot.style.display = 'none';
      this.switchToView(this.currentMainView || 'dashboard');
    }
  }

  // Interactive Profile Flyout (Clicking profile in Navbar)
  openProfileFlyout() {
    const user = window.pndlStore.getCurrentUser();
    if (!user) return;

    const profile = window.pndlStore.getUserProfile(user.id) || {};

    const modalHtml = `
      <div class="modal-overlay" id="profile-flyout-modal">
        <div class="modal-content profile-flyout-card" style="max-width: 480px;">
          <div class="sheet-drag-handle"></div>
          
          <div class="profile-flyout-header">
            <div class="profile-flyout-avatar">${user.avatar || 'PNJ'}</div>
            <div style="flex: 1;">
              <h3 style="font-size: 16px; font-weight: 800; color: var(--brand-primary); margin: 0;">${user.full_name || user.name}</h3>
              <p style="font-size: 12px; color: var(--neutral-500); margin: 2px 0 0 0;">
                ${user.identity_number || user.nim_nip} • ${user.role.toUpperCase()}
              </p>
              <div style="margin-top: 6px;">
                <span class="badge badge-source">${Icons.check(10)} Terverifikasi SSO PNJ</span>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-prof-flyout" style="border: none; background: transparent;">
              ${Icons.x(16)}
            </button>
          </div>

          <div class="profile-flyout-body">
            <div class="profile-info-row">
              <span class="profile-info-label">Jurusan</span>
              <span class="profile-info-val">${user.unit_department || user.jurusan}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Program Studi</span>
              <span class="profile-info-val">${user.prodi}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Email SSO</span>
              <span class="profile-info-val">${user.email}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Nomor WhatsApp</span>
              <span class="profile-info-val">${profile.no_telepon || 'Belum diisi'}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Nomor Paspor RI</span>
              <span class="profile-info-val">${profile.nomor_paspor || 'Belum diisi'}</span>
            </div>
            <div class="profile-info-row">
              <span class="profile-info-label">Masa Berlaku Paspor</span>
              <span class="profile-info-val">${profile.passport_expiry || 'Belum diisi'}</span>
            </div>
          </div>

          <div style="padding: 16px 24px; border-top: 1px solid var(--neutral-100); display: flex; justify-content: flex-end; align-items: center; background: var(--neutral-50);">
            <button class="btn btn-danger btn-sm" id="btn-flyout-logout">
              ${Icons.logout(14)} Keluar Sesi SSO
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const close = () => {
      const el = document.getElementById('profile-flyout-modal');
      if (el) el.remove();
    };

    document.getElementById('btn-close-prof-flyout').onclick = close;

    document.getElementById('btn-flyout-logout').onclick = () => {
      close();
      window.pndlStore.logout();
      window.location.href = 'index.html';
    };
  }

  bindEvents() {
    // Desktop Nav Menu Tabs
    document.querySelectorAll('.desktop-nav-menu .nav-link-btn[data-view]').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const view = btn.dataset.view;
        this.switchToView(view);
      };
    });

    // Top Navbar Word Template Button
    const btnTopWord = document.getElementById('btn-top-word-template');
    if (btnTopWord) {
      btnTopWord.onclick = (e) => {
        e.preventDefault();
        if (window.pndlWord) window.pndlWord.openTemplateModal();
      };
    }

    // Notification bell button
    const btnNotif = document.getElementById('btn-nav-notif');
    if (btnNotif) {
      btnNotif.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleNotificationDrawer();
      };
    }

    // Close notification drawer when clicking outside
    document.addEventListener('click', (e) => {
      const drawer = document.getElementById('notif-drawer');
      const btn = document.getElementById('btn-nav-notif');
      if (drawer && drawer.style.display === 'block' && !drawer.contains(e.target) && !btn.contains(e.target)) {
        drawer.style.display = 'none';
      }
    });

    // Profile button in navbar
    const btnUserMini = document.getElementById('btn-nav-user-profile');
    if (btnUserMini) {
      btnUserMini.onclick = (e) => {
        e.preventDefault();
        this.openProfileFlyout();
      };
    }

    // Logout button in navbar
    const btnLogout = document.getElementById('btn-nav-logout');
    if (btnLogout) {
      btnLogout.onclick = (e) => {
        e.preventDefault();
        window.pndlStore.logout();
        window.location.href = 'index.html';
      };
    }

    // Mobile bottom bar items
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.onclick = () => {
        document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const navAction = item.dataset.nav;
        if (navAction === 'home') {
          this.switchToView('dashboard');
        } else if (navAction === 'diagrams') {
          this.switchToView('diagrams');
        } else if (navAction === 'mobility') {
          this.switchToView('mobility');
        } else if (navAction === 'word') {
          if (window.pndlWord) window.pndlWord.openTemplateModal();
        } else if (navAction === 'profile') {
          this.openProfileFlyout();
        }
      };
    });

    window.addEventListener('pndl:auth-changed', () => {
      this.routeViews();
    });

    window.addEventListener('pndl:notification-added', () => {
      this.updateNotificationBadge();
    });

    window.addEventListener('pndl:notification-changed', () => {
      this.updateNotificationBadge();
    });
  }
}

window.pndlApp = new App();

document.addEventListener('DOMContentLoaded', () => {
  window.pndlApp.init();
});
