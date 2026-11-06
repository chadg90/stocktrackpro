'use client';

import React, { useState } from 'react';
import DashboardPageTitle from '../components/DashboardPageTitle';
import PageGuideButton from '../components/PageGuide';
import InspectionPdfsPanel from './InspectionPdfsPanel';
import DocumentsPacksPanel from './DocumentsPacksPanel';

type DocTab = 'pdfs' | 'packs';

export default function VehicleDocumentsPage() {
  const [tab, setTab] = useState<DocTab>('pdfs');
  const [sharedVehicleId, setSharedVehicleId] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      <DashboardPageTitle title="Vehicle documents" />
      <div className="mb-6 px-4 md:px-6 pt-4 md:pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vehicle documents</h1>
          <PageGuideButton pageId="inspection-proof" />
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Choose a vehicle once, then switch between inspection PDFs and document packs.
        </p>

        <div
          className="mt-5 flex flex-wrap gap-x-1 border-b border-gray-200 dark:border-white/10"
          role="tablist"
          aria-label="Vehicle document sections"
        >
          {(
            [
              { id: 'pdfs', label: 'Inspection PDFs' },
              { id: 'packs', label: 'Documents & 6/12-month packs' },
            ] as const
          ).map(({ id, label }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={`-mb-px inline-flex items-center px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 dark:text-white/55 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'pdfs' ? (
        <InspectionPdfsPanel
          embedded
          sharedVehicleId={sharedVehicleId}
          onSharedVehicleIdChange={setSharedVehicleId}
        />
      ) : (
        <DocumentsPacksPanel
          embedded
          sharedVehicleId={sharedVehicleId}
          onSharedVehicleIdChange={setSharedVehicleId}
        />
      )}
    </div>
  );
}
