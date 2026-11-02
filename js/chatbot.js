/* ==========================================================================
   PDLN PNJ — CHATBOT ASSISTANT (CHATBOT.JS)
   Layanan Asisten Virtual Kantor Urusan Internasional PNJ
   ========================================================================== */

class ChatbotAssistant {
  constructor() {
    this.isOpen = false;
    this.messages = [];
  }

  init() {
    this.render();
    this.bindEvents();
    this.addWelcomeMessage();
  }

  render() {
    const root = document.getElementById('chatbot-root');
    if (!root) return;

    root.innerHTML = `
      <div class="bot-dock">
        <!-- Floating Launcher FAB -->
        <button class="bot-fab" id="bot-toggle-btn" title="Asisten Virtual PDLN PNJ">
          ${Icons.bot(22)}
        </button>

        <!-- Floating Chat Panel -->
        <div class="bot-panel" id="bot-panel" style="display: none;">
          
          <!-- Header -->
          <div class="bot-panel-header">
            <div>
              <h4>Asisten Virtual PDLN PNJ</h4>
              <p>Panduan Informasi & Layanan Administrasi PDLN</p>
            </div>
            <button class="btn btn-secondary btn-sm btn-icon" id="bot-close-btn" style="background: transparent; border: none; color: var(--white); width: 28px; height: 28px;">
              ${Icons.x(14)}
            </button>
          </div>

          <!-- Feed -->
          <div class="bot-feed" id="bot-feed">
            <!-- Messages will be injected here -->
          </div>

          <!-- Quick Query Chips -->
          <div style="padding: 8px 12px; background: var(--white); border-top: 1px solid var(--neutral-200); display: flex; gap: 6px; flex-wrap: wrap;">
            <button class="btn btn-secondary btn-sm chip-query" data-q="status" style="padding: 4px 8px; font-size: 11px;">Status Saya</button>
            <button class="btn btn-secondary btn-sm chip-query" data-q="kurang" style="padding: 4px 8px; font-size: 11px;">Dokumen Kurang?</button>
            <button class="btn btn-secondary btn-sm chip-query" data-q="paspor" style="padding: 4px 8px; font-size: 11px;">Syarat Paspor</button>
            <button class="btn btn-secondary btn-sm chip-query" data-q="srikandi" style="padding: 4px 8px; font-size: 11px;">Alur SRIKANDI</button>
            <button class="btn btn-secondary btn-sm chip-query" data-q="template" style="padding: 4px 8px; font-size: 11px;">Template Word</button>
            <button class="btn btn-secondary btn-sm chip-query" data-q="lpj" style="padding: 4px 8px; font-size: 11px;">Laporan LPJ</button>
          </div>

          <!-- Input Field -->
          <div style="padding: 10px 12px; background: var(--white); border-top: 1px solid var(--neutral-100); display: flex; gap: 8px;">
            <input type="text" id="bot-input-text" class="form-control" placeholder="Tanyakan prosedur, dokumen, atau status..." style="font-size: 12.5px; min-height: 36px;">
            <button class="btn btn-primary btn-sm" id="bot-send-trigger" style="padding: 6px 12px;">Kirim</button>
          </div>

        </div>
      </div>
    `;

    this.bindDynamicElements();
  }

  addWelcomeMessage() {
    const user = window.pndlStore.getCurrentUser();
    const name = user ? user.full_name : 'Civitas PNJ';
    this.pushMessage('bot', `Halo, <strong>${name}</strong>. Saya asisten resmi KUI Politeknik Negeri Jakarta. Silakan tanyakan seputar status pengajuan Anda, kelengkapan berkas, atau regulasi izin PDLN.`);
  }

  pushMessage(sender, text) {
    this.messages.push({
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    this.renderMessages();
  }

  renderMessages() {
    const feed = document.getElementById('bot-feed');
    if (!feed) return;

    feed.innerHTML = this.messages.map(m => `
      <div class="chat-bubble ${m.sender === 'bot' ? 'chat-bubble-bot' : 'chat-bubble-user'}">
        ${m.text}
        <div style="font-size: 9.5px; opacity: 0.6; margin-top: 3px; text-align: right;">${m.time}</div>
      </div>
    `).join('');

    feed.scrollTop = feed.scrollHeight;
  }

  showTyping(callback) {
    const feed = document.getElementById('bot-feed');
    if (!feed) return;

    const t = document.createElement('div');
    t.className = 'chat-bubble chat-bubble-bot';
    t.id = 'bot-typing-node';
    t.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    feed.appendChild(t);
    feed.scrollTop = feed.scrollHeight;

    setTimeout(() => {
      t.remove();
      callback();
    }, 380);
  }

  handleQuery(queryText) {
    if (!queryText.trim()) return;

    this.pushMessage('user', queryText);
    const q = queryText.toLowerCase();

    this.showTyping(() => {
      const user = window.pndlStore.getCurrentUser();
      const apps = user ? window.pndlStore.getUserApplications(user.id) : [];
      const activeApp = apps[0];
      const profile = user ? window.pndlStore.getUserProfile(user.id) : null;

      // 1. Status Check Query
      if (q.includes('status') || q.includes('progres') || q.includes('progress') || q.includes('pengajuan saya')) {
        if (activeApp) {
          const urgency = window.pndlStore.calculateUrgency(activeApp.startDate || activeApp.tanggal_mulai);
          this.pushMessage('bot', `
            Pengajuan Anda nomor <strong>${activeApp.case_id || activeApp.id}</strong> tujuan <strong>${activeApp.destinationCountry} (${activeApp.destinationCity})</strong>:<br><br>
            • Status Alur: <strong>${activeApp.statusLabel}</strong><br>
            • Progres Sistem: <strong>${activeApp.progress_percentage || activeApp.progress}%</strong><br>
            • Jadwal Berangkat: <strong>${activeApp.startDate || activeApp.tanggal_mulai}</strong> (${urgency.daysLeft} hari lagi)<br>
            • Tingkat Urgensi: <span class="badge badge-source">${urgency.label}</span>
          `);
        } else {
          this.pushMessage('bot', 'Anda belum memiliki permohonan PDLN aktif. Anda dapat membuat usulan baru melalui formulir rencana perjalanan di beranda.');
        }
      }

      // 2. Missing Documents Query
      else if (q.includes('kurang') || q.includes('belum lengkap') || q.includes('revisi apa') || q.includes('dokumen kurang')) {
        if (activeApp) {
          if (activeApp.current_status === 'REVISION' && activeApp.revisionItems && activeApp.revisionItems.length > 0) {
            this.pushMessage('bot', `
              <strong>Perhatian:</strong> Berkas Anda saat ini berstatus <strong>Perlu Revisi</strong>.<br><br>
              Item yang harus diperbaiki: <strong>${activeApp.revisionItems.join(', ')}</strong><br>
              Catatan KUI: <em>"${activeApp.revisionNote}"</em><br><br>
              Silakan klik tombol <strong>Unggah Perbaikan Berkas</strong> pada tiket pengajuan Anda untuk mengunggah scan yang jelas.
            `);
          } else {
            let missingProfile = [];
            if (!profile || !profile.nomor_paspor) missingProfile.push('Nomor Paspor RI');
            if (!profile || !profile.passport_expiry) missingProfile.push('Masa Berlaku Paspor');
            if (!profile || !profile.no_telepon) missingProfile.push('Nomor WhatsApp Aktif');

            if (missingProfile.length > 0) {
              this.pushMessage('bot', `Dokumen pengajuan Anda lengkap. Namun data profil mandiri Anda masih kekurangan: <strong>${missingProfile.join(', ')}</strong>. Mohon lengkapi di menu Profil.`);
            } else {
              this.pushMessage('bot', `Seluruh dokumen persyaratan utama (Paspor, LoA, SPTJM) pada usulan <strong>${activeApp.case_id || activeApp.id}</strong> telah terpenuhi lengkap.`);
            }
          }
        } else {
          this.pushMessage('bot', 'Tidak ada pengajuan aktif yang kekurangan dokumen. Anda dapat mengajukan permohonan baru kapan saja.');
        }
      }

      // 3. Passport & Validity Query
      else if (q.includes('paspor') || q.includes('passport') || q.includes('expired') || q.includes('masa berlaku')) {
        const kb = window.pndlStore.data.chatbot_knowledge_base.find(k => k.topic_category === 'PASPOR');
        this.pushMessage('bot', kb ? kb.approved_answer : 'Paspor RI wajib masih berlaku minimal 6 bulan terhitung sejak tanggal rencana kepulangan ke tanah air.');
      }

      // 4. Required Documents Query (Knowledge Base)
      else if (q.includes('syarat') || q.includes('dokumen') || q.includes('berkas') || q.includes('checklist')) {
        const kb = window.pndlStore.data.chatbot_knowledge_base.find(k => k.topic_category === 'DOKUMEN_WAJIB');
        this.pushMessage('bot', kb ? kb.approved_answer : 'Dokumen persyaratan mencakup: 1) Scan Paspor RI (min. 6 bulan), 2) LoA / Undangan Resmi Mitra, 3) SPTJM Bermaterai Rp10.000, dan 4) Bukti Jaminan Pembiayaan.');
      }

      // 5. SRIKANDI Query (Knowledge Base)
      else if (q.includes('srikandi') || q.includes('tte') || q.includes('tanda tangan')) {
        const kb = window.pndlStore.data.chatbot_knowledge_base.find(k => k.topic_category === 'SRIKANDI');
        this.pushMessage('bot', kb ? kb.approved_answer : 'SRIKANDI adalah aplikasi persuratan resmi pemerintah untuk penomoran surat dan Tanda Tangan Elektronik (TTE) Direktur PNJ.');
      }

      // 6. Template Word & Inbound/Outbound
      else if (q.includes('template') || q.includes('word') || q.includes('inbound') || q.includes('outbound') || q.includes('visa')) {
        this.pushMessage('bot', `
          Sistem menyediakan template resmi Microsoft Word (.docx) yang otomatis terisi data profil Anda:<br><br>
          1. Surat Pengantar Permohonan Paspor Dinas<br>
          2. Surat Rekomendasi Visa Kunjungan<br>
          3. SPTJM Bermaterai Bebas Tuntutan<br>
          4. Formulir Data Mobilitas Inbound / Outbound<br><br>
          Anda dapat mengaksesnya langsung melalui tombol <strong>Template Word</strong> pada navigasi atas atau beranda.
        `);
      }

      // 7. LPJ & SPPD Query (Knowledge Base)
      else if (q.includes('lpj') || q.includes('laporan') || q.includes('sppd') || q.includes('selesai') || q.includes('kuitansi')) {
        const kb = window.pndlStore.data.chatbot_knowledge_base.find(k => k.topic_category === 'LPJ_SPPD');
        this.pushMessage('bot', kb ? kb.approved_answer : 'Setelah kegiatan selesai, pemohon wajib mengunggah Laporan Pertanggungjawaban (LPJ) dan kuitansi SPPD maksimal 14 hari kerja.');
      }

      // 8. Fallback / Layanan Umum
      else {
        this.pushMessage('bot', `
          Untuk pertanyaan umum atau konsultasi teknis yang tidak tercantum dalam knowledge base, silakan hubungi <strong>Kantor Urusan Internasional (KUI) PNJ</strong> di Gedung Direktorat Lt. 2 atau kirim pesan email ke <strong>kui@pnj.ac.id</strong>.<br><br>
          <em>(Catatan: Asisten virtual bersifat informatif dan tidak dapat mengubah status administratif berkas Anda secara sepihak).</em>
        `);
      }
    });
  }

  bindEvents() {
    window.addEventListener('pndl:auth-changed', () => {
      this.messages = [];
      this.addWelcomeMessage();
    });
  }

  bindDynamicElements() {
    const toggleBtn = document.getElementById('bot-toggle-btn');
    const closeBtn = document.getElementById('bot-close-btn');
    const panel = document.getElementById('bot-panel');
    const sendBtn = document.getElementById('bot-send-trigger');
    const input = document.getElementById('bot-input-text');

    if (toggleBtn && panel) {
      toggleBtn.onclick = () => {
        this.isOpen = !this.isOpen;
        panel.style.display = this.isOpen ? 'flex' : 'none';
        if (this.isOpen && input) input.focus();
      };
    }

    if (closeBtn && panel) {
      closeBtn.onclick = () => {
        this.isOpen = false;
        panel.style.display = 'none';
      };
    }

    if (sendBtn && input) {
      const doSend = () => {
        const val = input.value.trim();
        if (val) {
          input.value = '';
          this.handleQuery(val);
        }
      };

      sendBtn.onclick = doSend;
      input.onkeydown = (e) => {
        if (e.key === 'Enter') doSend();
      };
    }

    // Quick chip queries
    document.querySelectorAll('.chip-query').forEach(b => {
      b.onclick = () => {
        const type = b.dataset.q;
        let query = 'Bagaimana status pengajuan saya?';
        if (type === 'kurang') query = 'Dokumen apa yang masih kurang pada berkas saya?';
        else if (type === 'paspor') query = 'Berapa lama masa berlaku paspor yang diwajibkan?';
        else if (type === 'srikandi') query = 'Bagaimana alur persuratan di SRIKANDI?';
        else if (type === 'template') query = 'Bagaimana cara menggunakan template Word mandiri?';
        else if (type === 'lpj') query = 'Bagaimana tata cara penyerahan LPJ dan SPPD?';
        this.handleQuery(query);
      };
    });
  }
}

window.pndlBot = new ChatbotAssistant();
