// app/funnel-analysis/page.tsx
'use client';

import React, { useState } from 'react';
import FunnelScorecard from '@/components/FunnelScorecard';
import type { FunnelSnapshot } from '@/lib/funnelTypes';
import { Download, RefreshCw } from 'lucide-react';

export default function FunnelAnalysisPage() {
  // Example data - replace with real data from your backend
  const [snapshot] = useState<FunnelSnapshot>({
    businessName: 'Apex Digital Africa',
    periodLabel: 'November 2025',
    currency: '₦',
    estimatedRevenue: 5000000, // ₦5M
    stages: [
      {
        id: 'awareness',
        label: 'Website Visitors',
        input: 10000,
        output: 3000,
        targetConversion: 0.35,
      },
      {
        id: 'interest',
        label: 'Lead Magnets Downloaded',
        input: 3000,
        output: 1500,
        targetConversion: 0.6,
      },
      {
        id: 'consideration',
        label: 'Discovery Call Booked',
        input: 1500,
        output: 600,
        targetConversion: 0.5,
      },
      {
        id: 'intent',
        label: 'Proposal Sent',
        input: 600,
        output: 300,
        targetConversion: 0.6,
      },
      {
        id: 'evaluation',
        label: 'Negotiation',
        input: 300,
        output: 200,
        targetConversion: 0.7,
      },
      {
        id: 'purchase',
        label: 'Deals Closed',
        input: 200,
        output: 100,
        targetConversion: 0.6,
      },
    ],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">
            Funnel Analysis Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Real-time diagnostic of how efficiently you turn attention into revenue
          </p>
        </div>

        {/* Scorecard */}
        <FunnelScorecard snapshot={snapshot} />

        {/* Additional Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105">
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
          <button className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25">
            <Download className="w-4 h-4" />
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
}
