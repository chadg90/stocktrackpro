'use client';

import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase';
import { Puzzle, HardHat, CheckCircle, Wrench, Loader2, ExternalLink } from 'lucide-react';
import { PLANT_MODULE_DEV_MODE } from '@/lib/plantModeDev';
import Link from 'next/link';

type PlantModuleStatus = {
  has_plant_module: boolean;
  plant_module_status?: string;
  status?: string;
};

export default function AddOnsPage() {
  const [plantStatus, setPlantStatus] = useState<PlantModuleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) setIdToken(await user.getIdToken());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!idToken) return;
    setLoading(true);
    fetch('/api/billing/plant-module', { headers: { Authorization: `Bearer ${idToken}` } })
      .then((r) => r.json())
      .then(setPlantStatus)
      .finally(() => setLoading(false));
  }, [idToken]);

  const isActive = PLANT_MODULE_DEV_MODE || plantStatus?.has_plant_module;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Puzzle className="h-7 w-7 text-blue-400" />
          Add-ons
        </h1>
        <p className="text-sm text-white/50 mt-1">Optional modules to extend your Stock Track PRO subscription</p>
      </div>

      {/* DEV MODE Banner */}
      {PLANT_MODULE_DEV_MODE && (
        <div className="flex items-start gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-sm text-yellow-400">
          <Wrench className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Developer Mode Active</p>
            <p className="text-yellow-400/70 text-xs mt-0.5">
              The Plant &amp; Machinery module is enabled via <code className="bg-yellow-500/20 px-1 rounded">PLANT_MODULE_DEV_MODE=true</code>.
              Stripe billing will be required in production.
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-white/40" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Plant & Machinery Card */}
          <div className={`relative bg-white/3 border rounded-xl p-6 ${isActive ? 'border-green-500/30' : 'border-white/10'}`}>
            {isActive && (
              <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                <CheckCircle className="h-3 w-3" />
                Active
              </span>
            )}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <HardHat className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Plant &amp; Machinery</h2>
                <p className="text-xs text-white/40">LOLER 1998 / PUWER 1998 compliance</p>
              </div>
            </div>

            <ul className="space-y-1.5 text-sm text-white/60 mb-5">
              {[
                'Machine register with prohibition management',
                'LOLER & PUWER inspection reports with PDF generation',
                'Parts library with CSV import',
                'Hire equipment check-in / check-out',
                'Compliance due-date alerts (email + push)',
                'Inspector qualification tracking',
                'Full amendment audit trail',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {isActive ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard/machines"
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg text-center transition-colors"
                >
                  Open Machine Register
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-white/40">Contact us or subscribe to activate this add-on for your company.</p>
                <a
                  href="https://www.stocktrackpro.co.uk/add-ons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Learn More &amp; Activate
                </a>
              </div>
            )}
          </div>

          {/* Coming Soon Placeholder */}
          <div className="bg-white/3 border border-white/10 rounded-xl p-6 opacity-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Puzzle className="h-5 w-5 text-white/30" />
              </div>
              <div>
                <h2 className="font-semibold text-white/60">More Add-ons</h2>
                <p className="text-xs text-white/30">Coming soon</p>
              </div>
            </div>
            <p className="text-sm text-white/30">Additional compliance modules and integrations are in development.</p>
          </div>
        </div>
      )}
    </div>
  );
}
