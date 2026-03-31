'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { fifteenMonthsAgoStart } from '@/lib/dvsaRetention';
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
import { format } from 'date-fns';

type Profile = FleetUser & { company_id?: string };

type FleetReportContextValue = {
  loading: boolean;
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
  weekBounds: { start: Date; end: Date };
};

const FleetReportContext = createContext<FleetReportContextValue | null>(null);

const FULL_EXPORT_COOLDOWN_MS = 45_000;

export function FleetReportProvider({ children }: { children: React.ReactNode }) {
  const lastFullExportAt = useRef(0);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [users, setUsers] = useState<FleetUser[]>([]);
  const [inspections, setInspections] = useState<FleetInspection[]>([]);
  const [defects, setDefects] = useState<FleetDefect[]>([]);

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
      return;
    }
    setError(null);
    try {
      const startDate = fifteenMonthsAgoStart();

      const vehiclesQ = query(
        collection(firebaseDb, 'vehicles'),
        where('company_id', '==', companyId)
      );
      const teamQ = query(
        collection(firebaseDb, 'profiles'),
        where('company_id', '==', companyId)
      );
      const inspQ = query(
        collection(firebaseDb, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        where('inspected_at', '>=', Timestamp.fromDate(startDate)),
        orderBy('inspected_at', 'desc')
      );
      const defQ = query(
        collection(firebaseDb, 'vehicle_defects'),
        where('company_id', '==', companyId),
        where('reported_at', '>=', Timestamp.fromDate(startDate)),
        orderBy('reported_at', 'desc')
      );

      const [vSnap, uSnap, iSnap, dSnap] = await Promise.all([
        getDocs(vehiclesQ),
        getDocs(teamQ),
        getDocs(inspQ),
        getDocs(defQ),
      ]);

      setVehicles(vSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetVehicle)));
      setUsers(uSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetUser)));
      setInspections(iSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetInspection)));
      setDefects(dSnap.docs.map((d) => ({ id: d.id, ...d.data() } as FleetDefect)));
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to load fleet report data');
    } finally {
      setLoading(false);
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
    weekBounds,
  };

  return <FleetReportContext.Provider value={value}>{children}</FleetReportContext.Provider>;
}

export function useFleetReport() {
  const ctx = useContext(FleetReportContext);
  if (!ctx) throw new Error('useFleetReport must be used within FleetReportProvider');
  return ctx;
}
