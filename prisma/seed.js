const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING DATABASE ---');
  const seedDataPath = path.join(__dirname, 'seed-data.json');
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

  // 1. Project
  console.log('Seeding project...');
  const project = await prisma.project.upsert({
    where: { id: 'rs-pertamina-prabumulih' },
    update: {},
    create: {
      id: 'rs-pertamina-prabumulih',
      nama: seedData.project.nama,
      lokasi: seedData.project.lokasi,
      client: seedData.project.client,
      kontraktor: seedData.project.kontraktor,
      nilaiKontrak: seedData.project.nilaiKontrak,
      tanggalMulai: new Date(seedData.project.tanggalMulai),
      tanggalBatasKontrak: new Date(seedData.project.tanggalBatasKontrak),
      tanggalAkhirBaseline: new Date(seedData.project.tanggalAkhirBaseline),
      hariKerja: seedData.project.hariKerja,
      dendaPersenPerHari: seedData.project.dendaPersenPerHari,
      maksDendaPersen: seedData.project.maksDendaPersen,
    },
  });

  // 2. Users
  console.log('Seeding users...');
  for (const u of seedData.users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { nama: u.nama, role: u.role },
      create: {
        nama: u.nama,
        email: u.email,
        passwordHash: 'password123', // Demo password
        role: u.role,
      },
    });
  }

  // 3. Periods
  console.log('Seeding 9 periods...');
  const periodMap = {};
  for (const p of seedData.periods) {
    const periodId = `period-${p.mingguKe}`;
    const period = await prisma.period.upsert({
      where: { id: periodId },
      update: {},
      create: {
        id: periodId,
        projectId: project.id,
        mingguKe: p.mingguKe,
        tanggalMulai: new Date(p.tanggalMulai),
        tanggalSelesai: new Date(p.tanggalSelesai),
        bobotRencana: p.bobotRencana,
        bobotKumulatifRencana: p.bobotKumulatifRencana,
        nilaiKumulatifRencana: p.nilaiKumulatifRencana,
      },
    });
    periodMap[p.mingguKe] = period.id;
  }

  // 4. RabItems & RabPlans
  console.log(`Seeding ${seedData.rabItems.length} RAB items and plans...`);
  for (const it of seedData.rabItems) {
    const rabItem = await prisma.rabItem.upsert({
      where: { id: `rab-${it.kode}` },
      update: {},
      create: {
        id: `rab-${it.kode}`,
        projectId: project.id,
        kode: it.kode,
        parentKode: it.parentKode,
        kategori: it.kategori,
        subKategori: it.subKategori,
        uraian: it.uraian,
        volume: it.volume,
        satuan: it.satuan,
        hargaUpah: it.hargaUpah,
        hargaBahan: it.hargaBahan,
        totalHarga: it.totalHarga,
        bobotPersen: it.bobotPersen,
        bobotJadwalAsli: it.bobotJadwalAsli,
        selisihBobot: it.selisihBobot,
        statusRekonsiliasi: it.statusRekonsiliasi,
        urutan: it.urutan,
      },
    });

    // Plans
    if (it.plans) {
      for (const [weekNumStr, porsiVal] of Object.entries(it.plans)) {
        const weekNum = parseInt(weekNumStr, 10);
        const periodId = periodMap[weekNum];
        if (periodId) {
          const planId = `plan-${it.kode}-${weekNum}`;
          await prisma.rabPlan.upsert({
            where: { id: planId },
            update: {},
            create: {
              id: planId,
              rabItemId: rabItem.id,
              periodId: periodId,
              porsiRencanaPersen: porsiVal,
              volumeRencana: (porsiVal / (it.bobotJadwalAsli || 1)) * it.volume,
            },
          });
        }
      }
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
