# ARSITEKTUR SISTEM INTERNAL PDLN PNJ
## Tahap 1 (Frontend HTML/CSS/JS) & Roadmap Tahap 2 (PHP Native)

---

## 1. Ringkasan Sistem

Sistem Internal PDLN PNJ adalah aplikasi administrasi pra-pengajuan (*pre-submission*) dan verifikasi dokumen Perjalanan Dinas Luar Negeri untuk civitas akademika **Politeknik Negeri Jakarta (PNJ)**.

Sistem ini berdiri di depan proses resmi Kemensetneg/Kemlu/Kemdikbudristek, bertindak sebagai filter kelayakan internal institusi agar tidak terjadi penolakan atau kesalahan berkas di tingkat kementerian.

---

## 2. Model Hak Akses (Role-Based Access Control)

| Peran (Role) | Hak Akses Utama | Batasan Ketat |
| :--- | :--- | :--- |
| **Mahasiswa** | Mengisi profil, mengajukan PDLN, unggah dokumen, respon revisi, melihat status diri sendiri | Tidak bisa melihat data pemohon lain, tidak bisa melihat catatan internal KUI, tidak ada akses ke dokumen SP |
| **Dosen** | Mengisi profil, mengajukan PDLN kedinasan/riset/konferensi, unggah dokumen, respon revisi | Tidak bisa melihat pengajuan orang lain, tidak bisa melihat catatan internal KUI |
| **KUI / Admin** | Tinjau seluruh pengajuan, verifikasi dokumen per item, minta revisi spesifik, beri catatan rahasia internal, ekspor data siap PDLN resmi | Operator utama internal, semua tindakan tercatat dalam audit trail |
| **Super Admin** | Konfigurasi sistem, manajemen master data (negara, prodi, mitra), audit log lengkap | Akses administratif terisolasi |

---

## 3. Model Data & Skema Entitas (Database Ready)

Untuk persiapan Tahap 2 (MySQL), skema dinormalisasi sebagai berikut:

```
users
├── id (INT PK AUTO_INCREMENT)
├── username (VARCHAR 50 UNIQUE)
├── email (VARCHAR 100 UNIQUE)
├── password_hash (VARCHAR 255)
├── role ('mahasiswa', 'dosen', 'kui_admin', 'super_admin')
└── created_at, updated_at

profiles
├── id (INT PK)
├── user_id (INT FK -> users.id)
├── nomor_induk (VARCHAR 30) -- NIM / NIP
├── nama_lengkap (VARCHAR 150)
├── jurusan (VARCHAR 100)
├── program_studi (VARCHAR 100)
├── no_hp (VARCHAR 25)
├── no_paspor (VARCHAR 30 NULL)
├── tgl_habis_paspor (DATE NULL)
├── kontak_darurat_nama (VARCHAR 100)
├── kontak_darurat_hp (VARCHAR 25)
└── is_verified_by_kui (BOOLEAN DEFAULT FALSE)

applications
├── id (VARCHAR 36 PK) -- e.g. PDLN-2026-09-001
├── user_id (INT FK -> users.id)
├── jenis_kegiatan ('student_exchange', 'conference', 'research', 'training', 'other')
├── negara_tujuan (VARCHAR 100)
├── kota_tujuan (VARCHAR 100)
├── instansi_tujuan (VARCHAR 150)
├── tgl_berangkat (DATE)
├── tgl_kembali (DATE)
├── sumber_pendanaan ('pribadi', 'pnj', 'sponsor_eksternal', 'kerjasama')
├── nama_sponsor (VARCHAR 150 NULL)
├── is_kerjasama (BOOLEAN DEFAULT FALSE)
├── nama_program_mitra (VARCHAR 150 NULL)
├── status ('draft', 'submitted', 'kui_review', 'revision_required', 'verified', 'ready_for_official_pdln', 'rejected')
├── progress_percent (INT DEFAULT 0)
└── created_at, updated_at

application_documents
├── id (INT PK)
├── application_id (VARCHAR 36 FK)
├── jenis_dokumen ('paspor', 'surat_undangan', 'sptjm', 'bukti_pendanaan', 'persetujuan_jurusan')
├── file_name (VARCHAR 255)
├── file_path (VARCHAR 255) -- Path aman di luar web root!
├── file_size (INT)
├── status ('uploaded', 'verified', 'revision_required')
├── rejection_reason (TEXT NULL)
└── verified_at, verified_by

internal_notes (STRICTLY KUI ONLY)
├── id (INT PK)
├── application_id (VARCHAR 36 FK)
├── admin_user_id (INT FK)
├── note_text (TEXT)
└── created_at

messages (APPLICANT <-> KUI)
├── id (INT PK)
├── application_id (VARCHAR 36 FK)
├── sender_user_id (INT FK)
├── message_type ('user_message', 'kui_message', 'system_event')
├── message_text (TEXT)
└── created_at

audit_logs
├── id (INT PK)
├── actor_user_id (INT)
├── action (VARCHAR 50)
├── target_type (VARCHAR 50)
├── target_id (VARCHAR 50)
├── old_value (JSON NULL)
├── new_value (JSON NULL)
└── created_at
```

---

## 4. Keamanan & Kerahasiaan Dokumen

1. **Catatan Internal KUI Terpisah Total**:
   Tabel `internal_notes` tidak pernah di-*join* atau diekspos ke API/kueri yang dapat diakses oleh peran `mahasiswa` atau `dosen`.
2. **Penyimpanan Dokumen Non-Publik**:
   File unggahan (paspor, undangan, SP) tidak ditaruh di folder publik (`/public/uploads/` dilarang). Di Tahap 2, file diakses melalui script controller `download.php?doc_id=...` yang memverifikasi kepemilikan sesi sebelum melakukan `fpassthru()`.
3. **Pemberian ID Aplikasi Non-Tebak**:
   Menggunakan prefix institusi terformat: `PDLN-PNJ-{TAHUN}-{BULAN}-{KODE_UNIK}`.

---

## 5. Roadmap Transisi ke PHP Native (Tahap 2)

| Komponen Tahap 1 (HTML/CSS/JS) | Pemetaan di Tahap 2 (PHP Native) |
| :--- | :--- |
| `index.html` (Single Page Router) | Arsitektur MVC sederhana (`index.php` routing ke `controllers/`) atau skrip per modul (`dashboard.php`, `apply.php`, `kui/review.php`) |
| `js/store.js` (`localStorage`) | Database MySQL dengan PDO Prepared Statements (`db.php` singleton) |
| Role Switcher Mock | PHP Native Session (`$_SESSION['user_id']`, `$_SESSION['role']`) |
| Upload Simulator | Handler `move_uploaded_file()` ke direktori aman terenkripsi/terisolasi |
| `css/main.css` & `css/motion.css` | Dipakai langsung 100% tanpa perubahan |
| `js/applicant.js` & `js/kui.js` | Digunakan sebagai client-side enhancer (AJAX/Fetch ke endpoint API PHP) |
