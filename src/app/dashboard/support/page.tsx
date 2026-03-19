'use client';

import React, { useEffect, useState } from 'react';
import {
  collection, query, where, getDocs, addDoc, orderBy,
  doc, getDoc, serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { Plus, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import Modal from '../components/Modal';
import { EmptyStateTableRow } from '../components/EmptyState';

type Ticket = {
  id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt?: Timestamp;
  lastMessage?: string;
};

type Message = {
  id: string;
  senderName: string;
  senderRole: 'admin' | 'manager' | 'user';
  message: string;
  createdAt?: Timestamp;
};

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ uid: string; company_id?: string; role?: string; name: string; email?: string } | null>(null);
  const [companyName, setCompanyName] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) { setLoading(false); return; }
      const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (!snap.exists()) { setLoading(false); return; }
      const d = snap.data();
      const name = d.first_name ? `${d.first_name} ${d.last_name || ''}`.trim() : d.displayName || user.email?.split('@')[0] || 'User';
      setProfile({ uid: user.uid, company_id: d.company_id, role: d.role, name, email: user.email || undefined });
      if (d.company_id) {
        const cSnap = await getDoc(doc(firebaseDb, 'companies', d.company_id));
        if (cSnap.exists()) setCompanyName(cSnap.data().name || '');
      }
      fetchTickets(user.uid);
    });
    return () => unsub();
  }, []);

  const fetchTickets = async (uid: string) => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(
        collection(firebaseDb, 'support_tickets'),
        where('submittedById', '==', uid),
        orderBy('createdAt', 'desc')
      ));
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseDb || !profile || !formSubject.trim() || !formMessage.trim()) return;
    setSubmitting(true);
    try {
      const ticketRef = await addDoc(collection(firebaseDb, 'support_tickets'), {
        subject: formSubject.trim(),
        companyName,
        submittedById: profile.uid,
        submittedByName: profile.name,
        submittedByEmail: profile.email || '',
        status: 'open',
        priority: formPriority,
        lastMessage: formMessage.trim().slice(0, 100),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await addDoc(collection(firebaseDb, 'support_tickets', ticketRef.id, 'messages'), {
        senderName: profile.name,
        senderRole: profile.role || 'user',
        message: formMessage.trim(),
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setFormSubject(''); setFormMessage(''); setFormPriority('medium');
      if (profile.uid) fetchTickets(profile.uid);
    } catch (e) { alert('Failed to submit ticket.'); console.error(e); }
    finally { setSubmitting(false); }
  };

  const loadMessages = async (ticketId: string) => {
    if (!firebaseDb || messages[ticketId]) return;
    try {
      const snap = await getDocs(query(
        collection(firebaseDb, 'support_tickets', ticketId, 'messages'),
        orderBy('createdAt', 'asc')
      ));
      setMessages((prev) => ({ ...prev, [ticketId]: snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)) }));
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (ticketId: string) => {
    if (expanded === ticketId) { setExpanded(null); return; }
    setExpanded(ticketId);
    loadMessages(ticketId);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Support</h1>
          <p className="text-white/60 text-sm mt-1">Open a ticket and our team will get back to you</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
        >
          <Plus className="h-4 w-4" />
          New Ticket
        </button>
      </div>

      {/* Info card */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 mb-6 flex gap-3">
        <MessageSquare className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-white/80 text-sm font-medium">How support works</p>
          <p className="text-white/50 text-sm mt-1">
            Submit a ticket below describing your issue. Our team will review it and reply directly here. You&apos;ll see the full thread when you click on any ticket.
          </p>
        </div>
      </div>

      {/* Tickets list */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-8 text-center text-white/40 text-sm">Loading tickets…</div>
        ) : tickets.length === 0 ? (
          <div className="bg-black border border-blue-500/20 rounded-xl p-10 text-center">
            <MessageSquare className="h-8 w-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">No tickets yet. Click &quot;New Ticket&quot; to get in touch.</p>
          </div>
        ) : tickets.map((ticket) => (
          <div key={ticket.id} className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleExpand(ticket.id)}
              className="w-full flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-white/40 text-xs capitalize">{ticket.priority} priority</span>
                </div>
                <p className="text-white font-medium truncate">{ticket.subject}</p>
                {ticket.lastMessage && (
                  <p className="text-white/40 text-xs mt-0.5 truncate">{ticket.lastMessage}</p>
                )}
              </div>
              {expanded === ticket.id ? <ChevronUp className="h-4 w-4 text-white/40 shrink-0" /> : <ChevronDown className="h-4 w-4 text-white/40 shrink-0" />}
            </button>
            {expanded === ticket.id && (
              <div className="border-t border-white/10 px-6 py-4">
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {(messages[ticket.id] || []).length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No messages yet.</p>
                  ) : (messages[ticket.id] || []).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.senderRole === 'admin'
                          ? 'bg-blue-500/20 text-white border border-blue-500/30 rounded-bl-sm'
                          : 'bg-white/10 text-white/85 border border-white/10 rounded-br-sm'
                      }`}>
                        <p className="text-xs font-medium mb-1 opacity-60">{msg.senderRole === 'admin' ? 'Stock Track PRO Support' : msg.senderName}</p>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1">Subject <span className="text-red-400">*</span></label>
            <input type="text" value={formSubject} onChange={(e) => setFormSubject(e.target.value)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Brief description of your issue" required />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Priority</label>
            <select value={formPriority} onChange={(e) => setFormPriority(e.target.value as typeof formPriority)}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none">
              <option value="low">Low — general question</option>
              <option value="medium">Medium — something isn&apos;t working</option>
              <option value="high">High — urgent / blocking issue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">Message <span className="text-red-400">*</span></label>
            <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} rows={4}
              className="w-full bg-black border border-blue-500/30 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none resize-none"
              placeholder="Describe your issue in detail…" required />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-white/20 text-white/80 hover:border-white/40">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:opacity-60">
              {submitting ? 'Submitting…' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
