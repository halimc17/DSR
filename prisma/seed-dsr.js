const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to PostgreSQL...');
  const rabItems = await prisma.rabItem.findMany({
    where: {
      kode: { in: ['A.1', 'A.2', 'B.1.1', 'B.1.2'] }
    }
  });
  console.log('Found RAB items:', rabItems.map(i => ({ id: i.id, kode: i.kode, uraian: i.uraian })));

  // Check if DSR for 2026-09-21 already exists
  const existing = await prisma.dailyReport.findFirst({
    where: { tanggal: new Date('2026-09-21T00:00:00.000Z') }
  });

  if (existing) {
    console.log('DSR for 2026-09-21 already exists, ID:', existing.id);
    return;
  }

  // Create DSR for 2026-09-21 (Day 7)
  const dsr = await prisma.dailyReport.create({
    data: {
      projectId: 'rs-pertamina-prabumulih',
      tanggal: new Date('2026-09-21T00:00:00.000Z'),
      hariKerjaKe: 7,
      cuacaPagi: 'CERAH',
      cuacaSiang: 'CERAH',
      cuacaSore: 'HUJAN_RINGAN',
      jamMulai: '08:00',
      jamSelesai: '17:00',
      jamTerhentiCuaca: 0.5,
      status: 'APPROVED',
      isBackdated: false,
      catatanUmum: 'Pekerjaan pembongkaran dinding partisi eksisting dan pembersihan puing area Hemodialisa. Pemasangan barikade debu dan proteksi area steril RS Pertamina.',
      rencanaBesok: 'Melanjutkan pembongkaran plafon eksisting dan instalasi jalur kabel tray utama.',
      catatanK3: 'Semua pekerja menggunakan helm K3, rompi, sepatu safety, dan masker respirator partikulat N95 di area pembongkaran.',
      adaInsidenK3: false,
      manpowers: {
        create: [
          { kategori: 'Pelaksana Lapangan', jumlah: 1 },
          { kategori: 'Mandor', jumlah: 1 },
          { kategori: 'Tukang Batu/Bongkar', jumlah: 4 },
          { kategori: 'Pekerja/Kenek', jumlah: 4 },
          { kategori: 'Petugas K3', jumlah: 1 },
        ]
      },
      equipments: {
        create: [
          { namaAlat: 'Jack Hammer / Demolition Hammer', jumlah: 2, status: 'BAIK' },
          { namaAlat: 'Gerobak Sorong (Wheelbarrow)', jumlah: 3, status: 'BAIK' },
          { namaAlat: 'Tangga Scaffolding (Aluminium)', jumlah: 2, status: 'BAIK' },
        ]
      },
      progressEntries: {
        create: [
          {
            rabItemId: rabItems.find(i => i.kode === 'B.1.1')?.id || rabItems[0].id,
            volumeHariIni: 45.0,
            lokasiKerja: 'Ruang Tindakan Hemodialisa Lt. 1',
            catatan: 'Pembongkaran partisi eksisting sisi barat dan pembersihan puing'
          },
          {
            rabItemId: rabItems.find(i => i.kode === 'A.2')?.id || rabItems[0].id,
            volumeHariIni: 1.0,
            lokasiKerja: 'Area Selasar dan Koridor Belakang',
            catatan: 'Pembersihan dan proteksi terpal debu'
          }
        ]
      },
      issues: {
        create: [
          {
            kategori: 'KOORDINASI_RS',
            deskripsi: 'Akses koridor utama RS sempat padat troli medis pukul 10:00-11:00, pengangkutan puing dialihkan via pintu timur.',
            dampakJam: 1.0,
            tindakan: 'Pengangkutan puing dijadwalkan ulang sebelum jam 08:00 dan sesudah jam 16:00 agar tidak mengganggu operasional RS.',
            status: 'RESOLVED',
            pic: 'Pelaksana Lapangan MBM'
          }
        ]
      },
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
            kategori: 'PROGRES',
            keterangan: 'Pekerjaan pembongkaran partisi ruang Hemodialisa & proteksi area',
            lat: -3.4308,
            lng: 104.2342
          }
        ]
      }
    }
  });

  console.log('Successfully created sample DSR:', dsr.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
