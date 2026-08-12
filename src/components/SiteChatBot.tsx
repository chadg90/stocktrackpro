'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, RotateCcw } from 'lucide-react';
import { SITE_CHAT_TOPICS, SITE_CHAT_WHATSAPP_URL } from '@/content/siteChatFaq';

type ChatMessage =
  | { id: string; role: 'bot'; text: string }
  | { id: string; role: 'user'; text: string };

const WELCOME =
  'Hi — I can answer common questions about Fleet Track PRO. Pick a topic below, or message us on WhatsApp / Contact if you need a person.';

function isDashboardPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === '/dashboard' || pathname.startsWith('/dashboard/');
}

export default function SiteChatBot() {
  const pathname = usePathname();
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'bot', text: WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  if (isDashboardPath(pathname)) return null;

  const resetChat = () => {
    setMessages([{ id: `welcome-${Date.now()}`, role: 'bot', text: WELCOME }]);
  };

  const askTopic = (topicId: string) => {
    const topic = SITE_CHAT_TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    setMessages((prev) => [
      ...prev,
      { id: `u-${topic.id}-${Date.now()}`, role: 'user', text: topic.label },
      { id: `b-${topic.id}-${Date.now()}`, role: 'bot', text: topic.answer },
    ]);
  };

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Fleet Track PRO help chat"
          className="flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.14)]"
        >
          <div className="flex items-center justify-between gap-2 bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Quick help</p>
              <p className="text-xs text-slate-300">FAQ answers · WhatsApp & contact</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Reset chat"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div ref={listRef} className="max-h-[min(50vh,22rem)] space-y-3 overflow-y-auto bg-slate-50 px-3 py-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[var(--brand-blue)] text-white'
                      : 'border border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Ask about
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SITE_CHAT_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => askTopic(topic.id)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-left text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white"
                >
                  {topic.label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={SITE_CHAT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                WhatsApp
              </a>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                Contact form
              </Link>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-blue)] text-white shadow-lg shadow-slate-900/15 transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)] focus:ring-offset-2"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close help chat' : 'Open help chat'}
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>
    </div>
  );
}
