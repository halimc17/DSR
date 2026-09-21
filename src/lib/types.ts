export interface RabItemData {
  id: string;
  kode: string;
  parentKode?: string | null;
  kategori: string;
  subKategori: string;
  uraian: string;
  volume: number;
  satuan: string;
  hargaUpah: number;
  hargaBahan: number;
  totalHarga: number;
  bobotPersen: number;
  bobotJadwalAsli: number;
  selisihBobot: number;
  statusRekonsiliasi: string;
  urutan: number;
  volumeCumulative?: number;
  percentCumulative?: number;
}

export interface ProgressInput {
  rabItemId: string;
  volumeHariIni: number;
  lokasiKerja?: string;
  isPekerjaanTambah?: boolean;
  catatan?: string;
}

export interface ManpowerInput {
  kategori: string;
  jumlah: number;
}

export interface EquipmentInput {
  namaAlat: string;
  jumlah: number;
  status: 'BEROPERASI' | 'STANDBY' | 'RUSAK';
}

export interface MaterialInput {
  namaMaterial: string;
  jumlah: number;
  satuan: string;
  noSuratJalan?: string;
  pemasok?: string;
  fotoSuratJalan?: string;
}

export interface IssueInput {
  kategori: string;
  deskripsi: string;
  dampakJam: number;
  tindakan?: string;
  status: 'OPEN' | 'CLOSED';
  pic?: string;
}

export interface PhotoInput {
  rabItemId?: string;
  url: string;
  thumbUrl?: string;
  kategori: 'PROGRES' | 'MATERIAL' | 'K3' | 'KENDALA' | 'BEFORE_AFTER';
  keterangan?: string;
  lat?: number;
  lng?: number;
}

export interface DsrFormData {
  id?: string;
  tanggal: string; // YYYY-MM-DD
  hariKerjaKe: number;
  cuacaPagi: string;
  cuacaSiang: string;
  cuacaSore: string;
  jamMulai: string;
  jamSelesai: string;
  jamTerhentiCuaca: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REVISI';
  isBackdated: boolean;
  catatanUmum?: string;
  rencanaBesok?: string;
  catatanK3?: string;
  adaInsidenK3: boolean;
  progressEntries: ProgressInput[];
  manpowers: ManpowerInput[];
  equipments: EquipmentInput[];
  materialLogs: MaterialInput[];
  issues: IssueInput[];
  photos: PhotoInput[];
}
