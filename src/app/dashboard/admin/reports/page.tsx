'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Building2, Calendar, FileText, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';
import { type MonthlyCompanyReportTemplate, type OpenDefectRow, type ReportTrendPoint, type ReportUserCheckRow, type ReportUserNoCheckRow } from '@/lib/adminMonthlyCompanyReportPdf';
import { isStaffExpectedToCheck } from '@/lib/adminMonthlyCompanyReportHelpers';

type Profile = {
  role?: string;
  company_id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
};

type Company = {
  id: string;
  name?: string;
  subscription_status?: string;
};

type Inspection = {
  id: string;
  company_id?: string;
  inspected_at?: Timestamp | string;
  inspected_by?: string;
};

type Defect = {
  id: string;
  company_id?: string;
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  status?: string;
  severity?: string;
  vehicle_registration?: string;
  registration?: string;
  vehicle_id?: string;
  description?: string;
  defect?: string;
  notes?: string;
  reported_by?: string;
};

type Vehicle = {
  id: string;
  registration?: string;
  make?: string;
  model?: string;
};

type CompanySnapshot = {
  activeCompanies: number;
  trialCompanies: number;
  paidCompanies: number;
  highDefectCompanies: Array<{ id: string; name: string; defectsReported: number }>;
  inactivityAlerts: Array<{ id: string; name: string; daysSinceLastCheck: number | null }>;
  billingRiskCompanies: Array<{ id: string; name: string; subscriptionStatus: string }>;
};

type ReportStats = {
  checksCompleted: number;
  defectsReported: number;
  defectsResolved: number;
  resolutionRate: number | null;
  openDefects: number;
  criticalOpenDefects: number;
  daysSinceLastCheck: number | null;
  usersReportedCount: number;
  usersNotReportedCount: number;
};

type ReportComparison = {
  previousMonthLabel: string;
  checksDelta: number;
  defectsReportedDelta: number;
  defectsResolvedDelta: number;
  resolutionRateDelta: number | null;
};

const HIGH_DEFECT_THRESHOLD = 10;
const INACTIVITY_ALERT_DAYS = 14;

function toDate(value: Timestamp | string | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function monthToRange(monthValue: string): { start: Date; end: Date } {
  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 1, 0, 0, 0, 0);
  return { start, end };
}

function formatMonthLabel(monthValue: string): string {
  const [yearStr, monthStr] = monthValue.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function getPreviousMonthValue(monthValue: string): string {
  const [yearStr, monthStr] = monthValue.split('-');
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  date.setMonth(date.getMonth() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function isWithinRange(value: Timestamp | string | undefined, start: Date, end: Date): boolean {
  const dt = toDate(value);
  if (!dt) return false;
  return dt >= start && dt < end;
}

function profileDisplayName(profile: Profile): string {
  const full = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
  return profile.display_name || full || profile.email || 'Unknown user';
}

function getRecentMonthValues(monthValue: string, count: number): string[] {
  const [yearStr, monthStr] = monthValue.split('-');
  const base = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  const result: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const dt = new Date(base);
    dt.setMonth(dt.getMonth() - i);
    result.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
  }
  return result;
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const template: MonthlyCompanyReportTemplate = 'executive';
  const [previewLoading, setPreviewLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [comparison, setComparison] = useState<ReportComparison | null>(null);
  const [trend, setTrend] = useState<ReportTrendPoint[]>([]);
  const [openDefectRows, setOpenDefectRows] = useState<OpenDefectRow[]>([]);
  const [usersWithChecks, setUsersWithChecks] = useState<ReportUserCheckRow[]>([]);
  const [usersWithoutChecks, setUsersWithoutChecks] = useState<ReportUserNoCheckRow[]>([]);
  const [snapshot, setSnapshot] = useState<CompanySnapshot | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authIdToken, setAuthIdToken] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [supportsMonthInput, setSupportsMonthInput] = useState(true);

  const loadCompanies = useCallback(async (): Promise<void> => {
    if (!firebaseDb) return;
    const companySnap = await getDocs(query(collection(firebaseDb!, 'companies')));
    const data = companySnap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Company, 'id'>) }));
    data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    setCompanies(data);
    if (!selectedCompanyId && data[0]) {
      setSelectedCompanyId(data[0].id);
    }
  }, [selectedCompanyId]);

  const loadAdminSnapshot = useCallback(async (): Promise<void> => {
    if (!firebaseDb) return;
    const companySnap = await getDocs(query(collection(firebaseDb!, 'companies')));
    const companyList = companySnap.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Company, 'id'>) }));
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const highDefectCompanies: Array<{ id: string; name: string; defectsReported: number }> = [];
    const inactivityAlerts: Array<{ id: string; name: string; daysSinceLastCheck: number | null }> = [];

    for (const company of companyList) {
      const defectsSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', company.id),
          where('reported_at', '>=', Timestamp.fromDate(monthStart)),
          where('reported_at', '<', Timestamp.fromDate(monthEnd))
        )
      );
      if (defectsSnap.size >= HIGH_DEFECT_THRESHOLD) {
        highDefectCompanies.push({
          id: company.id,
          name: company.name || company.id,
          defectsReported: defectsSnap.size,
        });
      }

      const inspectionsByCompanySnap = await getDocs(
        query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', company.id))
      );
      const latestDate =
        inspectionsByCompanySnap.docs
          .map((docSnap) => (docSnap.data() as Inspection).inspected_at)
          .map((value) => toDate(value))
          .filter((dt): dt is Date => dt !== null)
          .sort((a, b) => b.getTime() - a.getTime())[0] || null;
      const daysSinceLastCheck = latestDate
        ? Math.floor((Date.now() - latestDate.getTime()) / 86400000)
        : null;
      if (daysSinceLastCheck === null || daysSinceLastCheck >= INACTIVITY_ALERT_DAYS) {
        inactivityAlerts.push({
          id: company.id,
          name: company.name || company.id,
          daysSinceLastCheck,
        });
      }
    }

    const trialCompanies = companyList.filter((company) => company.subscription_status === 'trial').length;
    const paidCompanies = companyList.filter((company) => company.subscription_status === 'active').length;
    const activeCompanies = trialCompanies + paidCompanies;
    const billingRiskCompanies = companyList
      .filter((company) => company.subscription_status !== 'trial' && company.subscription_status !== 'active')
      .map((company) => ({
        id: company.id,
        name: company.name || company.id,
        subscriptionStatus: company.subscription_status || 'inactive',
      }));

    setSnapshot({
      activeCompanies,
      trialCompanies,
      paidCompanies,
      highDefectCompanies: highDefectCompanies.slice(0, 8),
      inactivityAlerts: inactivityAlerts.slice(0, 8),
      billingRiskCompanies: billingRiskCompanies.slice(0, 8),
    });
  }, []);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setLoading(false);
        setIsAdmin(false);
        setAuthIdToken(null);
        return;
      }

      try {
        setAuthIdToken(await user.getIdToken());
        const profileSnap = await getDoc(doc(firebaseDb!, 'profiles', user.uid));
        if (!profileSnap.exists()) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const profile = profileSnap.data() as Profile;
        const admin = profile.role === 'admin';
        setIsAdmin(admin);
        setAdminUserId(user.uid);
        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.display_name || profile.email || 'Admin';
        setAdminName(fullName);
        if (!admin) {
          setLoading(false);
          return;
        }

        await Promise.all([loadCompanies(), loadAdminSnapshot()]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [loadCompanies, loadAdminSnapshot]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  useEffect(() => {
    setStats(null);
    setComparison(null);
    setTrend([]);
    setOpenDefectRows([]);
    setUsersWithChecks([]);
    setUsersWithoutChecks([]);
  }, [selectedCompanyId, selectedMonth]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const probe = document.createElement('input');
    probe.setAttribute('type', 'month');
    probe.value = '2026-05';
    const supports = probe.type === 'month' && probe.value === '2026-05';
    setSupportsMonthInput(supports);
  }, []);

  async function getMonthStats(
    companyId: string,
    monthValue: string
  ): Promise<Pick<ReportStats, 'checksCompleted' | 'defectsReported' | 'defectsResolved' | 'resolutionRate'>> {
    if (!firebaseDb) {
      return { checksCompleted: 0, defectsReported: 0, defectsResolved: 0, resolutionRate: null };
    }
    const { start, end } = monthToRange(monthValue);
    const [inspectionsByCompanySnap, defectsByCompanySnap] = await Promise.all([
      getDocs(query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', companyId))),
      getDocs(query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId))),
    ]);

    const checksCompleted = inspectionsByCompanySnap.docs.filter((docSnap) => {
      const inspection = docSnap.data() as Inspection;
      return isWithinRange(inspection.inspected_at, start, end);
    }).length;
    const defectsReported = defectsByCompanySnap.docs.filter((docSnap) => {
      const defect = docSnap.data() as Defect;
      return isWithinRange(defect.reported_at, start, end);
    }).length;
    const defectsResolved = defectsByCompanySnap.docs.filter((docSnap) => {
      const defect = docSnap.data() as Defect;
      return isWithinRange(defect.resolved_at, start, end);
    }).length;
    const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;
    return { checksCompleted, defectsReported, defectsResolved, resolutionRate };
  }

  async function calculateStats(): Promise<ReportStats | null> {
    if (!firebaseDb || !selectedCompanyId || !selectedMonth) return null;
    const { start, end } = monthToRange(selectedMonth);

    setPreviewLoading(true);
    setStatusMessage(null);
    try {
      const [inspectionsByCompanySnap, allDefectsByCompanySnap] = await Promise.all([
        getDocs(query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', selectedCompanyId))),
        getDocs(query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', selectedCompanyId))),
      ]);
      const [vehiclesSnap, profilesSnap] = await Promise.all([
        getDocs(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', selectedCompanyId))),
        getDocs(query(collection(firebaseDb!, 'profiles'), where('company_id', '==', selectedCompanyId))),
      ]);
      const vehiclesById: Record<string, Vehicle> = {};
      vehiclesSnap.docs.forEach((vehicleDoc) => {
        vehiclesById[vehicleDoc.id] = { id: vehicleDoc.id, ...(vehicleDoc.data() as Omit<Vehicle, 'id'>) };
      });
      const profilesById: Record<string, Profile> = {};
      profilesSnap.docs.forEach((profileDoc) => {
        profilesById[profileDoc.id] = { ...(profileDoc.data() as Profile) };
      });

      const checksCompleted = inspectionsByCompanySnap.docs.filter((docSnap) => {
        const inspection = docSnap.data() as Inspection;
        return isWithinRange(inspection.inspected_at, start, end);
      }).length;
      const inspectionsInMonth = inspectionsByCompanySnap.docs
        .map((docSnap) => docSnap.data() as Inspection)
        .filter((inspection) => isWithinRange(inspection.inspected_at, start, end));
      const defectsReportedInMonth = allDefectsByCompanySnap.docs
        .map((docSnap) => docSnap.data() as Defect)
        .filter((defect) => isWithinRange(defect.reported_at, start, end));
      const defectsReported = allDefectsByCompanySnap.docs.filter((docSnap) => {
        const defect = docSnap.data() as Defect;
        return isWithinRange(defect.reported_at, start, end);
      }).length;
      const defectsResolved = allDefectsByCompanySnap.docs.filter((docSnap) => {
        const defect = docSnap.data() as Defect;
        return isWithinRange(defect.resolved_at, start, end);
      }).length;

      const openDefects = allDefectsByCompanySnap.docs
        .map((item) => item.data() as Defect)
        .filter((defect) => defect.status !== 'resolved');
      const criticalOpenDefects = openDefects.filter((defect) => {
        const severity = (defect.severity || '').toLowerCase();
        return severity === 'critical' || severity === 'high';
      }).length;

      const latestInspectionDate = inspectionsByCompanySnap.docs
        .map((docSnap) => (docSnap.data() as Inspection).inspected_at)
        .map((value) => toDate(value))
        .filter((dt): dt is Date => dt !== null)
        .sort((a, b) => b.getTime() - a.getTime())[0] || null;
      const daysSinceLastCheck = latestInspectionDate
        ? Math.floor((Date.now() - latestInspectionDate.getTime()) / 86400000)
        : null;

      const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;
      const openRows: OpenDefectRow[] = openDefects.map((defect) => {
        const raisedDate = toDate(defect.reported_at);
        const sev = (defect.severity || '').toLowerCase();
        const mappedVehicle = defect.vehicle_id ? vehiclesById[defect.vehicle_id] : undefined;
        const vehicleName =
          defect.vehicle_registration ||
          defect.registration ||
          mappedVehicle?.registration ||
          (mappedVehicle?.make || mappedVehicle?.model
            ? `${mappedVehicle?.make || ''} ${mappedVehicle?.model || ''}`.trim()
            : '') ||
          'Unknown vehicle';
        const reporterName = defect.reported_by ? profileDisplayName(profilesById[defect.reported_by] || {}) : '';
        return {
          vehicle: vehicleName,
          description: reporterName
            ? `${defect.description || defect.defect || defect.notes || 'Defect reported'} (reported by ${reporterName})`
            : defect.description || defect.defect || defect.notes || 'Defect reported',
          raised: raisedDate ? raisedDate.toLocaleDateString('en-GB') : 'Unknown date',
          priority: sev === 'critical' || sev === 'high' ? 'critical' : 'standard',
          status: defect.status === 'resolved' ? 'resolved' : 'open',
        };
      });
      const staffProfileDocs = profilesSnap.docs.filter((profileDoc) =>
        isStaffExpectedToCheck((profileDoc.data() as Profile).role)
      );
      const staffIds = new Set(staffProfileDocs.map((profileDoc) => profileDoc.id));

      const checksByUser: Record<string, number> = {};
      inspectionsInMonth.forEach((inspection) => {
        const userId = inspection.inspected_by;
        if (!userId || !staffIds.has(userId)) return;
        checksByUser[userId] = (checksByUser[userId] || 0) + 1;
      });

      const usersWithChecksRows: ReportUserCheckRow[] = [];
      const usersWithoutChecksRows: ReportUserNoCheckRow[] = [];
      staffProfileDocs.forEach((profileDoc) => {
        const profile = profileDoc.data() as Profile;
        const name = profileDisplayName(profile);
        const email = profile.email;
        const checksCount = checksByUser[profileDoc.id] || 0;
        if (checksCount > 0) {
          usersWithChecksRows.push({ name, email, checksCompleted: checksCount });
        } else {
          usersWithoutChecksRows.push({ name, email });
        }
      });
      usersWithChecksRows.sort(
        (a, b) => b.checksCompleted - a.checksCompleted || a.name.localeCompare(b.name)
      );
      usersWithoutChecksRows.sort((a, b) => a.name.localeCompare(b.name));

      const reportingUserIds = new Set<string>();
      inspectionsInMonth.forEach((inspection) => {
        if (inspection.inspected_by && staffIds.has(inspection.inspected_by)) {
          reportingUserIds.add(inspection.inspected_by);
        }
      });
      defectsReportedInMonth.forEach((defect) => {
        if (defect.reported_by && staffIds.has(defect.reported_by)) {
          reportingUserIds.add(defect.reported_by);
        }
      });
      const totalUsers = staffProfileDocs.length;
      const usersReportedCount = reportingUserIds.size;
      const usersNotReportedCount = Math.max(0, totalUsers - usersReportedCount);

      const nextStats: ReportStats = {
        checksCompleted,
        defectsReported,
        defectsResolved,
        resolutionRate,
        openDefects: openDefects.length,
        criticalOpenDefects,
        daysSinceLastCheck,
        usersReportedCount,
        usersNotReportedCount,
      };
      setStats(nextStats);
      setOpenDefectRows(openRows);
      setUsersWithChecks(usersWithChecksRows);
      setUsersWithoutChecks(usersWithoutChecksRows);
      const previousMonthValue = getPreviousMonthValue(selectedMonth);
      const previousStats = await getMonthStats(selectedCompanyId, previousMonthValue);
      const trendValues = getRecentMonthValues(selectedMonth, 4);
      const trendSeries: ReportTrendPoint[] = [];
      for (const monthValue of trendValues) {
        const point = await getMonthStats(selectedCompanyId, monthValue);
        trendSeries.push({
          month: formatMonthLabel(monthValue),
          checks: point.checksCompleted,
          defectsReported: point.defectsReported,
          defectsResolved: point.defectsResolved,
        });
      }
      setTrend(trendSeries);
      setComparison({
        previousMonthLabel: formatMonthLabel(previousMonthValue),
        checksDelta: nextStats.checksCompleted - previousStats.checksCompleted,
        defectsReportedDelta: nextStats.defectsReported - previousStats.defectsReported,
        defectsResolvedDelta: nextStats.defectsResolved - previousStats.defectsResolved,
        resolutionRateDelta:
          nextStats.resolutionRate === null || previousStats.resolutionRate === null
            ? null
            : nextStats.resolutionRate - previousStats.resolutionRate,
      });
      setStatusMessage('Preview ready.');
      return nextStats;
    } catch (error) {
      console.error(error);
      const details = error instanceof Error ? error.message : 'Unknown query error';
      setStatusMessage(`Could not load data for selected month: ${details}`);
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }

  async function logReportEvent(action: 'preview' | 'pdf_generated'): Promise<void> {
    if (!firebaseDb || !adminUserId || !selectedCompanyId || !selectedMonth) return;
    await addDoc(collection(firebaseDb!, 'admin_report_events'), {
      action,
      admin_user_id: adminUserId,
      company_id: selectedCompanyId,
      month: selectedMonth,
      template,
      created_at: serverTimestamp(),
    });
  }

  async function handlePreview(): Promise<void> {
    const result = await calculateStats();
    if (result) {
      await logReportEvent('preview');
    }
  }

  async function handleGeneratePDF(): Promise<void> {
    if (!selectedCompanyId) {
      setStatusMessage('Select a company first.');
      return;
    }
    if (!selectedMonth) {
      setStatusMessage('Select a month first.');
      return;
    }
    if (!stats || !comparison) {
      setStatusMessage('Click "Preview stats" first, then generate the PDF.');
      return;
    }

    setPdfGenerating(true);
    try {
      const result = stats;
      if (!selectedCompany) {
        setStatusMessage('Unable to generate PDF: no report data for this selection.');
        return;
      }

      if (!authIdToken) {
        setStatusMessage('Session expired. Refresh and try again.');
        return;
      }
      const reportInput = {
        companyName: selectedCompany.name || selectedCompany.id,
        monthLabel: formatMonthLabel(selectedMonth),
        generatedAt: new Date(),
        generatedBy: adminName,
        template,
        checksCompleted: result.checksCompleted,
        defectsReported: result.defectsReported,
        defectsResolved: result.defectsResolved,
        resolutionRate: result.resolutionRate,
        openDefects: result.openDefects,
        criticalOpenDefects: result.criticalOpenDefects,
        daysSinceLastCheck: result.daysSinceLastCheck,
        comparison,
        trend,
        openDefectsList: openDefectRows,
        usersReportedCount: result.usersReportedCount,
        usersNotReportedCount: result.usersNotReportedCount,
        usersWithChecks,
        usersWithoutChecks,
      };
      const response = await fetch('/api/admin/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authIdToken}`,
        },
        body: JSON.stringify(reportInput),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || 'Failed to generate PDF');
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const disposition = response.headers.get('Content-Disposition');
      const filenameMatch = disposition?.match(/filename=\"?([^"]+)\"?/i);
      a.download = filenameMatch?.[1] || 'stp-monthly-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(downloadUrl);
      await logReportEvent('pdf_generated');
      setStatusMessage('PDF generated and downloaded.');
    } catch (error) {
      console.error(error);
      setStatusMessage(error instanceof Error ? error.message : 'PDF generation failed. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="dashboard-card p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Admin Reports</h1>
        <p className="text-white/60">Access restricted to administrators.</p>
      </div>
    );
  }

  const [selectedYear, selectedMonthPart] = selectedMonth.split('-');
  const monthOptions = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Reports Panel</h1>
        <p className="text-white/60">Generate company monthly PDFs and monitor admin-level risk signals.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Active companies</p>
          <p className="text-white text-3xl font-semibold mt-2">{snapshot?.activeCompanies ?? '—'}</p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Trials / paid</p>
          <p className="text-white text-3xl font-semibold mt-2">
            {snapshot ? `${snapshot.trialCompanies} / ${snapshot.paidCompanies}` : '—'}
          </p>
        </div>
        <div className="dashboard-card p-5">
          <p className="text-white/60 text-xs uppercase tracking-wide">Billing risk companies</p>
          <p className="text-white text-3xl font-semibold mt-2">{snapshot?.billingRiskCompanies.length ?? '—'}</p>
        </div>
      </div>

      <div className="dashboard-card p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">Monthly Company Report Generator</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm text-white/80">
            <span className="mb-1 block">Company</span>
            <select
              value={selectedCompanyId}
              onChange={(event) => setSelectedCompanyId(event.target.value)}
              className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name || company.id}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-white/80">
            <span className="mb-1 block">Month</span>
            {supportsMonthInput ? (
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={selectedMonthPart || '01'}
                  onChange={(event) => setSelectedMonth(`${selectedYear || String(currentYear)}-${event.target.value}`)}
                  className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
                >
                  {monthOptions.map((monthOption) => (
                    <option key={monthOption.value} value={monthOption.value}>
                      {monthOption.label}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear || String(currentYear)}
                  onChange={(event) => setSelectedMonth(`${event.target.value}-${selectedMonthPart || '01'}`)}
                  className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
                >
                  {yearOptions.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold px-4 py-2"
          >
            <Activity className="h-4 w-4" />
            {previewLoading ? 'Loading...' : 'Preview stats'}
          </button>
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={pdfGenerating || !stats || !comparison}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-400/40 text-blue-300 hover:bg-blue-500/10 px-4 py-2"
          >
            <FileText className="h-4 w-4" />
            {pdfGenerating ? 'Generating PDF...' : 'Generate PDF'}
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-white/50 text-xs">Checks completed</p>
              <p className="text-white text-xl font-semibold">{stats.checksCompleted}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-white/50 text-xs">Defects reported</p>
              <p className="text-white text-xl font-semibold">{stats.defectsReported}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-white/50 text-xs">Defects resolved</p>
              <p className="text-white text-xl font-semibold">{stats.defectsResolved}</p>
            </div>
            <div className="rounded-lg border border-white/10 p-3">
              <p className="text-white/50 text-xs">Resolution rate</p>
              <p className="text-white text-xl font-semibold">
                {stats.resolutionRate === null ? 'N/A' : `${stats.resolutionRate}%`}
              </p>
            </div>
          </div>
        )}

        {comparison && (
          <div className="rounded-lg border border-white/10 p-3 bg-white/[0.02]">
            <p className="text-white/60 text-xs mb-2">
              Month-on-month vs {comparison.previousMonthLabel}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <p className="text-white/80">
                Checks:{' '}
                <span className={comparison.checksDelta >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {comparison.checksDelta >= 0 ? '+' : ''}
                  {comparison.checksDelta}
                </span>
              </p>
              <p className="text-white/80">
                Defects reported:{' '}
                <span className={comparison.defectsReportedDelta <= 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {comparison.defectsReportedDelta >= 0 ? '+' : ''}
                  {comparison.defectsReportedDelta}
                </span>
              </p>
              <p className="text-white/80">
                Defects resolved:{' '}
                <span className={comparison.defectsResolvedDelta >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {comparison.defectsResolvedDelta >= 0 ? '+' : ''}
                  {comparison.defectsResolvedDelta}
                </span>
              </p>
              <p className="text-white/80">
                Resolution rate:{' '}
                <span
                  className={
                    comparison.resolutionRateDelta === null
                      ? 'text-white/60'
                      : comparison.resolutionRateDelta >= 0
                        ? 'text-emerald-300'
                        : 'text-red-300'
                  }
                >
                  {comparison.resolutionRateDelta === null
                    ? 'N/A'
                    : `${comparison.resolutionRateDelta >= 0 ? '+' : ''}${comparison.resolutionRateDelta}pp`}
                </span>
              </p>
            </div>
          </div>
        )}

        {stats && (usersWithChecks.length > 0 || usersWithoutChecks.length > 0) && (
          <div className="rounded-lg border border-white/10 p-3 bg-white/[0.02] space-y-3">
            <p className="text-white/60 text-xs uppercase tracking-wide">User check activity (report section 5)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-white font-medium text-sm mb-2">Completed checks ({usersWithChecks.length})</p>
                <ul className="space-y-1 text-sm text-white/80 max-h-40 overflow-y-auto">
                  {usersWithChecks.map((user) => (
                    <li key={`${user.name}-${user.checksCompleted}`} className="flex justify-between gap-2">
                      <span className="truncate">{user.name}</span>
                      <span className="text-blue-300 shrink-0">{user.checksCompleted}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-white font-medium text-sm mb-2">No checks this month ({usersWithoutChecks.length})</p>
                <ul className="space-y-1 text-sm text-white/80 max-h-40 overflow-y-auto">
                  {usersWithoutChecks.length ? (
                    usersWithoutChecks.map((user) => (
                      <li key={user.name} className="truncate">
                        {user.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-white/50">All staff completed at least one check.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}

        {statusMessage && (
          <p className="text-sm text-blue-300">{statusMessage}</p>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="dashboard-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h3 className="text-white font-semibold">High defect companies</h3>
          </div>
          <div className="space-y-2">
            {snapshot?.highDefectCompanies.length ? (
              snapshot.highDefectCompanies.map((item) => (
                <div key={item.id} className="text-sm text-white/80 flex justify-between gap-2">
                  <span className="truncate">{item.name}</span>
                  <span className="text-amber-300">{item.defectsReported}</span>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No high-defect flags this month.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-blue-400" />
            <h3 className="text-white font-semibold">Inactivity alerts</h3>
          </div>
          <div className="space-y-2">
            {snapshot?.inactivityAlerts.length ? (
              snapshot.inactivityAlerts.map((item) => (
                <div key={item.id} className="text-sm text-white/80 flex justify-between gap-2">
                  <span className="truncate">{item.name}</span>
                  <span className="text-blue-300">
                    {item.daysSinceLastCheck === null ? 'No checks' : `${item.daysSinceLastCheck}d`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No inactivity alerts.</p>
            )}
          </div>
        </div>

        <div className="dashboard-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-red-400" />
            <h3 className="text-white font-semibold">Billing risk flags</h3>
          </div>
          <div className="space-y-2">
            {snapshot?.billingRiskCompanies.length ? (
              snapshot.billingRiskCompanies.map((item) => (
                <div key={item.id} className="text-sm text-white/80 flex justify-between gap-2">
                  <span className="truncate">{item.name}</span>
                  <span className="text-red-300">{item.subscriptionStatus}</span>
                </div>
              ))
            ) : (
              <p className="text-white/50 text-sm">No billing risks.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-card p-5">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          Admin actions
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/dashboard/companies" className="text-blue-300 hover:underline">
            Manage companies
          </Link>
          <Link href="/dashboard/subscription" className="text-blue-300 hover:underline">
            Review subscription controls
          </Link>
          <Link href="/dashboard/defects" className="text-blue-300 hover:underline">
            Inspect defect workflows
          </Link>
        </div>
      </div>

    </div>
  );
}
