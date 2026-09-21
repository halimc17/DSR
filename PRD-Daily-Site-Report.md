# PRD — Daily Site Report (DSR)
### Proyek Renovasi Ruang Hemodialisa, RS Pertamina Prabumulih

| | |
|---|---|
| **Dokumen** | Product Requirements Document v1.2 |
| **Pemilik Produk** | Kingking Firdaus ST — Direktur, PT Mitra Bangun Mahakarya |
| **Tanggal** | 21 September 2026 |
| **Status** | Siap dieksekusi — pertanyaan terbuka sudah terjawab |

---

## 1. Konteks Proyek

Aplikasi ini dibangun untuk mendukung satu proyek nyata terlebih dahulu, lalu digeneralisasi.

| Aspek | Detail |
|---|---|
| Pekerjaan | Renovasi Ruang Hemodialisa |
| Lokasi | RS Umum Pertamina Prabumulih, Jl. Kesehatan No. 100, Komperta Prabumulih, Kel. Muntang Tapus, Kec. Prabumulih Barat, Sumatera Selatan 31122 |
| Pemberi Kerja | PT Abadinusa Usahasemesta ("AbadiNusa") |
| Pelaksana | PT Mitra Bangun Mahakarya ("Vendor") |
| Nilai Kontrak | Rp 712.063.413 (belum termasuk PPh) |
| Jangka Waktu | 60 hari kerja — 14 September s/d 13 November 2026 |
| Denda Keterlambatan | 0,1% per hari, maksimum 10% dari nilai kontrak |
| Termin | 30% setelah SPK → 40% → 25% setelah BAST → retensi 5% |
| Baseline Jadwal | Time Schedule 9 periode mingguan, 15 Sep – 15 Nov 2026 (Kurva S rencana tersedia) |

**Kewajiban kontraktual yang menjadi dasar aplikasi ini:**

- **Pasal 8** — pengawasan dilakukan **setiap hari** dan **wajib menyertakan foto atau video** terhadap pekerjaan yang dilakukan; laporan perkembangan disampaikan secara berkala kepada AbadiNusa melalui media komunikasi yang disepakati.
- **Pasal 5** — hasil pekerjaan diperiksa ulang oleh AbadiNusa berdasarkan berita acara/laporan kemajuan, disaksikan wakil Rumah Sakit; item yang tidak sesuai harus diperbaiki sesuai jadwal.
- **Pasal 7** — kekeliruan perhitungan progres klaim menyebabkan pembayaran **ditunda** sampai dokumen pendukung lengkap dan benar.
- **Pasal 9** — keterlambatan penyelesaian memicu denda; perpanjangan waktu hanya disetujui bila **dibuktikan dengan data penunjang**.

> **Intinya:** DSR bukan sekadar aplikasi absensi lapangan. Ia adalah **mesin pembuktian** — sumber data tunggal untuk klaim termin, pembelaan atas denda keterlambatan, dan berita acara serah terima.

---

## 2. Masalah yang Diselesaikan

Kondisi saat ini (asumsi baseline, mohon dikoreksi bila berbeda):

1. **Laporan tersebar di WhatsApp.** Foto progres bercampur percakapan, tidak bisa dicari, terkompresi, dan metadata (tanggal/lokasi) hilang.
2. **Progres tidak terhubung ke RAB.** Tim lapangan melapor naratif ("pasang keramik lantai 2 ruang"), sementara klaim termin harus dalam satuan volume RAB (m², m', unit, Ls). Konversi dilakukan manual di akhir bulan, rawan salah, dan memicu penolakan klaim sesuai Pasal 7.
3. **Kendala/keterlambatan tidak terdokumentasi saat terjadi.** Saat mengajukan perpanjangan waktu, bukti hujan, keterlambatan material, atau instruksi tambahan dari RS tidak tersedia dalam bentuk yang bisa dipakai.
4. **Site di Prabumulih, manajemen di Jakarta.** Tidak ada visibilitas harian tanpa menelepon.
5. **Sinyal internet di area rumah sakit tidak selalu stabil**, sehingga aplikasi yang wajib online akan ditinggalkan oleh tim lapangan.

---

## 3. Tujuan & Metrik Sukses

| Tujuan | Metrik | Target |
|---|---|---|
| Kepatuhan pelaporan harian (Pasal 8) | % hari kerja dengan DSR tersubmit sebelum pukul 20.00 WIB | ≥ 95% |
| Klaim termin diterima tanpa revisi | Jumlah klaim yang dikembalikan AbadiNusa untuk dikoreksi | 0 |
| Kecepatan pembuatan laporan | Waktu isi DSR oleh pengawas lapangan | < 10 menit/hari |
| Bukti visual lengkap | Rata-rata foto per DSR | ≥ 6 foto |
| Deteksi dini keterlambatan | Selisih deviasi rencana vs realisasi diketahui | mingguan, bukan di akhir proyek |

**Non-tujuan (v1):** bukan aplikasi akuntansi, bukan payroll, bukan manajemen inventori gudang penuh, bukan BIM/gambar kerja.

---

## 4. Pengguna & Peran

| Peran | Siapa | Kebutuhan utama | Hak akses |
|---|---|---|---|
| **Pengawas Lapangan / Site Manager** | 2 orang di Prabumulih, keduanya Android | Isi DSR cepat dari HP, sering tanpa sinyal | Buat & edit DSR miliknya (sebelum di-approve), upload foto, catat kendala |
| **Mandor / Kepala Tukang** | Per paket pekerjaan | Lapor volume terpasang per item RAB | Input progres item yang ditugaskan |
| **Project Manager / Direktur (Firdaus)** | Jakarta | Lihat ringkasan, approve DSR, tarik rekap klaim termin | Semua akses + approve + export |
| **Admin/Keuangan** | Kantor Jakarta | Susun berkas klaim progres & lampiran | Lihat & export, tidak input |
| **Pemberi Kerja (AbadiNusa)** — *fase 2* | Julius Sudrajat cs. | Lihat progres read-only tanpa perlu akun rumit | Link share read-only per periode |

---

## 5. Konsep Inti: Struktur Data Pekerjaan (WBS dari RAB)

Seluruh aplikasi berputar di sekitar **item RAB sebagai unit progres**. RAB proyek ini sudah berjenjang dan langsung dipakai sebagai WBS:

```
A. CIVIL WORK — Rp 474.490.827,89
   A.1  Pekerjaan Persiapan                     Rp  21.703.572,99   (5 item)
   A.2  Pekerjaan Pondasi                       Rp  14.664.867,50   (4 item)
   A.3  Pekerjaan Beton Bertulang               Rp  49.976.129,22   (4 item)
   A.4  Pekerjaan Dinding, Pintu dan Jendela    Rp 179.408.982,58  (10 item)
   A.5  Pekerjaan Lantai                        Rp  75.939.476,39   (4 item)
   A.7  Pekerjaan Plafon                        Rp  83.740.703,28   (3 item)
   A.8  Pekerjaan Pengecatan                    Rp  49.057.095,92   (3 item)

B. MEP WORK — Rp 233.372.585,11
   B.1  Pekerjaan Elektrikal-Elektronik         Rp  93.299.811,50  (18 item)
   B.2  Pekerjaan Plumbing                      Rp  36.275.295,21   (9 item)
   B.3  Interior & Furnishing (gorden, nurse
        station, signage)                       Rp 103.797.478,40   (4 item)

C. PEKERJAAN AKHIR (dokumentasi, pembersihan)   Rp   4.200.000,00   (2 item)
                                          ──────────────────────
                            GRAND TOTAL   Rp 712.063.413,00
```

Setiap item RAB menyimpan: kode, uraian, volume kontrak, satuan, harga satuan upah, harga satuan bahan, total harga, dan **bobot (%) terhadap grand total**. Bobot inilah yang membuat progres fisik bisa dihitung otomatis:

> **Progres Proyek (%) = Σ (volume terpasang kumulatif ÷ volume kontrak × bobot item)**

Contoh: item A.5.4 (Pasang Lantai Granit Halus 60×60, volume 323,44 m², nilai Rp 66.037.174,85) memiliki bobot 9,27% dari proyek. Bila hari ini terpasang 40 m², progres proyek bertambah 40/323,44 × 9,27% = **1,15%**. Angka inilah yang dipakai untuk klaim termin, bukan estimasi kira-kira.

---

## 6. Baseline Jadwal (Kurva S Rencana)

Time Schedule proyek membagi pekerjaan ke dalam **9 periode mingguan**. Inilah baseline yang dipakai aplikasi — tidak perlu lagi menyusun rencana dari nol.

| Minggu | Periode | Bobot Rencana (%) | Kumulatif (%) | Nilai Kumulatif (Rp) |
|---|---|---|---|---|
| 1 | 15–20 Sep | 0,87 | 0,87 | 6.212.000 |
| 2 | 21–27 Sep | 2,19 | 3,07 | 21.828.000 |
| 3 | 28 Sep – 4 Okt | 8,22 | 11,28 | 80.325.000 |
| 4 | 5–11 Okt | 4,98 | 16,26 | 115.804.000 |
| 5 | 12–18 Okt | 6,85 | 23,11 | 164.586.000 |
| 6 | 19–25 Okt | 20,96 | 44,07 | 313.796.000 |
| 7 | 26 Okt – 1 Nov | 30,30 | 74,36 | 529.501.000 |
| 8 | 2–8 Nov | 14,02 | 88,39 | 629.394.000 |
| 9 | 9–15 Nov | 11,61 | 100,00 | 712.063.413 |

Distribusi per item juga sudah tersedia (mis. A.5.4 Lantai Granit Halus dipecah rata ke minggu 8 dan 9; A.4.1 Dinding Bata ke minggu 3, 4, 5). Aplikasi mengimpor pecahan mingguan ini sebagai `RabPlan`.

### 6.1 Status aktual per 21 September 2026

Pekerjaan fisik baru dimulai **Senin, 21 September** dengan tahap bongkaran. Minggu 1 baseline (15–20 Sep, bobot 0,87%) berlalu tanpa produksi, sehingga proyek memulai minggu ke-2 dengan deviasi **−0,87%** atau setara **6 hari kerja** dari jatah 60 hari kerja. Konsekuensinya terhadap prioritas rilis dibahas di Section 14.3.

### 6.2 Karakter jadwal yang harus tercermin di aplikasi

**Jadwal ini sangat back-loaded.** Sampai akhir minggu 6 (25 Okt) rencana baru 44%; sisa 56% dikerjakan dalam 3 minggu terakhir, dengan **minggu 7 sendiri memikul 30,3%** — beban tertinggi sepanjang proyek. Implikasi ke produk:

- Dashboard tidak boleh hanya menampilkan "on track / behind" terhadap kumulatif. Di minggu 1–5, deviasi kecil terlihat aman padahal justru di situlah pekerjaan penyiapan (bongkaran, pondasi, dinding) harus tuntas agar minggu 6–7 bisa dieksekusi.
- Perlu indikator **kesiapan predecessor**: sebelum minggu 7 dimulai, sistem menandai item minggu 1–6 yang belum 100%.
- Simulasi denda harus memakai proyeksi berbasis produktivitas aktual, bukan ekstrapolasi linear dari kumulatif.

### 6.3 Dua temuan yang perlu dikonfirmasi sebelum data dikunci

Saat membandingkan Time Schedule dengan RAB penawaran, ada dua ketidakcocokan:

**a) Bobot per kelompok tidak sama dengan proporsi nilai RAB**

| Kelompok | Bobot dari RAB | Bobot di Time Schedule | Selisih |
|---|---|---|---|
| A.1 Persiapan | 3,05% | 2,32% | −0,73 |
| A.4 Dinding/Pintu/Jendela | 25,20% | 22,45% | −2,75 |
| **B.1 Elektrikal-Elektronik** | **13,10%** | **20,36%** | **+7,26** |
| **B.3 Interior & Lain-lain** | **14,58%** | **9,13%** | **−5,44** |
| Lainnya | — | — | selisih < 1 |

Penyebabnya terlihat pada dua baris: **B.1.13 Instalasi Nurse Call** bernilai Rp 3.080.000 di RAB (0,43%) tetapi diberi bobot 6,93% di jadwal, sementara **B.3.3 Fabrikasi Meja Nurse Station** bernilai Rp 48.720.000 (6,84%) tetapi hanya diberi bobot 1,83%. Angkanya tampak tertukar.

**b) Uraian pekerjaan B.3.3 dan B.3.4 di Time Schedule salah salin** — tertulis "Pasang Jalur Pipa Air Limbah Closet" dan "Pasang Wastafel Keramik", padahal di RAB kedua item itu adalah fabrikasi Meja Nurse Station/Lemari Arsip dan interior pintu masuk + signage akrilik.

**Keputusan produk yang diambil:** **RAB kontrak adalah satu-satunya sumber kebenaran untuk bobot dan nilai**, karena RAB-lah yang dilampirkan dan menjadi bagian tak terpisahkan dari Perjanjian (Pasal 2 & 6). Time Schedule dipakai hanya untuk **distribusi waktu** (item mana dikerjakan minggu ke berapa, dengan porsi berapa). Aplikasi akan menghitung ulang bobot dari RAB lalu menempelkannya ke pola distribusi mingguan tersebut, sehingga kurva rencana tetap berbentuk sama tetapi nilainya konsisten dengan klaim termin.

**c) Tanggal jadwal melewati masa kontrak** — kontrak berakhir 13 November 2026, sedangkan periode terakhir Time Schedule adalah 9–15 November. Artinya baseline yang ada sudah menjadwalkan ~2 hari di luar masa kontrak. Aplikasi akan menampilkan **13 November sebagai garis batas denda** pada Kurva S, terpisah dari akhir baseline, agar selisih ini terlihat sejak hari pertama.

---

## 7. Ruang Lingkup MVP

### 7.1 Modul A — Setup Proyek, RAB & Baseline
- Import RAB dari Excel/CSV (kolom: kode, uraian, volume, satuan, harga satuan upah, harga satuan bahan, total). Bobot per item dihitung otomatis dari total harga ÷ nilai kontrak.
- Import Time Schedule: membaca kolom mingguan dan menyimpan **porsi rencana per item per periode** (mis. item dikerjakan 3 minggu → 33,3% per minggu).
- **Laporan rekonsiliasi saat import** — wajib ada. Sistem membandingkan bobot di Time Schedule dengan bobot hasil hitung RAB, lalu menampilkan daftar item dengan selisih > 0,5 poin persen untuk ditinjau. Import tidak bisa dikunci sebelum selisih ditandai "sudah diperiksa". Fitur ini lahir langsung dari temuan B.1.13 / B.3.3 di atas; tanpa pemeriksaan ini, bobot yang salah akan diam-diam merusak seluruh perhitungan klaim.
- Kalender proyek: mulai 14 Sep 2026, batas kontrak 13 Nov 2026, 60 hari kerja, daftar hari libur nasional, serta definisi 9 periode mingguan sesuai Time Schedule.
- Kurva S rencana dihasilkan otomatis — tidak ada input manual baseline.

### 7.2 Modul B — Input Daily Site Report *(jantung aplikasi)*

Satu DSR = satu proyek × satu tanggal. Form dibagi menjadi bagian yang bisa diisi berurutan dan disimpan sebagai draft:

**B.1 Kondisi Harian**
- Tanggal (default hari ini), hari kerja ke-N dari 60.
- Cuaca: pagi / siang / sore → Cerah, Berawan, Hujan Ringan, Hujan Deras.
- Jam kerja efektif, serta **jam berhenti kerja akibat cuaca** (field ini penting: jadi bukti force majeure/perpanjangan waktu).

**B.2 Tenaga Kerja**
- Jumlah per kategori: mandor, tukang batu, tukang kayu, tukang besi, tukang listrik, tukang plumbing, pekerja/helper, operator, lainnya.
- Total headcount otomatis. Opsional: nama-nama untuk kebutuhan safety induction rumah sakit.

**B.3 Progres Pekerjaan (terhubung RAB)**
- Pilih item RAB (pencarian cepat berdasar kode/uraian, difilter ke item yang sedang aktif).
- Input **volume dikerjakan hari ini** dalam satuan item tersebut.
- Sistem menampilkan real-time: volume kumulatif, sisa volume, % item, kontribusi ke progres proyek.
- **Validasi keras:** volume kumulatif tidak boleh melebihi volume kontrak. Bila melebihi, wajib ditandai sebagai *pekerjaan tambah* dan masuk ke log Variation Order (tidak otomatis menambah nilai klaim).
- Catatan lokasi pengerjaan (mis. "Ruang HD Isolasi", "Koridor depan Nurse Station").

**B.4 Material Masuk & Terpakai**
- Nama material, jumlah, satuan, nomor surat jalan, pemasok.
- Foto surat jalan (penting untuk pembuktian material berada di lokasi saat klaim).

**B.5 Peralatan di Lokasi**
- Nama alat, jumlah, status (beroperasi / idle / rusak).

**B.6 Kendala & Permasalahan**
- Kategori: Cuaca, Material Terlambat, Tenaga Kerja Kurang, Instruksi/Perubahan dari RS atau AbadiNusa, Akses Lokasi (rumah sakit tetap beroperasi), Listrik/Air, Lainnya.
- Deskripsi, dampak terhadap jadwal (jam/hari), tindakan yang diambil, status (open/closed), PIC.
- Setiap kendala terbuka muncul di dashboard sampai ditutup.

**B.7 Dokumentasi Foto/Video** *(wajib, Pasal 8)*
- Minimal 1 foto, disarankan ≥ 6.
- Tiap foto: kategori (Progres, Material, K3, Kendala, Before/After), keterangan, dan **dikaitkan ke item RAB** bila relevan.
- **Watermark otomatis** pada foto: tanggal & jam, nama proyek, koordinat GPS. Ini yang membuat foto dapat diterima sebagai lampiran berita acara.
- Kompresi di sisi klien sebelum upload (target ≤ 500 KB/foto) agar hemat kuota dan cepat di sinyal lemah.

**B.8 Rencana Kerja Besok**
- Daftar singkat item yang akan dikerjakan + jumlah tenaga yang dibutuhkan.

**B.9 Catatan K3 (HSE)**
- Insiden/nearmiss (ya/tidak + deskripsi), penggunaan APD, catatan khusus area rumah sakit aktif (debu, kebisingan, jalur pasien).

**B.10 Submit & Approval**
- Draft → Submitted → Approved/Revisi oleh PM.
- Setelah approved, DSR terkunci; perubahan hanya via revisi bernomor dengan jejak audit.

### 7.3 Modul C — Dashboard & Monitoring
- **Kartu ringkas:** minggu ke-N dari 9, progres hari ini (%), kumulatif realisasi (%), kumulatif rencana pada tanggal tersebut (%), **deviasi CEPAT (+) / LAMBAT (−)** mengikuti format baris C pada Time Schedule, sisa hari kerja, proyeksi tanggal selesai.
- **Kurva S:** rencana vs realisasi, dengan penanda vertikal ganda — akhir baseline (15 Nov) dan **batas kontrak (13 Nov)**.
- **Kesiapan periode berikutnya:** daftar item dari minggu-minggu sebelumnya yang belum 100%, khususnya menjelang minggu 7 yang memikul 30,3% bobot. Ditampilkan sebagai peringatan, bukan sekadar angka.
- **Peringatan denda:** bila proyeksi selesai melewati 13 Nov 2026, tampilkan estimasi denda (0,1% × Rp 712.063.413 = **Rp 712.063/hari**, maksimum Rp 71.206.341). Proyeksi dihitung dari produktivitas rata-rata 7 hari terakhir per kelompok pekerjaan, bukan ekstrapolasi linear kumulatif — karena bentuk kurva rencana sangat tidak linear.
- Tabel progres per kelompok pekerjaan (A.1 s/d C), rencana vs realisasi per periode mingguan.
- Daftar kendala terbuka & umur kendala.
- Grafik tenaga kerja harian.
- Galeri foto yang bisa difilter per tanggal / per item RAB.

### 7.4 Modul D — Output & Distribusi
- **DSR PDF harian** berkop PT Mitra Bangun Mahakarya, siap kirim/tanda tangan.
- **Laporan Mingguan** — rekap progres, tenaga kerja, kendala, lampiran foto terpilih.
- **Berkas Klaim Progres (Termin)** — tabel per item RAB: volume kontrak, volume terpasang kumulatif, %, nilai yang diklaim, lengkap dengan lampiran foto pendukung. Ini yang dikirim ke AbadiNusa untuk termin ke-2 (40%) dan ke-3 (25%).
- **Export Excel** rekap volume harian per item.
- **Share link WhatsApp** — ringkasan DSR + tautan halaman publik read-only (token, kedaluwarsa opsional), karena media komunikasi yang disepakati Para Pihak umumnya WhatsApp.

---

## 8. Kebutuhan Non-Fungsional

| Aspek | Ketentuan |
|---|---|
| **Offline-first** | Form DSR dan antrean foto tersimpan lokal (IndexedDB), sinkron otomatis saat online. Ini syarat mutlak — sinyal di area RS tidak stabil. |
| **Mobile-first** | Android-only (Chrome) — dua pengawas di lokasi semuanya memakai Android. Dioptimalkan untuk HP kelas menengah, target kerja dengan satu tangan. Tidak ada dukungan iOS di v1. |
| **Bahasa** | Seluruh antarmuka Bahasa Indonesia, istilah konstruksi lokal (mandor, bowplank, bobokan, opname). |
| **Performa** | Halaman form terbuka < 2 detik pada koneksi 3G. |
| **Penyimpanan foto** | Object storage (Vercel Blob / S3-compatible); foto asli disimpan + thumbnail. Estimasi 60 hari × 8 foto × 500 KB ≈ 240 MB per proyek. |
| **Retensi & audit** | Data tidak boleh dihapus permanen selama masa retensi 5% belum cair; semua perubahan DSR ter-log (siapa, kapan, dari apa ke apa). |
| **Zona waktu** | WIB (UTC+7) untuk seluruh timestamp dan watermark. |
| **Keamanan** | Login email/password + role-based access. Link publik memakai token acak, tanpa indeks mesin pencari. |

---

## 9. Usulan Arsitektur Teknis

Selaras dengan stack yang biasa dipakai:

- **Frontend/Backend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **Auth:** Auth.js (credentials + role)
- **Storage:** Vercel Blob atau S3-compatible
- **Offline:** PWA (installable), service worker, IndexedDB queue via Dexie
- **PDF:** React-PDF atau Puppeteer serverless untuk laporan berkop
- **Deploy:** Vercel

### Sketsa Model Data (Prisma)

```prisma
Project        id, nama, lokasi, client, nilaiKontrak, tanggalMulai,
               tanggalBatasKontrak, tanggalAkhirBaseline, hariKerja,
               dendaPersenPerHari, maksDendaPersen

Period         id, projectId, mingguKe, tanggalMulai, tanggalSelesai,
               bobotRencana, bobotKumulatifRencana     // 9 periode

RabItem        id, projectId, kode, parentKode, uraian, volume, satuan,
               hargaUpah, hargaBahan, totalHarga, bobotPersen, urutan,
               bobotJadwalAsli, selisihBobot, statusRekonsiliasi

RabPlan        id, rabItemId, periodId, porsiRencanaPersen, volumeRencana

DailyReport    id, projectId, tanggal, hariKerjaKe, cuacaPagi, cuacaSiang,
               cuacaSore, jamMulai, jamSelesai, jamTerhentiCuaca,
               status(DRAFT|SUBMITTED|APPROVED|REVISI), dibuatOlehId,
               disetujuiOlehId, disetujuiPada, catatanUmum, rencanaBesok

ProgressEntry  id, dailyReportId, rabItemId, volumeHariIni, lokasiKerja,
               isPekerjaanTambah, catatan

Manpower       id, dailyReportId, kategori, jumlah
Equipment      id, dailyReportId, namaAlat, jumlah, status
MaterialLog    id, dailyReportId, namaMaterial, jumlah, satuan,
               noSuratJalan, pemasok, fotoUrl

Issue          id, dailyReportId, kategori, deskripsi, dampakJam,
               tindakan, status, picId, ditutupPada

Photo          id, dailyReportId, rabItemId?, url, thumbUrl, kategori,
               keterangan, lat, lng, diambilPada

User           id, nama, email, passwordHash, role(FIELD|MANDOR|PM|ADMIN|VIEWER),
               projectAccess[]

AuditLog       id, entity, entityId, aksi, userId, before, after, createdAt
```

---

## 10. Alur Pengguna Utama

**Alur 1 — Pengawas mengisi DSR (target < 10 menit)**
1. Buka PWA di HP → dashboard menampilkan "DSR hari ini belum diisi".
2. Tap "Buat DSR" → cuaca & jam kerja (3 tap).
3. Tenaga kerja: stepper +/- per kategori.
4. Progres: pilih item RAB dari daftar aktif → isi volume → sistem tampilkan dampak ke % proyek.
5. Foto: ambil langsung dari kamera, watermark otomatis, pilih kategori.
6. Kendala (bila ada) → Rencana besok → Submit.
7. Bila offline: tersimpan sebagai draft, badge "menunggu sinkron", terkirim otomatis saat sinyal kembali.

**Alur 2 — PM meninjau & menyetujui**
1. Notifikasi DSR masuk → buka ringkasan.
2. Cek foto vs volume yang diklaim; bila janggal → "Minta Revisi" dengan komentar.
3. Approve → DSR terkunci, masuk ke rekap kumulatif.

**Alur 3 — Menyusun klaim termin**
1. Pilih periode / cut-off tanggal.
2. Sistem menghasilkan tabel opname per item RAB + nilai klaim + lampiran foto.
3. Export PDF + Excel → kirim ke AbadiNusa sebagai dokumen pendukung Pasal 7.

---

## 11. Prioritisasi (MoSCoW)

**Must have (MVP, target siap dipakai secepatnya karena proyek sudah berjalan sejak 14 Sep):**
Import RAB & Time Schedule • Laporan rekonsiliasi bobot • Form DSR (cuaca, tenaga kerja, progres per item RAB, kendala, foto berwatermark) • **Entri backdate** • Offline draft • Approval PM • Dashboard progres & Kurva S (dua basis) • Export PDF DSR harian • Share link read-only.

**Should have:** Laporan mingguan • Berkas klaim termin otomatis • Log material & surat jalan • Peringatan proyeksi denda • Export Excel.

**Could have:** Modul K3 lengkap • Akun read-only untuk AbadiNusa • Notifikasi WhatsApp otomatis • Tanda tangan digital pada DSR • Multi-proyek & template RAB.

**Won't have (v1):** Absensi biometrik/GPS tenaga kerja • Manajemen pembayaran & invoice • Integrasi gambar kerja/BIM • Modul pengadaan • Modul perizinan kerja harian RS • Dukungan iOS • Pemilih proyek & dashboard portofolio.

---

## 12. Rencana Rilis Bertahap

| Fase | Isi | Durasi estimasi |
|---|---|---|
| **Fase 0** | Setup repo, schema Prisma, import RAB proyek ini, seed user | 2–3 hari |
| **Fase 1** | Form DSR + foto + offline draft + submit + **entri backdate** — cukup untuk mulai dipakai lapangan. Prioritas tertinggi: pekerjaan fisik sudah berjalan sejak 21 Sep. | 1–1,5 minggu |
| **Fase 2** | Dashboard, Kurva S, approval, PDF harian | 1 minggu |
| **Fase 3** | Klaim termin, laporan mingguan, share link, export Excel | 1 minggu |
| **Fase 4** | Pemilih proyek, dashboard portofolio, template RAB reusable | setelah Prabumulih selesai |

Entri backdate ditandai khusus (`isBackdated`, diisi pada tanggal berapa) agar jejak auditnya jujur — DSR yang diisi terlambat tetap sah, tetapi harus terlihat bahwa ia diisi terlambat.

---

## 13. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tim lapangan enggan memakai aplikasi, kembali ke WhatsApp | Data kosong, aplikasi mati | Form ≤ 10 menit; tombol share hasil DSR ke grup WA agar aplikasi jadi *sumber* WA, bukan saingannya |
| Volume progres dilaporkan berlebih | Klaim ditolak (Pasal 7), risiko reputasi | Validasi terhadap volume kontrak + wajib foto per item + approval PM |
| Sinyal buruk saat upload foto | Laporan gagal terkirim | Kompresi klien + antrean sinkron + retry otomatis |
| Foto tanpa konteks | Tidak berguna sebagai bukti | Watermark tanggal/GPS wajib + kategori + kaitan ke item RAB |
| Kehilangan HP / ganti personel | Data hilang | Semua data di server; akun berbasis peran, bukan perangkat |
| Bobot Time Schedule berbeda dari RAB, sementara jadwal sudah ditandatangani | Progres dilaporkan beda dengan nilai klaim | Simpan & tampilkan dua basis (Section 14.2) + berita acara klarifikasi sebelum termin ke-2 |
| Keterlambatan start 1 minggu terbawa sampai akhir | Denda ~Rp 712.063/hari | Backdate + catatan alasan periode nol-produksi sejak sekarang, sebagai dasar Pasal 9 |
| Jadwal back-loaded (56% di 3 minggu terakhir) | Keterlambatan kecil di awal menjadi tak terkejar di akhir | Indikator kesiapan predecessor + peringatan mingguan, bukan hanya deviasi kumulatif |
| Baseline berakhir 15 Nov, kontrak 13 Nov | Denda 2 hari sejak awal secara struktural | Garis batas kontrak ditampilkan terpisah di Kurva S sejak hari pertama |
| Aplikasi dianggap alat pengawasan oleh tim | Resistensi | Posisikan sebagai pelindung: bukti kendala = dasar sah perpanjangan waktu, bukan alat cari kesalahan |

---

## 14. Keputusan yang Sudah Ditetapkan

Seluruh pertanyaan terbuka v1.1 sudah dijawab. Berikut keputusan yang mengikat desain.

| No | Jawaban | Konsekuensi terhadap produk |
|---|---|---|
| 1 | 2 pengawas di lokasi, semua **Android** | Target tunggal: PWA Android (Chrome). Tidak ada pekerjaan kompatibilitas iOS/Safari di v1 — ini menghemat porsi besar effort, terutama pada kamera, service worker, dan penyimpanan offline yang di Safari jauh lebih rewel. |
| 2 | AbadiNusa **belum** menetapkan format laporan | MBM yang menentukan format. Lihat 14.1. |
| 3 | Time Schedule **sudah ditandatangani** | Bobot jadwal tidak boleh diubah sepihak. Lihat 14.2. |
| 4 | Pekerjaan **baru dimulai Senin 21 Sep**, tahap bongkaran | Proyek sudah terlambat terhadap baseline sejak hari pertama. Lihat 14.3. |
| 5 | Rumah Sakit **tidak** meminta laporan terpisah | Modul perizinan kerja harian dikeluarkan dari ruang lingkup sepenuhnya. |
| 6 | Akan dipakai untuk **proyek lain** | Multi-proyek disiapkan di lapisan data sejak awal. Lihat 14.4. |

### 14.1 Format laporan ditentukan MBM — dan itu keuntungan

Karena AbadiNusa belum menetapkan format, MBM berada di posisi menetapkan standar terlebih dahulu. Dua konsekuensi praktis:

- Template DSR dan laporan mingguan dirancang **berkop MBM**, memuat kolom yang melindungi posisi vendor: jam terhenti akibat cuaca, instruksi/perubahan dari pihak RS atau AbadiNusa, serta material yang sudah berada di lokasi. Item-item inilah yang nanti menjadi data penunjang bila perlu mengajukan perpanjangan waktu (Pasal 9).
- Disarankan mengirim **satu contoh DSR dan satu contoh laporan mingguan** ke AbadiNusa di awal, minta konfirmasi tertulis bahwa format itu diterima. Setelah disetujui, format tersebut menjadi "media komunikasi yang disepakati Para Pihak" seperti dimaksud Pasal 8, dan tidak bisa dipersoalkan di kemudian hari.

Template harus dapat dikonfigurasi (logo, kop, kolom opsional) karena proyek berikutnya bisa saja punya pemberi kerja dengan format wajib sendiri.

### 14.2 Time Schedule sudah ditandatangani — aplikasi menampilkan dua basis

Karena jadwal sudah resmi, temuan bobot B.1.13 / B.3.3 **tidak boleh** diperbaiki diam-diam di dalam aplikasi. Desainnya menjadi:

- `bobotJadwalAsli` disimpan apa adanya dan **dipakai untuk pelaporan progres fisik** ke AbadiNusa, supaya angka yang dilaporkan cocok dengan dokumen yang sudah mereka tandatangani.
- `bobotPersen` hasil hitung RAB dipakai untuk **nilai klaim termin dalam rupiah**, karena rupiah selalu dihitung dari volume terpasang × harga satuan RAB — bukan dari persentase.
- Dashboard internal menampilkan keduanya berdampingan dengan label jelas: *Progres menurut Time Schedule* dan *Progres menurut nilai RAB*. Selisih di antara keduanya adalah informasi manajerial, bukan error.

Secara paralel, disarankan mengirim **berita acara klarifikasi** ke AbadiNusa atas dua baris tersebut, sebelum klaim termin kedua diajukan. Bila tidak diklarifikasi, saat Nurse Call terpasang, jadwal akan mencatat +6,93% padahal nilainya hanya Rp 3,08 juta — selisih yang cepat atau lambat akan ketahuan dan memicu pemeriksaan ulang klaim (Pasal 7).

### 14.3 Proyek sudah tertinggal 1 minggu — ini mengubah prioritas rilis

Baseline menjadwalkan minggu 1 (15–20 Sep) dengan bobot 0,87%, terdiri dari pembersihan awal, pagar pengaman, dan sebagian bongkaran. Pekerjaan baru dimulai 21 September, sehingga:

- Realisasi kumulatif per 20 Sep = **0%**, rencana 0,87% → deviasi **−0,87%** sejak periode pertama.
- Sekitar **6 hari kerja** dari 60 hari kerja kontrak sudah terpakai tanpa produksi.
- Bila keterlambatan ini terbawa sampai akhir, eksposur denda ≈ Rp 712.063 × jumlah hari keterlambatan. Perlu dicatat: Pasal 9 menyebut "per hari keterlambatan" tanpa menegaskan hari kalender atau hari kerja — perbedaan tafsir ini sebaiknya diklarifikasi tertulis sekarang, bukan saat denda sudah dihitung.

Dampak ke produk:

1. **Fitur entri backdate naik menjadi Must have**, dan harus tersedia di Fase 1. DSR tanggal 21 September harus bisa masuk sistem, begitu juga hari-hari berikutnya bila aplikasi belum siap saat pekerjaan berjalan.
2. Sistem menyediakan **catatan periode nol-produksi**: minggu 1 dicatat sebagai realisasi 0% disertai field alasan. Alasan yang terdokumentasi sejak awal jauh lebih kuat daripada rekonstruksi di bulan November.
3. Dashboard menampilkan deviasi sebagai **hari kerja setara**, bukan hanya persen. "−0,87%" tidak terasa mendesak; "tertinggal 6 hari kerja dari 60" langsung terbaca.
4. Karena aplikasi belum siap sementara proyek berjalan, tim lapangan **tetap harus mendokumentasikan sekarang** — foto bongkaran harian beserta tanggal, minimal lewat WhatsApp. Foto-foto itu diimpor ke sistem begitu Fase 1 rilis. Ini bukan fitur, tapi instruksi operasional yang perlu disampaikan hari ini juga.

### 14.4 Multi-proyek: disiapkan di data, belum di antarmuka

Karena aplikasi akan dipakai proyek MBM berikutnya, seluruh tabel utama sudah membawa `projectId` sejak awal (lihat Section 9) dan tidak boleh ada nilai proyek yang di-hardcode. Namun **antarmuka v1 tetap single-project**: tanpa pemilih proyek, tanpa dashboard portofolio. Menambahkannya nanti hanya berupa pekerjaan UI, sedangkan membongkar skema data yang sudah berisi 60 hari laporan adalah pekerjaan yang jauh lebih mahal.

Yang perlu disiapkan sejak awal:

- Importer RAB dan Time Schedule bersifat generik — kolom dipetakan saat import, bukan diasumsikan.
- Kategori tenaga kerja, kategori kendala, dan kategori foto disimpan sebagai data referensi per proyek, bukan enum keras.
- Kalender proyek (tanggal mulai, batas kontrak, jumlah hari kerja, periode) sepenuhnya per proyek.
- Branding laporan (logo, kop, penanda tangan) per proyek.

Modul pemilih proyek dan dashboard lintas proyek masuk **Fase 4**, dikerjakan setelah proyek Prabumulih selesai dan pola penggunaannya terbukti.

---

## 15. Langkah Berikutnya

1. Sampaikan ke tim lapangan hari ini: dokumentasikan bongkaran dengan foto bertanggal, mulai hari ini.
2. Kirim contoh format DSR ke AbadiNusa untuk dikonfirmasi tertulis.
3. Siapkan berita acara klarifikasi bobot B.1.13 dan B.3.3.
4. Mulai Fase 0: repo, `schema.prisma`, import 64 item RAB dan distribusi mingguannya.
5. Kejar Fase 1 sesegera mungkin — setiap hari tanpa DSR terstruktur adalah hari yang harus direkonstruksi dari ingatan nanti.

---

*Dokumen ini dimaksudkan menjadi `PRD.md` di root repositori, mendampingi `CLAUDE.md`, `PLANNING.md`, `TASKS.md`, dan `prisma/schema.prisma`.*
