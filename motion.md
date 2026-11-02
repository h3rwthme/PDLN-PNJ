# SPESIFIKASI MOTION DESIGN (UI/UX) — SISTEM INTERNAL PDLN PNJ
## Standar Desain Minimalis & Mobile-First (Terinspirasi KAI Access)

Dokumen ini mendefinisikan standar arsitektur gerak (*motion design system*) terbaru untuk **Sistem Internal PDLN Politeknik Negeri Jakarta (PNJ)**. Mengacu pada kebutuhan antarmuka yang bersih, minimalis, dan nyaman digunakan baik di desktop maupun perangkat seluler.

---

## 1. Filosofi Gerak: Quiet, Snappy, & Tactile

1. **Quiet (Tenang & Tidak Mengganggu)**:
   - Tidak ada animasi kartun atau efek visual yang berlebihan.
   - Gerak hanya digunakan untuk memperjelas konteks perpindahan layar dan status proses.
2. **Snappy & Taktil (120ms – 220ms)**:
   - Respons instan saat tombol, kartu rute, atau chip ditekan (`transform: scale(0.97)`).
   - Memberi sensasi kepastian klik seperti pada aplikasi mobile perbankan dan reservasi tiket (KAI Access).
3. **Mobile-First Bottom Sheet**:
   - Seluruh modal dan pemilih opsi (misal: pemilihan negara & lembaga mitra) otomatis berubah menjadi *Bottom Sheet* di layar seluler (< 768px) yang meluncur mulus dari bawah layar menggunakan kurva *spring*.

---

## 2. Token Waktu & Kurva Easing (CSS Variables)

Definisi token terpusat pada file [`css/motion.css`](file:///Users/h3rwthme/Documents/PDLN/css/motion.css):

```css
:root {
  --motion-fast:   120ms; /* Hover, press feedback, badge pop */
  --motion-normal: 220ms; /* Sheet slide, accordion expand, toast */
  --motion-slow:   320ms; /* Page transition, modal scale */

  /* Kurva Easing */
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1); /* Lembut dan berbobot */
  --ease-out:    cubic-bezier(0.2, 0.9, 0.3, 1); /* Standar UI keluar */
  --ease-in:     cubic-bezier(0.4, 0, 1, 1);     /* Dismiss toast/sheet */
}
```

---

## 3. Pola Interaksi Komponen

### A. Kartu Rute Perjalanan (KAI Access Style)
- **Kotak Lokasi (Asal & Tujuan)**: Memiliki transisi border 120ms saat disentuh, membuka *sheet* pemilihan mitra tujuan.
- **Tombol Tukar Rute (*Swap Button*)**: Memberi sensasi putar mikro dan feedback taktil saat ditekan.
- **Durasi Hari Dinas**: Penghitung hari (`14 Hari Dinas`) terupdate secara otomatis dan lancar saat tanggal berangkat/pulang diubah.

### B. Tiket Dossier & Status Tracker
- **Boarding Pass Dossier**: Kartu tiket memiliki garis putus-putus (*perforated tear line*) yang memisahkan data rute dengan status verifikasi.
- **Lacak Alur Status (4 Langkah)**:
  1. *Diajukan* ➔ 2. *Verifikasi KUI* ➔ 3. *Persetujuan PNJ* ➔ 4. *SP Kemensetneg*.
  - Langkah aktif ditandai lingkaran biru berbayang halus (`box-shadow: 0 0 0 4px var(--brand-subtle)`).
  - Langkah selesai ditandai ikon centang SVG presisi.

### C. Mobile Bottom Sheet (*Modal Drawer*)
- Pada layar `<= 768px`:
  - Latar belakang meredup lembut (`fadeIn var(--motion-fast)`).
  - Lembar drawer meluncur dari bawah layar (`transform: translateY(100%)` ke `0`) dengan kurva `--ease-spring`.
  - Dilengkapi *drag handle indicator* di bagian atas.

### D. Notifikasi Toast Mengambang
- Meluncur dari kanan atas layar (`translateX(100%)` ke `0`).
- Menghilang otomatis setelah 3.2 detik dengan efek *slide out* 220ms.

---

## 4. Aksesibilitas (`prefers-reduced-motion`)

Semua animasi transform otomatis dinonaktifkan jika perangkat pengguna mengaktifkan mode pengurangan gerak:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
