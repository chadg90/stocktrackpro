'use client';

import React from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';

const WHATSAPP_NUMBER = '447438146343';
const WHATSAPP_TEXT = encodeURIComponent(
  'Hi Stock Track PRO support, I need help with:'
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`;

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">WhatsApp Support</h1>
          <p className="text-white/60 text-sm mt-1">
            We now handle dashboard support through WhatsApp Business for faster responses.
          </p>
        </div>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          Message on WhatsApp
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6">
        <p className="text-white font-medium mb-2">How to report an issue</p>
        <ul className="space-y-2 text-sm text-white/70">
          <li>Describe the issue clearly and include what you were trying to do.</li>
          <li>Add your company name and user email so we can identify your account quickly.</li>
          <li>Attach screenshots where possible to speed up resolution.</li>
        </ul>
        <p className="text-white/55 text-xs mt-4">
          WhatsApp number: +44 7438 146343
        </p>
      </div>
    </div>
  );
}
