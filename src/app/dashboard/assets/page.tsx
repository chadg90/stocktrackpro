'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, Pencil, Trash2, Search, QrCode, Image as ImageIcon, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import ImageViewerModal from '../components/ImageViewerModal';

type Tool = {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  status: 'active' | 'maintenance' | 'broken' | 'retired' | 'lost';
  qr_code?: string;
  image_url?: string;
  company_id: string;
  location?: string;
  purchased_at?: string;
};

type Profile = {
  company_id?: string;
  role?: string;
};

export default function AssetsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool | null>(null);
  const [formData, setFormData] = useState<Partial<Tool>>({});
  const [processing, setProcessing] = useState(false);
  
  // Image viewer state
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageAlt, setViewingImageAlt] = useState('');

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        // Fetch profile
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          if (data.company_id) {
            fetchTools(data.company_id);
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchTools = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const q = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId));
      const snapshot = await getDocs(q);
      const toolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tool));
      setTools(toolsData);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile?.company_id) return;
    
    setProcessing(true);
    try {
      await addDoc(collection(firebaseDb!, 'tools'), {
        ...formData,
        company_id: profile.company_id,
        created_at: serverTimestamp(),
        status: formData.status || 'active',
        // If qr_code is not provided, generate a simple one (or leave empty for app to handle)
        qr_code: formData.qr_code || `TOOL-${Date.now()}`, 
      });
      setIsAddModalOpen(false);
      setFormData({});
      fetchTools(profile.company_id);
    } catch (error) {
      console.error('Error adding tool:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !currentTool) return;

    setProcessing(true);
    try {
      const toolRef = doc(firebaseDb!, 'tools', currentTool.id);
      await updateDoc(toolRef, {
        ...formData,
        updated_at: serverTimestamp(),
      });
      setIsEditModalOpen(false);
      setCurrentTool(null);
      setFormData({});
      if (profile?.company_id) fetchTools(profile.company_id);
    } catch (error) {
      console.error('Error updating tool:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.') || !firebaseDb) return;
    
    try {
      await deleteDoc(doc(firebaseDb!, 'tools', toolId));
      if (profile?.company_id) fetchTools(profile.company_id);
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  const openEditModal = (tool: Tool) => {
    setCurrentTool(tool);
    setFormData(tool);
    setIsEditModalOpen(true);
  };

  const filteredTools = tools.filter(tool => 
    tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.qr_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <ImageViewerModal 
        isOpen={!!viewingImage} 
        onClose={() => setViewingImage(null)} 
        imageUrl={viewingImage} 
        altText={viewingImageAlt} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Assets</h1>
          <p className="text-white/70 text-sm mt-1">Manage your tools and equipment inventory</p>
        </div>
        <button
          onClick={() => {
            setFormData({});
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-black px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Asset
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Search by name, brand, or QR code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full md:w-96 bg-black border border-primary/30 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-black border border-primary/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-primary/20 text-white/70 text-sm uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">Asset Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    Loading assets...
                  </td>
                </tr>
              ) : filteredTools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    No assets found. Add your first asset to get started.
                  </td>
                </tr>
              ) : (
                filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                            if (tool.image_url) {
                              setViewingImage(tool.image_url);
                              setViewingImageAlt(tool.name || 'Asset Image');
                            }
                          }}
                          className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden ${tool.image_url ? 'hover:ring-2 hover:ring-primary cursor-pointer' : ''}`}
                        >
                          {tool.image_url ? (
                            <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-white/40" />
                          )}
                        </button>
                        <div>
                          <p className="text-white font-medium">{tool.name || 'Unnamed Asset'}</p>
                          <p className="text-white/50 text-xs">
                            {tool.brand} {tool.model}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${tool.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                          tool.status === 'broken' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          tool.status === 'maintenance' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-white/10 text-white/60 border border-white/20'}`}
                      >
                        {tool.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 opacity-50" />
                        {tool.qr_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-sm">
                      {tool.location || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(tool)}
                          className="p-2 text-white/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit Asset"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteTool(tool.id)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Asset (Admin Only)"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Asset"
      >
        <form onSubmit={handleAddTool} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Asset Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="e.g. Hilti Drill"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Status</label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
              <option value="lost">Lost</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="e.g. Warehouse A"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">QR Code (Optional)</label>
            <input
              type="text"
              value={formData.qr_code || ''}
              onChange={(e) => setFormData({...formData, qr_code: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              placeholder="Leave blank to auto-generate"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Adding Asset...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Asset"
      >
        <form onSubmit={handleEditTool} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Asset Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-1">Brand</label>
              <input
                type="text"
                value={formData.brand || ''}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Model</label>
              <input
                type="text"
                value={formData.model || ''}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Status</label>
            <select
              value={formData.status || 'active'}
              onChange={(e) => setFormData({...formData, status: e.target.value as any})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="broken">Broken</option>
              <option value="lost">Lost</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Location</label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">QR Code</label>
            <input
              type="text"
              value={formData.qr_code || ''}
              onChange={(e) => setFormData({...formData, qr_code: e.target.value})}
              className="w-full bg-black border border-primary/30 rounded-lg px-3 py-2 text-white focus:border-primary outline-none"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary hover:bg-primary-light text-black font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
            >
              {processing ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
