'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import {
  fifteenMonthsAgoStart,
  INSPECTION_ANALYTICS_CAP,
  DEFECT_ANALYTICS_CAP,
} from '@/lib/dvsaRetention';
import type {
  FleetDefect,
  FleetInspection,
  FleetUser,
  FleetVehicle,
} from '@/lib/fleetReportLogic';
import {
  buildFleetReportExcelSheets,
  buildMileageInspectionRows,
  buildUserCompliance,
  buildVehicleWeekCompliance,
  filterInspectionsInWeek,
  getCurrentWeekBounds,
} from '@/lib/fleetReportLogic';
import { exportMultipleSheetsToExcel } from '@/lib/exportUtils';
import { format, startOfDay, subDays } from 'date-fns';

type Profile = FleetUser & { company_id?: string };

/** Fast first paint for This week / last 30 days — full DVSA window loads in the background. */
const FLEET_REPORT_FAST_DAYS = 40;
const FLEET_REPORT_FAST_INSP_CAP = 800;

type FleetReportContextValue = {
  loading: boolean;
  /** True while the full 15‑month history is still downloading after the fast path. */
  historyLoading: boolean;
  error: string | null;
  authUser: User | null;
  profile: Profile | null;
  vehicles: FleetVehicle[];
  users: FleetUser[];
  inspections: FleetInspection[];
  defects: FleetDefect[];
  refresh: () => void;
  exportFullExcel: () => void;
  mileageRows: ReturnType<typeof buildMileageInspectionRows>;
  weekInspections: FleetInspection[];
  userCompliance: ReturnType<typeof buildUserCompliance>;
  vehicleWeekRows: ReturnType<typeof buildVehicleWeekCompliance>;
  outstandingDefects: FleetDefect[];
  /** Company-wide unresolved count (matches Defects page Pending / home Open Now). */
  openDefectsNowCount: number;
  weekBounds: { start: Date; end: Date };
};

const FleetReportContext = createContext<FleetReportContextValue | null>(null);

const FULL_EXPORT_COOLDOWN_MS = 45_000;

export function FleetReportProvider({ children }: { children: React.ReactNode }) {
  const lastFullExportAt = useRef(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [users, setUsers] = useState<FleetUser[]>([]);
  const [inspections, setInspections] = useState<FleetInspection[]>([]);
  const [defects, setDefects] = useState<FleetDefect[]>([]);
  const [openDefectsNowCount, setOpenDefectsNowCount] = useState(0);
  const fetchGenerationRef = useRef(0);

  useEffect(() => {
    if (!firebaseAuth) return;
    return onAuthStateChanged(firebaseAuth, setAuthUser);
  }, []);

  const loadProfile = useCallback(async (user: User) => {
    if (!firebaseDb) throw new Error('Firebase not configured');
    const ref = doc(firebaseDb, 'profiles', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Profile not found');
    const data = { id: snap.id, ...snap.data() } as Profile;
    if (data.role !== 'manager' && data.role !== 'admin') {
      throw new Error('Only managers can view the fleet report.');
    }
    setProfile(data);
    return data;
  }, []);

  const fetchFleetData = useCallback(async (companyId: string) => {
    if (!firebaseDb) {
      setError('Firebase not configured');
      setLoading(false);
      setHistoryLoading(false);
      return;
    }
    const generation = ++fetchGenerationRef.current;
    setError(null);
    try {
      const recentStart = startOfDay(subDays(new Date(), FLEET_REPORT_FAST_DAYS));
      const fullStart = fifteenMonthsAgoStart();

      const vehiclesQ = query(
        collection(firebaseDb, 'vehicles'),
        where('company_id', '==', companyId)
      );
      const teamQ = query(
        collection(firebaseDb, 'profiles'),
        where('company_id', '==', companyId)
      );
      const recentInspQ = query(
        collection(firebaseDb, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        where('inspected_at', '>=', Timestamp.fromDate(recentStart)),
        orderBy('inspected_at', 'desc'),
        limit(FLEET_REPORT_FAST_INSP_CAP)
      );
      const allDefectsQ = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId)
      );
      const resolvedDefectsQ = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId),
        where('status', '==', 'resolved')
      );

      // Phase 1: enough for This week / last 30 days / Who checked — unlock UI quickly
      const [vSnap, uSnap, recentInspSnap, allDefCountSnap, resolvedDefCountSnap] =
        await Promise.all([
          getDocs(vehiclesQ),
          getDocs(teamQ),
          getDocs(recentInspQ),
          getCountFromServer(allDefectsQ),
          getCountFromServer(resolvedDefectsQ),
        ]);

      if (generation !== fetchGenerationRef.current) return;

      setVehicles(vSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetVehicle)));
      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetUser)));
      setInspections(
        recentInspSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetInspection))
      );
      setOpenDefectsNowCount(
        Math.max(0, allDefCountSnap.data().count - resolvedDefCountSnap.data().count)
      );
      setLoading(false);
      setHistoryLoading(true);

      // Phase 2: full DVSA window for Mileage + month views + Excel
      const fullInspQ = query(
        collection(firebaseDb, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        where('inspected_at', '>=', Timestamp.fromDate(fullStart)),
        orderBy('inspected_at', 'desc'),
        limit(INSPECTION_ANALYTICS_CAP)
      );
      const defQ = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId),
        where('reported_at', '>=', Timestamp.fromDate(fullStart)),
        orderBy('reported_at', 'desc'),
        limit(DEFECT_ANALYTICS_CAP)
      );

      const [iSnap, dSnap] = await Promise.all([getDocs(fullInspQ), getDocs(defQ)]);
      if (generation !== fetchGenerationRef.current) return;

      setInspections(iSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetInspection)));
      setDefects(dSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetDefect)));
    } catch (e) {
      console.error(e);
      if (generation === fetchGenerationRef.current) {
        setError(e instanceof Error ? e.message : 'Failed to load fleet report data');
      }
    } finally {
      if (generation === fetchGenerationRef.current) {
        setLoading(false);
        setHistoryLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!authUser || !firebaseDb) {
      setLoading(false);
      if (!authUser) {
        setProfile(null);
        setVehicles([]);
        setUsers([]);
        setInspections([]);
        setDefects([]);
        setHistoryLoading(false);
      }
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await loadProfile(authUser);
        if (cancelled) return;
        if (!p.company_id?.trim()) {
          setError('No company associated with this account.');
          setLoading(false);
          return;
        }
        await fetchFleetData(p.company_id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Access denied');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authUser, loadProfile, fetchFleetData]);

  const refresh = useCallback(() => {
    if (!profile?.company_id) return;
    setLoading(true);
    void fetchFleetData(profile.company_id);
  }, [profile?.company_id, fetchFleetData]);

  const weekBounds = useMemo(() => getCurrentWeekBounds(), []);
  const weekInspections = useMemo(
    () => filterInspectionsInWeek(inspections, weekBounds.start, weekBounds.end),
    [inspections, weekBounds.start, weekBounds.end]
  );

  const mileageRows = useMemo(
    () => buildMileageInspectionRows(inspections, vehicles, users),
    [inspections, vehicles, users]
  );

  const userCompliance = useMemo(
    () => buildUserCompliance(users, weekInspections),
    [users, weekInspections]
  );

  const vehicleWeekRows = useMemo(
    () => buildVehicleWeekCompliance(vehicles, weekInspections, users),
    [vehicles, weekInspections, users]
  );

  const outstandingDefects = useMemo(
    () => defects.filter((d) => d.status !== 'resolved'),
    [defects]
  );

  const exportFullExcel = useCallback(() => {
    const now = Date.now();
    if (now - lastFullExportAt.current < FULL_EXPORT_COOLDOWN_MS) {
      const wait = Math.ceil((FULL_EXPORT_COOLDOWN_MS - (now - lastFullExportAt.current)) / 1000);
      alert(`Please wait ${wait}s before exporting the full fleet report again.`);
      return;
    }
    lastFullExportAt.current = Date.now();
    const sheets = buildFleetReportExcelSheets(vehicles, users, inspections, defects);
    exportMultipleSheetsToExcel(
      sheets.map((s) => ({ name: s.name, data: s.data as any[] })),
      `stp-fleet-report-${format(new Date(), 'yyyy-MM-dd')}`
    );
  }, [vehicles, users, inspections, defects]);

  const value: FleetReportContextValue = {
    loading,
    historyLoading,
    error,
    authUser,
    profile,
    vehicles,
    users,
    inspections,
    defects,
    refresh,
    exportFullExcel,
    mileageRows,
    weekInspections,
    userCompliance,
    vehicleWeekRows,
    outstandingDefects,
    openDefectsNowCount,
    weekBounds,
  };

  return <FleetReportContext.Provider value={value}>{children}</FleetReportContext.Provider>;
}

export function useFleetReport() {
  const ctx = useContext(FleetReportContext);
  if (!ctx) throw new Error('useFleetReport must be used within FleetReportProvider');
  return ctx;
}
