// app/funnel-analysis/page.tsx
'use client';

import { useEffect, useState } from 'react';
import FunnelScorecard from '@/components/FunnelScorecard';
import { transformToFunnelStages } from '@/lib/funnelDataTransformer';
import { DashboardStats, FunnelSnapshot } from '@/types/dashboard';
import { RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';

export default function FunnelAnalysisPage() {
  const [funnelData, setFunnelData] = useState<FunnelSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard-stats?range=30d');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }
      
      const dashboardStats: DashboardStats = await response.json();
      console.log('📊 Raw dashboard data:', dashboardStats);
      
      // Transform to funnel format
      const transformedData = transformToFunnelStages(dashboardStats);
      console.log('🔄 Transformed funnel data:', transformedData);
      
      setFunnelData(transformedData);
      
    } catch (error) {
      console.error('❌ Failed to fetch funnel data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-t-4 border-b-4 border-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-cyan-200 font-semibold text-lg animate-pulse">Loading Funnel Analysis...</p>
          <p className="text-cyan-300/60 text-sm mt-2">Analyzing your growth data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md border border-white/20">
          <div className="text-red-400 text-6xl mb-6 text-center">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-3 text-center">
            Failed to Load Funnel Data
          </h3>
          <p className="text-blue-200 text-center mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchFunnelData}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Loading
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-white/10 text-white px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!funnelData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md border border-white/20 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3">No Data Available</h3>
          <p className="text-blue-200 mb-6">Unable to generate funnel analysis from current data</p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <FunnelScorecard snapshot={funnelData} />;
}