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
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Building2, Calendar, FileText, Mail, ShieldAlert, Activity, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  exportAdminMonthlyCompanyReportPDF,
  type MonthlyCompanyReportTemplate,
} from '@/lib/adminMonthlyCompanyReportPdf';

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
};

type Defect = {
  id: string;
  company_id?: string;
  reported_at?: Timestamp | string;
  resolved_at?: Timestamp | string;
  status?: string;
  severity?: string;
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
};

type ReportComparison = {
  previousMonthLabel: string;
  checksDelta: number;
  defectsReportedDelta: number;
  defectsResolvedDelta: number;
  resolutionRateDelta: number | null;
};

type SentReportHistoryItem = {
  id: string;
  company_name: string;
  month_label: string;
  template: string;
  recipient_email: string;
  sent_at: string | null;
  stats?: {
    checksCompleted?: number;
    defectsReported?: number;
    defectsResolved?: number;
    resolutionRate?: number | null;
  };
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

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState('Admin');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [template, setTemplate] = useState<MonthlyCompanyReportTemplate>('executive');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [comparison, setComparison] = useState<ReportComparison | null>(null);
  const [snapshot, setSnapshot] = useState<CompanySnapshot | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [queueLoading, setQueueLoading] = useState(false);
  const [authIdToken, setAuthIdToken] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [queueProcessing, setQueueProcessing] = useState(false);
  const [sentHistory, setSentHistory] = useState<SentReportHistoryItem[]>([]);
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);
  const [pdfGenerating, setPdfGenerating] = useState(false);

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

      const latestInspectionSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', company.id),
          orderBy('inspected_at', 'desc'),
          limit(1)
        )
      );
      const latest = latestInspectionSnap.docs[0]?.data() as Inspection | undefined;
      const latestDate = toDate(latest?.inspected_at);
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
        await loadSentHistory(await user.getIdToken());
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [loadCompanies, loadAdminSnapshot]);

  useEffect(() => {
    let cancelled = false;
    async function preloadLogo(): Promise<void> {
      try {
        const logoResponse = await fetch('/logo.png');
        if (!logoResponse.ok) return;
        const blob = await logoResponse.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (!cancelled) setLogoDataUrl(dataUrl);
      } catch {
        // Keep fallback branding if logo preload fails.
      }
    }
    preloadLogo();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadSentHistory(token: string): Promise<void> {
    setHistoryLoading(true);
    try {
      const response = await fetch('/api/admin/reports/history?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = (await response.json()) as { items?: SentReportHistoryItem[] };
      setSentHistory(payload.items || []);
    } catch (error) {
      console.error(error);
      setStatusMessage('Could not load sent report history.');
    } finally {
      setHistoryLoading(false);
    }
  }

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );

  async function getMonthStats(
    companyId: string,
    monthValue: string
  ): Promise<Pick<ReportStats, 'checksCompleted' | 'defectsReported' | 'defectsResolved' | 'resolutionRate'>> {
    if (!firebaseDb) {
      return { checksCompleted: 0, defectsReported: 0, defectsResolved: 0, resolutionRate: null };
    }
    const { start, end } = monthToRange(monthValue);
    const [inspectionsSnap, defectsReportedSnap, defectsResolvedSnap] = await Promise.all([
      getDocs(
        query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', companyId),
          where('inspected_at', '>=', Timestamp.fromDate(start)),
          where('inspected_at', '<', Timestamp.fromDate(end))
        )
      ),
      getDocs(
        query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', companyId),
          where('reported_at', '>=', Timestamp.fromDate(start)),
          where('reported_at', '<', Timestamp.fromDate(end))
        )
      ),
      getDocs(
        query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', companyId),
          where('resolved_at', '>=', Timestamp.fromDate(start)),
          where('resolved_at', '<', Timestamp.fromDate(end))
        )
      ),
    ]);

    const checksCompleted = inspectionsSnap.size;
    const defectsReported = defectsReportedSnap.size;
    const defectsResolved = defectsResolvedSnap.size;
    const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;
    return { checksCompleted, defectsReported, defectsResolved, resolutionRate };
  }

  async function calculateStats(): Promise<ReportStats | null> {
    if (!firebaseDb || !selectedCompanyId || !selectedMonth) return null;
    const { start, end } = monthToRange(selectedMonth);

    setPreviewLoading(true);
    setStatusMessage(null);
    try {
      const inspectionsSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', selectedCompanyId),
          where('inspected_at', '>=', Timestamp.fromDate(start)),
          where('inspected_at', '<', Timestamp.fromDate(end))
        )
      );

      const defectsReportedSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', selectedCompanyId),
          where('reported_at', '>=', Timestamp.fromDate(start)),
          where('reported_at', '<', Timestamp.fromDate(end))
        )
      );

      const defectsResolvedSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_defects'),
          where('company_id', '==', selectedCompanyId),
          where('resolved_at', '>=', Timestamp.fromDate(start)),
          where('resolved_at', '<', Timestamp.fromDate(end))
        )
      );

      const allOpenDefectsSnap = await getDocs(
        query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', selectedCompanyId))
      );

      const openDefects = allOpenDefectsSnap.docs
        .map((item) => item.data() as Defect)
        .filter((defect) => defect.status !== 'resolved');
      const criticalOpenDefects = openDefects.filter((defect) => {
        const severity = (defect.severity || '').toLowerCase();
        return severity === 'critical' || severity === 'high';
      }).length;

      const latestInspectionSnap = await getDocs(
        query(
          collection(firebaseDb!, 'vehicle_inspections'),
          where('company_id', '==', selectedCompanyId),
          orderBy('inspected_at', 'desc'),
          limit(1)
        )
      );
      const latestInspection = latestInspectionSnap.docs[0]?.data() as Inspection | undefined;
      const latestInspectionDate = toDate(latestInspection?.inspected_at);
      const daysSinceLastCheck = latestInspectionDate
        ? Math.floor((Date.now() - latestInspectionDate.getTime()) / 86400000)
        : null;

      const checksCompleted = inspectionsSnap.size;
      const defectsReported = defectsReportedSnap.size;
      const defectsResolved = defectsResolvedSnap.size;
      const resolutionRate = defectsReported > 0 ? Math.round((defectsResolved / defectsReported) * 100) : null;

      const nextStats: ReportStats = {
        checksCompleted,
        defectsReported,
        defectsResolved,
        resolutionRate,
        openDefects: openDefects.length,
        criticalOpenDefects,
        daysSinceLastCheck,
      };
      setStats(nextStats);
      const previousMonthValue = getPreviousMonthValue(selectedMonth);
      const previousStats = await getMonthStats(selectedCompanyId, previousMonthValue);
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
      setStatusMessage('Could not load data for the selected month. Check indexes/permissions.');
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }

  async function logReportEvent(action: 'preview' | 'pdf_generated' | 'email_queued'): Promise<void> {
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

    setPdfGenerating(true);
    try {
      const result = stats || (await calculateStats());
      if (!result || !selectedCompany) {
        setStatusMessage('Unable to generate PDF: no report data for this selection.');
        return;
      }

      exportAdminMonthlyCompanyReportPDF(
        {
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
          inactivityDays: result.daysSinceLastCheck,
          comparison,
        },
        { logoDataUrl }
      );
      await logReportEvent('pdf_generated');
      setStatusMessage('PDF generated and downloaded.');
    } catch (error) {
      console.error(error);
      setStatusMessage('PDF generation failed. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  }

  async function handleQueueEmail(): Promise<void> {
    if (!firebaseDb || !selectedCompanyId || !selectedMonth || !adminUserId || !recipientEmail.trim()) {
      setStatusMessage('Enter a recipient email before queuing.');
      return;
    }
    setQueueLoading(true);
    try {
      await addDoc(collection(firebaseDb!, 'admin_report_dispatch_queue'), {
        company_id: selectedCompanyId,
        month: selectedMonth,
        template,
        recipient_email: recipientEmail.trim().toLowerCase(),
        requested_by: adminUserId,
        status: 'queued',
        created_at: serverTimestamp(),
      });
      await logReportEvent('email_queued');
      setStatusMessage('Monthly report email queued.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to queue email right now.');
    } finally {
      setQueueLoading(false);
    }
  }

  async function handleProcessQueueNow(): Promise<void> {
    if (!authIdToken) {
      setStatusMessage('Session expired. Refresh and try again.');
      return;
    }
    setQueueProcessing(true);
    try {
      const response = await fetch('/api/admin/reports/process-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authIdToken}`,
        },
      });
      const payload = (await response.json()) as { processed?: number; sent?: number; failed?: number; error?: string };
      if (!response.ok) {
        setStatusMessage(payload.error || 'Failed to process queued emails.');
        return;
      }
      setStatusMessage(`Queue processed: ${payload.processed || 0}, sent: ${payload.sent || 0}, failed: ${payload.failed || 0}.`);
      await loadSentHistory(authIdToken);
    } catch (error) {
      console.error(error);
      setStatusMessage('Queue processing failed.');
    } finally {
      setQueueProcessing(false);
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

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-6">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Reports Panel</h1>
        <p className="text-white/60">
          Generate company monthly PDFs, queue scheduled sends, and monitor admin-level risk signals.
        </p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
            />
          </label>
          <label className="text-sm text-white/80">
            <span className="mb-1 block">Template</span>
            <select
              value={template}
              onChange={(event) => setTemplate(event.target.value as MonthlyCompanyReportTemplate)}
              className="w-full rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
            >
              <option value="executive">Executive summary</option>
              <option value="compliance">Compliance focus</option>
              <option value="performance">Performance focus</option>
            </select>
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
            disabled={pdfGenerating}
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

        <div className="pt-3 border-t border-white/10">
          <p className="text-white/70 text-sm mb-2">Schedule / queue delivery</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="email"
              placeholder="recipient@company.co.uk"
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              className="flex-1 rounded-lg bg-black border border-white/20 px-3 py-2 text-white"
            />
            <button
              type="button"
              onClick={handleQueueEmail}
              disabled={queueLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10 px-4 py-2 disabled:opacity-60"
            >
              <Mail className="h-4 w-4" />
              {queueLoading ? 'Queueing...' : 'Queue monthly email'}
            </button>
          </div>
          <p className="text-white/40 text-xs mt-2">
            Queued emails are stored for backend dispatch processing.
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleProcessQueueNow}
              disabled={queueProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-400/40 text-blue-300 hover:bg-blue-500/10 px-4 py-2 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${queueProcessing ? 'animate-spin' : ''}`} />
              {queueProcessing ? 'Processing queue...' : 'Process queue now'}
            </button>
          </div>
        </div>

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

      <div className="dashboard-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Sent reports history</h3>
          <button
            type="button"
            onClick={() => authIdToken && loadSentHistory(authIdToken)}
            disabled={historyLoading || !authIdToken}
            className="text-xs text-blue-300 hover:underline disabled:opacity-50"
          >
            {historyLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {sentHistory.length === 0 ? (
          <p className="text-white/50 text-sm">No sent report history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/50 border-b border-white/10">
                <tr>
                  <th className="py-2 pr-3">Company</th>
                  <th className="py-2 pr-3">Month</th>
                  <th className="py-2 pr-3">Template</th>
                  <th className="py-2 pr-3">Recipient</th>
                  <th className="py-2 pr-3">KPIs</th>
                  <th className="py-2">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sentHistory.map((item) => (
                  <tr key={item.id} className="text-white/80">
                    <td className="py-2 pr-3">{item.company_name}</td>
                    <td className="py-2 pr-3">{item.month_label}</td>
                    <td className="py-2 pr-3 capitalize">{item.template}</td>
                    <td className="py-2 pr-3">{item.recipient_email}</td>
                    <td className="py-2 pr-3 text-xs text-white/60">
                      C:{item.stats?.checksCompleted ?? 0} / R:{item.stats?.defectsResolved ?? 0} / D:{item.stats?.defectsReported ?? 0}
                    </td>
                    <td className="py-2">
                      {item.sent_at ? new Date(item.sent_at).toLocaleString('en-GB') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
