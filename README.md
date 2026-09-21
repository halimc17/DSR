# Daily Site Report (DSR) — RS Pertamina Prabumulih

Aplikasi Daily Site Report (DSR) berbasis web & mobile-friendly untuk proyek **Renovasi Ruang Hemodialisa di RS Umum Pertamina Prabumulih**, dikembangkan untuk **PT Mitra Bangun Mahakarya (MBM)** dan **PT Abadinusa Usahasemesta**.

---

## 🏗️ Informasi Proyek

- **Nama Proyek**: Renovasi Ruang Hemodialisa RS Umum Pertamina Prabumulih
- **Lokasi**: Jl. Kesehatan No. 100, Komperta Prabumulih, Sumatera Selatan
- **Klien**: PT Abadinusa Usahasemesta
- **Kontraktor**: PT Mitra Bangun Mahakarya (MBM)
- **Nilai Kontrak**: Rp 712.063.413,-
- **Durasi Kontrak**: 60 Hari Kerja (14 September – 13 November 2026)
- **Periode Baseline**: 9 Minggu (15 September – 15 November 2026)

---

## ✨ Fitur Utama

1. **Executive Dashboard & Dual-Basis S-Curve**:
   - Menampilkan Kurva S dua basis secara simultan: **Basis Time Schedule Asli (%)** untuk pelaporan fisik dan **Basis RAB (%)** untuk dasar penagihan termin.
   - Status deviasi real-time (Cepat/Lambat) dan konversi ekuivalen hari kerja.
   - Kalkulator otomatis eksposur denda keterlambatan (Pasal 9 PKS).
   - Early warning system kesiapan pekerjaan predecessor sebelum lonjakan bobot minggu ke-7 (30,30%).

2. **Mobile-First DSR Wizard (`/dsr/new`)**:
   - Desain satu tangan yang dioptimalkan untuk perangkat layar sentuh smartphone lapangan (Inter font, tap targets $\ge 44$px).
   - Entri laporan harian dan **backdate** dengan validasi otomatis hari kerja ke-N.
   - Stepper headcount 8 kategori tenaga kerja (terkoneksi BPJS TK MBM).
   - Pencatatan progres fisik tertaut ke 65 item RAB resmi dengan kalkulasi instan.
   - Watermark kamera otomatis (WIB, Nama Proyek, GPS, Kode RAB) menggunakan HTML5 Canvas.
   - Log material masuk, nomor surat jalan, status peralatan kerja, dan mitigasi kendala lapangan.
   - Checklist K3 / CSMS Pertamina dan rencana kerja esok hari.

3. **Manajemen Laporan & Ekspor (`/dsr`, `/dsr/[id]`)**:
   - Detail laporan DSR resmi berkop PT Mitra Bangun Mahakarya.
   - Kolom tanda tangan resmi: Pemberi Kerja, Project Manager, dan Pengawas Lapangan.
   - Alur persetujuan Project Manager (Approve / Revisi).
   - Fitur penghapusan laporan DSR dengan konfirmasi aman dan cascade delete.
   - Cetak PDF resmi dan fitur "Share WhatsApp" dengan format ringkasan pesan instan.

4. **Rekonsiliasi RAB & Time Schedule (`/rab`)**:
   - Komparasi 65 item pekerjaan antara bobot jadwal fisik vs bobot nilai kontrak RAB.
   - Penjelasan transparansi perbedaan bobot (mis. Nurse Call & Meja Nurse Station).

5. **Kalkulasi Klaim Termin (`/termin`)**:
   - Kalkulasi kumulatif opname fisik terpasang berbasis harga satuan RAB.
   - Monitoring tahapan termin: DP 30%, Termin 2 (40%), Termin 3 (25%), dan Retensi (5%).

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Server Actions)
- **Language**: TypeScript
- **Database ORM**: Prisma ORM with PostgreSQL
- **Styling**: Tailwind CSS, Font Inter
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment Ready**: Node.js 18+

---

## 🚀 Memulai (Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/halimc17/DSR.git
cd DSR
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `.env.example` menjadi `.env` lalu sesuaikan kredensial database PostgreSQL Anda:
```bash
cp .env.example .env
```

### 4. Setup Database
Jalankan migrasi dan seeding data RAB & jadwal:
```bash
npx prisma db push
node scripts/seed-dsr.mjs
```

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.
Untuk akses dari HP dalam satu jaringan WiFi, buka `http://<IP-KOMPUTER>:3000`.
