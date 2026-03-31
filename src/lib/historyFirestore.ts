import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  type Firestore,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { fifteenMonthsAgoStart } from '@/lib/dvsaRetention';

export const HISTORY_PAGE_SIZE = 20;

export type PaginationMode = 'firestore' | 'client';

export type HistoryPagePayload<T> = {
  items: T[];
  hasMore: boolean;
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  paginationMode: PaginationMode;
};

export type ToolHistoryRow = {
  id: string;
  tool_id?: string;
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
  details?: string;
  user_email?: string;
};

export type VehicleInspectionRow = {
  id: string;
  vehicle_id?: string;
  inspected_by?: string;
  inspected_at?: Timestamp | string;
  has_defect?: boolean;
  mileage?: number;
  notes?: string;
  photo_urls?: Record<string, string>;
};

function isIndexError(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === 'failed-precondition' || Boolean(err?.message?.includes?.('index'));
}

async function fetchToolHistoryIndexed(
  db: Firestore,
  companyId: string,
  page: number,
  prevLastDoc: QueryDocumentSnapshot<DocumentData> | null | undefined
): Promise<Omit<HistoryPagePayload<ToolHistoryRow>, 'paginationMode'>> {
  if (page > 1 && !prevLastDoc) {
    throw new Error('Missing previous page cursor');
  }

  const fifteen = Timestamp.fromDate(fifteenMonthsAgoStart());
  const q =
    page > 1 && prevLastDoc
      ? query(
          collection(db, 'tool_history'),
          where('company_id', '==', companyId),
          where('timestamp', '>=', fifteen),
          orderBy('timestamp', 'desc'),
          startAfter(prevLastDoc),
          limit(HISTORY_PAGE_SIZE + 1)
        )
      : query(
          collection(db, 'tool_history'),
          where('company_id', '==', companyId),
          where('timestamp', '>=', fifteen),
          orderBy('timestamp', 'desc'),
          limit(HISTORY_PAGE_SIZE + 1)
        );

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > HISTORY_PAGE_SIZE;
  const slice = hasMore ? docs.slice(0, HISTORY_PAGE_SIZE) : docs;
  const items = slice.map((d) => ({ id: d.id, ...d.data() } as ToolHistoryRow));
  const lastDoc = slice.length > 0 ? slice[slice.length - 1]! : null;
  return { items, hasMore, lastDoc };
}

async function fetchToolHistoryFallback(
  db: Firestore,
  companyId: string,
  page: number
): Promise<Omit<HistoryPagePayload<ToolHistoryRow>, 'paginationMode'>> {
  const fifteen = Timestamp.fromDate(fifteenMonthsAgoStart());
  const fifteenMs = fifteen.toMillis();
  const fb = query(collection(db, 'tool_history'), where('company_id', '==', companyId), limit(80));
  const snap = await getDocs(fb);
  const all = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as ToolHistoryRow))
    .filter((row) => {
      const t = row.timestamp;
      if (t instanceof Timestamp) return t.toMillis() >= fifteenMs;
      if (typeof t === 'string') return new Date(t).getTime() >= fifteenMs;
      return false;
    })
    .sort((a, b) => {
      const am =
        a.timestamp instanceof Timestamp
          ? a.timestamp.toMillis()
          : a.timestamp
            ? new Date(a.timestamp as string).getTime()
            : 0;
      const bm =
        b.timestamp instanceof Timestamp
          ? b.timestamp.toMillis()
          : b.timestamp
            ? new Date(b.timestamp as string).getTime()
            : 0;
      return bm - am;
    });

  const start = (page - 1) * HISTORY_PAGE_SIZE;
  const pageSlice = all.slice(start, start + HISTORY_PAGE_SIZE + 1);
  const hasMore = pageSlice.length > HISTORY_PAGE_SIZE;
  const rows = hasMore ? pageSlice.slice(0, HISTORY_PAGE_SIZE) : pageSlice;
  return { items: rows, hasMore, lastDoc: null };
}

export async function fetchToolHistoryAssetsPage(
  db: Firestore,
  companyId: string,
  page: number,
  prev: HistoryPagePayload<ToolHistoryRow> | undefined
): Promise<HistoryPagePayload<ToolHistoryRow>> {
  if (page === 1) {
    try {
      const r = await fetchToolHistoryIndexed(db, companyId, 1, null);
      return { ...r, paginationMode: 'firestore' };
    } catch (e) {
      if (isIndexError(e)) {
        console.warn(
          '[History] tool_history: deploy composite index (company_id ASC, timestamp DESC) with timestamp >= filter.'
        );
        const r = await fetchToolHistoryFallback(db, companyId, 1);
        return { ...r, paginationMode: 'client' };
      }
      throw e;
    }
  }

  if (!prev) throw new Error('Missing previous page');

  if (prev.paginationMode === 'client') {
    const r = await fetchToolHistoryFallback(db, companyId, page);
    return { ...r, paginationMode: 'client' };
  }

  try {
    const r = await fetchToolHistoryIndexed(db, companyId, page, prev.lastDoc);
    return { ...r, paginationMode: 'firestore' };
  } catch (e) {
    if (isIndexError(e)) {
      const r = await fetchToolHistoryFallback(db, companyId, page);
      return { ...r, paginationMode: 'client' };
    }
    throw e;
  }
}

async function fetchInspectionsIndexed(
  db: Firestore,
  companyId: string,
  page: number,
  prevLastDoc: QueryDocumentSnapshot<DocumentData> | null | undefined
): Promise<Omit<HistoryPagePayload<VehicleInspectionRow>, 'paginationMode'>> {
  if (page > 1 && !prevLastDoc) {
    throw new Error('Missing previous page cursor');
  }

  const fifteen = Timestamp.fromDate(fifteenMonthsAgoStart());
  const q =
    page > 1 && prevLastDoc
      ? query(
          collection(db, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', fifteen),
          orderBy('inspected_at', 'desc'),
          startAfter(prevLastDoc),
          limit(HISTORY_PAGE_SIZE + 1)
        )
      : query(
          collection(db, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', fifteen),
          orderBy('inspected_at', 'desc'),
          limit(HISTORY_PAGE_SIZE + 1)
        );

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > HISTORY_PAGE_SIZE;
  const slice = hasMore ? docs.slice(0, HISTORY_PAGE_SIZE) : docs;
  const items = slice.map((d) => ({ id: d.id, ...d.data() } as VehicleInspectionRow));
  const lastDoc = slice.length > 0 ? slice[slice.length - 1]! : null;
  return { items, hasMore, lastDoc };
}

async function fetchInspectionsFallback(
  db: Firestore,
  companyId: string,
  page: number
): Promise<Omit<HistoryPagePayload<VehicleInspectionRow>, 'paginationMode'>> {
  const fifteen = Timestamp.fromDate(fifteenMonthsAgoStart());
  const fifteenMs = fifteen.toMillis();
  const fb = query(
    collection(db, 'vehicle_inspections'),
    where('company_id', '==', companyId),
    limit(80)
  );
  const snap = await getDocs(fb);
  const all = snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as VehicleInspectionRow))
    .filter((row) => {
      const t = row.inspected_at;
      if (t instanceof Timestamp) return t.toMillis() >= fifteenMs;
      if (typeof t === 'string') return new Date(t).getTime() >= fifteenMs;
      return false;
    })
    .sort((a, b) => {
      const am =
        a.inspected_at instanceof Timestamp
          ? a.inspected_at.toMillis()
          : a.inspected_at
            ? new Date(a.inspected_at as string).getTime()
            : 0;
      const bm =
        b.inspected_at instanceof Timestamp
          ? b.inspected_at.toMillis()
          : b.inspected_at
            ? new Date(b.inspected_at as string).getTime()
            : 0;
      return bm - am;
    });

  const start = (page - 1) * HISTORY_PAGE_SIZE;
  const pageSlice = all.slice(start, start + HISTORY_PAGE_SIZE + 1);
  const hasMore = pageSlice.length > HISTORY_PAGE_SIZE;
  const rows = hasMore ? pageSlice.slice(0, HISTORY_PAGE_SIZE) : pageSlice;
  return { items: rows, hasMore, lastDoc: null };
}

export async function fetchVehicleInspectionsHistoryPage(
  db: Firestore,
  companyId: string,
  page: number,
  prev: HistoryPagePayload<VehicleInspectionRow> | undefined
): Promise<HistoryPagePayload<VehicleInspectionRow>> {
  if (page === 1) {
    try {
      const r = await fetchInspectionsIndexed(db, companyId, 1, null);
      return { ...r, paginationMode: 'firestore' };
    } catch (e) {
      if (isIndexError(e)) {
        console.warn(
          '[History] vehicle_inspections: deploy composite index (company_id ASC, inspected_at DESC) with inspected_at >= filter.'
        );
        const r = await fetchInspectionsFallback(db, companyId, 1);
        return { ...r, paginationMode: 'client' };
      }
      throw e;
    }
  }

  if (!prev) throw new Error('Missing previous page');

  if (prev.paginationMode === 'client') {
    const r = await fetchInspectionsFallback(db, companyId, page);
    return { ...r, paginationMode: 'client' };
  }

  try {
    const r = await fetchInspectionsIndexed(db, companyId, page, prev.lastDoc);
    return { ...r, paginationMode: 'firestore' };
  } catch (e) {
    if (isIndexError(e)) {
      const r = await fetchInspectionsFallback(db, companyId, page);
      return { ...r, paginationMode: 'client' };
    }
    throw e;
  }
}

export const historyQueryKeys = {
  mappings: (companyId: string) => ['dashboard', 'history', 'mappings', companyId] as const,
  assets: (companyId: string, page: number) =>
    ['dashboard', 'history', 'tool_history', companyId, page] as const,
  fleet: (companyId: string, page: number) =>
    ['dashboard', 'history', 'vehicle_inspections', companyId, page] as const,
};
