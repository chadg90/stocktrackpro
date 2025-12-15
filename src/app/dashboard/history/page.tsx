'use client';

import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  orderBy,
  limit,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Clock, Search, Filter } from 'lucide-react';

type HistoryItem = {
  id: string;
  tool_id?: string; // Can be asset or vehicle ID
  action?: string;
  user_id?: string;
  timestamp?: Timestamp | string;
  details?: string;
  user_email?: string; // Optional if we can join data
};

type Profile = {
  id: string;
  company_id?: string;
  role?: string;
  displayName?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
};

type Tool = {
  id: string;
  name?: string;
  brand?: string;
  model?: string;
};

const formatDate = (value?: string | Timestamp) => {
  if (!value) return '—';
  try {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }
    return new Date(value).toLocaleString();
  } catch {
    return typeof value === 'string' ? value : '—';
  }
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tools, setTools] = useState<Record<string, Tool>>({});
  const [users, setUsers] = useState<Record<string, Profile>>({});
  
  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user && firebaseDb) {
        const profileRef = doc(firebaseDb, 'profiles', user.uid);
        const snap = await import('firebase/firestore').then(mod => mod.getDoc(profileRef));
        if (snap.exists()) {
          const data = snap.data() as Profile;
          setProfile(data);
          if (data.company_id) {
            fetchHistory(data.company_id);
          }
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchHistory = async (companyId: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      // Fetch tools for mapping
      const toolsQ = query(collection(firebaseDb!, 'tools'), where('company_id', '==', companyId));
      const toolsSnap = await getDocs(toolsQ);
      const toolsMap: Record<string, Tool> = {};
      toolsSnap.docs.forEach(doc => {
        toolsMap[doc.id] = { id: doc.id, ...doc.data() } as Tool;
      });
      setTools(toolsMap);

      // Fetch users for mapping
      const usersQ = query(collection(firebaseDb!, 'profiles'), where('company_id', '==', companyId));
      const usersSnap = await getDocs(usersQ);
      const usersMap: Record<string, Profile> = {};
      usersSnap.docs.forEach(doc => {
        usersMap[doc.id] = { id: doc.id, ...doc.data() } as Profile;
      });
      setUsers(usersMap);

      // Fetch tool_history
      const historyQ = query(
        collection(firebaseDb!, 'tool_history'),
        where('company_id', '==', companyId),
        orderBy('timestamp', 'desc'),
        limit(50) // Limit to last 50 events for performance
      );
      
      const historySnap = await getDocs(historyQ);
      const historyData = historySnap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as HistoryItem));
      
      setHistory(historyData);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    item.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tool_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity History</h1>
          <p className="text-white/70 text-sm mt-1">Audit log of all asset and fleet activities</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-white/30" />
        </div>
        <input
          type="text"
          placeholder="Search by action, asset ID, or user..."
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
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Item ID</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    Loading history...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-white/50">
                    No history found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const tool = item.tool_id ? tools[item.tool_id] : null;
                  const user = item.user_id ? users[item.user_id] : null;
                  
                  // Build user name with first_name + last_name priority
                  let userName = '—';
                  if (user) {
                    if (user.first_name || user.last_name) {
                      userName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
                    } else {
                      userName = user.displayName || user.name || user.email?.split('@')[0] || 'Unknown';
                    }
                  } else if (item.user_id) {
                    userName = item.user_id;
                  }
                  
                  const toolName = tool ? (tool.name || `${tool.brand} ${tool.model}`.trim() || item.tool_id) : (item.tool_id || '—');
                  
                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-white/70 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-50" />
                          {formatDate(item.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${item.action?.includes('check_out') ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                            item.action?.includes('check_in') ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            'bg-white/10 text-white/60 border border-white/20'}`}
                        >
                          {item.action?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white text-sm">
                        {toolName}
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">
                        {userName}
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {item.details || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
