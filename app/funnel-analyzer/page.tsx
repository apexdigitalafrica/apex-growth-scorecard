// app/funnel-analyzer/page.tsx
'use client';

import React, { useState } from 'react';
import FunnelScorecard from '@/components/FunnelScorecard';
import type { FunnelSnapshot } from '@/lib/funnelTypes';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Users,
  ArrowRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function FunnelAnalyzerPage() {
  const [showResults, setShowResults] = useState(false);
  const [funnelData, setFunnelData] = useState<FunnelSnapshot | null>(null);

  // Example: Load data (replace with your data source)
  const handleAnalyzeFunnel = () => {
    // This would normally come from a form or API
    const exampleData: FunnelSnapshot = {
      businessName: 'Your Business',
      periodLabel: 'Last 30 Days',
      currency: '₦',
      estimatedRevenue: 5000000,
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
          label: 'Lead Capture',
          input: 3000,
          output: 1500,
          targetConversion: 0.6,
        },
        {
          id: 'consideration',
          label: 'Discovery Calls',
          input: 1500,
          output: 600,
          targetConversion: 0.5,
        },
        {
          id: 'purchase',
          label: 'Closed Deals',
          input: 600,
          output: 100,
          targetConversion: 0.2,
        },
      ],
    };
    
    setFunnelData(exampleData);
    setShowResults(true);
  };

  if (showResults && funnelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <FunnelScorecard snapshot={funnelData} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-full text-emerald-400 text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          AI-Powered Funnel Analysis
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
          Find the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Revenue Leaks</span> in Your Funnel
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Discover exactly where you're losing customers—and how much revenue you could recover without spending more on ads.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">₦2.5M+</div>
            <div className="text-xs text-slate-400">Revenue Recovered</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <Users className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">150+</div>
            <div className="text-xs text-slate-400">Funnels Analyzed</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">40%</div>
            <div className="text-xs text-slate-400">Avg Improvement</div>
          </div>
        </div>

        <button
          onClick={handleAnalyzeFunnel}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-2xl shadow-emerald-500/25"
        >
          <BarChart3 className="w-5 h-5" />
          Analyze My Funnel - Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-sm text-slate-500 mt-4">
          ⚡ Takes 2 minutes • No credit card required
        </p>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          What You'll Discover
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: AlertTriangle,
              title: 'Biggest Revenue Leaks',
              description: 'Pinpoint exactly which stage is hemorrhaging customers and costing you money.',
            },
            {
              icon: DollarSign,
              title: 'Hidden Revenue',
              description: 'Calculate how much money is trapped inside your funnel right now.',
            },
            {
              icon: TrendingUp,
              title: 'Action Plan',
              description: 'Get specific, prioritized steps to plug leaks and boost conversions.',
            },
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all">
              <feature.icon className="w-10 h-10 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Link to other tool */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">
            Looking for Individual Growth Assessment?
          </h3>
          <p className="text-slate-300 mb-6">
            Check out our comprehensive Digital Growth Scorecard
          </p>
          <Link
            href="/scorecard"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105"
          >
            Take Growth Scorecard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
