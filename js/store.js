/* ==========================================================================
   PDLN PNJ — STORE & DATA ARCHITECTURE (STORE.JS)
   Modul Manajemen Status & Relational Data Store Politeknik Negeri Jakarta
   ========================================================================== */

// Reset key jika struktur diperbarui agar tidak bentrok dengan cache browser lama
const STORAGE_KEY = 'PDLN_PNJ_DATA_V7_STATUS_CORRECTED';

// --- INITIAL MASTER & SAMPLE DATA ---
const INITIAL_DATA = {
  // Default state session (null agar masuk ke login page saat belum ada sesi)
  sessionUserId: null,

  // 1. TABLE: users
  users: {
    'mhs-1': {
      id_user: 1,
      id: 'mhs-1',
      sso_id: 'andi.pratama',
      identity_number: '20260001',
      full_name: 'Andi Pratama',
      name: 'Andi Pratama',
      email: 'andi.pratama@mhs.pnj.ac.id',
      role: 'mahasiswa',
      unit_department: 'Teknik Informatika dan Komputer',
      prodi: 'Teknik Informatika (S1 Terapan)',
      is_active: true,
      created_at: '2026-01-15 08:00',
      avatar: 'AP'
    },
    'dosen-1': {
      id_user: 2,
      id: 'dosen-1',
      sso_id: 'hendra.wijaya',
      identity_number: '197805122005011002',
      full_name: 'Dr. Ir. Hendra Wijaya, M.T.',
      name: 'Dr. Ir. Hendra Wijaya, M.T.',
      email: 'hendra.wijaya@mesin.pnj.ac.id',
      role: 'dosen',
      unit_department: 'Teknik Mesin',
      prodi: 'Teknik Mesin Manufaktur',
      is_active: true,
      created_at: '2025-08-10 09:30',
      avatar: 'HW'
    },
    'kui-op': {
      id_user: 3,
      id: 'kui-op',
      sso_id: 'bayu.aditya',
      identity_number: '199003122015041002',
      full_name: 'Bayu Aditya, S.Kom.',
      name: 'Bayu Aditya, S.Kom.',
      email: 'bayu.aditya@pnj.ac.id',
      role: 'kui_operator',
      unit_department: 'Kantor Urusan Internasional',
      prodi: 'Operator Verifikasi Berkas PDLN',
      is_active: true,
      created_at: '2025-01-01 08:00',
      avatar: 'BA'
    },
    'kui-admin': {
      id_user: 4,
      id: 'kui-admin',
      sso_id: 'kui.admin',
      identity_number: '198509142010122001',
      full_name: 'Siti Rahmawati, M.Ed.',
      name: 'Siti Rahmawati, M.Ed.',
      email: 'kui@pnj.ac.id',
      role: 'kui_admin',
      unit_department: 'Kantor Urusan Internasional',
      prodi: 'Koordinator Kerjasama Luar Negeri & KUI Admin',
      is_active: true,
      created_at: '2024-06-01 08:00',
      avatar: 'SR'
    },
    'pimpinan-1': {
      id_user: 5,
      id: 'pimpinan-1',
      sso_id: 'zainal.arifin',
      identity_number: '196803201994031001',
      full_name: 'Dr. Sc. H. Zainal Nur Arifin, Dipl-Ing. HTL., M.T.',
      name: 'Dr. Sc. H. Zainal Nur Arifin, Dipl-Ing. HTL., M.T.',
      email: 'direktur@pnj.ac.id',
      role: 'pimpinan',
      unit_department: 'Direktorat Politeknik Negeri Jakarta',
      prodi: 'Direktur Politeknik Negeri Jakarta',
      is_active: true,
      created_at: '2023-01-01 08:00',
      avatar: 'ZA'
    }
  },

  // 2. TABLE: user_profiles
  user_profiles: {
    'mhs-1': {
      id_profile: 1,
      id_user: 1,
      nik: '3276012304010005',
      nomor_paspor: 'B7894561',
      passport_expiry: '2028-09-15',
      jenis_jabatan: 'Mahasiswa',
      nama_jabatan: 'Mahasiswa Aktif Jurusan TIK',
      no_telepon: '081234567890',
      file_ktp_default: 'KTP_Andi_Pratama.pdf',
      file_paspor_default: 'Paspor_Andi_Pratama.pdf',
      emergency_name: 'Budi Pratama (Ayah)',
      emergency_phone: '081299887766',
      completion_percentage: 90,
      updated_at: '2026-09-15 10:00'
    },
    'dosen-1': {
      id_profile: 2,
      id_user: 2,
      nik: '3276011205780002',
      nomor_paspor: 'A1234567',
      passport_expiry: '2029-04-10',
      jenis_jabatan: 'Dosen Tetap / Lektor Kepala',
      nama_jabatan: 'Ketua Laboratorium Manufaktur Cerdas',
      no_telepon: '081398765432',
      file_ktp_default: 'KTP_Hendra_Wijaya.pdf',
      file_paspor_default: 'Paspor_Hendra_Wijaya.pdf',
      emergency_name: 'Dewi Sartika (Istri)',
      emergency_phone: '081311223344',
      completion_percentage: 100,
      updated_at: '2026-09-10 14:00'
    },
    'kui-op': {
      id_profile: 3,
      id_user: 3,
      nik: '3276011203900008',
      nomor_paspor: 'C4567890',
      passport_expiry: '2030-01-20',
      jenis_jabatan: 'Tenaga Kependidikan',
      nama_jabatan: 'Staf Verifikator KUI PNJ',
      no_telepon: '081599881122',
      file_ktp_default: 'KTP_Bayu_Aditya.pdf',
      file_paspor_default: 'Paspor_Bayu_Aditya.pdf',
      emergency_name: 'Ratna (Istri)',
      emergency_phone: '081599881133',
      completion_percentage: 100,
      updated_at: '2026-01-05 10:00'
    },
    'kui-admin': {
      id_profile: 4,
      id_user: 4,
      nik: '3276011409850003',
      nomor_paspor: 'A9876543',
      passport_expiry: '2029-11-20',
      jenis_jabatan: 'Dosen / Koordinator KUI',
      nama_jabatan: 'Kepala Kantor Urusan Internasional PNJ',
      no_telepon: '021-7270036',
      file_ktp_default: 'KTP_Siti_Rahmawati.pdf',
      file_paspor_default: 'Paspor_Siti_Rahmawati.pdf',
      emergency_name: 'Ahmad Dahlan (Suami)',
      emergency_phone: '081288776655',
      completion_percentage: 100,
      updated_at: '2026-01-02 08:30'
    },
    'pimpinan-1': {
      id_profile: 5,
      id_user: 5,
      nik: '3276012003680001',
      nomor_paspor: 'P0000001',
      passport_expiry: '2031-05-15',
      jenis_jabatan: 'Pimpinan Institusi',
      nama_jabatan: 'Direktur Politeknik Negeri Jakarta',
      no_telepon: '021-7270034',
      file_ktp_default: 'KTP_Direktur_PNJ.pdf',
      file_paspor_default: 'Paspor_Dinas_Direktur.pdf',
      emergency_name: 'Sekretariat Pimpinan PNJ',
      emergency_phone: '021-7270034',
      completion_percentage: 100,
      updated_at: '2026-01-01 09:00'
    }
  },

  // 3. TABLE: pdln_cases (Lifecycle: DRAFT -> SUBMITTED -> KUI_REVIEW -> REVISION -> VERIFIED -> PIMPINAN_REVIEW -> DOCUMENT_GENERATED -> SRIKANDI_PROCESS -> SIGNED -> READY_FOR_OFFICIAL_PDLN -> PINTAS_SUBMITTED -> APPROVED / REJECTED -> LPJ_SUBMITTED -> LPJ_VERIFIED -> CLOSED)
  pdln_cases: [
    {
      case_id: 'PDLN-2026-09-001',
      id_user: 1,
      userId: 'mhs-1',
      applicantName: 'Andi Pratama',
      applicantRole: 'Mahasiswa',
      applicantNimNip: '20260001',
      applicantProdi: 'Teknik Informatika (S1 Terapan)',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'student_exchange',
      purposeLabel: 'Pertukaran Mahasiswa (Student Exchange)',
      nama_kegiatan: 'Student Exchange Program Fall Semester 2026',
      institusi_tujuan: 'Seoul National University of Science and Technology',
      hostInstitution: 'Seoul National University of Science and Technology',
      negara_tujuan: 'Korea Selatan',
      destinationCountry: 'Korea Selatan',
      kota_tujuan: 'Seoul',
      destinationCity: 'Seoul',
      tanggal_mulai: '2026-10-15',
      startDate: '2026-10-15',
      tanggal_selesai: '2027-02-28',
      endDate: '2027-02-28',
      durationDays: 136,
      rencana_tindak_lanjut: 'Transfer SKS kurikulum OBE dan transfer teknologi Artificial Intelligence ke lab PNJ.',
      funding_scheme: 'Sponsor Eksternal',
      fundingSource: 'sponsor_eksternal',
      sponsorName: 'Global Korea Scholarship (GKS)',
      pernyataan_biaya_pribadi: false,
      isCooperation: true,
      cooperationName: 'MoU PNJ - SeoulTech 2024-2029',
      current_status: 'REVISION',
      status: 'revision_required',
      statusLabel: 'Perlu Revisi Berkas',
      progress_percentage: 30,
      progress: 30,
      urgency_level: 'WARNING',
      approved_by_pimpinan_id: null,
      created_at: '2026-09-18 09:30',
      submittedAt: '2026-09-18 09:30',
      updated_at: '2026-09-20 14:15',
      lastUpdated: '2026-09-20 14:15',
      revisionItems: ['paspor'],
      revisionNote: 'Scan paspor halaman identitas terpotong pada bagian MRZ dan nomor paspor tidak terbaca jelas. Mohon unggah ulang scan resolusi minimal 300 DPI.',
      profile_snapshot: JSON.stringify({
        name: 'Andi Pratama',
        nim_nip: '20260001',
        jurusan: 'Teknik Informatika dan Komputer',
        prodi: 'Teknik Informatika (S1 Terapan)',
        passport_no: 'B7894561',
        passport_exp: '2028-09-15'
      }),
      documents: {
        paspor: {
          id_document: 101,
          name: 'Paspor_Andi_Pratama.pdf',
          size: '1.2 MB',
          status: 'revision_required',
          review_status: 'REVISION_REQUIRED',
          statusLabel: 'Perlu Revisi',
          uploadedAt: '2026-09-18',
          note: 'Scan halaman foto buram dan terpotong.'
        },
        surat_undangan: {
          id_document: 102,
          name: 'LoA_SeoulTech_Andi.pdf',
          size: '2.4 MB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-18'
        },
        sptjm: {
          id_document: 103,
          name: 'SPTJM_Bermaterai_Andi.pdf',
          size: '850 KB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-18'
        },
        bukti_pendanaan: {
          id_document: 104,
          name: 'Sponsorship_Letter_GKS.pdf',
          size: '1.8 MB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-18'
        }
      },
      internalNotes: [
        {
          id: 'note-1',
          author: 'Siti Rahmawati (KUI)',
          text: 'Sudah dikonfirmasi ke PIC SeoulTech, kuota pertukaran masih tersedia. Menunggu perbaikan paspor dari mahasiswa sebelum diteruskan ke draf SP Kemensetneg.',
          createdAt: '2026-09-20 14:15'
        }
      ],
      messages: [
        {
          id: 'msg-1',
          senderRole: 'kui',
          senderName: 'KUI PNJ',
          text: 'Mohon periksa permohonan revisi berkas paspor Anda.',
          time: '2026-09-20 14:16'
        }
      ]
    },
    {
      case_id: 'PDLN-2026-09-002',
      id_user: 2,
      userId: 'dosen-1',
      applicantName: 'Dr. Ir. Hendra Wijaya, M.T.',
      applicantRole: 'Dosen',
      applicantNimNip: '197805122005011002',
      applicantProdi: 'Teknik Mesin Manufaktur',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'conference',
      purposeLabel: 'Pemakalah Konferensi Internasional',
      nama_kegiatan: 'IEEE International Conference on Advanced Robotics 2026',
      institusi_tujuan: 'Tokyo Institute of Technology',
      hostInstitution: 'Tokyo Institute of Technology',
      negara_tujuan: 'Jepang',
      destinationCountry: 'Jepang',
      kota_tujuan: 'Tokyo',
      destinationCity: 'Tokyo',
      tanggal_mulai: '2026-11-04',
      startDate: '2026-11-04',
      tanggal_selesai: '2026-11-10',
      endDate: '2026-11-10',
      durationDays: 7,
      rencana_tindak_lanjut: 'Publikasi prosiding IEEE terindeks Scopus Q1 dan inisiasi riset bersama lab robotika Tokyo Tech.',
      funding_scheme: 'DIPA PNJ',
      fundingSource: 'pnj',
      sponsorName: 'DIPA PNJ 2026 Riset Terapan Terpadu',
      pernyataan_biaya_pribadi: false,
      isCooperation: false,
      cooperationName: '',
      current_status: 'PIMPINAN_REVIEW',
      status: 'pimpinan_review',
      statusLabel: 'Menunggu Persetujuan Direktur PNJ',
      progress_percentage: 60,
      progress: 60,
      urgency_level: 'URGENT',
      approved_by_pimpinan_id: null,
      created_at: '2026-09-19 11:20',
      submittedAt: '2026-09-19 11:20',
      updated_at: '2026-09-21 09:00',
      lastUpdated: '2026-09-21 09:00',
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify({
        name: 'Dr. Ir. Hendra Wijaya, M.T.',
        nim_nip: '197805122005011002',
        jurusan: 'Teknik Mesin',
        prodi: 'Teknik Mesin Manufaktur',
        passport_no: 'A1234567',
        passport_exp: '2029-04-10'
      }),
      documents: {
        paspor: {
          id_document: 201,
          name: 'Paspor_Hendra_Wijaya.pdf',
          size: '1.5 MB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-19'
        },
        surat_undangan: {
          id_document: 202,
          name: 'Invitation_IEEE_Tokyo.pdf',
          size: '1.1 MB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-19'
        },
        sptjm: {
          id_document: 203,
          name: 'SPTJM_Dosen_Hendra.pdf',
          size: '720 KB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-19'
        },
        bukti_pendanaan: {
          id_document: 204,
          name: 'Surat_Tugas_DIPA_PNJ.pdf',
          size: '950 KB',
          status: 'verified',
          review_status: 'VALID',
          statusLabel: 'Terverifikasi',
          uploadedAt: '2026-09-19'
        }
      },
      internalNotes: [
        {
          id: 'note-2',
          author: 'Siti Rahmawati (KUI)',
          text: 'Persetujuan Jurusan Mesin sudah lengkap. Paper IEEE valid dan anggaran DIPA tersedia. Rekomendasi KUI: Disetujui ke Direktur PNJ.',
          createdAt: '2026-09-21 09:00'
        }
      ],
      messages: []
    },
    {
      case_id: 'PDLN-2026-09-003',
      id_user: 6,
      userId: 'mhs-other',
      applicantName: 'Nadia Putri',
      applicantRole: 'Mahasiswa',
      applicantNimNip: '20260088',
      applicantProdi: 'Teknik Grafika dan Penerbitan',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'training',
      purposeLabel: 'Pelatihan Vokasi',
      nama_kegiatan: 'Vocation Internship Training on Digital Packaging',
      institusi_tujuan: 'Nanyang Polytechnic',
      hostInstitution: 'Nanyang Polytechnic',
      negara_tujuan: 'Singapura',
      destinationCountry: 'Singapura',
      kota_tujuan: 'Singapore',
      destinationCity: 'Singapore',
      tanggal_mulai: '2026-10-01',
      startDate: '2026-10-01',
      tanggal_selesai: '2026-10-21',
      endDate: '2026-10-21',
      durationDays: 21,
      rencana_tindak_lanjut: 'Penerapan standar ISO packaging di teaching factory grafika PNJ.',
      funding_scheme: 'DIPA PNJ',
      fundingSource: 'pnj',
      sponsorName: 'Bantuan Mobilitas Vokasi PNJ',
      pernyataan_biaya_pribadi: false,
      isCooperation: true,
      cooperationName: 'MoU PNJ - NYP Singapore',
      current_status: 'SRIKANDI_PROCESS',
      status: 'srikandi_process',
      statusLabel: 'Proses Naskah Dinas SRIKANDI',
      progress_percentage: 75,
      progress: 75,
      urgency_level: 'CRITICAL',
      approved_by_pimpinan_id: 5,
      created_at: '2026-09-10 10:00',
      submittedAt: '2026-09-10 10:00',
      updated_at: '2026-09-22 11:30',
      lastUpdated: '2026-09-22 11:30',
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify({
        name: 'Nadia Putri',
        nim_nip: '20260088',
        jurusan: 'Teknik Grafika dan Penerbitan',
        prodi: 'Teknik Grafika',
        passport_no: 'B9988776',
        passport_exp: '2028-11-01'
      }),
      documents: {
        paspor: { id_document: 301, name: 'Paspor_Nadia.pdf', size: '1.1 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        surat_undangan: { id_document: 302, name: 'NYP_Acceptance_Letter.pdf', size: '980 KB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        sptjm: { id_document: 303, name: 'SPTJM_Nadia.pdf', size: '750 KB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' }
      },
      internalNotes: [
        {
          id: 'note-3',
          author: 'Bayu Aditya (Operator KUI)',
          text: 'Draf naskah dinas Word sudah diunggah ke aplikasi SRIKANDI. Menunggu penomoran dan TTE Direktur PNJ.',
          createdAt: '2026-09-22 11:30'
        }
      ],
      messages: []
    },
    {
      case_id: 'PDLN-2026-09-004',
      id_user: 7,
      userId: 'dosen-2',
      applicantName: 'Prof. Ir. Bambang Soedarto, Ph.D.',
      applicantRole: 'Dosen',
      applicantNimNip: '196504101990031001',
      applicantProdi: 'Teknik Elektro',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'research',
      purposeLabel: 'Riset Kolaborasi Internasional',
      nama_kegiatan: 'Bilateral Joint Research on Microgrid Renewable Integration',
      institusi_tujuan: 'RWTH Aachen University',
      hostInstitution: 'RWTH Aachen University',
      negara_tujuan: 'Jerman',
      destinationCountry: 'Jerman',
      kota_tujuan: 'Aachen',
      destinationCity: 'Aachen',
      tanggal_mulai: '2026-12-15',
      startDate: '2026-12-15',
      tanggal_selesai: '2027-01-15',
      endDate: '2027-01-15',
      durationDays: 31,
      rencana_tindak_lanjut: 'Pengembangan laboratorium microgrid energi terbarukan di Kampus PNJ.',
      funding_scheme: 'Kerjasama Mitra',
      fundingSource: 'sponsor_eksternal',
      sponsorName: 'DAAD Bilateral Exchange Grant',
      pernyataan_biaya_pribadi: false,
      isCooperation: true,
      cooperationName: 'MoA PNJ - RWTH Aachen 2025-2030',
      current_status: 'SIGNED',
      status: 'signed',
      statusLabel: 'Surat TTE Terbit (Siap PINTAS)',
      progress_percentage: 85,
      progress: 85,
      urgency_level: 'NORMAL',
      approved_by_pimpinan_id: 5,
      created_at: '2026-09-01 08:00',
      submittedAt: '2026-09-01 08:00',
      updated_at: '2026-09-23 15:00',
      lastUpdated: '2026-09-23 15:00',
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify({
        name: 'Prof. Ir. Bambang Soedarto, Ph.D.',
        nim_nip: '196504101990031001',
        jurusan: 'Teknik Elektro',
        prodi: 'Teknik Otomasi Listrik',
        passport_no: 'A5566778',
        passport_exp: '2030-08-20'
      }),
      documents: {
        paspor: { id_document: 401, name: 'Paspor_Bambang.pdf', size: '1.4 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        surat_undangan: { id_document: 402, name: 'RWTH_Invitation.pdf', size: '1.8 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        sptjm: { id_document: 403, name: 'SPTJM_Bambang.pdf', size: '820 KB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' }
      },
      internalNotes: [],
      messages: []
    },
    {
      case_id: 'PDLN-2026-08-001',
      id_user: 8,
      userId: 'dosen-3',
      applicantName: 'Dewi Sartika, M.Kom.',
      applicantRole: 'Dosen',
      applicantNimNip: '198207152008122003',
      applicantProdi: 'Teknik Informatika dan Komputer',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'training',
      purposeLabel: 'Pelatihan / Summer School',
      nama_kegiatan: 'International Summer School on Data Science & AI',
      institusi_tujuan: 'TU Delft',
      hostInstitution: 'TU Delft',
      negara_tujuan: 'Belanda',
      destinationCountry: 'Belanda',
      kota_tujuan: 'Delft',
      destinationCity: 'Delft',
      tanggal_mulai: '2026-08-10',
      startDate: '2026-08-10',
      tanggal_selesai: '2026-08-25',
      endDate: '2026-08-25',
      durationDays: 16,
      rencana_tindak_lanjut: 'Penyusunan modul ajar kecerdasan buatan berbasis standar industri Eropa.',
      funding_scheme: 'DIPA PNJ',
      fundingSource: 'pnj',
      sponsorName: 'DIPA PNJ Peningkatan Kapasitas Dosen 2026',
      pernyataan_biaya_pribadi: false,
      isCooperation: false,
      cooperationName: '',
      current_status: 'APPROVED',
      status: 'approved',
      statusLabel: 'SP Setneg Terbit (Menunggu LPJ)',
      progress_percentage: 95,
      progress: 95,
      urgency_level: 'NORMAL',
      approved_by_pimpinan_id: 5,
      created_at: '2026-07-01 10:00',
      submittedAt: '2026-07-01 10:00',
      updated_at: '2026-08-05 14:00',
      lastUpdated: '2026-08-05 14:00',
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify({
        name: 'Dewi Sartika, M.Kom.',
        nim_nip: '198207152008122003',
        jurusan: 'Teknik Informatika dan Komputer',
        prodi: 'Teknik Informatika',
        passport_no: 'B3322110',
        passport_exp: '2029-06-15'
      }),
      documents: {
        paspor: { id_document: 501, name: 'Paspor_Dewi.pdf', size: '1.2 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        surat_undangan: { id_document: 502, name: 'TUDelft_Acceptance.pdf', size: '1.5 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' }
      },
      internalNotes: [],
      messages: []
    },
    {
      case_id: 'PDLN-2026-07-001',
      id_user: 9,
      userId: 'dosen-4',
      applicantName: 'Ahmad Fauzi, S.T., M.Eng.',
      applicantRole: 'Dosen',
      applicantNimNip: '197509182003121002',
      applicantProdi: 'Teknik Sipil',
      service_category: 'PDLN Outbound',
      jenis_kegiatan: 'conference',
      purposeLabel: 'Pemakalah Konferensi',
      nama_kegiatan: 'International Conference on Sustainable Civil Infrastructure',
      institusi_tujuan: 'University of Melbourne',
      hostInstitution: 'University of Melbourne',
      negara_tujuan: 'Australia',
      destinationCountry: 'Australia',
      kota_tujuan: 'Melbourne',
      destinationCity: 'Melbourne',
      tanggal_mulai: '2026-07-05',
      startDate: '2026-07-05',
      tanggal_selesai: '2026-07-12',
      endDate: '2026-07-12',
      durationDays: 8,
      rencana_tindak_lanjut: 'Diseminasi teknik beton hijau ramah lingkungan di jurusan teknik sipil.',
      funding_scheme: 'DIPA PNJ',
      fundingSource: 'pnj',
      sponsorName: 'DIPA PNJ Riset Terapan 2026',
      pernyataan_biaya_pribadi: false,
      isCooperation: false,
      cooperationName: '',
      current_status: 'CLOSED',
      status: 'closed',
      statusLabel: 'Kasus Selesai (Diarsipkan)',
      progress_percentage: 100,
      progress: 100,
      urgency_level: 'NORMAL',
      approved_by_pimpinan_id: 5,
      created_at: '2026-05-20 09:00',
      submittedAt: '2026-05-20 09:00',
      updated_at: '2026-07-25 16:00',
      lastUpdated: '2026-07-25 16:00',
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify({
        name: 'Ahmad Fauzi, S.T., M.Eng.',
        nim_nip: '197509182003121002',
        jurusan: 'Teknik Sipil',
        prodi: 'Konstruksi Gedung',
        passport_no: 'A7788990',
        passport_exp: '2028-12-10'
      }),
      documents: {
        paspor: { id_document: 601, name: 'Paspor_Ahmad.pdf', size: '1.3 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' },
        surat_undangan: { id_document: 602, name: 'UniMelb_Conference_LoA.pdf', size: '1.0 MB', status: 'verified', review_status: 'VALID', statusLabel: 'Terverifikasi' }
      },
      internalNotes: [],
      messages: []
    }
  ],

  // 4. TABLE: official_trackings
  official_trackings: {
    'PDLN-2026-09-003': {
      id_tracking: 1,
      case_id: 'PDLN-2026-09-003',
      srikandi_ref_no: 'SRK-PNJ-2026-0922-0041',
      srikandi_signed_doc_path: null,
      pintas_ref_id: null,
      pintas_submit_date: null,
      external_status: 'Sedang Proses Persuratan SRIKANDI',
      passport_exit_permit_status: 'Menunggu Surat Pengantar PNJ',
      final_sp_doc_path: null,
      rejection_or_revision_reason: null,
      updated_at: '2026-09-22 11:30'
    },
    'PDLN-2026-09-004': {
      id_tracking: 2,
      case_id: 'PDLN-2026-09-004',
      srikandi_ref_no: 'SRK-PNJ-2026-0918-0029',
      srikandi_signed_doc_path: 'Surat_Tugas_TTE_Direktur_Prof_Bambang.pdf',
      nomor_surat_resmi: '1042/PL3/TU/2026',
      tanggal_surat: '2026-09-23',
      pejabat_penandatangan: 'Dr. Sc. H. Zainal Nur Arifin, Dipl-Ing. HTL., M.T. (Direktur PNJ)',
      pintas_ref_id: null,
      pintas_submit_date: null,
      external_status: 'Naskah Dinas TTE Sah, Berkas Siap Diunggah ke PINTAS',
      passport_exit_permit_status: 'Siap diajukan',
      final_sp_doc_path: null,
      rejection_or_revision_reason: null,
      updated_at: '2026-09-23 15:00'
    },
    'PDLN-2026-08-001': {
      id_tracking: 3,
      case_id: 'PDLN-2026-08-001',
      srikandi_ref_no: 'SRK-PNJ-2026-0715-0012',
      srikandi_signed_doc_path: 'Surat_Pengantar_TTE_Direktur_Dewi.pdf',
      nomor_surat_resmi: '0854/PL3/TU/2026',
      tanggal_surat: '2026-07-16',
      pejabat_penandatangan: 'Dr. Sc. H. Zainal Nur Arifin (Direktur PNJ)',
      pintas_ref_id: 'PINTAS-KEMEN-2026-77821',
      pintas_submit_date: '2026-07-20',
      external_status: 'Izin Prinsip & SP Terbit',
      passport_exit_permit_status: 'Exit Permit & Visa Selesai',
      final_sp_doc_path: 'SP_Kemensetneg_Dewi_Sartika_B3211.pdf',
      rejection_or_revision_reason: null,
      updated_at: '2026-08-05 14:00'
    },
    'PDLN-2026-07-001': {
      id_tracking: 4,
      case_id: 'PDLN-2026-07-001',
      srikandi_ref_no: 'SRK-PNJ-2026-0610-0088',
      srikandi_signed_doc_path: 'Surat_Pengantar_TTE_Ahmad.pdf',
      nomor_surat_resmi: '0712/PL3/TU/2026',
      tanggal_surat: '2026-06-11',
      pejabat_penandatangan: 'Dr. Sc. H. Zainal Nur Arifin (Direktur PNJ)',
      pintas_ref_id: 'PINTAS-KEMEN-2026-55421',
      pintas_submit_date: '2026-06-15',
      external_status: 'Selesai & Sah',
      passport_exit_permit_status: 'Selesai',
      final_sp_doc_path: 'SP_Kemensetneg_Ahmad_Fauzi_B2119.pdf',
      rejection_or_revision_reason: null,
      updated_at: '2026-07-25 16:00'
    }
  },

  // 5. TABLE: case_lpj_reports
  case_lpj_reports: {
    'PDLN-2026-07-001': {
      id_lpj: 1,
      case_id: 'PDLN-2026-07-001',
      tim_bertugas: 'Ahmad Fauzi, S.T., M.Eng. (Presenter Utama)',
      tujuan_kegiatan: 'Diseminasi artikel ilmiah konstruksi berkelanjutan di Melbourne, Australia.',
      materi_kegiatan: 'Mempresentasikan paper tentang material geopolimer abu terbang untuk beton pracetak.',
      tindak_lanjut: 'Penerapan standar beton rendah karbon pada kurikulum praktikum konstruksi gedung.',
      dampak_rekomendasi: 'Kerjasama riset lanjutan dengan School of Engineering University of Melbourne.',
      total_realisasi_biaya: 34500000,
      file_sp_setneg: 'SP_Kemensetneg_Ahmad_Fauzi_B2119.pdf',
      file_laporan_kegiatan: 'LPJ_Lengkap_Melbourne_AhmadFauzi.pdf',
      file_sppd: 'Bukti_Pengeluaran_SPPD_Tiket_Ahmad.pdf',
      lpj_status: 'VERIFIED',
      verified_by: 4,
      created_at: '2026-07-20 10:00'
    }
  },

  // 6. TABLE: master_templates_and_configs
  master_templates_and_configs: [
    {
      id_master: 1,
      config_category: 'MASTER_NEGARA',
      code_or_name: 'Korea Selatan',
      file_or_link_path: 'Seoul, Busan, Daejeon, Incheon',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 2,
      config_category: 'MASTER_NEGARA',
      code_or_name: 'Jepang',
      file_or_link_path: 'Tokyo, Osaka, Kyoto, Yokohama, Fukuoka',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 3,
      config_category: 'MASTER_NEGARA',
      code_or_name: 'Singapura',
      file_or_link_path: 'Singapore Central, Jurong',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 4,
      config_category: 'MASTER_NEGARA',
      code_or_name: 'Jerman',
      file_or_link_path: 'Berlin, Aachen, Munich, Frankfurt',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 5,
      config_category: 'MASTER_NEGARA',
      code_or_name: 'Australia',
      file_or_link_path: 'Melbourne, Sydney, Perth, Brisbane',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 6,
      config_category: 'MASTER_KEGIATAN',
      code_or_name: 'student_exchange',
      file_or_link_path: 'Pertukaran Mahasiswa (Student Exchange / IISMA)',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 7,
      config_category: 'MASTER_KEGIATAN',
      code_or_name: 'conference',
      file_or_link_path: 'Pemakalah Konferensi Internasional',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 8,
      config_category: 'MASTER_KEGIATAN',
      code_or_name: 'research',
      file_or_link_path: 'Riset Kolaborasi & Publikasi Bersama',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 9,
      config_category: 'MASTER_KEGIATAN',
      code_or_name: 'training',
      file_or_link_path: 'Pelatihan Vokasi / Benchmarking Kurikulum',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    },
    {
      id_master: 10,
      config_category: 'URGENCY_RULE',
      code_or_name: 'Deadline Thresholds',
      file_or_link_path: 'CRITICAL: <= 7 Hari | URGENT: <= 14 Hari | WARNING: <= 30 Hari | NORMAL: > 30 Hari',
      is_active: true,
      updated_by: 4,
      updated_at: '2026-01-10'
    }
  ],

  // 7. TABLE: notifications
  notifications: [
    {
      id_notification: 1,
      recipient_id: 1,
      case_id: 'PDLN-2026-09-001',
      notification_type: 'REVISION_REQUIRED',
      title: 'Permintaan Perbaikan Berkas Paspor',
      message: 'KUI meminta scan ulang paspor Anda karena bagian MRZ terpotong dan nomor tidak terbaca jelas.',
      is_email_sent: true,
      is_read: false,
      created_at: '2026-09-20 14:15'
    },
    {
      id_notification: 2,
      recipient_id: 2,
      case_id: 'PDLN-2026-09-002',
      notification_type: 'VERIFIED_KUI',
      title: 'Berkas Selesai Diverifikasi KUI',
      message: 'Usulan Anda telah dinyatakan memenuhi syarat internal dan diteruskan ke Direktur PNJ.',
      is_email_sent: true,
      is_read: true,
      created_at: '2026-09-21 09:00'
    },
    {
      id_notification: 3,
      recipient_id: 8,
      case_id: 'PDLN-2026-08-001',
      notification_type: 'SP_APPROVED',
      title: 'Surat Persetujuan (SP) Kemensetneg Terbit Resmi!',
      message: 'Surat Persetujuan Setneg No. B-3211 telah diunggah oleh KUI. Anda dipersilakan mengunduh SP dan mengisi LPJ pasca perjalanan.',
      is_email_sent: true,
      is_read: false,
      created_at: '2026-08-05 14:00'
    }
  ],

  // 8. TABLE: chatbot_knowledge_base
  chatbot_knowledge_base: [
    {
      id_faq: 1,
      topic_category: 'PASPOR',
      question_keywords: 'paspor, passport, masa berlaku, kedaluwarsa, paspor dinas',
      approved_answer: 'Paspor RI wajib masih berlaku minimal 6 bulan terhitung sejak tanggal rencana kepulangan ke Indonesia. Untuk paspor dinas (biru), permohonan dapat menggunakan template pengantar KUI.',
      is_active: true
    },
    {
      id_faq: 2,
      topic_category: 'DOKUMEN_WAJIB',
      question_keywords: 'dokumen, berkas, syarat, checklist, loa, sptjm, surat tugas',
      approved_answer: 'Dokumen wajib meliputi: 1) Scan Paspor RI (min. 6 bulan), 2) Letter of Acceptance (LoA) / Undangan Resmi Mitra, 3) SPTJM Bermaterai Rp10.000, 4) Bukti Jaminan Pembiayaan (Surat Tugas DIPA PNJ atau Surat Sponsor), dan 5) CV / Biodata Pemohon.',
      is_active: true
    },
    {
      id_faq: 3,
      topic_category: 'SRIKANDI',
      question_keywords: 'srikandi, persuratan, tte, tanda tangan, nomor surat',
      approved_answer: 'SRIKANDI adalah aplikasi persuratan resmi pemerintah. Setelah berkas disetujui internal, KUI menyusun draf naskah dinas dan mengunggahnya ke SRIKANDI untuk penomoran resmi serta Tanda Tangan Elektronik (TTE) Direktur PNJ.',
      is_active: true
    },
    {
      id_faq: 4,
      topic_category: 'PINTAS_SETNEG',
      question_keywords: 'pintas, setneg, kemlu, kementerian, izin prinsip, sp',
      approved_answer: 'PINTAS adalah portal resmi izin PDLN di Kemendikbudristek/Kemensetneg. KUI mendaftarkan usulan yang telah bertanda tangan resmi (TTE) ke PINTAS untuk mendapatkan persetujuan izin clearance negara.',
      is_active: true
    },
    {
      id_faq: 5,
      topic_category: 'LPJ_SPPD',
      question_keywords: 'lpj, laporan, sppd, pertanggungjawaban, kuitansi, selesai',
      approved_answer: 'Setelah kegiatan dinas selesai, pemohon wajib mengunggah Laporan Pertanggungjawaban (LPJ), bukti capaian kegiatan, dan berkas SPPD dalam waktu maksimal 14 hari kerja agar status pengajuan dapat ditutup (CLOSED).',
      is_active: true
    }
  ],

  // 9. TABLE: audit_trails
  audit_trails: [
    {
      id_audit: 1,
      case_id: 'PDLN-2026-09-001',
      actor_id: 4,
      actor_name: 'Siti Rahmawati, M.Ed. (KUI)',
      action_name: 'Minta Revisi Berkas Paspor',
      status_before: 'KUI_REVIEW',
      status_after: 'REVISION',
      timestamp: '2026-09-20 14:15',
      change_details: 'Catatan revisi: Scan paspor terpotong pada bagian MRZ.'
    },
    {
      id_audit: 2,
      case_id: 'PDLN-2026-09-002',
      actor_id: 4,
      actor_name: 'Siti Rahmawati, M.Ed. (KUI)',
      action_name: 'Verifikasi Berkas Memenuhi Syarat',
      status_before: 'KUI_REVIEW',
      status_after: 'PIMPINAN_REVIEW',
      timestamp: '2026-09-21 09:00',
      change_details: 'Seluruh 4 dokumen diverifikasi valid. Diteruskan ke Direktur PNJ.'
    },
    {
      id_audit: 3,
      case_id: 'PDLN-2026-09-003',
      actor_id: 3,
      actor_name: 'Bayu Aditya, S.Kom. (Operator KUI)',
      action_name: 'Generate Draf Naskah Dinas & Kirim ke SRIKANDI',
      status_before: 'DOCUMENT_GENERATED',
      status_after: 'SRIKANDI_PROCESS',
      timestamp: '2026-09-22 11:30',
      change_details: 'Draf surat usulan dibuat otomatis. No Registrasi SRIKANDI: SRK-PNJ-2026-0922-0041.'
    },
    {
      id_audit: 4,
      case_id: 'PDLN-2026-09-004',
      actor_id: 3,
      actor_name: 'Bayu Aditya, S.Kom. (Operator KUI)',
      action_name: 'Pencatatan Nomor Surat Resmi & Upload TTE',
      status_before: 'SRIKANDI_PROCESS',
      status_after: 'SIGNED',
      timestamp: '2026-09-23 15:00',
      change_details: 'Nomor Surat Resmi: 1042/PL3/TU/2026 ditandatangani TTE Direktur PNJ.'
    },
    {
      id_audit: 5,
      case_id: 'PDLN-2026-08-001',
      actor_id: 4,
      actor_name: 'Siti Rahmawati, M.Ed. (KUI)',
      action_name: 'Upload SP Kemensetneg & Status APPROVED',
      status_before: 'PINTAS_SUBMITTED',
      status_after: 'APPROVED',
      timestamp: '2026-08-05 14:00',
      change_details: 'Surat Persetujuan Kemensetneg No. B-3211 terbit resmi dan disimpan.'
    },
    {
      id_audit: 6,
      case_id: 'PDLN-2026-07-001',
      actor_id: 4,
      actor_name: 'Siti Rahmawati, M.Ed. (KUI)',
      action_name: 'Verifikasi LPJ & Tutup Kasus (CLOSED)',
      status_before: 'LPJ_SUBMITTED',
      status_after: 'CLOSED',
      timestamp: '2026-07-25 16:00',
      change_details: 'Laporan kegiatan dan realisasi biaya Rp34.500.000 dinyatakan sah.'
    }
  ],

  // 10. Mobility Inbound & Outbound Records
  mobilityRecords: [
    {
      id: 'MOB-OUT-001',
      type: 'outbound',
      category: 'mahasiswa',
      title: 'Pertukaran Mahasiswa SeoulTech Batch Fall 2026',
      leaderName: 'Andi Pratama',
      participantCount: 5,
      participants: [
        { name: 'Andi Pratama', idNum: '20260001', role: 'Ketua Delegasi', prodi: 'Teknik Informatika' },
        { name: 'Rizky Ramadhan', idNum: '20260012', role: 'Anggota', prodi: 'Teknik Informatika' },
        { name: 'Farah Salsabila', idNum: '20260034', role: 'Anggota', prodi: 'Teknik Multimedia Digital' },
        { name: 'Dimas Setiawan', idNum: '20260045', role: 'Anggota', prodi: 'Teknik Otomasi Listrik' },
        { name: 'Clarissa Putri', idNum: '20260067', role: 'Anggota', prodi: 'Akuntansi Keuangan' }
      ],
      destinationCountry: 'Korea Selatan',
      destinationCity: 'Seoul',
      hostInstitution: 'Seoul National University of Science and Technology',
      department: 'Teknik Informatika dan Komputer',
      startDate: '2026-10-15',
      endDate: '2027-02-28',
      durationDays: 136,
      fundingSource: 'sponsor_eksternal',
      sponsorName: 'Global Korea Scholarship (GKS)',
      notes: 'Program pertukaran semester ganjil berbasis MoU PNJ-SeoulTech.',
      createdAt: '2026-09-18'
    },
    {
      id: 'MOB-OUT-002',
      type: 'outbound',
      category: 'dosen',
      title: 'Pemakalah Konferensi IEEE International Conference on Advanced Robotics',
      leaderName: 'Dr. Ir. Hendra Wijaya, M.T.',
      participantCount: 2,
      participants: [
        { name: 'Dr. Ir. Hendra Wijaya, M.T.', idNum: '197805122005011002', role: 'Presenter Utama', prodi: 'Teknik Mesin' },
        { name: 'Agus Salim, S.T., M.T.', idNum: '198203152008121003', role: 'Co-Author', prodi: 'Teknik Mesin' }
      ],
      destinationCountry: 'Jepang',
      destinationCity: 'Tokyo',
      hostInstitution: 'Tokyo Institute of Technology',
      department: 'Teknik Mesin',
      startDate: '2026-11-04',
      endDate: '2026-11-10',
      durationDays: 7,
      fundingSource: 'pnj',
      sponsorName: 'DIPA PNJ 2026 Riset Terapan',
      notes: 'Diseminasi hasil riset kolaborasi manufaktur cerdas.',
      createdAt: '2026-09-19'
    },
    {
      id: 'MOB-OUT-003',
      type: 'outbound',
      category: 'mahasiswa',
      title: 'Vocation Internship Training di Nanyang Polytechnic',
      leaderName: 'Nadia Putri',
      participantCount: 3,
      participants: [
        { name: 'Nadia Putri', idNum: '20260088', role: 'Peserta', prodi: 'Teknik Grafika' },
        { name: 'Bagas Wicaksono', idNum: '20260091', role: 'Peserta', prodi: 'Penerbitan' },
        { name: 'Maya Anggraini', idNum: '20260095', role: 'Peserta', prodi: 'Desain Grafis' }
      ],
      destinationCountry: 'Singapura',
      destinationCity: 'Singapore',
      hostInstitution: 'Nanyang Polytechnic',
      department: 'Teknik Grafika dan Penerbitan',
      startDate: '2026-10-01',
      endDate: '2026-10-21',
      durationDays: 21,
      fundingSource: 'pnj',
      sponsorName: 'Bantuan Mobilitas Vokasi PNJ',
      notes: 'Pelatihan teknologi digital printing and packaging.',
      createdAt: '2026-09-10'
    },
    {
      id: 'MOB-IN-001',
      type: 'inbound',
      category: 'mahasiswa',
      title: 'International Student Summer Program PNJ Tech-Eco 2026',
      leaderName: 'Chen Wei Liang',
      participantCount: 4,
      participants: [
        { name: 'Chen Wei Liang', idNum: 'MY-2026-901', role: 'Mahasiswa Asing', prodi: 'Information Technology' },
        { name: 'Nur Aisyah Binti Ahmad', idNum: 'MY-2026-902', role: 'Mahasiswa Asing', prodi: 'Computer Engineering' },
        { name: 'Lim Jia Yi', idNum: 'MY-2026-903', role: 'Mahasiswa Asing', prodi: 'Electronic Systems' },
        { name: 'Muhammad Danish', idNum: 'MY-2026-904', role: 'Mahasiswa Asing', prodi: 'Mechanical Eng' }
      ],
      destinationCountry: 'Malaysia (Asal)',
      destinationCity: 'Shah Alam (Asal)',
      hostInstitution: 'Management & Science University (MSU Malaysia)',
      department: 'Teknik Informatika dan Komputer (Host PNJ)',
      startDate: '2026-09-01',
      endDate: '2026-10-30',
      durationDays: 60,
      fundingSource: 'kerjasama',
      sponsorName: 'MSU Global Mobility Grant',
      notes: 'Sit-in dan proyek terapan di lab IoT dan Robotika Kampus PNJ Depok.',
      createdAt: '2026-08-25'
    },
    {
      id: 'MOB-IN-002',
      type: 'inbound',
      category: 'dosen',
      title: 'Visiting Professor: AI & Industry 4.0 in Vocational Higher Education',
      leaderName: 'Prof. Kenji Takahashi, Ph.D.',
      participantCount: 1,
      participants: [
        { name: 'Prof. Kenji Takahashi, Ph.D.', idNum: 'JP-DOC-8821', role: 'Visiting Professor', prodi: 'Precision Engineering' }
      ],
      destinationCountry: 'Jepang (Asal)',
      destinationCity: 'Yokohama (Asal)',
      hostInstitution: 'Yokohama National University',
      department: 'Teknik Elektro (Host PNJ)',
      startDate: '2026-09-15',
      endDate: '2026-10-15',
      durationDays: 31,
      fundingSource: 'kerjasama',
      sponsorName: 'JICA Vocational Academic Fellowship',
      notes: 'Memberikan kuliah umum, review kurikulum OBE, dan riset bersama dosen elektro.',
      createdAt: '2026-08-30'
    },
    {
      id: 'MOB-IN-003',
      type: 'inbound',
      category: 'dosen',
      title: 'Guest Researcher on Renewable Solar Energy Microgrids',
      leaderName: 'Assoc. Prof. Dr. Sarah Jenkins',
      participantCount: 2,
      participants: [
        { name: 'Assoc. Prof. Dr. Sarah Jenkins', idNum: 'AU-FAC-441', role: 'Lead Researcher', prodi: 'Renewable Energy' },
        { name: 'Dr. Liam Mitchell', idNum: 'AU-FAC-442', role: 'Postdoctoral Fellow', prodi: 'Smart Grid Tech' }
      ],
      destinationCountry: 'Australia (Asal)',
      destinationCity: 'Perth (Asal)',
      hostInstitution: 'Curtin University',
      department: 'Teknik Mesin & Elektro (Host PNJ)',
      startDate: '2026-10-10',
      endDate: '2026-11-05',
      durationDays: 27,
      fundingSource: 'sponsor_eksternal',
      sponsorName: 'DFAT Australia-Indonesia Institute Grant',
      notes: 'Implementasi pilot project panel surya efisiensi tinggi di atap gedung terpadu PNJ.',
      createdAt: '2026-09-05'
    }
  ]
};

// --- STORE CLASS IMPLEMENTATION ---
class Store {
  constructor() {
    this.data = this.loadData();
    this.ensureConsistency();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage, memuat dataset bawaan.', e);
    }
    this.saveData(INITIAL_DATA);
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Gagal menyimpan data:', e);
    }
  }

  ensureConsistency() {
    // Backwards compatibility sync for applications and pdln_cases
    if (!this.data.pdln_cases) {
      this.data.pdln_cases = INITIAL_DATA.pdln_cases;
    }
    this.data.applications = this.data.pdln_cases;
    this.saveData(this.data);
  }

  // --- NFR P0: Draft Management & Recovery ---
  saveFormDraft(draftKey, data) {
    try {
      const user = this.getCurrentUser();
      const prefix = user ? user.id : 'anon';
      const key = `PDLN_DRAFT_${prefix}_${draftKey}`;
      const payload = {
        data,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.warn('Gagal menyimpan draf otomatis:', e);
      return false;
    }
  }

  getFormDraft(draftKey) {
    try {
      const user = this.getCurrentUser();
      const prefix = user ? user.id : 'anon';
      const key = `PDLN_DRAFT_${prefix}_${draftKey}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Gagal membaca draf:', e);
    }
    return null;
  }

  clearFormDraft(draftKey) {
    try {
      const user = this.getCurrentUser();
      const prefix = user ? user.id : 'anon';
      const key = `PDLN_DRAFT_${prefix}_${draftKey}`;
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Auth & Session Methods ---
  isPageAdmin() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('page') === 'admin' || urlParams.get('page') === 'kui';
  }

  isPagePimpinan() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('page') === 'pimpinan';
  }

  isPageMobility() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('page') === 'mobility';
  }

  isLoggedIn() {
    return !!this.data.sessionUserId && !!this.data.users[this.data.sessionUserId];
  }

  getCurrentUser() {
    if (!this.isLoggedIn()) return null;
    return this.data.users[this.data.sessionUserId];
  }

  // Dynamic Profile Completeness Calculator (Realtime Data Verification)
  calculateProfileCompleteness(userId) {
    const profile = this.getUserProfile(userId);
    if (!profile) return 0;

    const fields = [
      'nik',
      'nomor_paspor',
      'passport_expiry',
      'no_telepon',
      'emergency_name',
      'emergency_phone'
    ];

    let filled = 0;
    fields.forEach(field => {
      if (profile[field] && String(profile[field]).trim() !== '') {
        filled++;
      }
    });

    return Math.round((filled / fields.length) * 100);
  }

  getUserProfile(userId) {
    return this.data.user_profiles[userId] || null;
  }

  quickLogin(userId) {
    if (this.data.users[userId]) {
      this.data.sessionUserId = userId;
      this.saveData(this.data);
      this.addAuditLog(this.data.users[userId].full_name, 'Login ke Sistem (SSO PNJ)', 'AUTH');
      window.dispatchEvent(new CustomEvent('pndl:auth-changed', { detail: this.data.users[userId] }));
      return true;
    }
    return false;
  }

  login(identifier, password) {
    const idClean = identifier.trim().toLowerCase();
    const user = Object.values(this.data.users).find(u => 
      u.sso_id.toLowerCase() === idClean || 
      u.email.toLowerCase() === idClean ||
      u.identity_number === idClean
    );

    if (user) {
      this.data.sessionUserId = user.id;
      this.saveData(this.data);
      this.addAuditLog(user.full_name, 'Login Berhasil (SSO PNJ)', 'AUTH');
      window.dispatchEvent(new CustomEvent('pndl:auth-changed', { detail: user }));
      return { success: true, user };
    }

    return { success: false, message: 'NIM / NIP atau kata sandi SSO PNJ tidak sesuai.' };
  }

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog(user.full_name, 'Logout dari Sistem', 'AUTH');
    }
    this.data.sessionUserId = null;
    this.saveData(this.data);
    window.dispatchEvent(new CustomEvent('pndl:auth-changed', { detail: null }));
  }

  updateProfile(userId, profileData) {
    if (!this.data.user_profiles[userId]) {
      this.data.user_profiles[userId] = {};
    }
    Object.assign(this.data.user_profiles[userId], profileData);
    this.data.user_profiles[userId].updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    // Calculate completion percentage
    let filled = 0;
    const required = ['nik', 'nomor_paspor', 'passport_expiry', 'no_telepon', 'emergency_name', 'emergency_phone'];
    required.forEach(k => {
      if (this.data.user_profiles[userId][k]) filled++;
    });
    this.data.user_profiles[userId].completion_percentage = Math.round((filled / required.length) * 100);

    const user = this.data.users[userId];
    this.addAuditLog(user ? user.full_name : 'Pengguna', 'Memperbarui Data Profil Mandiri', `PROFILE-${userId}`);
    this.saveData(this.data);
    window.dispatchEvent(new CustomEvent('pndl:profile-updated', { detail: this.data.user_profiles[userId] }));
    return true;
  }

  // --- Case Lifecycle & Management ---
  getApplications() {
    return this.data.pdln_cases;
  }

  getUserApplications(userId) {
    return this.data.pdln_cases.filter(app => app.userId === userId || app.id_user === (this.data.users[userId] ? this.data.users[userId].id_user : -1));
  }

  getApplicationById(caseId) {
    return this.data.pdln_cases.find(c => c.case_id === caseId || c.id === caseId);
  }

  // Urgency Calculator based on departure date & case status
  calculateUrgency(startDate, status) {
    if (status === 'CLOSED' || status === 'ARCHIVED') {
      return { level: 'ARCHIVED', daysLeft: 0, label: 'Selesai' };
    }
    if (status === 'APPROVED' || status === 'SP_ISSUED') {
      return { level: 'NORMAL', daysLeft: 0, label: 'SP Terbit' };
    }

    if (!startDate) return { level: 'NORMAL', daysLeft: 999, label: 'Normal' };
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { level: 'CRITICAL', daysLeft, label: 'Lewat Jadwal' };
    if (daysLeft <= 7) return { level: 'CRITICAL', daysLeft, label: `H-${daysLeft}` };
    if (daysLeft <= 14) return { level: 'URGENT', daysLeft, label: `H-${daysLeft}` };
    if (daysLeft <= 30) return { level: 'WARNING', daysLeft, label: `H-${daysLeft}` };
    return { level: 'NORMAL', daysLeft, label: `H-${daysLeft}` };
  }

  // Completeness Validator Engine
  validateCompleteness(formData, documents) {
    const missingItems = [];
    const completeItems = [];

    // 1. Mandatory Form Fields
    if (!formData.destinationCountry) missingItems.push('Negara Tujuan');
    else completeItems.push('Negara Tujuan');

    if (!formData.hostInstitution) missingItems.push('Institusi Mitra');
    else completeItems.push('Institusi Mitra');

    if (!formData.startDate) missingItems.push('Tanggal Berangkat');
    else completeItems.push('Tanggal Berangkat');

    if (!formData.endDate) missingItems.push('Tanggal Kepulangan');
    else completeItems.push('Tanggal Kepulangan');

    if (!formData.fundingSource) missingItems.push('Sumber Pendanaan');
    else completeItems.push('Sumber Pendanaan');

    // 2. Mandatory Documents
    if (!documents || !documents.paspor) missingItems.push('Scan Paspor RI (Aktif min. 6 bulan)');
    else completeItems.push('Scan Paspor RI');

    if (!documents || !documents.surat_undangan) missingItems.push('Surat Undangan / Letter of Acceptance (LoA)');
    else completeItems.push('Surat Undangan / LoA');

    if (!documents || !documents.sptjm) missingItems.push('SPTJM Bermaterai Rp10.000');
    else completeItems.push('SPTJM Bermaterai');

    const total = missingItems.length + completeItems.length;
    const score = Math.round((completeItems.length / total) * 100);

    return {
      isValid: missingItems.length === 0,
      score,
      missingItems,
      completeItems
    };
  }

  // Create new Case
  createApplication(formData) {
    const user = this.getCurrentUser();
    const profile = user ? this.getUserProfile(user.id) : null;
    const caseCount = this.data.pdln_cases.length + 1;
    const caseId = `PDLN-2026-09-${String(caseCount).padStart(3, '0')}`;

    const urgency = this.calculateUrgency(formData.startDate);

    const snapshot = {
      name: user ? user.full_name : 'Pemohon PNJ',
      nim_nip: user ? user.identity_number : '-',
      jurusan: user ? user.unit_department : '-',
      prodi: user ? user.prodi : '-',
      passport_no: profile ? profile.nomor_paspor : '-',
      passport_exp: profile ? profile.passport_expiry : '-'
    };

    const newCase = {
      case_id: caseId,
      id: caseId,
      id_user: user ? user.id_user : 1,
      userId: user ? user.id : 'mhs-1',
      applicantName: user ? user.full_name : 'Pemohon PNJ',
      applicantRole: user && user.role === 'dosen' ? 'Dosen' : 'Mahasiswa',
      applicantNimNip: user ? user.identity_number : '-',
      applicantProdi: user ? user.prodi : '-',
      service_category: formData.service_category || 'PDLN Outbound',
      jenis_kegiatan: formData.purpose || 'student_exchange',
      purposeLabel: formData.purposeLabel || 'Kegiatan Akademik Luar Negeri',
      nama_kegiatan: formData.activityTitle || `Program PDLN ke ${formData.destinationCountry}`,
      institusi_tujuan: formData.hostInstitution || '-',
      hostInstitution: formData.hostInstitution || '-',
      negara_tujuan: formData.destinationCountry || '-',
      destinationCountry: formData.destinationCountry || '-',
      kota_tujuan: formData.destinationCity || '-',
      destinationCity: formData.destinationCity || '-',
      tanggal_mulai: formData.startDate,
      startDate: formData.startDate,
      tanggal_selesai: formData.endDate,
      endDate: formData.endDate,
      durationDays: formData.durationDays || 7,
      rencana_tindak_lanjut: formData.followUpPlan || 'Laporan pertanggungjawaban dan transfer keilmuan.',
      funding_scheme: formData.fundingSource === 'pnj' ? 'DIPA PNJ' : formData.fundingSource === 'pribadi' ? 'Biaya Pribadi' : 'Sponsor Eksternal',
      fundingSource: formData.fundingSource || 'pnj',
      sponsorName: formData.sponsorName || '',
      pernyataan_biaya_pribadi: formData.fundingSource === 'pribadi',
      isCooperation: !!formData.isCooperation,
      cooperationName: formData.cooperationName || '',
      current_status: 'SUBMITTED',
      status: 'submitted',
      statusLabel: 'Menunggu Review KUI',
      progress_percentage: 20,
      progress: 20,
      urgency_level: urgency.level,
      approved_by_pimpinan_id: null,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updated_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      revisionItems: [],
      revisionNote: '',
      profile_snapshot: JSON.stringify(snapshot),
      documents: formData.documents || {
        paspor: { id_document: Date.now() + 1, name: 'Paspor_Mandiri.pdf', size: '1.2 MB', status: 'uploaded', review_status: 'PENDING', statusLabel: 'Menunggu Verifikasi', uploadedAt: new Date().toISOString().substring(0, 10) },
        surat_undangan: { id_document: Date.now() + 2, name: 'LoA_Mitra.pdf', size: '2.1 MB', status: 'uploaded', review_status: 'PENDING', statusLabel: 'Menunggu Verifikasi', uploadedAt: new Date().toISOString().substring(0, 10) },
        sptjm: { id_document: Date.now() + 3, name: 'SPTJM_Bermaterai.pdf', size: '850 KB', status: 'uploaded', review_status: 'PENDING', statusLabel: 'Menunggu Verifikasi', uploadedAt: new Date().toISOString().substring(0, 10) }
      },
      internalNotes: [],
      messages: []
    };

    this.data.pdln_cases.unshift(newCase);
    this.addAuditLog(newCase.applicantName, 'Mengajukan Permohonan PDLN Baru', caseId, 'DRAFT', 'SUBMITTED');
    this.addNotification(
      user ? user.id_user : 1,
      caseId,
      'SUBMITTED',
      'Pengajuan Berhasil Dikirim',
      `Pengajuan PDLN Anda (${caseId}) telah masuk ke antrean verifikasi KUI PNJ.`
    );

    this.saveData(this.data);
    return newCase;
  }

  // KUI Verification: Request Revision
  requestRevision(caseId, items, noteText) {
    const actor = this.getCurrentUser() || { full_name: 'Operator KUI', id_user: 3 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'REVISION';
    app.status = 'revision_required';
    app.statusLabel = 'Perlu Revisi Berkas';
    app.revisionItems = items;
    app.revisionNote = noteText;
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
    app.lastUpdated = app.updated_at;

    if (app.documents) {
      items.forEach(k => {
        if (app.documents[k]) {
          app.documents[k].status = 'revision_required';
          app.documents[k].review_status = 'REVISION_REQUIRED';
          app.documents[k].statusLabel = 'Perlu Revisi';
          app.documents[k].note = noteText;
        }
      });
    }

    this.addAuditLog(actor.full_name, `Minta Revisi Berkas: ${items.join(', ')}`, caseId, oldStatus, 'REVISION', noteText);
    this.addNotification(
      app.id_user,
      caseId,
      'REVISION_REQUIRED',
      'Permintaan Revisi Dokumen PDLN',
      `KUI meminta perbaikan berkas: ${items.join(', ')}. Catatan: "${noteText}"`
    );

    this.saveData(this.data);
    return true;
  }

  // KUI Verification: Mark Verified & Forward to Pimpinan
  verifyByKui(caseId) {
    const actor = this.getCurrentUser() || { full_name: 'Siti Rahmawati (KUI)', id_user: 4 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'PIMPINAN_REVIEW';
    app.status = 'pimpinan_review';
    app.statusLabel = 'Menunggu Persetujuan Direktur PNJ';
    app.progress_percentage = 50;
    app.progress = 50;
    app.revisionItems = [];
    app.revisionNote = '';
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
    app.lastUpdated = app.updated_at;

    if (app.documents) {
      Object.keys(app.documents).forEach(k => {
        app.documents[k].status = 'verified';
        app.documents[k].review_status = 'VALID';
        app.documents[k].statusLabel = 'Terverifikasi';
      });
    }

    this.addAuditLog(actor.full_name, 'Verifikasi Kelayakan KUI Selesai (Diteruskan ke Pimpinan)', caseId, oldStatus, 'PIMPINAN_REVIEW');
    this.addNotification(
      app.id_user,
      caseId,
      'VERIFIED_KUI',
      'Berkas Lolos Verifikasi KUI PNJ',
      'Dokumen pengajuan telah diverifikasi lengkap oleh KUI dan diteruskan untuk pertimbangan persetujuan Direktur PNJ.'
    );

    this.saveData(this.data);
    return true;
  }

  // Pimpinan Internal Review: Approve or Reject
  pimpinanDecision(caseId, isApproved, noteText = '') {
    const actor = this.getCurrentUser() || { full_name: 'Dr. Sc. H. Zainal Nur Arifin (Direktur PNJ)', id_user: 5 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;

    if (isApproved) {
      app.current_status = 'DOCUMENT_GENERATED';
      app.status = 'document_generated';
      app.statusLabel = 'Disetujui Pimpinan (Siap Naskah Dinas)';
      app.progress_percentage = 65;
      app.progress = 65;
      app.approved_by_pimpinan_id = actor.id_user;
      app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
      app.lastUpdated = app.updated_at;

      this.addAuditLog(actor.full_name, 'Direktur PNJ Menyetujui Usulan (Sahkan Kebijakan)', caseId, oldStatus, 'DOCUMENT_GENERATED');
      this.addNotification(
        app.id_user,
        caseId,
        'PIMPINAN_APPROVED',
        'Persetujuan Internal Direktur PNJ Terbit',
        'Pimpinan internal PNJ telah menyetujui usulan dinas Anda. KUI sedang memproses draf naskah dinas resmi.'
      );
    } else {
      app.current_status = 'REJECTED';
      app.status = 'rejected';
      app.statusLabel = 'Ditolak Pimpinan Internal';
      app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);
      app.lastUpdated = app.updated_at;

      this.addAuditLog(actor.full_name, 'Direktur PNJ Menolak/Menangguhkan Usulan', caseId, oldStatus, 'REJECTED', noteText);
      this.addNotification(
        app.id_user,
        caseId,
        'PIMPINAN_REJECTED',
        'Usulan PDLN Ditangguhkan / Ditolak',
        `Pertimbangan pimpinan: "${noteText}"`
      );
    }

    this.saveData(this.data);
    return true;
  }

  // SRIKANDI Tracking
  recordSrikandiProcess(caseId, srikandiRefNo) {
    const actor = this.getCurrentUser() || { full_name: 'Operator KUI', id_user: 3 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'SRIKANDI_PROCESS';
    app.status = 'srikandi_process';
    app.statusLabel = 'Proses Registrasi Naskah Dinas SRIKANDI';
    app.progress_percentage = 75;
    app.progress = 75;
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (!this.data.official_trackings[caseId]) {
      this.data.official_trackings[caseId] = { id_tracking: Date.now(), case_id: caseId };
    }
    this.data.official_trackings[caseId].srikandi_ref_no = srikandiRefNo;
    this.data.official_trackings[caseId].external_status = 'Menunggu TTE Direktur di SRIKANDI';
    this.data.official_trackings[caseId].updated_at = app.updated_at;

    this.addAuditLog(actor.full_name, `Pengajuan Draf Naskah Dinas ke SRIKANDI (${srikandiRefNo})`, caseId, oldStatus, 'SRIKANDI_PROCESS');
    this.addNotification(
      app.id_user,
      caseId,
      'SRIKANDI_PROCESS',
      'Naskah Dinas Diajukan ke SRIKANDI',
      `Proses registrasi naskah dinas resmi PNJ sedang berjalan di aplikasi SRIKANDI (Ref: ${srikandiRefNo}).`
    );

    this.saveData(this.data);
    return true;
  }

  // SRIKANDI Completion: Input Nomor Surat & Upload TTE
  recordSrikandiSigned(caseId, nomorSurat, tanggalSurat, pejabat, signedFileName) {
    const actor = this.getCurrentUser() || { full_name: 'Operator KUI', id_user: 3 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'SIGNED';
    app.status = 'signed';
    app.statusLabel = 'Dokumen TTE Sah (Siap PINTAS Setneg)';
    app.progress_percentage = 85;
    app.progress = 85;
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (!this.data.official_trackings[caseId]) {
      this.data.official_trackings[caseId] = { id_tracking: Date.now(), case_id: caseId };
    }
    const tracking = this.data.official_trackings[caseId];
    tracking.nomor_surat_resmi = nomorSurat;
    tracking.tanggal_surat = tanggalSurat;
    tracking.pejabat_penandatangan = pejabat;
    tracking.srikandi_signed_doc_path = signedFileName || `Surat_Pengantar_TTE_${caseId}.pdf`;
    tracking.external_status = 'Dokumen TTE Resmi Siap Diajukan ke Kementerian';
    tracking.updated_at = app.updated_at;

    this.addAuditLog(actor.full_name, `Catat Nomor Surat Resmi (${nomorSurat}) & Upload TTE`, caseId, oldStatus, 'SIGNED');
    this.addNotification(
      app.id_user,
      caseId,
      'SIGNED',
      'Surat Pengantar Bertanda Tangan Elektronik Terbit',
      `Surat Tugas / Pengantar Nomor: ${nomorSurat} telah sah bertanda tangan resmi TTE Direktur PNJ.`
    );

    this.saveData(this.data);
    return true;
  }

  // PINTAS / Kemensetneg Tracking: Input Ref ID
  recordPintasSubmitted(caseId, pintasRefId, submitDate) {
    const actor = this.getCurrentUser() || { full_name: 'Siti Rahmawati (KUI)', id_user: 4 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'PINTAS_SUBMITTED';
    app.status = 'pintas_submitted';
    app.statusLabel = 'Sedang Diproses Kementerian (PINTAS/Setneg)';
    app.progress_percentage = 90;
    app.progress = 90;
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (!this.data.official_trackings[caseId]) {
      this.data.official_trackings[caseId] = { id_tracking: Date.now(), case_id: caseId };
    }
    const tracking = this.data.official_trackings[caseId];
    tracking.pintas_ref_id = pintasRefId;
    tracking.pintas_submit_date = submitDate || new Date().toISOString().substring(0, 10);
    tracking.external_status = 'Evaluasi Berkas di Kemendikbudristek & Kemensetneg RI';
    tracking.updated_at = app.updated_at;

    this.addAuditLog(actor.full_name, `Daftarkan ke Portal Kementerian PINTAS (${pintasRefId})`, caseId, oldStatus, 'PINTAS_SUBMITTED');
    this.addNotification(
      app.id_user,
      caseId,
      'PINTAS_SUBMITTED',
      'Berkas Telah Didaftarkan ke Kementerian',
      `Usulan resmi telah diunggah ke portal kementerian (Tiket Ref: ${pintasRefId}). Menunggu penerbitan Surat Persetujuan (SP).`
    );

    this.saveData(this.data);
    return true;
  }

  // Kementerian Clearance: Upload Final SP & Mark APPROVED
  recordKementerianDecision(caseId, isApproved, spDocName = '', reason = '') {
    const actor = this.getCurrentUser() || { full_name: 'Siti Rahmawati (KUI)', id_user: 4 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    const tracking = this.data.official_trackings[caseId] || {};

    if (isApproved) {
      app.current_status = 'APPROVED';
      app.status = 'approved';
      app.statusLabel = 'SP Kemensetneg Terbit Resmi (Disetujui)';
      app.progress_percentage = 95;
      app.progress = 95;
      app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

      tracking.final_sp_doc_path = spDocName || `SP_Kemensetneg_${caseId}.pdf`;
      tracking.external_status = 'Surat Persetujuan (SP) Terbit Sah';
      tracking.passport_exit_permit_status = 'Izin Prinsip Sah';
      tracking.updated_at = app.updated_at;

      this.addAuditLog(actor.full_name, `Pencatatan Keputusan Kementerian: SP Terbit Sah (${tracking.final_sp_doc_path})`, caseId, oldStatus, 'APPROVED');
      this.addNotification(
        app.id_user,
        caseId,
        'SP_APPROVED',
        'Surat Persetujuan (SP) Kemensetneg Resmi Terbit!',
        `Selamat! Izin perjalanan dinas luar negeri Anda telah disetujui pemerintah RI. File SP: ${tracking.final_sp_doc_path}.`
      );
    } else {
      app.current_status = 'REJECTED';
      app.status = 'rejected';
      app.statusLabel = 'Ditolak Kementerian';
      app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

      tracking.rejection_or_revision_reason = reason;
      tracking.external_status = 'Ditolak oleh Kementerian';
      tracking.updated_at = app.updated_at;

      this.addAuditLog(actor.full_name, `Pencatatan Keputusan Kementerian: Ditolak (${reason})`, caseId, oldStatus, 'REJECTED');
      this.addNotification(
        app.id_user,
        caseId,
        'KEMEN_REJECTED',
        'Izin PDLN Ditolak Kementerian',
        `Alasan penolakan dari kementerian: "${reason}".`
      );
    }

    this.saveData(this.data);
    return true;
  }

  // LPJ Submission by Applicant
  submitLpj(caseId, lpjData) {
    const user = this.getCurrentUser() || { full_name: 'Pemohon', id_user: 1 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'LPJ_SUBMITTED';
    app.status = 'lpj_submitted';
    app.statusLabel = 'Laporan LPJ & SPPD Diserahkan';
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    this.data.case_lpj_reports[caseId] = {
      id_lpj: Date.now(),
      case_id: caseId,
      tim_bertugas: lpjData.tim_bertugas || app.applicantName,
      tujuan_kegiatan: lpjData.tujuan_kegiatan || app.nama_kegiatan,
      materi_kegiatan: lpjData.materi_kegiatan || '-',
      tindak_lanjut: lpjData.tindak_lanjut || '-',
      dampak_rekomendasi: lpjData.dampak_rekomendasi || '-',
      total_realisasi_biaya: Number(lpjData.total_realisasi_biaya) || 0,
      file_sp_setneg: (this.data.official_trackings[caseId] && this.data.official_trackings[caseId].final_sp_doc_path) || 'SP_Setneg.pdf',
      file_laporan_kegiatan: lpjData.file_laporan_kegiatan || `Laporan_Kegiatan_${caseId}.pdf`,
      file_sppd: lpjData.file_sppd || `Kuitansi_SPPD_${caseId}.pdf`,
      lpj_status: 'SUBMITTED',
      verified_by: null,
      created_at: app.updated_at
    };

    this.addAuditLog(user.full_name, 'Menyerahkan Laporan Pertanggungjawaban (LPJ) & SPPD', caseId, oldStatus, 'LPJ_SUBMITTED');
    this.addNotification(
      4, // Notif to KUI Admin
      caseId,
      'LPJ_SUBMITTED',
      'Laporan LPJ Masuk untuk Diverifikasi',
      `Pemohon ${app.applicantName} (${caseId}) telah mengunggah laporan LPJ dan kuitansi SPPD.`
    );

    this.saveData(this.data);
    return true;
  }

  // LPJ Verification by KUI & Final Case Closure
  verifyLpjAndClose(caseId) {
    const actor = this.getCurrentUser() || { full_name: 'Siti Rahmawati (KUI)', id_user: 4 };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    const oldStatus = app.current_status;
    app.current_status = 'CLOSED';
    app.status = 'closed';
    app.statusLabel = 'Kasus Selesai (Diarsipkan Permanen)';
    app.progress_percentage = 100;
    app.progress = 100;
    app.updated_at = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (this.data.case_lpj_reports[caseId]) {
      this.data.case_lpj_reports[caseId].lpj_status = 'VERIFIED';
      this.data.case_lpj_reports[caseId].verified_by = actor.id_user;
    }

    this.addAuditLog(actor.full_name, 'Verifikasi LPJ Sah & Menutup Kasus (CLOSED)', caseId, oldStatus, 'CLOSED');
    this.addNotification(
      app.id_user,
      caseId,
      'CASE_CLOSED',
      'Administrasi PDLN Selesai & Ditutup',
      'LPJ Anda telah dinyatakan sah dan lengkap. Seluruh proses administrasi resmi PDLN telah selesai dan diarsipkan permanen.'
    );

    this.saveData(this.data);
    return true;
  }

  // Resubmit perbaikan revisi oleh Pemohon
  resubmitRevision(caseId, docKey, newFileName) {
    const user = this.getCurrentUser() || { full_name: 'Pemohon' };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    if (app.documents && app.documents[docKey]) {
      app.documents[docKey].name = newFileName || app.documents[docKey].name;
      app.documents[docKey].status = 'uploaded';
      app.documents[docKey].review_status = 'PENDING';
      app.documents[docKey].statusLabel = 'Menunggu Verifikasi Ulang';
      app.documents[docKey].uploadedAt = new Date().toISOString().substring(0, 10);
    }

    app.revisionItems = (app.revisionItems || []).filter(i => i !== docKey);
    if (app.revisionItems.length === 0) {
      const oldStatus = app.current_status;
      app.current_status = 'KUI_REVIEW';
      app.status = 'kui_review';
      app.statusLabel = 'Dalam Review Ulang KUI';
      app.revisionNote = '';
      this.addAuditLog(user.full_name, `Resubmit Dokumen Perbaikan: ${docKey} (Semua Revisi Terpenuhi)`, caseId, oldStatus, 'KUI_REVIEW');
    } else {
      this.addAuditLog(user.full_name, `Resubmit Dokumen Perbaikan: ${docKey}`, caseId, app.current_status, app.current_status);
    }

    this.saveData(this.data);
    return true;
  }

  // Internal Confidential Note (KUI only)
  addInternalNote(caseId, noteText) {
    const user = this.getCurrentUser() || { full_name: 'Operator KUI' };
    const app = this.getApplicationById(caseId);
    if (!app) return false;

    if (!app.internalNotes) app.internalNotes = [];
    app.internalNotes.unshift({
      id: 'note-' + Date.now(),
      author: user.full_name,
      text: noteText,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    this.addAuditLog(user.full_name, 'Menambahkan Catatan Rahasia Internal KUI', caseId);
    this.saveData(this.data);
    return true;
  }

  // --- Notification Center ---
  addNotification(recipientId, caseId, type, title, message) {
    const newNotif = {
      id_notification: Date.now(),
      recipient_id: recipientId,
      case_id: caseId,
      notification_type: type,
      title,
      message,
      is_email_sent: true, // Simulation of email dispatching
      is_read: false,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    if (!this.data.notifications) this.data.notifications = [];
    this.data.notifications.unshift(newNotif);
    this.saveData(this.data);
    window.dispatchEvent(new CustomEvent('pndl:notification-added', { detail: newNotif }));
    return newNotif;
  }

  getNotifications(userId = null) {
    if (!this.data.notifications) this.data.notifications = [];
    if (!userId) return this.data.notifications;
    const targetUser = this.data.users[userId];
    const targetId = targetUser ? targetUser.id_user : -1;
    return this.data.notifications.filter(n => n.recipient_id === targetId || n.recipient_id === 0);
  }

  markAllNotificationsRead(userId) {
    const notifs = this.getNotifications(userId);
    notifs.forEach(n => { n.is_read = true; });
    this.saveData(this.data);
    window.dispatchEvent(new CustomEvent('pndl:notification-changed'));
  }

  // --- Audit Trails ---
  addAuditLog(actor, action, caseId = 'GLOBAL', statusBefore = '-', statusAfter = '-', details = '') {
    if (!this.data.audit_trails) this.data.audit_trails = [];
    this.data.audit_trails.unshift({
      id_audit: Date.now(),
      case_id: caseId,
      actor_name: actor,
      action_name: action,
      status_before: statusBefore,
      status_after: statusAfter,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      change_details: details
    });
  }

  getAuditTrails(caseId = null) {
    if (!this.data.audit_trails) this.data.audit_trails = [];
    if (!caseId || caseId === 'all') return this.data.audit_trails;
    return this.data.audit_trails.filter(a => a.case_id.toLowerCase().includes(caseId.toLowerCase()));
  }

  // --- Master Data CRUD ---
  getMasterConfigs(category = 'all') {
    if (!this.data.master_templates_and_configs) this.data.master_templates_and_configs = [];
    if (category === 'all') return this.data.master_templates_and_configs;
    return this.data.master_templates_and_configs.filter(m => m.config_category === category);
  }

  addMasterConfig(category, name, pathOrRules) {
    const actor = this.getCurrentUser() || { full_name: 'KUI Admin', id_user: 4 };
    const newConfig = {
      id_master: Date.now(),
      config_category: category,
      code_or_name: name,
      file_or_link_path: pathOrRules,
      is_active: true,
      updated_by: actor.id_user,
      updated_at: new Date().toISOString().substring(0, 10)
    };
    this.data.master_templates_and_configs.push(newConfig);
    this.addAuditLog(actor.full_name, `Menambahkan Master Data: ${name} (${category})`, 'MASTER');
    this.saveData(this.data);
    return newConfig;
  }

  toggleMasterConfig(id) {
    const actor = this.getCurrentUser() || { full_name: 'KUI Admin' };
    const item = this.data.master_templates_and_configs.find(m => m.id_master === id);
    if (item) {
      item.is_active = !item.is_active;
      item.updated_at = new Date().toISOString().substring(0, 10);
      this.addAuditLog(actor.full_name, `Mengubah Status Master Data: ${item.code_or_name}`, 'MASTER');
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  deleteMasterConfig(id) {
    const actor = this.getCurrentUser() || { full_name: 'KUI Admin' };
    const idx = this.data.master_templates_and_configs.findIndex(m => m.id_master === id);
    if (idx !== -1) {
      const name = this.data.master_templates_and_configs[idx].code_or_name;
      this.data.master_templates_and_configs.splice(idx, 1);
      this.addAuditLog(actor.full_name, `Menghapus Master Data: ${name}`, 'MASTER');
      this.saveData(this.data);
      return true;
    }
    return false;
  }

  // --- Mobility Tracking (Inbound vs Outbound) ---
  getMobilityRecords(filter = {}) {
    if (!this.data.mobilityRecords) this.data.mobilityRecords = [];
    let records = [...this.data.mobilityRecords];

    if (filter.type && filter.type !== 'all') {
      records = records.filter(r => r.type === filter.type);
    }
    if (filter.category && filter.category !== 'all') {
      records = records.filter(r => r.category === filter.category);
    }
    if (filter.department && filter.department !== 'all') {
      records = records.filter(r => r.department.toLowerCase().includes(filter.department.toLowerCase()));
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      records = records.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.leaderName && r.leaderName.toLowerCase().includes(q)) ||
        (r.destinationCountry && r.destinationCountry.toLowerCase().includes(q)) ||
        (r.hostInstitution && r.hostInstitution.toLowerCase().includes(q))
      );
    }

    return records;
  }

  getMobilityStats() {
    if (!this.data.mobilityRecords) this.data.mobilityRecords = [];
    const recs = this.data.mobilityRecords;

    let totalOutbound = 0;
    let totalInbound = 0;
    let mhsOutbound = 0;
    let mhsInbound = 0;
    let dosenOutbound = 0;
    let dosenInbound = 0;

    const countryOutbound = {};
    const countryInbound = {};

    recs.forEach(r => {
      const count = Number(r.participantCount) || 1;
      if (r.type === 'outbound') {
        totalOutbound += count;
        if (r.category === 'mahasiswa') mhsOutbound += count;
        else dosenOutbound += count;

        const c = r.destinationCountry || 'Lainnya';
        countryOutbound[c] = (countryOutbound[c] || 0) + count;
      } else if (r.type === 'inbound') {
        totalInbound += count;
        if (r.category === 'mahasiswa') mhsInbound += count;
        else dosenInbound += count;

        const c = r.destinationCountry || 'Lainnya';
        countryInbound[c] = (countryInbound[c] || 0) + count;
      }
    });

    return {
      totalOutbound,
      totalInbound,
      totalMobility: totalOutbound + totalInbound,
      mhsOutbound,
      mhsInbound,
      dosenOutbound,
      dosenInbound,
      netBalance: totalInbound - totalOutbound,
      countryOutbound,
      countryInbound
    };
  }

  addMobilityRecord(recordData) {
    if (!this.data.mobilityRecords) this.data.mobilityRecords = [];
    const user = this.getCurrentUser() || { full_name: 'KUI Admin' };

    const prefix = recordData.type === 'inbound' ? 'MOB-IN-' : 'MOB-OUT-';
    const countHex = String(this.data.mobilityRecords.length + 1).padStart(3, '0');
    const newId = prefix + countHex;

    const newRecord = {
      id: newId,
      type: recordData.type || 'outbound',
      category: recordData.category || 'mahasiswa',
      title: recordData.title || 'Mobilitas Akademik Internasional PNJ',
      leaderName: recordData.leaderName || user.full_name,
      participantCount: Math.max(1, Number(recordData.participantCount) || 1),
      participants: recordData.participants || [{ name: recordData.leaderName || user.full_name, idNum: '-', role: 'Utama', prodi: '-' }],
      destinationCountry: recordData.destinationCountry || '-',
      destinationCity: recordData.destinationCity || '-',
      hostInstitution: recordData.hostInstitution || '-',
      department: recordData.department || 'Kantor Urusan Internasional',
      startDate: recordData.startDate || new Date().toISOString().substring(0, 10),
      endDate: recordData.endDate || new Date().toISOString().substring(0, 10),
      durationDays: Number(recordData.durationDays) || 1,
      fundingSource: recordData.fundingSource || 'pnj',
      sponsorName: recordData.sponsorName || '',
      notes: recordData.notes || '',
      createdAt: new Date().toISOString().substring(0, 10)
    };

    this.data.mobilityRecords.unshift(newRecord);
    this.addAuditLog(user.full_name, `Mencatat Mobilitas ${newRecord.type.toUpperCase()}`, newId);
    this.saveData(this.data);
    window.dispatchEvent(new CustomEvent('pndl:mobility-changed', { detail: newRecord }));
    return newRecord;
  }

  // --- Public Tracker Data (Aman & Transparan) ---
  getPublicTrackerData(searchQuery = '') {
    const apps = this.data.pdln_cases || [];
    const q = searchQuery.trim().toLowerCase();

    return apps.map(app => {
      const words = (app.applicantName || 'Pemohon').split(' ');
      const initials = words.length > 1 
        ? words[0] + ' ' + words.slice(1).map(w => w[0] + '.').join(' ') 
        : words[0];

      return {
        id: app.case_id || app.id,
        applicantDisplay: initials,
        applicantRole: app.applicantRole || 'Civitas PNJ',
        applicantProdi: app.applicantProdi || 'Politeknik Negeri Jakarta',
        destinationCountry: app.destinationCountry || app.negara_tujuan || '-',
        destinationCity: app.destinationCity || app.kota_tujuan || '-',
        hostInstitution: app.hostInstitution || app.institusi_tujuan || '-',
        purposeLabel: app.purposeLabel || 'Kegiatan Akademik',
        startDate: app.startDate || app.tanggal_mulai,
        endDate: app.endDate || app.tanggal_selesai,
        durationDays: app.durationDays,
        current_status: app.current_status,
        statusLabel: app.statusLabel,
        progress: app.progress_percentage || app.progress || 50,
        urgency_level: app.urgency_level || 'NORMAL',
        submittedAt: app.submittedAt || app.created_at,
        lastUpdated: app.lastUpdated || app.updated_at
      };
    }).filter(item => {
      if (!q) return true;
      return item.id.toLowerCase().includes(q) ||
             item.destinationCountry.toLowerCase().includes(q) ||
             item.hostInstitution.toLowerCase().includes(q) ||
             item.applicantProdi.toLowerCase().includes(q) ||
             item.applicantDisplay.toLowerCase().includes(q);
    });
  }

  // --- Admin Statistics & Analytics ---
  getAdminStats() {
    const apps = this.data.pdln_cases;
    const total = apps.length;
    const totalDosen = apps.filter(a => a.applicantRole === 'Dosen').length;
    const totalMhs = apps.filter(a => a.applicantRole === 'Mahasiswa').length;
    
    // Status filters
    const pendingReview = apps.filter(a => a.current_status === 'KUI_REVIEW' || a.current_status === 'SUBMITTED').length;
    const revisionReq = apps.filter(a => a.current_status === 'REVISION').length;
    const pimpinanReview = apps.filter(a => a.current_status === 'PIMPINAN_REVIEW').length;
    const srikandiProcess = apps.filter(a => a.current_status === 'SRIKANDI_PROCESS').length;
    const readySetneg = apps.filter(a => a.current_status === 'SIGNED' || a.current_status === 'READY_FOR_OFFICIAL_PDLN').length;
    const pintasSubmitted = apps.filter(a => a.current_status === 'PINTAS_SUBMITTED').length;
    const approved = apps.filter(a => a.current_status === 'APPROVED').length;
    const closed = apps.filter(a => a.current_status === 'CLOSED').length;
    const rejected = apps.filter(a => a.current_status === 'REJECTED').length;

    // Upcoming departures
    const upcoming = apps.map(a => {
      const calc = this.calculateUrgency(a.startDate || a.tanggal_mulai);
      return {
        ...a,
        daysLeft: calc.daysLeft,
        urgencyLabel: calc.label,
        urgencyLevel: calc.level
      };
    }).sort((x, y) => x.daysLeft - y.daysLeft);

    // Distribution by Country
    const countryDist = {};
    apps.forEach(a => {
      const c = a.destinationCountry || a.negara_tujuan || 'Lainnya';
      countryDist[c] = (countryDist[c] || 0) + 1;
    });

    // Distribution by Funding
    const fundingDist = {
      'DIPA PNJ': apps.filter(a => a.funding_scheme === 'DIPA PNJ').length,
      'Sponsor Eksternal': apps.filter(a => a.funding_scheme === 'Sponsor Eksternal').length,
      'Biaya Pribadi': apps.filter(a => a.funding_scheme === 'Biaya Pribadi' || a.fundingSource === 'pribadi').length,
      'Kerjasama Mitra': apps.filter(a => a.funding_scheme === 'Kerjasama Mitra').length
    };

    return {
      total,
      totalDosen,
      totalMhs,
      pendingReview,
      revisionReq,
      pimpinanReview,
      srikandiProcess,
      readySetneg,
      pintasSubmitted,
      approved,
      closed,
      rejected,
      upcoming,
      countryDist,
      fundingDist,
      mobility: this.getMobilityStats()
    };
  }

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
    this.saveData(this.data);
    window.location.reload();
  }
}

window.pndlStore = new Store();
