'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  orderBy,
  limit,
  getCountFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Pencil, Trash2, Search, Building2, Users, Truck, Package, Plus, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';

type Company = {
  id: string;
  name?: string;
  subscription_status?: string;
  subscription_type?: string;
  subscription_expiry_date?: any;
  created_at?: any;
};

type CompanyWithCounts = Company & {
  vehiclesCount: number;
  assetsCount: number;
  usersCount: number;
};

type Profile = {
  company_id?: string;
  role?: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Admin company selection
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [editName, setEditName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [processing, setProcessing] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          if (data.role === 'admin') {
            fetchCompanies();
          } else {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchCompanyDetails = async (companyId: string) => {
    console.log('Fetching company details for:', companyId); // Debug log
    if (!firebaseDb || !companyId) {
      console.log('Missing firebaseDb or companyId');
      return;
    }
    setLoadingDetails(true);
    try {
      // Fetch company info
      const companyRef = doc(firebaseDb!, 'companies', companyId);
      const companySnap = await getDoc(companyRef);
      const companyData = companySnap.exists() ? { id: companySnap.id, ...companySnap.data() } : null;

      if (!companyData) {
        setCompanyDetails(null);
        return;
      }

      // Fetch detailed counts and recent data
      const [
        vehiclesCount,
        assetsCount,
        usersCount,
        inspectionsCount,
        defectsCount,
        defectsResolvedCount,
        assetsCheckedOutCount,
        activeVehiclesCount,
        maintenanceVehiclesCount,
        serviceDueVehiclesCount,
        activeAssetsCount,
        maintenanceAssetsCount,
        retiredAssetsCount
      ] = await Promise.all([
        getCountFromServer(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicle_inspections'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicle_defects'), where('company_id', '==', companyId), where('status', '==', 'resolved'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'tool_history'), where('company_id', '==', companyId))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'active'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'maintenance'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', companyId), where('status', '==', 'service_due'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId), where('status', '==', 'active'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId), where('status', '==', 'maintenance'))).then(snap => snap.data().count).catch(() => 0),
        getCountFromServer(query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId), where('status', '==', 'retired'))).then(snap => snap.data().count).catch(() => 0),
      ]);

      // Fetch recent inspections (more than 3)
      const recentInspectionsQ = query(
        collection(firebaseDb!, 'vehicle_inspections'),
        where('company_id', '==', companyId),
        orderBy('inspected_at', 'desc'),
        limit(10)
      );
      const inspectionsSnap = await getDocs(recentInspectionsQ);
      const recentInspections = inspectionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch recent defects (more than 3)
      const recentDefectsQ = query(
        collection(firebaseDb!, 'vehicle_defects'),
        where('company_id', '==', companyId),
        orderBy('reported_at', 'desc'),
        limit(10)
      );
      const defectsSnap = await getDocs(recentDefectsQ);
      const recentDefects = defectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch recent tool history
      const recentToolHistoryQ = query(
        collection(firebaseDb!, 'tool_history'),
        where('company_id', '==', companyId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );
      const toolHistorySnap = await getDocs(recentToolHistoryQ);
      const recentToolHistory = toolHistorySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch team members
      const teamQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
      const teamSnap = await getDocs(teamQ);
      const teamMembers = teamSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('Setting company details for:', companyId); // Debug log
      setCompanyDetails({
        ...companyData,
        stats: {
          vehiclesCount,
          assetsCount,
          usersCount,
          inspectionsCount,
          defectsCount,
          defectsResolvedCount,
          assetsCheckedOutCount,
          activeVehiclesCount,
          maintenanceVehiclesCount,
          serviceDueVehiclesCount,
          activeAssetsCount,
          maintenanceAssetsCount,
          retiredAssetsCount
        },
        recentInspections,
        recentDefects,
        recentToolHistory,
        teamMembers
      });
      console.log('Company details set successfully'); // Debug log
    } catch (error) {
      console.error('Error fetching company details:', error);
      setCompanyDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchCompanies = async () => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      // Fetch all companies
      const companiesQ = query(collection(firebaseDb!, 'companies'));
      const companiesSnap = await getDocs(companiesQ);
      const companiesData = companiesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Company));

      // Fetch counts for each company
      const companiesWithCounts = await Promise.all(
        companiesData.map(async (company) => {
          try {
            const [vehiclesCount, assetsCount, usersCount] = await Promise.all([
              getCountFromServer(query(collection(firebaseDb!, 'vehicles'), where('company_id', '==', company.id))).then(snap => snap.data().count).catch(() => 0),
              getCountFromServer(query(collection(firebaseDb!, 'tools'), where('company_id', '==', company.id))).then(snap => snap.data().count).catch(() => 0),
              getCountFromServer(query(collection(firebaseDb!, 'profiles'), where('company_id', '==', company.id))).then(snap => snap.data().count).catch(() => 0),
            ]);
            return { ...company, vehiclesCount, assetsCount, usersCount };
          } catch (error) {
            console.error('Error fetching counts for company:', company.id, error);
            return { ...company, vehiclesCount: 0, assetsCount: 0, usersCount: 0 };
          }
        })
      );

      console.log('Fetched companies:', companiesWithCounts.length); // Debug log
      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (companyId: string) => {
    console.log('Company selected:', companyId); // Debug log
    setSelectedCompanyId(companyId);
    if (companyId) {
      fetchCompanyDetails(companyId);
    } else {
      setCompanyDetails(null);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !newCompanyName.trim()) return;

    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'companies'), {
        name: newCompanyName.trim(),
        subscription_status: 'trial',
        created_at: serverTimestamp(),
      });
      setIsCreateModalOpen(false);
      setNewCompanyName('');
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentCompany || !editName.trim()) return;

    setProcessing(true);
    try {
      const companyRef = doc(firebaseDb!, 'companies', currentCompany.id);
      await updateDoc(companyRef, {
        name: editName.trim(),
        updated_at: serverTimestamp(),
      });
      setIsEditModalOpen(false);
      setCurrentCompany(null);
      setEditName('');
      fetchCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!isAdmin) {
      alert('Only admins can delete companies.');
      return;
    }

    const company = companies.find(c => c.id === companyId);
    if (!confirm(`Delete company "${company?.name || companyId}"? This will permanently delete the company and all associated data. This action cannot be undone.`)) return;

    try {
      await deleteDoc(doc(firebaseDb!, 'companies', companyId));
      fetchCompanies();
      if (selectedCompanyId === companyId) {
        setSelectedCompanyId('');
        setCompanyDetails(null);
      }
      alert('Company deleted successfully.');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');
    }
  };

  const openEditModal = (company: Company) => {
    setCurrentCompany(company);
    setEditName(company.name || '');
    setIsEditModalOpen(true);
  };

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-white/70 text-lg">Access Restricted</p>
          <p className="text-white/50 text-sm mt-2">Only administrators can view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {selectedCompanyId ? `Company: ${companyDetails?.name || selectedCompanyId}` : 'Companies'}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            {selectedCompanyId ? 'Detailed company information and management' : 'Manage all companies and view their statistics'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!selectedCompanyId && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Company
            </button>
          )}
          {selectedCompanyId && (
            <button
              onClick={() => handleCompanySelect('')}
              className="inline-flex items-center gap-2 border border-primary/40 text-primary hover:border-primary hover:bg-primary/10 px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              ← Back to Companies
            </button>
          )}
        </div>
      </div>

      {/* Company Selector */}
      {!selectedCompanyId && (
        <div className="mb-6">
          <label className="block text-sm text-white/70 mb-2">Select Company for Detailed View</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => {
              console.log('Dropdown changed to:', e.target.value); // Debug log
              handleCompanySelect(e.target.value);
            }}
            className="w-full md:w-96 bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
          >
            <option value="">Choose a company to view details...</option>
            {companies.length > 0 ? companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name || company.id} ({company.usersCount} users, {company.vehiclesCount} vehicles, {company.assetsCount} assets)
              </option>
            )) : (
              <option disabled>Loading companies...</option>
            )}
          </select>
        </div>
      )}

      {/* Company Details View */}
      {selectedCompanyId ? (
        <div className="space-y-6">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Company Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { title: 'Total Assets', value: companyDetails.stats.assetsCount, icon: Package, subtitle: `${companyDetails.stats.activeAssetsCount} active` },
                  { title: 'Total Vehicles', value: companyDetails.stats.vehiclesCount, icon: Truck, subtitle: `${companyDetails.stats.activeVehiclesCount} active` },
                  { title: 'Team Members', value: companyDetails.stats.usersCount, icon: Users },
                  { title: 'Inspections', value: companyDetails.stats.inspectionsCount, icon: Building2 },
                ].map((item) => (
                  <div key={item.title} className="bg-black border border-primary/25 rounded-xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">{item.title}</p>
                        <p className="text-white text-xl font-semibold">
                          {item.value || 0}
                        </p>
                      </div>
                    </div>
                    {item.subtitle && (
                      <p className="text-white/50 text-xs">{item.subtitle}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { title: 'Active Vehicles', value: companyDetails.stats.activeVehiclesCount, icon: Truck, color: 'text-green-400' },
                  { title: 'Vehicles in Service', value: companyDetails.stats.maintenanceVehiclesCount, icon: Truck, color: 'text-yellow-400' },
                  { title: 'Service Due', value: companyDetails.stats.serviceDueVehiclesCount, icon: Truck, color: 'text-orange-400' },
                  { title: 'Active Assets', value: companyDetails.stats.activeAssetsCount, icon: Package, color: 'text-green-400' },
                  { title: 'Assets in Maintenance', value: companyDetails.stats.maintenanceAssetsCount, icon: Package, color: 'text-yellow-400' },
                  { title: 'Retired Assets', value: companyDetails.stats.retiredAssetsCount, icon: Package, color: 'text-gray-400' },
                  { title: 'Open Defects', value: companyDetails.stats.defectsCount - companyDetails.stats.defectsResolvedCount, icon: AlertTriangle, color: 'text-red-400' },
                  { title: 'Resolved Defects', value: companyDetails.stats.defectsResolvedCount, icon: CheckCircle, color: 'text-green-400' },
                ].map((item) => (
                  <div key={item.title} className="bg-black border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <item.icon className={`h-4 w-4 ${item.color}`} />
                      <div>
                        <p className="text-white/60 text-xs">{item.title}</p>
                        <p className="text-white font-semibold">
                          {item.value || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-black border border-primary/25 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Company Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-white/70 text-sm">Company ID</p>
                      <p className="text-white font-mono">{companyDetails.id}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Company Name</p>
                      <p className="text-white">{companyDetails.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Subscription Status</p>
                      <p className="text-white">{companyDetails.subscription_status || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Subscription Type</p>
                      <p className="text-white">{companyDetails.subscription_type || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-primary/25 rounded-2xl p-6">
                  <h3 className="text-white text-lg font-semibold mb-4">Activity Summary</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm">Total Inspections</p>
                        <p className="text-white font-semibold">{companyDetails.stats.inspectionsCount}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Asset Checkouts</p>
                        <p className="text-white font-semibold">{companyDetails.stats.assetsCheckedOutCount}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/70 text-sm">Total Defects</p>
                        <p className="text-white font-semibold">{companyDetails.stats.defectsCount}</p>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm">Resolved Defects</p>
                        <p className="text-white font-semibold text-green-400">{companyDetails.stats.defectsResolvedCount}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-primary/20">
                      <p className="text-white/70 text-sm">Company Created</p>
                      <p className="text-white">{companyDetails.created_at ? new Date(companyDetails.created_at.seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Inspections */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Recent Inspections</h3>
                  <span className="text-xs text-white/50">Showing {Math.min(10, companyDetails.recentInspections.length)} most recent</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {companyDetails.recentInspections.length === 0 ? (
                    <p className="text-white/60 text-sm">No inspections found.</p>
                  ) : (
                    companyDetails.recentInspections.map((inspection: any) => (
                      <div key={inspection.id} className="rounded-lg border border-primary/15 p-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-semibold">
                            Vehicle: {inspection.vehicle_id || 'Unknown'}
                          </p>
                          <div className="flex items-center gap-2">
                            {inspection.has_defect && (
                              <span className="inline-block text-xs text-red-300 border border-red-400/50 px-2 py-0.5 rounded">
                                Defect Found
                              </span>
                            )}
                            <span className="text-xs text-white/50">
                              {inspection.inspected_at ? new Date(inspection.inspected_at.seconds * 1000).toLocaleDateString() : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <p className="text-white/60 text-xs">
                          Inspector: {inspection.inspected_by || 'Unknown'} • {inspection.inspected_at ? new Date(inspection.inspected_at.seconds * 1000).toLocaleTimeString() : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Defects */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Recent Defects</h3>
                  <span className="text-xs text-white/50">Showing {Math.min(10, companyDetails.recentDefects.length)} most recent</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {companyDetails.recentDefects.length === 0 ? (
                    <p className="text-white/60 text-sm">No defects found.</p>
                  ) : (
                    companyDetails.recentDefects.map((defect: any) => (
                      <div key={defect.id} className="rounded-lg border border-primary/15 p-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-semibold">
                              Vehicle: {defect.vehicle_id || 'Unknown'}
                            </p>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded capitalize
                              ${defect.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                defect.severity === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                defect.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}
                            >
                              {defect.severity || 'low'}
                            </span>
                            <span className={`inline-block text-xs px-2 py-0.5 rounded capitalize
                              ${defect.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                                defect.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'}`}
                            >
                              {defect.status || 'pending'}
                            </span>
                          </div>
                          <span className="text-xs text-white/50">
                            {defect.reported_at ? new Date(defect.reported_at.seconds * 1000).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm mb-2 line-clamp-2">
                          {defect.description || 'No description'}
                        </p>
                        <p className="text-white/60 text-xs">
                          Reported by: {defect.reported_by || 'Unknown'} • {defect.reported_at ? new Date(defect.reported_at.seconds * 1000).toLocaleTimeString() : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Tool History */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold">Recent Tool Activity</h3>
                  <span className="text-xs text-white/50">Showing {Math.min(10, companyDetails.recentToolHistory.length)} most recent</span>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {companyDetails.recentToolHistory.length === 0 ? (
                    <p className="text-white/60 text-sm">No tool activity found.</p>
                  ) : (
                    companyDetails.recentToolHistory.map((activity: any) => (
                      <div key={activity.id} className="rounded-lg border border-primary/15 p-3 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white text-sm font-semibold">
                            Tool: {activity.tool_id || 'Unknown'}
                          </p>
                          <span className="text-xs text-white/50">
                            {activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-white/70 text-sm capitalize">
                            Action: {activity.action || 'Unknown'}
                          </p>
                          <p className="text-white/60 text-xs">
                            User: {activity.user_id || 'Unknown'} • {activity.timestamp ? new Date(activity.timestamp.seconds * 1000).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Team Members */}
              <div className="bg-black border border-primary/25 rounded-2xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Team Members ({companyDetails.teamMembers.length})</h3>
                <div className="space-y-3">
                  {companyDetails.teamMembers.length === 0 ? (
                    <p className="text-white/60 text-sm">No team members found.</p>
                  ) : (
                    companyDetails.teamMembers.map((member: any) => (
                      <div key={member.id} className="rounded-lg border border-primary/15 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                            <span className="text-white/60 text-sm font-medium">
                              {(member.first_name || member.displayName || member.email || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {member.first_name && member.last_name ? `${member.first_name} ${member.last_name}` : (member.displayName || member.email?.split('@')[0] || 'Unknown User')}
                            </p>
                            <p className="text-white/60 text-xs">{member.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          member.role === 'admin' ? 'bg-primary/20 text-primary' :
                          member.role === 'manager' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-white/10 text-white/60'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="mb-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/30" />
            </div>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-96 bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
            />
          </div>

          {/* Companies Table */}
          <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-xs sm:text-sm uppercase">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium">Company Name</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium hidden md:table-cell">ID</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium">Vehicles</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium">Assets</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium">Users</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium hidden lg:table-cell">Subscription</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                        Loading companies...
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                        No companies found.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company) => (
                      <tr key={company.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-white/40" />
                            </div>
                            <div>
                              <p className="text-white font-medium text-sm sm:text-base">{company.name || 'Unnamed Company'}</p>
                              <p className="text-white/50 text-xs font-mono md:hidden">{company.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-white/70 font-mono text-xs hidden md:table-cell">
                          {company.id}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
                            <span className="text-white text-sm sm:text-base">{company.vehiclesCount}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
                            <span className="text-white text-sm sm:text-base">{company.assetsCount}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
                            <span className="text-white text-sm sm:text-base">{company.usersCount}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${company.subscription_status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                              company.subscription_status === 'trial' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                              'bg-white/10 text-white/60 border border-white/20'}`}
                          >
                            {company.subscription_status || 'inactive'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => openEditModal(company)}
                              className="p-1.5 sm:p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Edit Company"
                            >
                              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCompany(company.id)}
                              className="p-1.5 sm:p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Delete Company"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create Company Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Company"
      >
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={newCompanyName}
              onChange={(e) => setNewCompanyName(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="Company Name"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewCompanyName('');
              }}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:bg-primary-light disabled:opacity-60"
            >
              {processing ? 'Creating...' : 'Create Company'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentCompany ? `Edit ${currentCompany.name || 'Company'}` : 'Edit Company'}
      >
        <form onSubmit={handleEditCompany} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Company Name</label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="Company Name"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 rounded-lg bg-primary text-black font-semibold hover:bg-primary-light disabled:opacity-60"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}