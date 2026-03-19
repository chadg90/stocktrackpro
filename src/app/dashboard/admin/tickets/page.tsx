'use client';

import React, { useEffect, useState } from 'react';
import {
  collection, query, getDocs, orderBy, doc, getDoc,
  updateDoc, serverTimestamp, Timestamp, addDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth, firebaseDb } from '@/lib/firebase';
import { MessageSquare, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { EmptyStateTableRow } from '../../components/EmptyState';
import TableSkeleton from '../../components/TableSkeleton';

type Ticket = {
  id: string;
  subject: string;
  companyName?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
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

const PRIORITY_STYLES: Record<string, string> = {
  low: 'text-white/40',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const fmt = (ts?: Timestamp) => ts ? ts.toDate().toLocaleString('en-GB') : '—';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [reply, setReply] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth || !firebaseDb) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user || !firebaseDb) { setLoading(false); return; }
      const snap = await getDoc(doc(firebaseDb, 'profiles', user.uid));
      if (snap.exists() && snap.data().role === 'admin') {
        setIsAdmin(true);
        const d = snap.data();
        setAdminName(d.first_name ? `${d.first_name} ${d.last_name || ''}`.trim() : d.displayName || 'Admin');
        fetchTickets();
      } else { setLoading(false); }
    });
    return () => unsub();
  }, []);

  const fetchTickets = async () => {
    if (!firebaseDb) return;
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(firebaseDb, 'support_tickets'), orderBy('createdAt', 'desc')));
      setTickets(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Ticket)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
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

  const handleStatusChange = async (ticketId: string, status: Ticket['status']) => {
    if (!firebaseDb) return;
    await updateDoc(doc(firebaseDb, 'support_tickets', ticketId), { status, updatedAt: serverTimestamp() });
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
  };

  const handleReply = async (ticketId: string) => {
    const msg = reply[ticketId]?.trim();
    if (!msg || !firebaseDb) return;
    setSending(ticketId);
    try {
      const msgDoc = await addDoc(
        collection(firebaseDb, 'support_tickets', ticketId, 'messages'),
        { senderName: adminName, senderRole: 'admin', message: msg, createdAt: serverTimestamp() }
      );
      await updateDoc(doc(firebaseDb, 'support_tickets', ticketId), {
        lastMessage: msg.slice(0, 100),
        status: 'in_progress',
        updatedAt: serverTimestamp(),
      });
      setMessages((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), { id: msgDoc.id, senderName: adminName, senderRole: 'admin', message: msg }],
      }));
      setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: 'in_progress', lastMessage: msg.slice(0, 100) } : t));
      setReply((prev) => ({ ...prev, [ticketId]: '' }));
    } catch (e) { alert('Failed to send reply.'); console.error(e); }
    finally { setSending(null); }
  };

  if (!isAdmin && !loading) return <p className="text-white/60 p-6">Access denied.</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
        <p className="text-white/60 text-sm mt-1">Manage and respond to support requests from managers</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
            <table className="w-full"><tbody><TableSkeleton cols={5} /></tbody></table>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
            <table className="w-full"><tbody><EmptyStateTableRow colSpan={5} message="No support tickets yet." /></tbody></table>
          </div>
        ) : tickets.map((ticket) => (
          <div key={ticket.id} className="bg-black border border-blue-500/20 rounded-xl overflow-hidden">
            {/* Ticket header row */}
            <button
              onClick={() => toggleExpand(ticket.id)}
              className="w-full flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className={`text-xs font-medium capitalize ${PRIORITY_STYLES[ticket.priority]}`}>
                    {ticket.priority} priority
                  </span>
                </div>
                <p className="text-white font-medium truncate">{ticket.subject}</p>
                <p className="text-white/50 text-xs mt-0.5">
                  {ticket.companyName} — {ticket.submittedByName || ticket.submittedByEmail} &bull; {fmt(ticket.createdAt)}
                </p>
                {ticket.lastMessage && (
                  <p className="text-white/40 text-xs mt-1 truncate">{ticket.lastMessage}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={ticket.status}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, e.target.value as Ticket['status']); }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-black border border-blue-500/30 rounded-lg px-2 py-1 text-white text-xs focus:border-blue-500 outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                {expanded === ticket.id ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
              </div>
            </button>

            {/* Expanded message thread */}
            {expanded === ticket.id && (
              <div className="border-t border-white/10 px-6 py-4">
                <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                  {(messages[ticket.id] || []).length === 0 ? (
                    <p className="text-white/40 text-sm text-center py-4">No messages yet.</p>
                  ) : (messages[ticket.id] || []).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.senderRole === 'admin'
                          ? 'bg-blue-500/20 text-white border border-blue-500/30 rounded-br-sm'
                          : 'bg-white/10 text-white/85 border border-white/10 rounded-bl-sm'
                      }`}>
                        <p className="text-xs font-medium mb-1 opacity-60">{msg.senderName}</p>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={reply[ticket.id] || ''}
                    onChange={(e) => setReply((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(ticket.id); } }}
                    placeholder="Type your reply… (Enter to send)"
                    rows={2}
                    className="flex-1 bg-white/5 border border-blue-500/30 rounded-xl px-3 py-2 text-white text-sm focus:border-blue-500 outline-none resize-none"
                  />
                  <button
                    onClick={() => handleReply(ticket.id)}
                    disabled={sending === ticket.id || !reply[ticket.id]?.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 self-end"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
