'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ExternalLink } from 'lucide-react';

const WHATSAPP_SUPPORT_URL = 'https://wa.me/447438146343?text=Hi%20Stock%20Track%20PRO%20support%2C%20I%20need%20help%20with%3A';

export default function AdminTicketsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Support Routing Updated</h1>
        <p className="text-white/60 text-sm mt-1">
          Dashboard ticketing has been retired. Support is now handled through WhatsApp Business.
        </p>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <p className="text-white font-medium mb-2">New support channel</p>
        <p className="text-white/70 text-sm mb-4">
          Ask users to message support directly on WhatsApp so issues are picked up faster.
        </p>
        <a
          href={WHATSAPP_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp Support
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <Link
        href="/dashboard/support"
        className="inline-flex text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        Go to Support page
      </Link>
    </div>
  );
}
