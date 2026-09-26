'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DsrFormData, RabItemData, ProgressInput, ManpowerInput, EquipmentInput, MaterialInput, IssueInput, PhotoInput } from '@/lib/types';
import { saveDsr } from '@/app/actions/dsr';
import { getWorkdayNumber } from '@/lib/calculations';
import { addWatermarkToImage } from '@/lib/watermark';
import { db } from '@/lib/offline/db';
import {
  Calendar,
  CloudSun,
  Users,
  HardHat,
  Wrench,
  PackageCheck,
  AlertTriangle,
  Camera,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Wifi,
  WifiOff,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

interface DsrFormProps {
  rabItems: RabItemData[];
  initialData?: DsrFormData;
}

const DEFAULT_MANPOWER_CATEGORIES = [
  'Pelaksana',
  'Mandor',
  'Kepala Tukang',
  'Tukang',
  'Tukang Sipil / Batu',
  'Tukang Kayu / Partisi',
  'Tukang Besi / Baja',
  'Tukang Listrik (MEP)',
  'Tukang Plumbing (Air/RO)',
  'Kenek / Helper',
  'HSE',
  'Safety Officer (K3)',
];

const WEATHER_OPTIONS = ['Cerah', 'Berawan', 'Hujan Ringan', 'Hujan Deras'];
const ISSUE_CATEGORIES = [
  'Cuaca',
  'Material Terlambat',
  'Tenaga Kerja Kurang',
  'Instruksi RS / AbadiNusa',
  'Akses Lokasi RS Aktif (Pasien/Debu)',
  'Listrik / Air Padam',
  'Lainnya',
];

const TABS = [
  { id: 'info', label: '1. Kondisi & Cuaca', icon: CloudSun },
  { id: 'manpower', label: '2. Tenaga Kerja', icon: Users },
  { id: 'progress', label: '3. Progres RAB', icon: HardHat },
  { id: 'photos', label: '4. Foto', icon: Camera },
  { id: 'material', label: '5. Material', icon: PackageCheck },
  { id: 'equipment', label: '6. Alat', icon: Wrench },
  { id: 'issues', label: '7. Kendala', icon: AlertTriangle },
  { id: 'k3', label: '8. K3 & Besok', icon: CheckCircle2 },
] as const;

type TabId = typeof TABS[number]['id'];

export function DsrForm({ rabItems, initialData }: DsrFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('info');

  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState<DsrFormData>(() => {
    if (initialData) {
      const existingMap = new Map(initialData.manpowers.map((m) => [m.kategori, m.jumlah]));
      const merged = DEFAULT_MANPOWER_CATEGORIES.map((k) => ({
        kategori: k,
        jumlah: existingMap.get(k) ?? 0,
      }));
      initialData.manpowers.forEach((m) => {
        if (!DEFAULT_MANPOWER_CATEGORIES.includes(m.kategori)) {
          merged.push(m);
        }
      });
      return {
        ...initialData,
        manpowers: merged,
      };
    }
    return {
      tanggal: todayStr,
      hariKerjaKe: getWorkdayNumber(new Date()),
      cuacaPagi: 'Cerah',
      cuacaSiang: 'Cerah',
      cuacaSore: 'Cerah',
      jamMulai: '08:00',
      jamSelesai: '17:00',
      jamTerhentiCuaca: 0,
      status: 'DRAFT',
      isBackdated: false,
      catatanUmum: '',
      rencanaBesok: '',
      catatanK3: 'Penggunaan APD lengkap (helm, rompi, sepatu safety, masker debu). Area kerja tertutup pagar plastik.',
      adaInsidenK3: false,
      progressEntries: [],
      manpowers: DEFAULT_MANPOWER_CATEGORIES.map((k) => ({ kategori: k, jumlah: 0 })),
      equipments: [
        { namaAlat: 'Mesin Las / Bor', jumlah: 1, status: 'BEROPERASI' },
        { namaAlat: 'Gerinda Potong', jumlah: 2, status: 'BEROPERASI' },
      ],
      materialLogs: [],
      issues: [],
      photos: [],
    };
  });

  // Track online status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update workday number when date changes
  const handleDateChange = (newDateStr: string) => {
    const d = new Date(newDateStr);
    const wk = getWorkdayNumber(d);
    const isPast = newDateStr < todayStr;
    setFormData((prev) => ({
      ...prev,
      tanggal: newDateStr,
      hariKerjaKe: wk,
      isBackdated: isPast,
    }));
  };

  // Stepper navigation
  const currentTabIndex = TABS.findIndex((t) => t.id === activeTab);
  const goToNextTab = () => {
    if (currentTabIndex < TABS.length - 1) {
      setActiveTab(TABS[currentTabIndex + 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const goToPrevTab = () => {
    if (currentTabIndex > 0) {
      setActiveTab(TABS[currentTabIndex - 1].id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Manpower stepper
  const updateManpower = (kategori: string, delta: number) => {
    setFormData((prev) => ({
      ...prev,
      manpowers: prev.manpowers.map((m) =>
        m.kategori === kategori ? { ...m, jumlah: Math.max(0, m.jumlah + delta) } : m
      ),
    }));
  };

  const setManpowerCount = (kategori: string, val: number) => {
    setFormData((prev) => ({
      ...prev,
      manpowers: prev.manpowers.map((m) =>
        m.kategori === kategori ? { ...m, jumlah: Math.max(0, val) } : m
      ),
    }));
  };

  const [isAddingManpower, setIsAddingManpower] = useState(false);
  const [newManpowerName, setNewManpowerName] = useState('');

  const handleAddCustomManpower = () => {
    const trimmed = newManpowerName.trim();
    if (!trimmed) return;
    if (!formData.manpowers.some((m) => m.kategori.toLowerCase() === trimmed.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        manpowers: [...prev.manpowers, { kategori: trimmed, jumlah: 0 }],
      }));
    }
    setNewManpowerName('');
    setIsAddingManpower(false);
  };

  const totalHeadcount = formData.manpowers.reduce((acc, curr) => acc + curr.jumlah, 0);

  // Progress entry handlers
  const addProgressEntry = () => {
    if (rabItems.length === 0) return;
    setFormData((prev) => ({
      ...prev,
      progressEntries: [
        ...prev.progressEntries,
        {
          rabItemId: rabItems[0].id,
          volumeHariIni: 0,
          lokasiKerja: 'Ruang Hemodialisa',
          isPekerjaanTambah: false,
          catatan: '',
        },
      ],
    }));
  };

  const removeProgressEntry = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      progressEntries: prev.progressEntries.filter((_, i) => i !== index),
    }));
  };

  const updateProgressEntry = (index: number, field: keyof ProgressInput, val: any) => {
    setFormData((prev) => {
      const updated = [...prev.progressEntries];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, progressEntries: updated };
    });
  };

  // Photo handlers with Canvas watermarking
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, rabItemId?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const itemObj = rabItems.find((r) => r.id === rabItemId);
        const { dataUrl } = await addWatermarkToImage(file, {
          projectName: 'RS PERTAMINA PRABUMULIH',
          contractorName: 'PT MITRA BANGUN MAHAKARYA',
          rabCode: itemObj ? `${itemObj.kode} - ${itemObj.uraian.slice(0, 30)}` : undefined,
          timestamp: new Date(formData.tanggal),
        });

        setFormData((prev) => ({
          ...prev,
          photos: [
            ...prev.photos,
            {
              url: dataUrl,
              rabItemId: rabItemId || undefined,
              kategori: 'PROGRES',
              keterangan: itemObj ? `Progres pekerjaan ${itemObj.kode}` : 'Dokumentasi lapangan',
            },
          ],
        }));
      } catch (err) {
        console.error('Failed to watermark photo:', err);
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  // Save / Submit
  const handleSubmit = async (status: 'DRAFT' | 'SUBMITTED') => {
    setIsSubmitting(true);
    const dataToSave = { ...formData, status };

    try {
      if (!isOnline) {
        // Save to Dexie IndexedDB
        const localId = formData.id || `local-${Date.now()}`;
        await db.drafts.put({
          localId,
          projectId: 'rs-pertamina-prabumulih',
          tanggal: formData.tanggal,
          data: dataToSave,
          savedAt: Date.now(),
          syncStatus: 'DRAFT_LOCAL',
        });
        alert('Disimpan di penyimpanan lokal perangkat (Offline). Laporan akan disinkronkan otomatis saat terhubung internet.');
        router.push('/dsr');
        return;
      }

      // Save to server
      const res = await saveDsr(dataToSave);
      if (res.success) {
        router.push(`/dsr/${res.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan laporan. Data telah diamankan di penyimpanan lokal perangkat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-28">
      {/* Header bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Form Daily Site Report</h1>
            {formData.isBackdated && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Backdate
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            RS Umum Pertamina Prabumulih &bull; PT Mitra Bangun Mahakarya
          </p>
        </div>

        {/* Network indicator */}
        <div className="flex items-center space-x-2 text-xs">
          {isOnline ? (
            <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-emerald-200">
              <Wifi className="w-3 h-3 mr-1" /> Online (PostgreSQL)
            </span>
          ) : (
            <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-bold text-[11px] border border-amber-200">
              <WifiOff className="w-3 h-3 mr-1" /> Offline (Tersimpan Lokal)
            </span>
          )}
        </div>
      </div>

      {/* Tabs navigation - Mobile touch-optimized scroll */}
      <div className="flex overflow-x-auto pb-1.5 space-x-1.5 scrollbar-none no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              <span>{tab.label}</span>
              {tab.id === 'manpower' && totalHeadcount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-medium">
                  {totalHeadcount}
                </span>
              )}
              {tab.id === 'progress' && formData.progressEntries.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                  {formData.progressEntries.length}
                </span>
              )}
              {tab.id === 'photos' && formData.photos.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-medium">
                  {formData.photos.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Kondisi & Cuaca */}
      {activeTab === 'info' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
              <CloudSun className="w-5 h-5 mr-2 text-amber-500" />
              Kondisi Harian & Cuaca
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Langkah 1 dari 8</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Laporan</label>
              <input
                type="date"
                value={formData.tanggal}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Hari Kerja ke-{formData.hariKerjaKe} dari 60</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Jam Kerja</label>
              <div className="flex items-center space-x-2">
                <input
                  type="time"
                  value={formData.jamMulai}
                  onChange={(e) => setFormData({ ...formData, jamMulai: e.target.value })}
                  className="w-full px-2.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
                <span className="text-slate-400 text-xs">s/d</span>
                <input
                  type="time"
                  value={formData.jamSelesai}
                  onChange={(e) => setFormData({ ...formData, jamSelesai: e.target.value })}
                  className="w-full px-2.5 py-2.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-700 mb-1">
                Jam Berhenti Akibat Cuaca (Jam)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="12"
                value={formData.jamTerhentiCuaca}
                onChange={(e) => setFormData({ ...formData, jamTerhentiCuaca: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-rose-200 bg-rose-50/40 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <p className="text-[10px] sm:text-[11px] text-rose-600 mt-1">Bukti force majeure/perpanjangan waktu</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 sm:pt-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">Cuaca Harian Lapangan</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {(['cuacaPagi', 'cuacaSiang', 'cuacaSore'] as const).map((wKey) => {
                const title = wKey === 'cuacaPagi' ? 'Pagi (08:00 - 12:00)' : wKey === 'cuacaSiang' ? 'Siang (12:00 - 15:00)' : 'Sore/Malam (15:00 - 17:00)';
                return (
                  <div key={wKey} className="bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 block mb-1.5">{title}</span>
                    <select
                      value={formData[wKey]}
                      onChange={(e) => setFormData({ ...formData, [wKey]: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    >
                      {WEATHER_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Umum / Ringkasan Pekerjaan Hari Ini</label>
            <textarea
              rows={3}
              value={formData.catatanUmum || ''}
              onChange={(e) => setFormData({ ...formData, catatanUmum: e.target.value })}
              placeholder="Contoh: Pembongkaran dinding keramik ruang isolasi selesai 50%, dilanjutkan perapian puing..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: Tenaga Kerja */}
      {activeTab === 'manpower' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Tenaga Kerja Lapangan
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                16 tenaga kerja terdaftar BPJS Ketenagakerjaan MBM di RS Pertamina
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500">Total:</span>
              <span className="text-lg sm:text-xl font-semibold text-blue-700 ml-1.5">{totalHeadcount} Org</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {formData.manpowers.map((m) => (
              <div
                key={m.kategori}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
              >
                <div className="flex items-center space-x-1.5 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{m.kategori}</span>
                  {!DEFAULT_MANPOWER_CATEGORIES.includes(m.kategori) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          manpowers: prev.manpowers.filter((x) => x.kategori !== m.kategori),
                        }))
                      }
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="Hapus kategori kustom"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {/* Finger-friendly 44px min tap targets */}
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updateManpower(m.kategori, -1)}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold text-lg hover:bg-slate-100 active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={m.jumlah}
                    onChange={(e) => setManpowerCount(m.kategori, Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-10 text-center text-sm font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg py-1 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateManpower(m.kategori, 1)}
                    className="w-10 h-10 rounded-xl bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 active:scale-95 flex items-center justify-center shadow-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom category adder */}
          <div className="pt-2 border-t border-slate-100">
            {!isAddingManpower ? (
              <button
                type="button"
                onClick={() => setIsAddingManpower(true)}
                className="inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Tambah Kategori Tenaga Kerja Lainnya
              </button>
            ) : (
              <div className="flex items-center space-x-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Nama jabatan / kategori baru..."
                  value={newManpowerName}
                  onChange={(e) => setNewManpowerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomManpower();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomManpower}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Tambah
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingManpower(false);
                    setNewManpowerName('');
                  }}
                  className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: Progres Pekerjaan (RAB-linked) */}
      {activeTab === 'progress' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <HardHat className="w-5 h-5 mr-2 text-emerald-600" />
                Progres Pekerjaan Fisik (RAB)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Pilih dari 65 item RAB kontrak &bull; Progres otomatis dihitung
              </p>
            </div>
            <button
              type="button"
              onClick={addProgressEntry}
              className="inline-flex items-center px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </button>
          </div>

          {formData.progressEntries.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
              <HardHat className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada item progres ditambahkan</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Tap tombol di bawah untuk memilih pekerjaan yang dikerjakan hari ini</p>
              <button
                type="button"
                onClick={addProgressEntry}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow active:scale-95"
              >
                + Tambah Item Pekerjaan
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {formData.progressEntries.map((entry, idx) => {
                const rabItem = rabItems.find((r) => r.id === entry.rabItemId) || rabItems[0];
                const volumeKumulatif = (rabItem?.volumeCumulative || 0) + (entry.volumeHariIni || 0);
                const isOverContract = rabItem ? volumeKumulatif > rabItem.volume : false;

                const impactSchedule = rabItem && rabItem.volume > 0
                  ? ((entry.volumeHariIni / rabItem.volume) * rabItem.bobotJadwalAsli).toFixed(3)
                  : '0.000';
                const impactRab = rabItem && rabItem.volume > 0
                  ? ((entry.volumeHariIni / rabItem.volume) * rabItem.bobotPersen).toFixed(3)
                  : '0.000';

                return (
                  <div key={idx} className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeProgressEntry(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
                      <div className="sm:col-span-8">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Item RAB ({rabItem?.kategori})
                        </label>
                        <select
                          value={entry.rabItemId}
                          onChange={(e) => updateProgressEntry(idx, 'rabItemId', e.target.value)}
                          className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                        >
                          {rabItems.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.kode} &bull; {r.uraian} ({r.volume} {r.satuan})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Volume Hari Ini ({rabItem?.satuan})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.volumeHariIni}
                          onChange={(e) => updateProgressEntry(idx, 'volumeHariIni', parseFloat(e.target.value) || 0)}
                          className={`w-full px-3 py-2 bg-white border rounded-xl text-base sm:text-sm font-medium ${
                            isOverContract && !entry.isPekerjaanTambah ? 'border-rose-500 text-rose-700' : 'border-slate-300'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs gap-1.5">
                      <div className="text-slate-600">
                        Kontrak: <span className="font-bold text-slate-800">{rabItem?.volume} {rabItem?.satuan}</span> &bull; Kumulatif: <span className="font-medium text-blue-700">{volumeKumulatif.toFixed(2)} {rabItem?.satuan}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] font-medium">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +{impactSchedule}% (Jadwal)
                        </span>
                        <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          +{impactRab}% (RAB)
                        </span>
                      </div>
                    </div>

                    {isOverContract && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span>Peringatan: Melebihi volume kontrak!</span>
                        <label className="flex items-center space-x-1 font-bold text-[11px]">
                          <input
                            type="checkbox"
                            checked={entry.isPekerjaanTambah || false}
                            onChange={(e) => updateProgressEntry(idx, 'isPekerjaanTambah', e.target.checked)}
                          />
                          <span>Tandai Pekerjaan Tambah (VO)</span>
                        </label>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Lokasi kerja (mis. Ruang HD Isolasi)"
                        value={entry.lokasiKerja || ''}
                        onChange={(e) => updateProgressEntry(idx, 'lokasiKerja', e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Catatan tambahan pekerjaan"
                        value={entry.catatan || ''}
                        onChange={(e) => updateProgressEntry(idx, 'catatan', e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Foto Dokumentasi (Watermark Otomatis) */}
      {activeTab === 'photos' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-indigo-600" />
                Dokumentasi Foto Lapangan
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Watermark otomatis: WIB, Proyek, GPS, Kode RAB (Pasal 8 PKS)
              </p>
            </div>
            <label className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer shadow-md active:scale-95">
              <Camera className="w-4 h-4 mr-2" />
              Ambil / Unggah Foto
              <input
                type="file"
                accept="image/*"
                multiple
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {formData.photos.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
              <Camera className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Belum ada foto diunggah</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Pasal 8 PKS mewajibkan menyertakan bukti foto visual pekerjaan setiap hari
              </p>
              <label className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer shadow">
                <Camera className="w-4 h-4 mr-1.5" />
                Ambil Foto Kamera
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {formData.photos.map((ph, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm relative group">
                  <img src={ph.url} alt="Foto Progres" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="p-3 space-y-2 text-xs">
                    <select
                      value={ph.kategori}
                      onChange={(e) => {
                        const updated = [...formData.photos];
                        updated[idx].kategori = e.target.value as any;
                        setFormData({ ...formData, photos: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="PROGRES">Kategori: Progres Fisik</option>
                      <option value="MATERIAL">Kategori: Material / Surat Jalan</option>
                      <option value="K3">Kategori: K3 / Safety</option>
                      <option value="KENDALA">Kategori: Kendala Lapangan</option>
                      <option value="BEFORE_AFTER">Kategori: Sebelum & Sesudah</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Keterangan foto..."
                      value={ph.keterangan || ''}
                      onChange={(e) => {
                        const updated = [...formData.photos];
                        updated[idx].keterangan = e.target.value;
                        setFormData({ ...formData, photos: updated });
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 5: Material Masuk & Terpakai */}
      {activeTab === 'material' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <PackageCheck className="w-5 h-5 mr-2 text-amber-600" />
                Material Masuk & Surat Jalan
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Catat penerimaan material di lokasi proyek RS</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  materialLogs: [
                    ...prev.materialLogs,
                    { namaMaterial: '', jumlah: 1, satuan: 'Zak', noSuratJalan: '', pemasok: '' },
                  ],
                }));
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah
            </button>
          </div>

          {formData.materialLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Tidak ada material masuk hari ini</p>
          ) : (
            <div className="space-y-2.5">
              {formData.materialLogs.map((mat, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-5 gap-2 items-center text-xs">
                  <input
                    type="text"
                    placeholder="Nama Material (mis. Semen Gresik 50kg)"
                    value={mat.namaMaterial}
                    onChange={(e) => {
                      const updated = [...formData.materialLogs];
                      updated[idx].namaMaterial = e.target.value;
                      setFormData({ ...formData, materialLogs: updated });
                    }}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <div className="flex space-x-1.5">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={mat.jumlah}
                      onChange={(e) => {
                        const updated = [...formData.materialLogs];
                        updated[idx].jumlah = parseFloat(e.target.value) || 0;
                        setFormData({ ...formData, materialLogs: updated });
                      }}
                      className="w-1/2 px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Satuan"
                      value={mat.satuan}
                      onChange={(e) => {
                        const updated = [...formData.materialLogs];
                        updated[idx].satuan = e.target.value;
                        setFormData({ ...formData, materialLogs: updated });
                      }}
                      className="w-1/2 px-2.5 py-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="No. Surat Jalan / Toko"
                    value={mat.noSuratJalan || ''}
                    onChange={(e) => {
                      const updated = [...formData.materialLogs];
                      updated[idx].noSuratJalan = e.target.value;
                      setFormData({ ...formData, materialLogs: updated });
                    }}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        materialLogs: prev.materialLogs.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-rose-600 font-bold hover:text-rose-800 text-right p-1"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: Peralatan */}
      {activeTab === 'equipment' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-slate-700" />
                Peralatan Kerja di Lokasi
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Status alat yang digunakan di area RS</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  equipments: [
                    ...prev.equipments,
                    { namaAlat: '', jumlah: 1, status: 'BEROPERASI' },
                  ],
                }));
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Tambah
            </button>
          </div>

          <div className="space-y-2.5">
            {formData.equipments.map((eq, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs">
                <input
                  type="text"
                  placeholder="Nama Alat (mis. Scaffolding, Molen, Bor)"
                  value={eq.namaAlat}
                  onChange={(e) => {
                    const updated = [...formData.equipments];
                    updated[idx].namaAlat = e.target.value;
                    setFormData({ ...formData, equipments: updated });
                  }}
                  className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
                <input
                  type="number"
                  min="1"
                  value={eq.jumlah}
                  onChange={(e) => {
                    const updated = [...formData.equipments];
                    updated[idx].jumlah = parseInt(e.target.value, 10) || 1;
                    setFormData({ ...formData, equipments: updated });
                  }}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                />
                <div className="flex items-center space-x-2">
                  <select
                    value={eq.status}
                    onChange={(e) => {
                      const updated = [...formData.equipments];
                      updated[idx].status = e.target.value as any;
                      setFormData({ ...formData, equipments: updated });
                    }}
                    className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="BEROPERASI">Beroperasi</option>
                    <option value="STANDBY">Standby</option>
                    <option value="RUSAK">Rusak</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        equipments: prev.equipments.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="text-rose-600 font-bold hover:text-rose-800 p-1"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 7: Kendala & Permasalahan */}
      {activeTab === 'issues' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-rose-600" />
                Kendala Lapangan & Mitigasi
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Bukti penunjang sah klaim perpanjangan waktu (Pasal 9 PKS)
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  issues: [
                    ...prev.issues,
                    {
                      kategori: 'Cuaca',
                      deskripsi: '',
                      dampakJam: 0,
                      tindakan: '',
                      status: 'OPEN',
                      pic: 'Site Manager',
                    },
                  ],
                }));
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Catat
            </button>
          </div>

          {formData.issues.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Tidak ada kendala kerja hari ini</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {formData.issues.map((iss, idx) => (
                <div key={idx} className="p-3.5 sm:p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3 relative text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        issues: prev.issues.filter((_, i) => i !== idx),
                      }));
                    }}
                    className="absolute top-3 right-3 text-rose-400 hover:text-rose-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Kategori</label>
                      <select
                        value={iss.kategori}
                        onChange={(e) => {
                          const updated = [...formData.issues];
                          updated[idx].kategori = e.target.value;
                          setFormData({ ...formData, issues: updated });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        {ISSUE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Dampak (Jam)</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={iss.dampakJam}
                        onChange={(e) => {
                          const updated = [...formData.issues];
                          updated[idx].dampakJam = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, issues: updated });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={iss.status}
                        onChange={(e) => {
                          const updated = [...formData.issues];
                          updated[idx].status = e.target.value as any;
                          setFormData({ ...formData, issues: updated });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="OPEN">OPEN (Terjadi)</option>
                        <option value="CLOSED">CLOSED (Selesai)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Deskripsi Kendala</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Hujan deras mengguyur area Prabumulih sehingga pekerjaan atap dihentikan..."
                      value={iss.deskripsi}
                      onChange={(e) => {
                        const updated = [...formData.issues];
                        updated[idx].deskripsi = e.target.value;
                        setFormData({ ...formData, issues: updated });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Tindakan Mitigasi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Menambah tenaga lembur besok..."
                      value={iss.tindakan || ''}
                      onChange={(e) => {
                        const updated = [...formData.issues];
                        updated[idx].tindakan = e.target.value;
                        setFormData({ ...formData, issues: updated });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 8: K3 & Rencana Besok */}
      {activeTab === 'k3' && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-teal-600" />
              K3 (CSMS) & Rencana Kerja Besok
            </h2>
            <span className="text-[11px] font-bold text-slate-400">Langkah 8 dari 8</span>
          </div>

          <div className="bg-teal-50/50 p-3.5 sm:p-4 rounded-xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-teal-900">Catatan K3 / CSMS Pertamina</label>
              <label className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                <input
                  type="checkbox"
                  checked={formData.adaInsidenK3}
                  onChange={(e) => setFormData({ ...formData, adaInsidenK3: e.target.checked })}
                />
                <span>Ada Insiden</span>
              </label>
            </div>
            <textarea
              rows={2}
              value={formData.catatanK3 || ''}
              onChange={(e) => setFormData({ ...formData, catatanK3: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-teal-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Rencana Kerja Besok</label>
            <textarea
              rows={3}
              value={formData.rencanaBesok || ''}
              onChange={(e) => setFormData({ ...formData, rencanaBesok: e.target.value })}
              placeholder="Contoh: Pasang dinding partisi konsultasi, instalasi pipa konduit kabel tray..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>
      )}

      {/* Step Navigation for Mobile (Next / Prev Step Buttons) */}
      <div className="flex items-center justify-between pt-2">
        {currentTabIndex > 0 ? (
          <button
            type="button"
            onClick={goToPrevTab}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Sebelumnya
          </button>
        ) : <div />}

        {currentTabIndex < TABS.length - 1 ? (
          <button
            type="button"
            onClick={goToNextTab}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm active:scale-95"
          >
            Selanjutnya
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        ) : <div />}
      </div>

      {/* Fixed Bottom Action Bar for Easy One-Hand Mobile Submission */}
      <div className="fixed bottom-12 md:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 py-2.5 px-4 shadow-2xl safe-area-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => handleSubmit('DRAFT')}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm active:scale-95 transition-colors"
          >
            <Save className="w-4 h-4 mr-1.5" />
            Simpan Draft
          </button>

          <button
            type="button"
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Menyimpan...' : 'Submit Laporan'}
          </button>
        </div>
      </div>
    </div>
  );
}
