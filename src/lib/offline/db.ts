import Dexie, { type EntityTable } from 'dexie';
import type { DsrFormData } from '../types';

export interface OfflineDsrDraft {
  localId: string;
  projectId: string;
  tanggal: string;
  data: DsrFormData;
  savedAt: number;
  syncStatus: 'DRAFT_LOCAL' | 'PENDING_SYNC' | 'SYNCED';
  errorMessage?: string;
}

export interface OfflinePhotoQueue {
  id: string;
  dailyReportDate: string;
  rabItemId?: string;
  dataUrl: string;
  kategori: string;
  keterangan?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  synced: boolean;
}

const db = new Dexie('DailySiteReportDB') as Dexie & {
  drafts: EntityTable<OfflineDsrDraft, 'localId'>;
  photoQueue: EntityTable<OfflinePhotoQueue, 'id'>;
};

// Schema declaration:
db.version(1).stores({
  drafts: 'localId, tanggal, syncStatus, savedAt',
  photoQueue: 'id, dailyReportDate, synced, createdAt',
});

export { db };
