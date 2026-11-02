/* ==========================================================================
   PDLN PNJ — WORD TEMPLATE INTEGRATION ENGINE (WORD-TEMPLATE.JS)
   Integrated with Google Apps Script Reference Templates for PDLN PNJ
   Generates editable Microsoft Word (.docx) documents with live preview & export
   ========================================================================== */

class WordTemplateEngine {
  constructor() {
    this.templates = {
      surat_tugas: {
        id: 'surat_tugas',
        name: 'Surat Tugas Direktur PNJ (PDLN Resmi)',
        code: 'ST-DIR-PDLN',
        description: 'Surat penugasan resmi dari Direktur Politeknik Negeri Jakarta untuk perjalanan dinas luar negeri.',
        category: 'Resmi PNJ'
      },
      permohonan_setneg: {
        id: 'permohonan_setneg',
        name: 'Formulir Permohonan Izin PDLN Kemensetneg RI',
        code: 'FORM-SETNEG-01',
        description: 'Formulir resmi clearance izin perjalanan dinas ke Kementerian Sekretariat Negara RI.',
        category: 'Kemensetneg'
      },
      sptjm: {
        id: 'sptjm',
        name: 'Surat Pertanggungjawaban Mutlak (SPTJM)',
        code: 'SPTJM-KUI-PNJ',
        description: 'Pernyataan keabsahan data bermaterai Rp10.000 wajib pemohon PDLN.',
        category: 'KUI PNJ'
      },
      berita_acara_mobilitas: {
        id: 'berita_acara_mobilitas',
        name: 'Berita Acara & Rekapitulasi Rombongan Mobilitas',
        code: 'BA-MOBILITAS-PNJ',
        description: 'Daftar rekapitulasi rombongan keluar (Outbound) atau masuk (Inbound) untuk delegasi mahasiswa/dosen.',
        category: 'Mobilitas Global'
      }
    };

    this.activeTemplateId = 'surat_tugas';
    this.currentData = null;
  }

  init() {
    this.bindEvents();
  }

  getDefaultData() {
    const user = window.pndlStore.getCurrentUser() || {
      name: 'Andi Pratama',
      nim_nip: '20260001',
      role: 'mahasiswa',
      jurusan: 'Teknik Informatika dan Komputer',
      prodi: 'Teknik Informatika (S1 Terapan)',
      passport_no: 'B7894561'
    };

    const apps = window.pndlStore.getApplications();
    const app = apps[0] || {};
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      nomor_surat: 'B/1422/PL3/TU.00/2026',
      tanggal_surat: todayStr,
      nama: user.name || 'Andi Pratama',
      nim_nip: user.nim_nip || '20260001',
      jabatan_prodi: user.role === 'dosen' ? `Dosen Tetap Jurusan ${user.jurusan}` : `Mahasiswa Program Studi ${user.prodi}`,
      role_label: user.role === 'dosen' ? 'Dosen' : 'Mahasiswa',
      jurusan: user.jurusan || 'Teknik Informatika dan Komputer',
      prodi: user.prodi || 'Teknik Informatika (S1 Terapan)',
      no_paspor: user.passport_no || 'B7894561',
      tujuan_kegiatan: app.purposeLabel || 'Pertukaran Mahasiswa (Student Exchange)',
      negara_tujuan: app.destinationCountry || 'Korea Selatan',
      kota_tujuan: app.destinationCity || 'Seoul',
      lembaga_mitra: app.hostInstitution || 'Seoul National University of Science and Technology',
      tanggal_berangkat: app.startDate || '2026-10-15',
      tanggal_kembali: app.endDate || '2027-02-28',
      durasi_hari: app.durationDays || '136',
      jumlah_peserta: '1',
      sumber_dana: app.fundingSource === 'pnj' ? 'DIPA Politeknik Negeri Jakarta' : 
                   app.fundingSource === 'sponsor_eksternal' ? `Sponsor Eksternal (${app.sponsorName || 'GKS'})` : 'Mandiri / Beasiswa Mitra',
      sponsor_name: app.sponsorName || 'Global Korea Scholarship (GKS)',
      dasar_hukum: 'Nota Dinas Wakil Direktur Bidang Kerjasama Nomor 0411/PL3.WDIR4/KS/2026',
      nama_direktur: 'Dr. Sc. H. Zainal Nur Arifin, Dipl-Ing. HTL., M.T.',
      nip_direktur: '196111101989031002',
      daftar_peserta: [
        { no: 1, nama: user.name, id: user.nim_nip, role: 'Ketua / Pemohon Utama', prodi: user.prodi }
      ]
    };
  }

  loadDataFromApplication(appId) {
    const app = window.pndlStore.getApplicationById(appId);
    if (!app) return;

    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    this.currentData = {
      ...this.getDefaultData(),
      nomor_surat: `B/${Math.floor(1000 + Math.random() * 9000)}/PL3/TU.00/2026`,
      tanggal_surat: todayStr,
      nama: app.applicantName,
      nim_nip: app.applicantNimNip,
      role_label: app.applicantRole,
      jabatan_prodi: `${app.applicantRole} - ${app.applicantProdi}`,
      tujuan_kegiatan: app.purposeLabel,
      negara_tujuan: app.destinationCountry,
      kota_tujuan: app.destinationCity,
      lembaga_mitra: app.hostInstitution,
      tanggal_berangkat: app.startDate,
      tanggal_kembali: app.endDate,
      durasi_hari: app.durationDays,
      sumber_dana: app.fundingSource === 'pnj' ? 'DIPA PNJ' : app.fundingSource === 'sponsor_eksternal' ? app.sponsorName : 'Mandiri',
      sponsor_name: app.sponsorName || '-'
    };
  }

  loadDataFromMobility(mobId) {
    const records = window.pndlStore.getMobilityRecords();
    const r = records.find(m => m.id === mobId);
    if (!r) return;

    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    this.currentData = {
      ...this.getDefaultData(),
      nomor_surat: `B/${Math.floor(1000 + Math.random() * 9000)}/PL3/TU.00/2026`,
      tanggal_surat: todayStr,
      nama: r.leaderName,
      nim_nip: r.participants?.[0]?.idNum || '-',
      role_label: r.category === 'dosen' ? 'Dosen' : 'Mahasiswa',
      jabatan_prodi: `${r.category === 'dosen' ? 'Dosen' : 'Mahasiswa'} - ${r.department}`,
      tujuan_kegiatan: r.title,
      negara_tujuan: r.destinationCountry,
      kota_tujuan: r.destinationCity,
      lembaga_mitra: r.hostInstitution,
      tanggal_berangkat: r.startDate,
      tanggal_kembali: r.endDate,
      durasi_hari: r.durationDays,
      jumlah_peserta: String(r.participantCount || 1),
      sumber_dana: r.fundingSource === 'pnj' ? 'DIPA PNJ' : r.sponsorName || 'Mitra',
      sponsor_name: r.sponsorName || '-',
      daftar_peserta: (r.participants || []).map((p, idx) => ({
        no: idx + 1,
        nama: p.name,
        id: p.idNum,
        role: p.role || 'Anggota',
        prodi: p.prodi || '-'
      }))
    };
  }

  generateHtmlDocument(templateId, data) {
    const d = data || this.currentData || this.getDefaultData();

    switch (templateId) {
      case 'surat_tugas':
        return this.renderSuratTugas(d);
      case 'permohonan_setneg':
        return this.renderPermohonanSetneg(d);
      case 'sptjm':
        return this.renderSptjm(d);
      case 'berita_acara_mobilitas':
        return this.renderBeritaAcaraMobilitas(d);
      default:
        return this.renderSuratTugas(d);
    }
  }

  // Template 1: Surat Tugas Direktur PNJ
  renderSuratTugas(d) {
    const participantsList = d.daftar_peserta && d.daftar_peserta.length > 1
      ? `
        <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11pt;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #333; padding: 5px; text-align: center; width: 35px;">No</th>
              <th style="border: 1px solid #333; padding: 5px; text-align: left;">Nama Lengkap</th>
              <th style="border: 1px solid #333; padding: 5px; text-align: left;">NIM / NIP</th>
              <th style="border: 1px solid #333; padding: 5px; text-align: left;">Program Studi / Jabatan</th>
            </tr>
          </thead>
          <tbody>
            ${d.daftar_peserta.map(p => `
              <tr>
                <td style="border: 1px solid #333; padding: 5px; text-align: center;">${p.no}</td>
                <td style="border: 1px solid #333; padding: 5px;"><strong>${p.nama}</strong></td>
                <td style="border: 1px solid #333; padding: 5px;">${p.id}</td>
                <td style="border: 1px solid #333; padding: 5px;">${p.prodi}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <table style="width: 100%; margin-left: 20px; font-size: 11pt; line-height: 1.6;">
          <tr><td style="width: 160px;">Nama</td><td style="width: 15px;">:</td><td><strong>${d.nama}</strong></td></tr>
          <tr><td>NIM / NIP</td><td>:</td><td>${d.nim_nip}</td></tr>
          <tr><td>Jabatan / Prodi</td><td>:</td><td>${d.jabatan_prodi}</td></tr>
          <tr><td>Unit Kerja</td><td>:</td><td>Politeknik Negeri Jakarta</td></tr>
        </table>
      `;

    return `
      <div class="doc-page">
        <!-- Official PNJ Letterhead (Kop Surat) -->
        <div style="border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; text-align: center; font-family: 'Times New Roman', serif;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 6px;">
            <img src="assets/logo_pnj.png" alt="Logo PNJ" style="width: 68px; height: 68px; object-fit: contain;">
            <div style="line-height: 1.2;">
              <div style="font-size: 12pt; font-weight: bold; letter-spacing: 0.5px;">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
              <div style="font-size: 14pt; font-weight: bold; letter-spacing: 1px;">POLITEKNIK NEGERI JAKARTA</div>
              <div style="font-size: 9pt; color: #333; margin-top: 3px;">
                Jl. Prof. Dr. G.A. Siwabessy, Kampus UI Depok 16425<br>
                Telepon (021) 7270036, Hunting, Fax (021) 7270034 • Laman: www.pnj.ac.id
              </div>
            </div>
          </div>
        </div>

        <!-- Judul Dokumen -->
        <div style="text-align: center; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline;">SURAT TUGAS</div>
          <div style="font-size: 10.5pt; margin-top: 4px;">Nomor: ${d.nomor_surat}</div>
        </div>

        <!-- Isi Surat -->
        <div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #111;">
          <p style="margin-bottom: 12px; text-align: justify;">
            Direktur Politeknik Negeri Jakarta dengan ini menugaskan kepada civitas akademika di bawah ini:
          </p>

          ${participantsList}

          <p style="margin-top: 14px; margin-bottom: 10px; text-align: justify;">
            Untuk melaksanakan Perjalanan Dinas Luar Negeri (PDLN) dalam rangka <strong>${d.tujuan_kegiatan}</strong> yang diselenggarakan di:
          </p>

          <table style="width: 100%; margin-left: 20px; margin-bottom: 14px; font-size: 11pt; line-height: 1.6;">
            <tr><td style="width: 160px;">Tempat / Lembaga</td><td style="width: 15px;">:</td><td>${d.lembaga_mitra}</td></tr>
            <tr><td>Kota / Negara</td><td>:</td><td>${d.kota_tujuan}, ${d.negara_tujuan}</td></tr>
            <tr><td>Tanggal Pelaksanaan</td><td>:</td><td>${d.tanggal_berangkat} s/d ${d.tanggal_kembali} (${d.durasi_hari} hari)</td></tr>
            <tr><td>Sumber Pembiayaan</td><td>:</td><td>${d.sumber_dana}</td></tr>
          </table>

          <p style="margin-bottom: 12px; text-align: justify;">
            Demikian Surat Tugas ini dibuat untuk dilaksanakan dengan penuh rasa tanggung jawab, menjaga nama baik almamater Politeknik Negeri Jakarta dan Republik Indonesia, serta menyampaikan laporan tertulis pelaksanaan tugas kepada Direktur melalui Kantor Urusan Internasional (KUI) selambat-lambatnya 7 (tujuh) hari kerja setelah kembali ke tanah air.
          </p>

          <!-- Tanda Tangan Direktur -->
          <div style="margin-top: 36px; display: flex; justify-content: flex-end;">
            <div style="width: 280px; text-align: left;">
              <div>Depok, ${d.tanggal_surat}</div>
              <div style="margin-top: 4px; font-weight: bold;">Direktur Politeknik Negeri Jakarta,</div>
              <div style="height: 65px; display: flex; align-items: center; color: #888; font-style: italic; font-size: 9pt;">
                [Tanda Tangan & Cap Dinas Resmi]
              </div>
              <div style="font-weight: bold; text-decoration: underline;">${d.nama_direktur}</div>
              <div style="font-size: 10pt;">NIP ${d.nip_direktur}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Template 2: Formulir Permohonan Izin PDLN Kemensetneg
  renderPermohonanSetneg(d) {
    return `
      <div class="doc-page">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 18px; font-family: Arial, sans-serif;">
          <div style="font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #555;">KEMENTERIAN SEKRETARIAT NEGARA REPUBLIK INDONESIA</div>
          <div style="font-size: 12pt; font-weight: bold; margin-top: 4px;">FORMULIR PERMOHONAN IZIN PERJALANAN DINAS LUAR NEGERI (PDLN)</div>
          <div style="font-size: 9pt; color: #666;">Berdasarkan Inpres No. 11/2005 & Permensetneg No. 3/2023</div>
        </div>

        <div style="font-family: Arial, sans-serif; font-size: 9.5pt; line-height: 1.45;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            <tr style="background: #f8fafc;">
              <td colspan="2" style="border: 1px solid #999; padding: 6px 10px; font-weight: bold; background: #e2e8f0;">
                I. DATA INSTANSI PENGUSUL & ADMINISTRASI
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px; width: 35%;">1. Kementerian / Lembaga</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">Kementerian Pendidikan Tinggi, Sains, dan Teknologi</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">2. Satuan Kerja / Perguruan Tinggi</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">Politeknik Negeri Jakarta (Kampus Depok)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">3. Unit Pelaksana Teknis</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">Kantor Urusan Internasional (KUI) PNJ</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">4. Nomor Surat Usulan Internal</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.nomor_surat}</td>
            </tr>

            <tr style="background: #f8fafc;">
              <td colspan="2" style="border: 1px solid #999; padding: 6px 10px; font-weight: bold; background: #e2e8f0;">
                II. DATA PEMOHON / DELEGASI
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">1. Nama Lengkap</td>
              <td style="border: 1px solid #999; padding: 6px 10px;"><strong>${d.nama}</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">2. NIP / NIM / Identitas Resmi</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.nim_nip}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">3. Jabatan / Status Civitas</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.jabatan_prodi}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">4. Nomor Paspor RI</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.no_paspor}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">5. Jumlah Peserta Rombongan</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.jumlah_peserta} Orang</td>
            </tr>

            <tr style="background: #f8fafc;">
              <td colspan="2" style="border: 1px solid #999; padding: 6px 10px; font-weight: bold; background: #e2e8f0;">
                III. INFORMASI PERJALANAN & KEGIATAN LUAR NEGERI
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">1. Agenda / Nama Kegiatan</td>
              <td style="border: 1px solid #999; padding: 6px 10px;"><strong>${d.tujuan_kegiatan}</strong></td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">2. Negara & Kota Tujuan</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.negara_tujuan} — ${d.kota_tujuan}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">3. Lembaga Penyelenggara / Mitra</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.lembaga_mitra}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">4. Waktu Pelaksanaan</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.tanggal_berangkat} s/d ${d.tanggal_kembali} (${d.durasi_hari} Hari)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">5. Sumber Pembiayaan</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">${d.sumber_dana}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #999; padding: 6px 10px;">6. Urgensi / Manfaat Institusi</td>
              <td style="border: 1px solid #999; padding: 6px 10px;">Meningkatkan reputasi internasional dan daya saing global pendidikan vokasi PNJ serta implementasi IKU 8 Kampus Merdeka.</td>
            </tr>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 30px;">
            <div style="width: 240px; text-align: center;">
              <div>Mengetahui,</div>
              <div style="font-weight: bold; margin-top: 2px;">Koordinator Urusan Internasional PNJ</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">Siti Rahmawati, M.Ed.</div>
              <div style="font-size: 8.5pt;">NIP 198509142010122001</div>
            </div>

            <div style="width: 240px; text-align: center;">
              <div>Depok, ${d.tanggal_surat}</div>
              <div style="font-weight: bold; margin-top: 2px;">Pemohon PDLN,</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">${d.nama}</div>
              <div style="font-size: 8.5pt;">${d.nim_nip}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Template 3: SPTJM Bermaterai
  renderSptjm(d) {
    return `
      <div class="doc-page">
        <!-- Letterhead -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; font-family: 'Times New Roman', serif;">
          <div style="font-size: 11pt; font-weight: bold;">POLITEKNIK NEGERI JAKARTA</div>
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline; margin-top: 4px;">
            SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM)
          </div>
          <div style="font-size: 9.5pt; color: #444; margin-top: 2px;">USULAN PERJALANAN DINAS LUAR NEGERI (PDLN)</div>
        </div>

        <div style="font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #111;">
          <p style="margin-bottom: 12px;">Yang bertanda tangan di bawah ini:</p>

          <table style="width: 100%; margin-left: 20px; margin-bottom: 16px; font-size: 11pt; line-height: 1.6;">
            <tr><td style="width: 160px;">Nama Lengkap</td><td style="width: 15px;">:</td><td><strong>${d.nama}</strong></td></tr>
            <tr><td>NIM / NIP</td><td>:</td><td>${d.nim_nip}</td></tr>
            <tr><td>Status Civitas</td><td>:</td><td>${d.jabatan_prodi}</td></tr>
            <tr><td>Jurusan / Unit</td><td>:</td><td>${d.jurusan}</td></tr>
            <tr><td>Nomor Paspor RI</td><td>:</td><td>${d.no_paspor}</td></tr>
          </table>

          <p style="text-align: justify; margin-bottom: 12px;">
            Dengan ini menyatakan dengan sesungguhnya dan penuh kesadaran bahwa:
          </p>

          <ol style="margin-left: 22px; margin-bottom: 16px; line-height: 1.6; text-align: justify;">
            <li>Seluruh data, informasi, dan dokumen persyaratan yang saya unggah (termasuk scan Paspor, Surat Undangan/LoA, dan Bukti Jaminan Pendanaan) untuk pengajuan PDLN ke <strong>${d.negara_tujuan}</strong> dalam rangka <strong>${d.tujuan_kegiatan}</strong> adalah benar, absah, dan dapat dipertanggungjawabkan sesuai hukum yang berlaku.</li>
            <li>Selama melaksanakan perjalanan dinas luar negeri, saya berjanji akan menjunjung tinggi martabat dan nama baik Politeknik Negeri Jakarta serta Negara Kesatuan Republik Indonesia, mematuhi peraturan perundang-undangan di negara tujuan, dan tidak akan melakukan kegiatan yang bertentangan dengan ketentuan PDLN.</li>
            <li>Saya menjamin ketersediaan pembiayaan melalui <strong>${d.sumber_dana}</strong> dan tidak akan membebani anggaran di luar ketentuan yang telah disetujui.</li>
            <li>Apabila di kemudian hari terbukti data atau dokumen yang saya sampaikan tidak benar atau terjadi pelanggaran, saya bersedia menerima sanksi administratif, akademik, dan/atau dituntut sesuai ketentuan perundang-undangan yang berlaku.</li>
          </ol>

          <p style="text-align: justify; margin-bottom: 24px;">
            Demikian Surat Pernyataan Tanggung Jawab Mutlak ini saya buat dengan sebenarnya, tanpa paksaan dari pihak mana pun, untuk dipergunakan sebagaimana mestinya.
          </p>

          <div style="margin-top: 30px; display: flex; justify-content: flex-end;">
            <div style="width: 260px; text-align: center;">
              <div>Depok, ${d.tanggal_surat}</div>
              <div style="margin-top: 4px;">Yang Membuat Pernyataan,</div>
              <div style="height: 70px; display: flex; align-items: center; justify-content: center;">
                <div style="border: 1px dashed #777; padding: 6px 12px; font-size: 8.5pt; color: #555; background: #fafafa;">
                  MATERAI<br>Rp10.000
                </div>
              </div>
              <div style="font-weight: bold; text-decoration: underline;">${d.nama}</div>
              <div style="font-size: 9.5pt;">NIP/NIM. ${d.nim_nip}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Template 4: Berita Acara & Rekapitulasi Rombongan Mobilitas
  renderBeritaAcaraMobilitas(d) {
    const participants = d.daftar_peserta || [
      { no: 1, nama: d.nama, id: d.nim_nip, role: 'Ketua Delegasi', prodi: d.prodi }
    ];

    return `
      <div class="doc-page">
        <!-- Letterhead -->
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 16px; font-family: Arial, sans-serif;">
          <div style="font-size: 11pt; font-weight: bold;">KANTOR URUSAN INTERNASIONAL (KUI)</div>
          <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">POLITEKNIK NEGERI JAKARTA</div>
          <div style="font-size: 13pt; font-weight: bold; text-decoration: underline; margin-top: 4px;">
            BERITA ACARA & REKAPITULASI MOBILITAS INTERNASIONAL
          </div>
          <div style="font-size: 9.5pt; color: #555; margin-top: 2px;">Kode Dokumen: BA-MOBILITAS-PNJ-2026</div>
        </div>

        <div style="font-family: Arial, sans-serif; font-size: 9.5pt; line-height: 1.45;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
            <tr>
              <td style="padding: 4px 8px; width: 160px; font-weight: bold;">Nama Program / Agenda</td>
              <td style="padding: 4px 8px; width: 10px;">:</td>
              <td style="padding: 4px 8px;">${d.tujuan_kegiatan}</td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: bold;">Negara & Institusi Mitra</td>
              <td style="padding: 4px 8px;">:</td>
              <td style="padding: 4px 8px;">${d.negara_tujuan} — ${d.lembaga_mitra}</td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: bold;">Periode Kegiatan</td>
              <td style="padding: 4px 8px;">:</td>
              <td style="padding: 4px 8px;">${d.tanggal_berangkat} s/d ${d.tanggal_kembali} (${d.durasi_hari} hari)</td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: bold;">Total Jumlah Peserta</td>
              <td style="padding: 4px 8px;">:</td>
              <td style="padding: 4px 8px;"><strong>${participants.length} Orang</strong></td>
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: bold;">Sumber Pendanaan</td>
              <td style="padding: 4px 8px;">:</td>
              <td style="padding: 4px 8px;">${d.sumber_dana}</td>
            </tr>
          </table>

          <div style="font-weight: bold; margin-bottom: 6px;">DAFTAR NAMA ANGGOTA DELEGASI / ROMBONGAN:</div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #e2e8f0; text-align: left;">
                <th style="border: 1px solid #666; padding: 6px; width: 35px; text-align: center;">No</th>
                <th style="border: 1px solid #666; padding: 6px;">Nama Lengkap</th>
                <th style="border: 1px solid #666; padding: 6px; width: 130px;">NIM / NIP / ID</th>
                <th style="border: 1px solid #666; padding: 6px; width: 120px;">Peran Delegasi</th>
                <th style="border: 1px solid #666; padding: 6px;">Program Studi / Unit</th>
              </tr>
            </thead>
            <tbody>
              ${participants.map((p, idx) => `
                <tr>
                  <td style="border: 1px solid #666; padding: 6px; text-align: center;">${idx + 1}</td>
                  <td style="border: 1px solid #666; padding: 6px;"><strong>${p.nama}</strong></td>
                  <td style="border: 1px solid #666; padding: 6px;">${p.id || '-'}</td>
                  <td style="border: 1px solid #666; padding: 6px;">${p.role || 'Peserta'}</td>
                  <td style="border: 1px solid #666; padding: 6px;">${p.prodi || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top: 24px;">
            <div style="width: 220px; text-align: center;">
              <div>Verifikator KUI PNJ,</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">Siti Rahmawati, M.Ed.</div>
              <div style="font-size: 8.5pt;">Koordinator Kerjasama Luar Negeri</div>
            </div>

            <div style="width: 220px; text-align: center;">
              <div>Depok, ${d.tanggal_surat}</div>
              <div style="font-weight: bold;">Ketua Delegasi / Pemohon,</div>
              <div style="height: 50px;"></div>
              <div style="font-weight: bold; text-decoration: underline;">${d.nama}</div>
              <div style="font-size: 8.5pt;">${d.nim_nip}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Generate & trigger instant Word .docx download
  downloadAsDocx(templateId, customData) {
    const t = this.templates[templateId] || this.templates.surat_tugas;
    const data = customData || this.currentData || this.getDefaultData();
    const htmlBody = this.generateHtmlDocument(templateId, data);

    const fullDocContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${t.name}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: A4 portrait;
            margin: 20mm 20mm 20mm 20mm;
            mso-header-margin: 36pt;
            mso-footer-margin: 36pt;
            mso-paper-source: 0;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            color: #000000;
            line-height: 1.5;
          }
          table {
            border-collapse: collapse;
          }
          td, th {
            padding: 4px 6px;
          }
        </style>
      </head>
      <body>
        ${htmlBody}
      </body>
      </html>
    `;

    // Create Blob with official Word MIME type and download as .docx
    const blob = new Blob(['\ufeff', fullDocContent], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    const fileName = `${t.code}_${data.nama.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.docx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (window.pndlApp && window.pndlApp.showToast) {
      window.pndlApp.showToast(`Dokumen Word siap! Mengunduh "${fileName}"...`, 'success');
    }
  }

  // Open Full Interactive Word Template Modal
  openTemplateModal(defaultTemplateId = 'surat_tugas', optionalAppId = null, optionalMobId = null) {
    this.activeTemplateId = defaultTemplateId;

    if (optionalAppId) {
      this.loadDataFromApplication(optionalAppId);
    } else if (optionalMobId) {
      this.loadDataFromMobility(optionalMobId);
    } else if (!this.currentData) {
      this.currentData = this.getDefaultData();
    }

    const modalId = 'word-template-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const modalHtml = `
      <div class="modal-overlay" id="${modalId}" style="z-index: 9999;">
        <div class="modal-content word-modal-layout" style="max-width: 1100px; width: 95vw; height: 90vh; display: flex; flex-direction: column;">
          <div class="sheet-drag-handle"></div>
          
          <!-- Modal Top Header -->
          <div class="card-header" style="padding: 16px 24px; margin-bottom: 0; background: var(--brand-primary); color: var(--white);">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="background: rgba(255,255,255,0.15); padding: 6px 10px; border-radius: 8px; display: flex; align-items: center;">
                ${Icons.fileText(20, 'text-white')}
              </div>
              <div>
                <h3 class="card-title" style="color: var(--white); font-size: 16px; margin: 0;">
                  Generator Template Word (.docx) — Integrasi Google Apps Script
                </h3>
                <p class="card-subtitle" style="color: #cbd5e1; font-size: 11.5px; margin: 2px 0 0 0;">
                  Otomatisasi pengisian format surat resmi PDLN & mobilitas PNJ siap unduh & siap cetak.
                </p>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-word-modal" style="color: var(--white); background: rgba(255,255,255,0.15); border: none;">
              ${Icons.x(16)}
            </button>
          </div>

          <!-- Modal Body Split View -->
          <div style="display: flex; flex: 1; overflow: hidden;">
            <!-- Left Panel: Template & Data Controls (360px) -->
            <div style="width: 360px; border-right: 1px solid var(--neutral-200); background: var(--neutral-50); padding: 18px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px;">
              
              <div>
                <label class="form-label" style="font-size: 12px; font-weight: 700; color: var(--neutral-700);">Pilih Template Dokumen Resmi:</label>
                <select id="sel-word-template" class="form-control" style="font-size: 12.5px; font-weight: 600;">
                  ${Object.values(this.templates).map(t => `
                    <option value="${t.id}" ${t.id === this.activeTemplateId ? 'selected' : ''}>${t.name} (${t.code})</option>
                  `).join('')}
                </select>
                <p id="word-template-desc" style="font-size: 11px; color: var(--neutral-500); margin: 6px 0 0 0;">
                  ${this.templates[this.activeTemplateId].description}
                </p>
              </div>

              <!-- Quick Autofill Source -->
              <div style="background: var(--white); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: 12px;">
                <label class="form-label" style="font-size: 11px; font-weight: 700; color: var(--brand-primary); margin-bottom: 6px;">
                  Ambil Data Otomatis Dari:
                </label>
                <div style="display: flex; gap: 6px; flex-direction: column;">
                  <button class="btn btn-secondary btn-sm" id="btn-autofill-active-user" style="font-size: 11.5px; justify-content: flex-start;">
                    ${Icons.user(13)} Profil Pengguna Aktif
                  </button>
                  <button class="btn btn-secondary btn-sm" id="btn-autofill-app" style="font-size: 11.5px; justify-content: flex-start;">
                    ${Icons.plane(13)} Permohonan PDLN Aktif
                  </button>
                </div>
              </div>

              <!-- Live Editable Fields Form -->
              <div style="background: var(--white); border: 1px solid var(--neutral-200); border-radius: var(--radius-md); padding: 14px; flex: 1;">
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 10px; color: var(--neutral-800); display: flex; justify-content: space-between; align-items: center;">
                  <span>Substitusi Variabel Word</span>
                  <span class="badge badge-source" style="font-size: 10px;">Live Sync</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11.5px;">
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Nomor Surat:</label>
                    <input type="text" id="inp-w-nomor" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.nomor_surat}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Nama Lengkap:</label>
                    <input type="text" id="inp-w-nama" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.nama}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">NIM / NIP:</label>
                    <input type="text" id="inp-w-id" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.nim_nip}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Status / Jabatan / Prodi:</label>
                    <input type="text" id="inp-w-jabatan" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.jabatan_prodi}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Agenda / Kegiatan:</label>
                    <input type="text" id="inp-w-kegiatan" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.tujuan_kegiatan}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Negara & Kota Tujuan:</label>
                    <input type="text" id="inp-w-negara" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.kota_tujuan}, ${this.currentData.negara_tujuan}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Lembaga Mitra:</label>
                    <input type="text" id="inp-w-mitra" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.lembaga_mitra}">
                  </div>
                  <div>
                    <label style="font-weight: 600; color: var(--neutral-600); display: block; margin-bottom: 2px;">Sumber Pendanaan:</label>
                    <input type="text" id="inp-w-dana" class="form-control" style="font-size: 11.5px; padding: 4px 8px;" value="${this.currentData.sumber_dana}">
                  </div>
                </div>
              </div>

              <!-- Download Button on Left Panel -->
              <button class="btn btn-primary" id="btn-word-modal-download" style="width: 100%; font-weight: 700;">
                ${Icons.fileText(16)} Unduh Dokumen Word (.docx)
              </button>
            </div>

            <!-- Right Panel: Live Document Paper Preview -->
            <div style="flex: 1; background: #94a3b8; padding: 24px; overflow-y: auto; display: flex; flex-direction: column; align-items: center;">
              
              <div style="margin-bottom: 12px; display: flex; gap: 10px; align-items: center; align-self: flex-end;">
                <span style="color: var(--white); font-size: 12px; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.4);">
                  Pratinjau Lembar A4 Cetak
                </span>
                <button class="btn btn-secondary btn-sm" id="btn-word-modal-print" style="background: var(--white); border: none; font-weight: 600;">
                  ${Icons.ticket(14)} Cetak / PDF
                </button>
              </div>

              <!-- Paper Sheet Simulator -->
              <div class="word-paper-sheet" id="word-paper-container" style="background: var(--white); width: 100%; max-width: 720px; min-height: 860px; padding: 45px 50px; box-shadow: 0 10px 25px rgba(0,0,0,0.25); border-radius: 2px;">
                ${this.generateHtmlDocument(this.activeTemplateId, this.currentData)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const close = () => {
      const el = document.getElementById(modalId);
      if (el) el.remove();
    };

    document.getElementById('btn-close-word-modal').onclick = close;

    // Selector change
    const sel = document.getElementById('sel-word-template');
    sel.onchange = (e) => {
      this.activeTemplateId = e.target.value;
      const t = this.templates[this.activeTemplateId];
      document.getElementById('word-template-desc').textContent = t.description;
      this.updatePaperPreview();
    };

    // Autofill handlers
    document.getElementById('btn-autofill-active-user').onclick = () => {
      this.currentData = this.getDefaultData();
      this.populateFormFields();
      this.updatePaperPreview();
      if (window.pndlApp) window.pndlApp.showToast('Data diisi dari profil aktif.', 'info');
    };

    document.getElementById('btn-autofill-app').onclick = () => {
      const apps = window.pndlStore.getApplications();
      if (apps.length > 0) {
        this.loadDataFromApplication(apps[0].id);
        this.populateFormFields();
        this.updatePaperPreview();
        if (window.pndlApp) window.pndlApp.showToast(`Data diisi dari permohonan ${apps[0].id}.`, 'info');
      }
    };

    // Form inputs live binding
    const bindInp = (id, prop) => {
      const el = document.getElementById(id);
      if (el) {
        el.oninput = (e) => {
          this.currentData[prop] = e.target.value;
          this.updatePaperPreview();
        };
      }
    };

    bindInp('inp-w-nomor', 'nomor_surat');
    bindInp('inp-w-nama', 'nama');
    bindInp('inp-w-id', 'nim_nip');
    bindInp('inp-w-jabatan', 'jabatan_prodi');
    bindInp('inp-w-kegiatan', 'tujuan_kegiatan');
    bindInp('inp-w-mitra', 'lembaga_mitra');
    bindInp('inp-w-dana', 'sumber_dana');

    const inpNegara = document.getElementById('inp-w-negara');
    if (inpNegara) {
      inpNegara.oninput = (e) => {
        this.currentData.negara_tujuan = e.target.value;
        this.updatePaperPreview();
      };
    }

    // Download action
    document.getElementById('btn-word-modal-download').onclick = () => {
      this.downloadAsDocx(this.activeTemplateId, this.currentData);
    };

    // Print action
    document.getElementById('btn-word-modal-print').onclick = () => {
      const content = document.getElementById('word-paper-container').innerHTML;
      const win = window.open('', '', 'width=800,height=900');
      win.document.write(`
        <html>
          <head>
            <title>${this.templates[this.activeTemplateId].name}</title>
            <style>
              body { font-family: 'Times New Roman', serif; margin: 20mm; font-size: 11pt; color: #000; }
              table { border-collapse: collapse; width: 100%; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
    };
  }

  populateFormFields() {
    if (!this.currentData) return;
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('inp-w-nomor', this.currentData.nomor_surat);
    setVal('inp-w-nama', this.currentData.nama);
    setVal('inp-w-id', this.currentData.nim_nip);
    setVal('inp-w-jabatan', this.currentData.jabatan_prodi);
    setVal('inp-w-kegiatan', this.currentData.tujuan_kegiatan);
    setVal('inp-w-negara', `${this.currentData.kota_tujuan}, ${this.currentData.negara_tujuan}`);
    setVal('inp-w-mitra', this.currentData.lembaga_mitra);
    setVal('inp-w-dana', this.currentData.sumber_dana);
  }

  updatePaperPreview() {
    const container = document.getElementById('word-paper-container');
    if (container) {
      container.innerHTML = this.generateHtmlDocument(this.activeTemplateId, this.currentData);
    }
  }

  bindEvents() {
    // Global listener if needed
  }
}

window.pndlWord = new WordTemplateEngine();
