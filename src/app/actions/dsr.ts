'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { DsrFormData, RabItemData, RabProgressPageData, RabProgressItemDetail } from '@/lib/types';
import { calculateDailyPenalty, PROJECT_CONFIG } from '@/lib/calculations';
import { getSessionUser } from '@/lib/auth';

const PROJECT_ID = 'rs-pertamina-prabumulih';

export async function getDashboardData() {
  const project = await prisma.project.findUnique({
    where: { id: PROJECT_ID },
    include: {
      periods: {
        orderBy: { mingguKe: 'asc' },
      },
      dailyReports: {
        orderBy: { tanggal: 'desc' },
        include: {
          progressEntries: {
            include: { rabItem: true },
          },
          manpowers: true,
          issues: true,
          photos: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  // Calculate cumulative actual progress
  // We sum up: for each RabItem, (sum(volumeHariIni from approved/submitted DSRs) / contractVolume) * bobot
  const allRabItems = await prisma.rabItem.findMany({
    where: { projectId: PROJECT_ID },
  });

  const itemVolumeMap: Record<string, number> = {};
  for (const dr of project.dailyReports) {
    // Only count approved or submitted
    if (dr.status === 'APPROVED' || dr.status === 'SUBMITTED') {
      for (const entry of dr.progressEntries) {
        if (!entry.isPekerjaanTambah) {
          itemVolumeMap[entry.rabItemId] = (itemVolumeMap[entry.rabItemId] || 0) + entry.volumeHariIni;
        }
      }
    }
  }

  let totalActualProgressSchedule = 0;
  let totalActualProgressRab = 0;

  for (const item of allRabItems) {
    const volDone = itemVolumeMap[item.id] || 0;
    const ratio = item.volume > 0 ? Math.min(volDone / item.volume, 1.0) : 0;
    totalActualProgressSchedule += ratio * item.bobotJadwalAsli;
    totalActualProgressRab += ratio * item.bobotPersen;
  }

  // Find current week based on date
  const now = new Date();
  let currentPeriod = project.periods[0];
  for (const p of project.periods) {
    if (now >= p.tanggalMulai && now <= p.tanggalSelesai) {
      currentPeriod = p;
      break;
    }
  }

  // Deviation: Actual Schedule % vs Planned Cumulative % for current period
  const plannedCumulative = currentPeriod ? currentPeriod.bobotKumulatifRencana : 0;
  const deviation = totalActualProgressSchedule - plannedCumulative;

  // Days late estimation
  // If deviation is negative, approximate days late: (abs(deviation) / 100) * totalWorkdays
  const daysBehind = deviation < 0 ? Math.round((Math.abs(deviation) / 100) * project.hariKerja) : 0;
  const estimatedPenalty = calculateDailyPenalty(daysBehind);

  // Predecessor check before week 7 (items from week 1-6 that are not 100% completed)
  const predecessorWarningItems: { kode: string; uraian: string; percentDone: number }[] = [];
  const week1To6Plans = await prisma.rabPlan.findMany({
    where: {
      period: { mingguKe: { lte: 6 } },
    },
    include: { rabItem: true },
  });

  const checkedRabItemIds = new Set<string>();
  for (const plan of week1To6Plans) {
    if (!checkedRabItemIds.has(plan.rabItemId)) {
      checkedRabItemIds.add(plan.rabItemId);
      const volDone = itemVolumeMap[plan.rabItemId] || 0;
      const pct = plan.rabItem.volume > 0 ? (volDone / plan.rabItem.volume) * 100 : 0;
      if (pct < 99.0) {
        predecessorWarningItems.push({
          kode: plan.rabItem.kode,
          uraian: plan.rabItem.uraian,
          percentDone: Math.round(pct),
        });
      }
    }
  }

  // Open issues
  const openIssues = await prisma.issue.findMany({
    where: {
      status: 'OPEN',
      dailyReport: { projectId: PROJECT_ID },
    },
    include: { dailyReport: true },
    orderBy: { dailyReport: { tanggal: 'desc' } },
  });

  return {
    project,
    currentPeriod,
    totalActualProgressSchedule: Number(totalActualProgressSchedule.toFixed(2)),
    totalActualProgressRab: Number(totalActualProgressRab.toFixed(2)),
    plannedCumulative: Number(plannedCumulative.toFixed(2)),
    deviation: Number(deviation.toFixed(2)),
    daysBehind,
    estimatedPenalty,
    predecessorWarningItems: predecessorWarningItems.slice(0, 8),
    openIssues,
    recentDsr: project.dailyReports.slice(0, 7),
  };
}

export async function getRabItemsWithProgress(): Promise<RabItemData[]> {
  const items = await prisma.rabItem.findMany({
    where: { projectId: PROJECT_ID },
    orderBy: { urutan: 'asc' },
    include: {
      progressEntries: {
        where: {
          isPekerjaanTambah: false,
          dailyReport: {
            status: { in: ['APPROVED', 'SUBMITTED'] },
          },
        },
      },
    },
  });

  return items.map((item) => {
    const volDone = item.progressEntries.reduce((acc, curr) => acc + curr.volumeHariIni, 0);
    const pct = item.volume > 0 ? Math.min((volDone / item.volume) * 100, 100) : 0;
    return {
      id: item.id,
      kode: item.kode,
      parentKode: item.parentKode,
      kategori: item.kategori,
      subKategori: item.subKategori,
      uraian: item.uraian,
      volume: item.volume,
      satuan: item.satuan,
      hargaUpah: item.hargaUpah,
      hargaBahan: item.hargaBahan,
      totalHarga: item.totalHarga,
      bobotPersen: item.bobotPersen,
      bobotJadwalAsli: item.bobotJadwalAsli,
      selisihBobot: item.selisihBobot,
      statusRekonsiliasi: item.statusRekonsiliasi,
      urutan: item.urutan,
      volumeCumulative: Number(volDone.toFixed(2)),
      percentCumulative: Number(pct.toFixed(1)),
    };
  });
}

export async function getRabProgressPageData(): Promise<RabProgressPageData> {
  const items = await prisma.rabItem.findMany({
    where: { projectId: PROJECT_ID },
    orderBy: { urutan: 'asc' },
    include: {
      progressEntries: {
        where: {
          isPekerjaanTambah: false,
          dailyReport: {
            status: { in: ['APPROVED', 'SUBMITTED'] },
          },
        },
        include: {
          dailyReport: {
            select: {
              id: true,
              tanggal: true,
              hariKerjaKe: true,
              status: true,
            },
          },
        },
        orderBy: {
          dailyReport: {
            tanggal: 'desc',
          },
        },
      },
    },
  });

  let totalActualProgressSchedule = 0;
  let totalActualProgressRab = 0;
  let totalNilaiTerpasang = 0;
  let completedItems = 0;
  let inProgressItems = 0;
  let notStartedItems = 0;

  const categoriesMap = new Map<string, Set<string>>();

  const detailedItems: RabProgressItemDetail[] = items.map((item) => {
    if (!categoriesMap.has(item.kategori)) {
      categoriesMap.set(item.kategori, new Set());
    }
    categoriesMap.get(item.kategori)!.add(item.subKategori);

    const volDone = item.progressEntries.reduce((acc, curr) => acc + curr.volumeHariIni, 0);
    const pct = item.volume > 0 ? (volDone / item.volume) * 100 : 0;
    const ratio = item.volume > 0 ? Math.min(volDone / item.volume, 1.0) : 0;

    totalActualProgressSchedule += ratio * item.bobotJadwalAsli;
    totalActualProgressRab += ratio * item.bobotPersen;

    const nilaiTerpasang = Math.round(ratio * item.totalHarga);
    totalNilaiTerpasang += nilaiTerpasang;

    if (pct >= 99.9) {
      completedItems++;
    } else if (pct > 0.01) {
      inProgressItems++;
    } else {
      notStartedItems++;
    }

    const latestReport = item.progressEntries[0]?.dailyReport;

    return {
      id: item.id,
      kode: item.kode,
      parentKode: item.parentKode,
      kategori: item.kategori,
      subKategori: item.subKategori,
      uraian: item.uraian,
      volume: item.volume,
      satuan: item.satuan,
      hargaUpah: item.hargaUpah,
      hargaBahan: item.hargaBahan,
      totalHarga: item.totalHarga,
      bobotPersen: item.bobotPersen,
      bobotJadwalAsli: item.bobotJadwalAsli,
      selisihBobot: item.selisihBobot,
      statusRekonsiliasi: item.statusRekonsiliasi,
      urutan: item.urutan,
      volumeCumulative: Number(volDone.toFixed(2)),
      percentCumulative: Number(pct.toFixed(1)),
      nilaiTerpasang,
      entriesCount: item.progressEntries.length,
      lastUpdatedDate: latestReport ? latestReport.tanggal.toISOString().split('T')[0] : null,
      history: item.progressEntries.map((pe) => ({
        reportId: pe.dailyReport.id,
        tanggal: pe.dailyReport.tanggal.toISOString().split('T')[0],
        hariKerjaKe: pe.dailyReport.hariKerjaKe,
        volumeHariIni: pe.volumeHariIni,
        lokasiKerja: pe.lokasiKerja,
        catatan: pe.catatan,
        status: pe.dailyReport.status,
      })),
    };
  });

  const totalNilaiRab = items.reduce((acc, i) => acc + i.totalHarga, 0);
  const totalBobotRab = items.reduce((acc, i) => acc + i.bobotPersen, 0);

  const categories = Array.from(categoriesMap.entries()).map(([name, subCats]) => ({
    name,
    subCategories: Array.from(subCats),
  }));

  return {
    summary: {
      totalItems: items.length,
      completedItems,
      inProgressItems,
      notStartedItems,
      totalNilaiRab,
      totalNilaiTerpasang,
      totalBobotRab: Number(totalBobotRab.toFixed(2)),
      totalProgressSchedule: Number(totalActualProgressSchedule.toFixed(2)),
      totalProgressRab: Number(totalActualProgressRab.toFixed(2)),
    },
    categories,
    items: detailedItems,
  };
}

export async function getDsrList() {
  return await prisma.dailyReport.findMany({
    where: { projectId: PROJECT_ID },
    orderBy: { tanggal: 'desc' },
    include: {
      dibuatOleh: true,
      disetujuiOleh: true,
      progressEntries: { include: { rabItem: true } },
      manpowers: true,
      issues: true,
      photos: true,
    },
  });
}

export async function getDsrById(id: string) {
  return await prisma.dailyReport.findUnique({
    where: { id },
    include: {
      dibuatOleh: true,
      disetujuiOleh: true,
      progressEntries: {
        include: { rabItem: true },
      },
      manpowers: true,
      equipments: true,
      materialLogs: true,
      issues: true,
      photos: {
        include: { rabItem: true },
      },
    },
  });
}

export async function saveDsr(data: DsrFormData) {
  const targetDate = new Date(`${data.tanggal}T00:00:00.000Z`);

  // Transaction: Create or update report and its children
  const result = await prisma.$transaction(async (tx) => {
    let reportId = data.id;

    if (reportId) {
      // Delete old children to replace with updated ones
      await tx.progressEntry.deleteMany({ where: { dailyReportId: reportId } });
      await tx.manpower.deleteMany({ where: { dailyReportId: reportId } });
      await tx.equipment.deleteMany({ where: { dailyReportId: reportId } });
      await tx.materialLog.deleteMany({ where: { dailyReportId: reportId } });
      await tx.issue.deleteMany({ where: { dailyReportId: reportId } });
      await tx.photo.deleteMany({ where: { dailyReportId: reportId } });

      const currentUser = await getSessionUser();

      await tx.dailyReport.update({
        where: { id: reportId },
        data: {
          tanggal: targetDate,
          hariKerjaKe: data.hariKerjaKe,
          cuacaPagi: data.cuacaPagi,
          cuacaSiang: data.cuacaSiang,
          cuacaSore: data.cuacaSore,
          jamMulai: data.jamMulai,
          jamSelesai: data.jamSelesai,
          jamTerhentiCuaca: data.jamTerhentiCuaca,
          status: data.status,
          isBackdated: data.isBackdated,
          catatanUmum: data.catatanUmum,
          rencanaBesok: data.rencanaBesok,
          catatanK3: data.catatanK3,
          adaInsidenK3: data.adaInsidenK3,
          ...(currentUser ? { dibuatOlehId: currentUser.id } : {}),
        },
      });
    } else {
      const currentUser = await getSessionUser();
      const created = await tx.dailyReport.create({
        data: {
          projectId: PROJECT_ID,
          tanggal: targetDate,
          hariKerjaKe: data.hariKerjaKe,
          cuacaPagi: data.cuacaPagi,
          cuacaSiang: data.cuacaSiang,
          cuacaSore: data.cuacaSore,
          jamMulai: data.jamMulai,
          jamSelesai: data.jamSelesai,
          jamTerhentiCuaca: data.jamTerhentiCuaca,
          status: data.status,
          isBackdated: data.isBackdated,
          catatanUmum: data.catatanUmum,
          rencanaBesok: data.rencanaBesok,
          catatanK3: data.catatanK3,
          adaInsidenK3: data.adaInsidenK3,
          dibuatOlehId: currentUser?.id || null,
        },
      });
      reportId = created.id;
    }

    // Insert children
    if (data.progressEntries.length > 0) {
      await tx.progressEntry.createMany({
        data: data.progressEntries.map((e) => ({
          dailyReportId: reportId!,
          rabItemId: e.rabItemId,
          volumeHariIni: e.volumeHariIni,
          lokasiKerja: e.lokasiKerja,
          isPekerjaanTambah: e.isPekerjaanTambah || false,
          catatan: e.catatan,
        })),
      });
    }

    if (data.manpowers.length > 0) {
      await tx.manpower.createMany({
        data: data.manpowers.map((m) => ({
          dailyReportId: reportId!,
          kategori: m.kategori,
          jumlah: m.jumlah,
        })),
      });
    }

    if (data.equipments.length > 0) {
      await tx.equipment.createMany({
        data: data.equipments.map((eq) => ({
          dailyReportId: reportId!,
          namaAlat: eq.namaAlat,
          jumlah: eq.jumlah,
          status: eq.status,
        })),
      });
    }

    if (data.materialLogs.length > 0) {
      await tx.materialLog.createMany({
        data: data.materialLogs.map((mat) => ({
          dailyReportId: reportId!,
          namaMaterial: mat.namaMaterial,
          jumlah: mat.jumlah,
          satuan: mat.satuan,
          noSuratJalan: mat.noSuratJalan,
          pemasok: mat.pemasok,
          fotoSuratJalan: mat.fotoSuratJalan,
        })),
      });
    }

    if (data.issues.length > 0) {
      await tx.issue.createMany({
        data: data.issues.map((iss) => ({
          dailyReportId: reportId!,
          kategori: iss.kategori,
          deskripsi: iss.deskripsi,
          dampakJam: iss.dampakJam,
          tindakan: iss.tindakan,
          status: iss.status,
          pic: iss.pic,
        })),
      });
    }

    if (data.photos.length > 0) {
      await tx.photo.createMany({
        data: data.photos.map((ph) => ({
          dailyReportId: reportId!,
          rabItemId: ph.rabItemId || null,
          url: ph.url,
          thumbUrl: ph.thumbUrl,
          kategori: ph.kategori,
          keterangan: ph.keterangan,
          lat: ph.lat,
          lng: ph.lng,
        })),
      });
    }

    return reportId;
  });

  revalidatePath('/dsr');
  revalidatePath('/');
  return { success: true, id: result };
}

export async function approveDsr(id: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'PM' && currentUser.role !== 'ADMIN')) {
    return {
      success: false,
      error: 'Akses ditolak. Hanya Project Manager atau Administrator yang dapat menyetujui laporan.',
    };
  }

  await prisma.dailyReport.update({
    where: { id },
    data: {
      status: 'APPROVED',
      disetujuiOlehId: currentUser.id,
      disetujuiPada: new Date(),
    },
  });
  revalidatePath(`/dsr/${id}`);
  revalidatePath('/dsr');
  revalidatePath('/');
  return { success: true };
}

export async function requestRevisionDsr(id: string, notes: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'PM' && currentUser.role !== 'ADMIN')) {
    return {
      success: false,
      error: 'Akses ditolak. Hanya Project Manager atau Administrator yang dapat meminta revisi.',
    };
  }

  await prisma.dailyReport.update({
    where: { id },
    data: {
      status: 'REVISI',
      catatanRevisi: notes,
    },
  });
  revalidatePath(`/dsr/${id}`);
  revalidatePath('/dsr');
  return { success: true };
}

export async function deleteDsr(id: string) {
  const currentUser = await getSessionUser();
  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'PM')) {
    return {
      success: false,
      error: 'Akses ditolak. Hanya Administrator atau Project Manager yang dapat menghapus laporan.',
    };
  }

  await prisma.dailyReport.delete({
    where: { id },
  });
  revalidatePath('/dsr');
  revalidatePath('/');
  revalidatePath('/rab');
  revalidatePath('/termin');
  return { success: true };
}

export async function getTerminClaimData() {
  const rabItems = await getRabItemsWithProgress();
  const grandTotal = PROJECT_CONFIG.contractValue;

  let totalClaimRupiah = 0;
  const itemsWithClaim = rabItems.map((item) => {
    const volClaim = item.volumeCumulative || 0;
    const itemClaimRupiah = (volClaim / (item.volume || 1)) * item.totalHarga;
    totalClaimRupiah += itemClaimRupiah;
    return {
      ...item,
      volClaim,
      itemClaimRupiah: Math.round(itemClaimRupiah),
      claimPercent: Number(((itemClaimRupiah / grandTotal) * 100).toFixed(2)),
    };
  });

  const totalClaimPercent = Number(((totalClaimRupiah / grandTotal) * 100).toFixed(2));

  return {
    grandTotal,
    totalClaimRupiah: Math.round(totalClaimRupiah),
    totalClaimPercent,
    items: itemsWithClaim,
    termins: [
      { name: 'Termin 1 (DP)', targetPercent: 30, nilaiRupiah: grandTotal * 0.3, status: 'DIBAYAR' },
      { name: 'Termin 2', targetPercent: 40, nilaiRupiah: grandTotal * 0.4, status: totalClaimPercent >= 70 ? 'SIAP_KLAIM' : 'BELUM_CAPAI' },
      { name: 'Termin 3 (BAST)', targetPercent: 25, nilaiRupiah: grandTotal * 0.25, status: totalClaimPercent >= 95 ? 'SIAP_KLAIM' : 'BELUM_CAPAI' },
      { name: 'Retensi', targetPercent: 5, nilaiRupiah: grandTotal * 0.05, status: 'MASA_RETENSI' },
    ],
  };
}
