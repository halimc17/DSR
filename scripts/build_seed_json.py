import json

# Exact list of 65 items with correct prices, categories, and schedule links
items_data = [
    # A.1. PEKERJAAN PERSIAPAN
    {
        "kode": "A.1.1", "parentKode": "A.1", "kategori": "A. CIVIL WORK", "subKategori": "A.1. PEKERJAAN PERSIAPAN",
        "uraian": "Pek. Pembersihan Awal Lapangan", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 1680000.0, "hargaBahan": 0.0, "totalHarga": 1680000.0,
        "bobotJadwalAsli": 0.1667, "plans": { "1": 0.1667 }
    },
    {
        "kode": "A.1.2", "parentKode": "A.1", "kategori": "A. CIVIL WORK", "subKategori": "A.1. PEKERJAAN PERSIAPAN",
        "uraian": "Pek. Pagar Pengaman Sementara Dari Plastik Hitam", "volume": 54.55, "satuan": "m'",
        "hargaUpah": 4264500.80, "hargaBahan": 3044413.68, "totalHarga": 7308914.48,
        "bobotJadwalAsli": 0.3478, "plans": { "1": 0.1739, "2": 0.1739 }
    },
    {
        "kode": "A.1.3", "parentKode": "A.1", "kategori": "A. CIVIL WORK", "subKategori": "A.1. PEKERJAAN PERSIAPAN",
        "uraian": "Pek. Bongkaran Lantai Keramik dan Keramik Dinding", "volume": 296.39, "satuan": "m²",
        "hargaUpah": 4460271.15, "hargaBahan": 0.0, "totalHarga": 4460271.15,
        "bobotJadwalAsli": 0.6213, "plans": { "1": 0.3106, "2": 0.3106 }
    },
    {
        "kode": "A.1.4", "parentKode": "A.1", "kategori": "A. CIVIL WORK", "subKategori": "A.1. PEKERJAAN PERSIAPAN",
        "uraian": "Pek. Bongkaran Dinding Bata, Kusen, Daun Pintu, Daun Jendela, Plumbing Eks. AC central", "volume": 175.46, "satuan": "m²",
        "hargaUpah": 5280874.36, "hargaBahan": 0.0, "totalHarga": 5280874.36,
        "bobotJadwalAsli": 0.7414, "plans": { "2": 0.3707, "3": 0.3707 }
    },
    {
        "kode": "A.1.5", "parentKode": "A.1", "kategori": "A. CIVIL WORK", "subKategori": "A.1. PEKERJAAN PERSIAPAN",
        "uraian": "Pek. Bongkaran Penutup Plafon dan Rangka Plafon", "volume": 296.39, "satuan": "m²",
        "hargaUpah": 2973512.99, "hargaBahan": 0.0, "totalHarga": 2973512.99,
        "bobotJadwalAsli": 0.4425, "plans": { "1": 0.2213, "2": 0.2213 }
    },

    # A.2. PEKERJAAN PONDASI
    {
        "kode": "A.2.1", "parentKode": "A.2", "kategori": "A. CIVIL WORK", "subKategori": "A.2. PEKERJAAN PONDASI",
        "uraian": "Pek. Galian Tanah Biasa Max Kedalaman 1 m' (Pondasi Menerus dan Pondasi Tapak)", "volume": 12.41, "satuan": "m³",
        "hargaUpah": 1309304.64, "hargaBahan": 0.0, "totalHarga": 1309304.64,
        "bobotJadwalAsli": 0.1664, "plans": { "2": 0.1664 }
    },
    {
        "kode": "A.2.2", "parentKode": "A.2", "kategori": "A. CIVIL WORK", "subKategori": "A.2. PEKERJAAN PONDASI",
        "uraian": "Pek. Urugan Pasir Bawah Pondasi", "volume": 1.24, "satuan": "m³",
        "hargaUpah": 43816.64, "hargaBahan": 249984.0, "totalHarga": 293800.64,
        "bobotJadwalAsli": 0.0425, "plans": { "2": 0.0425 }
    },
    {
        "kode": "A.2.3", "parentKode": "A.2", "kategori": "A. CIVIL WORK", "subKategori": "A.2. PEKERJAAN PONDASI",
        "uraian": "Pek. Pasangan Pondasi Bata Merah 1Pc : 3Ps 1 Bata", "volume": 49.57, "satuan": "m²",
        "hargaUpah": 5349197.84, "hargaBahan": 7404766.60, "totalHarga": 12753964.44,
        "bobotJadwalAsli": 1.8965, "plans": { "3": 1.8965 }
    },
    {
        "kode": "A.2.4", "parentKode": "A.2", "kategori": "A. CIVIL WORK", "subKategori": "A.2. PEKERJAAN PONDASI",
        "uraian": "Pek. Urugan Tanah Kembali", "volume": 12.41, "satuan": "m³",
        "hargaUpah": 307797.78, "hargaBahan": 0.0, "totalHarga": 307797.78,
        "bobotJadwalAsli": 0.0458, "plans": { "3": 0.0458 }
    },

    # A.3. PEKERJAAN BETON BERTULANG
    {
        "kode": "A.3.1", "parentKode": "A.3", "kategori": "A. CIVIL WORK", "subKategori": "A.3. PEKERJAAN BETON BERTULANG",
        "uraian": "Pek. Sloof Beton (12x15) cm, ad. K-250, Rasio 300 Kg/m³ + Bekisting", "volume": 1.78, "satuan": "m³",
        "hargaUpah": 1900369.30, "hargaBahan": 7277437.44, "totalHarga": 9177806.74,
        "bobotJadwalAsli": 1.3634, "plans": { "3": 1.3634 }
    },
    {
        "kode": "A.3.2", "parentKode": "A.3", "kategori": "A. CIVIL WORK", "subKategori": "A.3. PEKERJAAN BETON BERTULANG",
        "uraian": "Pek. Pondasi Tapak (60x60x20) cm + Kolom Umpak (15x15) cm, ad. K-250, Rasio 250 Kg/m³ + Bekisting", "volume": 2.37, "satuan": "m³",
        "hargaUpah": 2530266.98, "hargaBahan": 9689621.76, "totalHarga": 12219888.74,
        "bobotJadwalAsli": 1.8152, "plans": { "2": 0.9076, "3": 0.9076 }
    },
    {
        "kode": "A.3.3", "parentKode": "A.3", "kategori": "A. CIVIL WORK", "subKategori": "A.3. PEKERJAAN BETON BERTULANG",
        "uraian": "Pek. Kolom Beton (12 X 12) cm, Ad. K-250, Rasio 300 Kg/m³ + Bekisting", "volume": 1.56, "satuan": "m³",
        "hargaUpah": 2683175.04, "hargaBahan": 10498313.28, "totalHarga": 13181488.32,
        "bobotJadwalAsli": 1.9569, "plans": { "3": 0.9784, "4": 0.9784 }
    },
    {
        "kode": "A.3.4", "parentKode": "A.3", "kategori": "A. CIVIL WORK", "subKategori": "A.3. PEKERJAAN BETON BERTULANG",
        "uraian": "Pek. Balok Beton (12 X 15) cm, ad. K-250, Rasio 300 Kg/m³ + Bekisting", "volume": 2.38, "satuan": "m³",
        "hargaUpah": 3293788.62, "hargaBahan": 12103156.80, "totalHarga": 15396945.42,
        "bobotJadwalAsli": 2.2956, "plans": { "7": 2.2956 }
    },

    # A.4. PEKERJAAN DINDING, PINTU DAN JENDELA
    {
        "kode": "A.4.1", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Dinding Bata baru dan Penutupan eks. Lubang Jendela, Ad. 1:3 Pas.1/2 Bt", "volume": 359.77, "satuan": "m²",
        "hargaUpah": 13166142.92, "hargaBahan": 19399258.91, "totalHarga": 32565401.83,
        "bobotJadwalAsli": 4.8466, "plans": { "3": 1.6155, "4": 1.6155, "5": 1.6155 }
    },
    {
        "kode": "A.4.2", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Plesteran Dinding, ad. 1:3 + Perapian Kembali Eks. Bongkaran", "volume": 719.54, "satuan": "m²",
        "hargaUpah": 21416388.56, "hargaBahan": 9099245.28, "totalHarga": 30515633.84,
        "bobotJadwalAsli": 4.5415, "plans": { "4": 1.5138, "5": 1.5138, "6": 1.5138 }
    },
    {
        "kode": "A.4.3", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pasang Kembali Dinding Partisi Ruang Konsultasi & Pemeriksaan, Rangka Kayu Kls III + Penutup GRC", "volume": 83.97, "satuan": "m²",
        "hargaUpah": 5245202.84, "hargaBahan": 13321860.65, "totalHarga": 18567063.49,
        "bobotJadwalAsli": 2.7631, "plans": { "6": 2.7631 }
    },
    {
        "kode": "A.4.4", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Pintu Alumunium Geser Kaca Bening + Sand Blasting + Perlengkapan (uk. 1,25 x 2,1 m)", "volume": 6.0, "satuan": "Unit",
        "hargaUpah": 8400000.0, "hargaBahan": 23520000.0, "totalHarga": 31920000.0,
        "bobotJadwalAsli": 3.5004, "plans": { "4": 0.8751, "5": 0.8751, "6": 0.8751, "7": 0.8751 }
    },
    {
        "kode": "A.4.5", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pemindahan Pintu Alumunium Geser Kaca Bening ruang HD isolasi + Sand Blasting + Perlengkapan (Pintu uk. 1,25 x 2,1 m)", "volume": 1.0, "satuan": "Unit",
        "hargaUpah": 8400000.0, "hargaBahan": 2889600.0, "totalHarga": 11289600.0,
        "bobotJadwalAsli": 0.1250, "plans": { "7": 0.1250 }
    },
    {
        "kode": "A.4.6", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Pintu Kaca Alumunium 2 Daun, Frame Alumunium, floor Hinges + Sandblasting + Perlengkapan (Pintu Uk. 1,35 x 2,1 m)", "volume": 1.0, "satuan": "Unit",
        "hargaUpah": 2475200.0, "hargaBahan": 8848000.0, "totalHarga": 11323200.0,
        "bobotJadwalAsli": 1.3168, "plans": { "7": 1.3168 }
    },
    {
        "kode": "A.4.7", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Pintu Kayu Finishing HPL 2 daun + Perlengkapan (1 Unit Pintu uk. 1,2 x 2,1 m, Engsel Biasa)", "volume": 1.0, "satuan": "Unit",
        "hargaUpah": 1876000.0, "hargaBahan": 2576000.0, "totalHarga": 4452000.0,
        "bobotJadwalAsli": 0.3834, "plans": { "7": 0.3834 }
    },
    {
        "kode": "A.4.8", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Pintu Kayu Multiplek+Finishing HPL+ Perlengkapan (uk. 0,9 x 2,1 m, Engsel Biasa)", "volume": 6.0, "satuan": "Unit",
        "hargaUpah": 5376000.0, "hargaBahan": 12096000.0, "totalHarga": 17472000.0,
        "bobotJadwalAsli": 1.8002, "plans": { "6": 0.9001, "7": 0.9001 }
    },
    {
        "kode": "A.4.9", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Pintu KM/WC Customize Size, Pintu Alumunium Kaca + Perlengkapan (uk. 0.9 x 2.1 m)", "volume": 6.0, "satuan": "Unit",
        "hargaUpah": 1008000.0, "hargaBahan": 11088000.0, "totalHarga": 12096000.0,
        "bobotJadwalAsli": 1.8002, "plans": { "6": 0.9001, "7": 0.9001 }
    },
    {
        "kode": "A.4.10", "parentKode": "A.4", "kategori": "A. CIVIL WORK", "subKategori": "A.4. PEKERJAAN DINDING, PINTU DAN JENDELA",
        "uraian": "Pek. Pasang Keramik Dinding KM/WC dan Gudang Kotor, Granit HT 60 cm X 60 cm", "volume": 32.97, "satuan": "m²",
        "hargaUpah": 2316208.44, "hargaBahan": 6891874.98, "totalHarga": 9208083.42,
        "bobotJadwalAsli": 1.3704, "plans": { "7": 1.3704 }
    },

    # A.5. PEKERJAAN LANTAI
    {
        "kode": "A.5.1", "parentKode": "A.5", "kategori": "A. CIVIL WORK", "subKategori": "A.5. PEKERJAAN LANTAI",
        "uraian": "Pek. Perataan Tanah Bawah Lantai", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 2800000.0, "hargaBahan": 0.0, "totalHarga": 2800000.0,
        "bobotJadwalAsli": 0.4167, "plans": { "3": 0.4167 }
    },
    {
        "kode": "A.5.2", "parentKode": "A.5", "kategori": "A. CIVIL WORK", "subKategori": "A.5. PEKERJAAN LANTAI",
        "uraian": "Pek. Urugan Pasir Bawah Lantai", "volume": 17.61, "satuan": "m³",
        "hargaUpah": 622266.96, "hargaBahan": 3550176.0, "totalHarga": 4172442.96,
        "bobotJadwalAsli": 0.6210, "plans": { "3": 0.6210 }
    },
    {
        "kode": "A.5.3", "parentKode": "A.5", "kategori": "A. CIVIL WORK", "subKategori": "A.5. PEKERJAAN LANTAI",
        "uraian": "Pek. Pasang Lantai KM/WC Granit Kasar ukuran 60 x 60 cm", "volume": 14.35, "satuan": "m²",
        "hargaUpah": 530777.80, "hargaBahan": 2399080.78, "totalHarga": 2929858.58,
        "bobotJadwalAsli": 0.4360, "plans": { "6": 0.4360 }
    },
    {
        "kode": "A.5.4", "parentKode": "A.5", "kategori": "A. CIVIL WORK", "subKategori": "A.5. PEKERJAAN LANTAI",
        "uraian": "Pek. Pasang Lantai Granit Halus Ukuran 60x60 cm", "volume": 323.44, "satuan": "m²",
        "hargaUpah": 11963398.72, "hargaBahan": 54073776.13, "totalHarga": 66037174.85,
        "bobotJadwalAsli": 9.8282, "plans": { "7": 4.9141, "8": 4.9141 }
    },

    # A.7. PEKERJAAN PLAFON
    {
        "kode": "A.7.1", "parentKode": "A.7", "kategori": "A. CIVIL WORK", "subKategori": "A.7. PEKERJAAN PLAFON",
        "uraian": "Pek. Pasang Rangka Plafond, Alumunium Hollow", "volume": 352.21, "satuan": "m²",
        "hargaUpah": 10182391.10, "hargaBahan": 18619229.44, "totalHarga": 28801620.54,
        "bobotJadwalAsli": 4.2864, "plans": { "6": 2.1432, "7": 2.1432 }
    },
    {
        "kode": "A.7.2", "parentKode": "A.7", "kategori": "A. CIVIL WORK", "subKategori": "A.7. PEKERJAAN PLAFON",
        "uraian": "Pek. Pasang Penutup Plafond, Kalsiboard 3.5 mm", "volume": 352.21, "satuan": "m²",
        "hargaUpah": 8241573.12, "hargaBahan": 11786918.98, "totalHarga": 20028492.10,
        "bobotJadwalAsli": 2.9808, "plans": { "7": 1.4904, "8": 1.4904 }
    },
    {
        "kode": "A.7.3", "parentKode": "A.7", "kategori": "A. CIVIL WORK", "subKategori": "A.7. PEKERJAAN PLAFON",
        "uraian": "Pek. Penambahan Atap Area Ruang Onsite", "volume": 50.57, "satuan": "m²",
        "hargaUpah": 4247880.0, "hargaBahan": 30662710.65, "totalHarga": 34910590.65,
        "bobotJadwalAsli": 5.1956, "plans": { "6": 2.5978, "7": 2.5978 }
    },

    # A.8. PEKERJAAN PENGECATAN
    {
        "kode": "A.8.1", "parentKode": "A.8", "kategori": "A. CIVIL WORK", "subKategori": "A.8. PEKERJAAN PENGECATAN",
        "uraian": "Pek. Pengecatan Tembok Baru dan Lama, 1 Plamir + 1 Lapis Cat Dasar + 2 Lapis Cat Finish", "volume": 814.0, "satuan": "m²",
        "hargaUpah": 8476800.64, "hargaBahan": 30921414.09, "totalHarga": 39398214.73,
        "bobotJadwalAsli": 5.6652, "plans": { "8": 2.8326, "9": 2.8326 }
    },
    {
        "kode": "A.8.2", "parentKode": "A.8", "kategori": "A. CIVIL WORK", "subKategori": "A.8. PEKERJAAN PENGECATAN",
        "uraian": "Pek. Pengecatan Plafond Baru dan Lama , 1 Plamir + 1 lapis Cat Dasar + 2 lapis Cat Finish", "volume": 352.21, "satuan": "m²",
        "hargaUpah": 4259543.21, "hargaBahan": 4279337.98, "totalHarga": 8538881.19,
        "bobotJadwalAsli": 1.2708, "plans": { "8": 0.6354, "9": 0.6354 }
    },
    {
        "kode": "A.8.3", "parentKode": "A.8", "kategori": "A. CIVIL WORK", "subKategori": "A.8. PEKERJAAN PENGECATAN",
        "uraian": "Pek. Cat Minyak (Kusen Kayu, Pintu Kayu, Lisplank GRC)", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 336000.0, "hargaBahan": 784000.0, "totalHarga": 1120000.0,
        "bobotJadwalAsli": 0.1667, "plans": { "8": 0.0833, "9": 0.0833 }
    },

    # B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK
    {
        "kode": "B.1.1", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Stop Kontak 5 Channel setiap Bed Pasien, Ruang Konsultasi dan Pemeriksaan, Counter Administrasi", "volume": 21.0, "satuan": "Ttk",
        "hargaUpah": 843825.39, "hargaBahan": 2527553.28, "totalHarga": 3371378.67,
        "bobotJadwalAsli": 0.5017, "plans": { "7": 0.5017 }
    },
    {
        "kode": "B.1.2", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Stop Kontak 8 Channel di Nurse Station", "volume": 1.0, "satuan": "Ttk",
        "hargaUpah": 40182.16, "hargaBahan": 224000.0, "totalHarga": 264182.16,
        "bobotJadwalAsli": 0.0393, "plans": { "7": 0.0393 }
    },
    {
        "kode": "B.1.3", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Stop Kontak 2 Channel di Ruang Tunggu", "volume": 2.0, "satuan": "Ttk",
        "hargaUpah": 80364.32, "hargaBahan": 155554.56, "totalHarga": 235918.88,
        "bobotJadwalAsli": 0.0351, "plans": { "7": 0.0351 }
    },
    {
        "kode": "B.1.4", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Sakelar Tunggal inbow channel di masing-masing tempat tidur + Perlengkapan", "volume": 19.0, "satuan": "Ttk",
        "hargaUpah": 763461.07, "hargaBahan": 983646.72, "totalHarga": 1747107.79,
        "bobotJadwalAsli": 0.2600, "plans": { "7": 0.1300, "8": 0.1300 }
    },
    {
        "kode": "B.1.5", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang sakelar Ganda Inbow Channel + Perlengkapan", "volume": 12.0, "satuan": "Ttk",
        "hargaUpah": 482185.94, "hargaBahan": 621250.56, "totalHarga": 1103436.50,
        "bobotJadwalAsli": 0.1642, "plans": { "7": 0.0821, "8": 0.0821 }
    },
    {
        "kode": "B.1.6", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Fitting Lampu (Include Lampu 24 Watt LED Down Light) + Perlengkapan", "volume": 45.0, "satuan": "Ttk",
        "hargaUpah": 1808197.27, "hargaBahan": 4939200.0, "totalHarga": 6747397.27,
        "bobotJadwalAsli": 1.0042, "plans": { "7": 0.5021, "8": 0.5021 }
    },
    {
        "kode": "B.1.7", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Stop Kontak HV-AC", "volume": 10.0, "satuan": "Ttk",
        "hargaUpah": 401821.62, "hargaBahan": 1122508.80, "totalHarga": 1524330.42,
        "bobotJadwalAsli": 0.2269, "plans": { "7": 0.1134, "8": 0.1134 }
    },
    {
        "kode": "B.1.7.a", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pemindahan Panel Listrik SDP dan PHB", "volume": 2.0, "satuan": "Set",
        "hargaUpah": 3920000.0, "hargaBahan": 3920000.0, "totalHarga": 7840000.0,
        "bobotJadwalAsli": 1.1668, "plans": { "9": 1.1668 }
    },
    {
        "kode": "B.1.8", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Jalur Kabel Listrik NYY, Uk.4x16 mm dari PHB Belakang Onsite Ke Panel PHB Genset + Perlengkapan", "volume": 50.03, "satuan": "m'",
        "hargaUpah": 2010313.54, "hargaBahan": 15409240.0, "totalHarga": 17419553.54,
        "bobotJadwalAsli": 2.5922, "plans": { "6": 1.2961, "7": 1.2961 }
    },
    {
        "kode": "B.1.9", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Jalur Kabel Tunggal NYM 1x2.5 mm + Perlengkapan (Jalur Kabel Stop Kontak + HVAC)", "volume": 591.42, "satuan": "m'",
        "hargaUpah": 5666491.54, "hargaBahan": 9879420.34, "totalHarga": 15545911.88,
        "bobotJadwalAsli": 2.3136, "plans": { "6": 1.1568, "7": 1.1568 }
    },
    {
        "kode": "B.1.10", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Jalur Kabel Tunggal NYM 1x1.5 mm + Perlengkapan (Jalur Lampu Penerangan)", "volume": 580.60, "satuan": "m'",
        "hargaUpah": 5562823.35, "hargaBahan": 5146772.83, "totalHarga": 10709596.18,
        "bobotJadwalAsli": 1.5939, "plans": { "5": 0.7969, "6": 0.7969 }
    },
    {
        "kode": "B.1.11.a", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang MCB 25A", "volume": 15.0, "satuan": "Pcs",
        "hargaUpah": 602732.42, "hargaBahan": 1419600.0, "totalHarga": 2022332.42,
        "bobotJadwalAsli": 0.3010, "plans": { "7": 0.3010 }
    },
    {
        "kode": "B.1.11.b", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Manual Cos Handle Breaker Genset 200A", "volume": 1.0, "satuan": "Pcs",
        "hargaUpah": 140000.0, "hargaBahan": 3056480.0, "totalHarga": 3196480.0,
        "bobotJadwalAsli": 0.4757, "plans": { "7": 0.4757 }
    },
    {
        "kode": "B.1.12", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Ceilling Exhaustfan 25R", "volume": 5.0, "satuan": "Pcs",
        "hargaUpah": 700000.0, "hargaBahan": 2167200.0, "totalHarga": 2867200.0,
        "bobotJadwalAsli": 0.4267, "plans": { "8": 0.4267 }
    },
    {
        "kode": "B.1.13", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Instalasi Nurce Call 21 Titik (Bed Head unit) + Master Nurse Call 24 Channel + Perlengkapan", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 3080000.0, "hargaBahan": 0.0, "totalHarga": 3080000.0,
        "bobotJadwalAsli": 6.9324, "plans": { "6": 2.3108, "7": 2.3108, "8": 2.3108 }
    },
    {
        "kode": "B.1.14", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Kabel Jaringan Nurse Call + Perlengkepan", "volume": 218.56, "satuan": "m'",
        "hargaUpah": 856755.20, "hargaBahan": 2065196.17, "totalHarga": 2921951.37,
        "bobotJadwalAsli": 0.4349, "plans": { "6": 0.1450, "7": 0.1450, "8": 0.1450 }
    },
    {
        "kode": "B.1.15", "parentKode": "B.1", "kategori": "B. MEP WORK", "subKategori": "B.1. PEKERJAAN ELEKTRIKAL-ELEKTRONIK",
        "uraian": "Pek. Pasang Pipa Konduit Jalur Listrik, Telp, LAN + TC PVC (Wall Ducting)+ PVC Kabel Tray type", "volume": 586.01, "satuan": "m'",
        "hargaUpah": 5614657.45, "hargaBahan": 7088376.96, "totalHarga": 12703034.41,
        "bobotJadwalAsli": 1.8905, "plans": { "6": 1.8905 }
    },

    # B.2. PEK. PLUMBING
    {
        "kode": "B.2.1", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Jalur Pipa Air RO, Pipa PVC AW 1/2\" + Perlengkapan", "volume": 84.98, "satuan": "m'",
        "hargaUpah": 1131566.49, "hargaBahan": 1356280.80, "totalHarga": 2487847.29,
        "bobotJadwalAsli": 0.3703, "plans": { "5": 0.3703 }
    },
    {
        "kode": "B.2.2", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Jalur Pipa Air Limbah , Pipa PVC AW 2 1/2\" + Perlengkapan", "volume": 99.98, "satuan": "m'",
        "hargaUpah": 1331301.69, "hargaBahan": 6718656.0, "totalHarga": 8049957.69,
        "bobotJadwalAsli": 1.1980, "plans": { "5": 1.1980 }
    },
    {
        "kode": "B.2.3", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Jalur Pipa Air Limbah Closet dan Sloof Sink, Pipa PVC AW 4\" + Perlengkapan", "volume": 16.0, "satuan": "m'",
        "hargaUpah": 479503.36, "hargaBahan": 2742880.0, "totalHarga": 3222383.36,
        "bobotJadwalAsli": 0.4796, "plans": { "5": 0.4796 }
    },
    {
        "kode": "B.2.4", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Wastafel Keramik Cuci Tangan + Perlengkapan", "volume": 5.0, "satuan": "Pcs",
        "hargaUpah": 1734600.0, "hargaBahan": 4436600.0, "totalHarga": 6171200.0,
        "bobotJadwalAsli": 0.9184, "plans": { "6": 0.9184 }
    },
    {
        "kode": "B.2.5", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Closed Duduk + Perlengkapan", "volume": 1.0, "satuan": "Pcs",
        "hargaUpah": 346920.0, "hargaBahan": 1747200.0, "totalHarga": 2094120.0,
        "bobotJadwalAsli": 0.3117, "plans": { "6": 0.3117 }
    },
    {
        "kode": "B.2.6", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Sloof Sink Di ruang Gudang Kotor", "volume": 1.0, "satuan": "Pcs",
        "hargaUpah": 346920.0, "hargaBahan": 11466000.0, "totalHarga": 11812920.0,
        "bobotJadwalAsli": 1.2978, "plans": { "7": 1.2978 }
    },
    {
        "kode": "B.2.7", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Floor Drain di KM/WC dan Gudang Kotor", "volume": 3.0, "satuan": "Pcs",
        "hargaUpah": 89906.88, "hargaBahan": 218400.0, "totalHarga": 308306.88,
        "bobotJadwalAsli": 0.0406, "plans": { "8": 0.0406 }
    },
    {
        "kode": "B.2.8", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Stop Kran Drat Kuningan 1/2\" + Neple Selang 1/2\"-5/8\" drat luar + perlengkapan", "volume": 19.0, "satuan": "Pcs",
        "hargaUpah": 159600.0, "hargaBahan": 1851360.0, "totalHarga": 2010960.0,
        "bobotJadwalAsli": 0.2993, "plans": { "8": 0.2993 }
    },
    {
        "kode": "B.2.9", "parentKode": "B.2", "kategori": "B. MEP WORK", "subKategori": "B.2. PEKERJAAN PLUMBING",
        "uraian": "Pek. Pasang Kran Air Biasa 1/2\" + Perlengkapan", "volume": 2.0, "satuan": "Pcs",
        "hargaUpah": 16800.0, "hargaBahan": 100800.0, "totalHarga": 117600.0,
        "bobotJadwalAsli": 0.0175, "plans": { "8": 0.0175 }
    },

    # B.3. INTERIOR & FURNISHING
    {
        "kode": "B.3.1", "parentKode": "B.3", "kategori": "B. MEP WORK", "subKategori": "B.3. INTERIOR & FURNISHING",
        "uraian": "Pek. Pasang Rel Gordeng Menggunakan Stainles Pipe 1\"", "volume": 82.64, "satuan": "m'",
        "hargaUpah": 2313920.0, "hargaBahan": 15086758.40, "totalHarga": 17400678.40,
        "bobotJadwalAsli": 2.4106, "plans": { "9": 2.4106 }
    },
    {
        "kode": "B.3.2", "parentKode": "B.3", "kategori": "B. MEP WORK", "subKategori": "B.3. INTERIOR & FURNISHING",
        "uraian": "Pek. Gorden PVC Non Porosif anti Bakteri dan Noda", "volume": 247.50, "satuan": "m²",
        "hargaUpah": 1386000.0, "hargaBahan": 26334000.0, "totalHarga": 27720000.0,
        "bobotJadwalAsli": 4.1255, "plans": { "9": 4.1255 }
    },
    {
        "kode": "B.3.3", "parentKode": "B.3", "kategori": "B. MEP WORK", "subKategori": "B.3. INTERIOR & FURNISHING",
        "uraian": "Pek. Fabrikasi dan Pemasangan Meja Nurse Station, Lemari Arsip HD + Backdrop HPL Belakang Nurse Station", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 15120000.0, "hargaBahan": 33600000.0, "totalHarga": 48720000.0,
        "bobotJadwalAsli": 1.8335, "plans": { "7": 1.8335 }
    },
    {
        "kode": "B.3.4", "parentKode": "B.3", "kategori": "B. MEP WORK", "subKategori": "B.3. INTERIOR & FURNISHING",
        "uraian": "Pek. Fabrikasi dan Pemasangan interior pintu masuk + Sign Nama Ruangan (Akrilik Lampu)", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 2408000.0, "hargaBahan": 7548800.0, "totalHarga": 9956800.0,
        "bobotJadwalAsli": 0.7626, "plans": { "7": 0.7626 }
    },

    # C. PEKERJAAN AKHIR
    {
        "kode": "C.1", "parentKode": "C", "kategori": "C. PEKERJAAN AKHIR", "subKategori": "C. PEKERJAAN AKHIR",
        "uraian": "Dokumentasi", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 336000.0, "hargaBahan": 728000.0, "totalHarga": 1064000.0,
        "bobotJadwalAsli": 0.1083, "plans": { "9": 0.1083 }
    },
    {
        "kode": "C.2", "parentKode": "C", "kategori": "C. PEKERJAAN AKHIR", "subKategori": "C. PEKERJAAN AKHIR",
        "uraian": "Pembersihan Akhir", "volume": 1.0, "satuan": "Ls",
        "hargaUpah": 728000.0, "hargaBahan": 2408000.0, "totalHarga": 3136000.0,
        "bobotJadwalAsli": 0.2500, "plans": { "9": 0.2500 }
    }
]

GRAND_TOTAL = 712063413.0
total_rab = sum(i["totalHarga"] for i in items_data)
print(f"Total RAB calculated: Rp {total_rab:,.2f}")
print(f"Grand Total target:    Rp {GRAND_TOTAL:,.2f}")
print(f"Difference:            Rp {total_rab - GRAND_TOTAL:,.2f}")

# Calculate bobotPersen, selisihBobot, and statusRekonsiliasi
for idx, item in enumerate(items_data, 1):
    item["urutan"] = idx
    item["bobotPersen"] = round((item["totalHarga"] / GRAND_TOTAL) * 100, 4)
    item["selisihBobot"] = round(item["bobotJadwalAsli"] - item["bobotPersen"], 4)
    item["statusRekonsiliasi"] = "CLARIFIED" if abs(item["selisihBobot"]) > 0.5 else "VERIFIED"

seed_data = {
    "project": {
        "nama": "Renovasi Ruang Hemodialisa RS Umum Pertamina Prabumulih",
        "lokasi": "Jl. Kesehatan No. 100, Komperta Prabumulih, Kel. Muntang Tapus, Kec. Prabumulih Barat, Sumatera Selatan 31122",
        "client": "PT Abadinusa Usahasemesta",
        "kontraktor": "PT Mitra Bangun Mahakarya",
        "nilaiKontrak": GRAND_TOTAL,
        "tanggalMulai": "2026-09-14T00:00:00.000Z",
        "tanggalBatasKontrak": "2026-11-13T00:00:00.000Z",
        "tanggalAkhirBaseline": "2026-11-15T00:00:00.000Z",
        "hariKerja": 60,
        "dendaPersenPerHari": 0.1,
        "maksDendaPersen": 10.0
    },
    "periods": [
        { "mingguKe": 1, "tanggalMulai": "2026-09-15T00:00:00.000Z", "tanggalSelesai": "2026-09-20T00:00:00.000Z", "bobotRencana": 0.8725, "bobotKumulatifRencana": 0.8725, "nilaiKumulatifRencana": 6212543.0 },
        { "mingguKe": 2, "tanggalMulai": "2026-09-21T00:00:00.000Z", "tanggalSelesai": "2026-09-27T00:00:00.000Z", "bobotRencana": 2.1930, "bobotKumulatifRencana": 3.0655, "nilaiKumulatifRencana": 21828032.0 },
        { "mingguKe": 3, "tanggalMulai": "2026-09-28T00:00:00.000Z", "tanggalSelesai": "2026-10-04T00:00:00.000Z", "bobotRencana": 8.2156, "bobotKumulatifRencana": 11.2811, "nilaiKumulatifRencana": 80328731.0 },
        { "mingguKe": 4, "tanggalMulai": "2026-10-05T00:00:00.000Z", "tanggalSelesai": "2026-10-11T00:00:00.000Z", "bobotRencana": 4.9829, "bobotKumulatifRencana": 16.2640, "nilaiKumulatifRencana": 115809772.0 },
        { "mingguKe": 5, "tanggalMulai": "2026-10-12T00:00:00.000Z", "tanggalSelesai": "2026-10-18T00:00:00.000Z", "bobotRencana": 6.8493, "bobotKumulatifRencana": 23.1132, "nilaiKumulatifRencana": 164581977.0 },
        { "mingguKe": 6, "tanggalMulai": "2026-10-19T00:00:00.000Z", "tanggalSelesai": "2026-10-25T00:00:00.000Z", "bobotRencana": 20.9556, "bobotKumulatifRencana": 44.0688, "nilaiKumulatifRencana": 313796570.0 },
        { "mingguKe": 7, "tanggalMulai": "2026-10-26T00:00:00.000Z", "tanggalSelesai": "2026-11-01T00:00:00.000Z", "bobotRencana": 30.2952, "bobotKumulatifRencana": 74.3640, "nilaiKumulatifRencana": 529500778.0 },
        { "mingguKe": 8, "tanggalMulai": "2026-11-02T00:00:00.000Z", "tanggalSelesai": "2026-11-08T00:00:00.000Z", "bobotRencana": 14.0234, "bobotKumulatifRencana": 88.3874, "nilaiKumulatifRencana": 629379611.0 },
        { "mingguKe": 9, "tanggalMulai": "2026-11-09T00:00:00.000Z", "tanggalSelesai": "2026-11-15T00:00:00.000Z", "bobotRencana": 11.6126, "bobotKumulatifRencana": 100.0000, "nilaiKumulatifRencana": 712063413.0 }
    ],
    "users": [
        { "nama": "Kingking Firdaus ST", "email": "pm@mbm.co.id", "role": "PM" },
        { "nama": "Pengawas Lapangan 1", "email": "site1@mbm.co.id", "role": "FIELD" },
        { "nama": "Pengawas Lapangan 2", "email": "site2@mbm.co.id", "role": "FIELD" },
        { "nama": "Admin Keuangan", "email": "admin@mbm.co.id", "role": "ADMIN" }
    ],
    "rabItems": items_data
}

with open('prisma/seed-data.json', 'w', encoding='utf-8') as f:
    json.dump(seed_data, f, indent=2, ensure_ascii=False)

print("Saved prisma/seed-data.json perfectly!")
