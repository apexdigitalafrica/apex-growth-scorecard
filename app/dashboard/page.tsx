'use client';
export const dynamic = 'force-dynamic';
import { UserPlus, Clock } from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Users, 
  Target, 
  Download,
  RefreshCw,
  Search,
  BarChart3,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Zap,
  Sparkles,
  DollarSign,
  PieChart,
  Activity,
  Filter,
  FileSpreadsheet,
  Eye,
  X,
  Lock, 
  Shield,
  Award
} from 'lucide-react';

import AIGrowthChatbot from '@/components/AIGrowthChatbot';
import { useAuthStore } from '@/lib/session-client';
import { useRouter } from 'next/navigation';

// Types & Interfaces
interface DashboardStats {
  totalSubmissions: number;
  averageScore: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  recentSubmissions: SubmissionRecord[];
  dimensionAverages: DimensionAverage[];
  trends: {
    submissionsChange: number;
    scoreChange: number;
    hotLeadsChange: number;
  };
  conversionMetrics: {
    hotLeadRate: number;
    averageResponseTime: string;
    topPerformingIndustry: string;
  };
}

interface SubmissionRecord {
  id: string;
  company_name: string;
  email: string;
  total_score: number;
  total_stage: string;
  lead_priority?: string;
  lead_score?: number;
  lead_readiness?: string;
  created_at: string;
}

interface DimensionAverage {
  dimension_name: string;
  avg_percentage: number;
  count: number;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';
type LeadFilter = 'all' | 'hot' | 'warm' | 'cold';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // State Management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<SubmissionRecord | null>(null);

  // Data Fetching
  const fetchDashboardData = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      const response = await fetch(`/api/dashboard-stats?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch pending registrations count
  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch('/api/admin/registrations?status=pending');
        const data = await res.json();
        if (data.requests) {
          setPendingCount(data.requests.length);
        }
      } catch (error) {
        console.error('Failed to fetch pending count:', error);
      }
    }
    fetchPending();
  }, []);

  // Memoized Filtered Data
  const filteredSubmissions = useMemo(() => {
    if (!stats) return [];
    
    return stats.recentSubmissions.filter(submission => {
      const matchesSearch = submission.company_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        submission.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = leadFilter === 'all' || 
        submission.lead_priority?.toLowerCase() === leadFilter;
      
      return matchesSearch && matchesFilter;
    });
  }, [stats, searchTerm, leadFilter]);

  // Calculate estimated revenue
  const estimatedRevenue = useMemo(() => {
    if (!stats) return 0;
    return (stats.hotLeads * 5000) + (stats.warmLeads * 2000) + (stats.coldLeads * 500);
  }, [stats]);

  // Export Functions
  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (!stats) return;
    
    if (format === 'csv') {
      const csv = [
        ['Company', 'Email', 'Score', 'Stage', 'Priority', 'Readiness', 'Date'].join(','),
        ...filteredSubmissions.map(s => 
          [
            `"${s.company_name}"`,
            s.email,
            s.total_score,
            s.total_stage,
            s.lead_priority || 'N/A',
            s.lead_readiness || 'N/A',
            new Date(s.created_at).toLocaleDateString()
          ].join(',')
        )
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apex-scorecard-data-${timeRange}-${Date.now()}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(filteredSubmissions, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `apex-scorecard-data-${timeRange}-${Date.now()}.json`;
      a.click();
    }
  }, [stats, filteredSubmissions, timeRange]);

  // Loading State with Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <Sparkles className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-blue-200 font-semibold text-lg animate-pulse">Loading analytics...</p>
          <p className="text-blue-300/60 text-sm mt-2">Fetching your growth insights</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 max-w-md border border-white/20">
          <div className="text-red-400 text-6xl mb-6 text-center">⚠️</div>
          <h3 className="text-2xl font-bold text-white mb-3 text-center">
            Failed to Load Dashboard
          </h3>
          <p className="text-blue-200 text-center mb-8">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
	  
	  {/* 🔒 ELITE SECURITY BANNER */}
      <div className="relative z-50 bg-gradient-to-r from-green-900/90 via-emerald-900/90 to-green-900/90 backdrop-blur-xl border-b-2 border-green-500/50 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-4 animate-fadeIn">
            <Shield className="w-6 h-6 text-green-400 animate-pulse" />
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-300" />
              <span className="text-green-300 font-bold text-sm tracking-wider uppercase">
                🔒 SECURE ACCESS • AUTHORIZED PERSONNEL ONLY
              </span>
              <Lock className="w-5 h-5 text-green-300" />
            </div>
            <Shield className="w-6 h-6 text-green-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
		        <div>
                  <div className="text-white font-bold text-lg">Apex Dashboard</div>
                  <div className="text-blue-300 text-xs">Growth Analytics</div>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              {/* 🔐 Admin-only link */}
              {user && (user.role === 'admin' || user.permissions?.includes('admin')) && (
                <Link
                  href="/admin/registrations"
                  className="text-emerald-300 hover:text-emerald-100 transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/40 hover:bg-emerald-500/20"
                >
                  <Shield className="w-4 h-4" />
                  Admin Registrations
                  {pendingCount > 0 && (
                    <span className="inline-block bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full ml-2 text-xs animate-bounce shadow">
                      {pendingCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-red-300 hover:text-red-200 transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-500/20"
              >
                <Lock className="w-4 h-4" />
                Logout
              </button>
              
              <Link
                href="/scorecard"
                className="text-blue-200 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                View Scorecard
              </Link>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Access Cards */}
      <div className="relative z-10 max-w-[1600px] mx-auto p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Scorecard Overview */}
          <Link
            href="/scorecard"
            className="group bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500 transition-all hover:scale-105"
          >
            <Award className="w-10 h-10 text-emerald-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Growth Scorecard</h3>
            <p className="text-slate-400 mb-4">
              Individual digital maturity assessments
            </p>
            <div className="flex items-center text-emerald-400 font-semibold">
              View Submissions <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Funnel Analysis Tool */}
          <Link
            href="/funnel-analysis"
            className="group bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl p-6 hover:border-blue-500 transition-all hover:scale-105"
          >
            <BarChart3 className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Funnel Analysis</h3>
            <p className="text-slate-400 mb-4">
              Real-time funnel diagnostics & revenue recovery
            </p>
            <div className="flex items-center text-blue-400 font-semibold">
              Analyze Funnels <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Header Section with Glassmorphism */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                    Growth Analytics
                  </h1>
                  <p className="text-blue-300 text-sm mt-1">Real-time lead intelligence & insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Time Range Selector */}
              <div className="relative">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className="appearance-none px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="7d" className="bg-slate-800">Last 7 Days</option>
                  <option value="30d" className="bg-slate-800">Last 30 Days</option>
                  <option value="90d" className="bg-slate-800">Last 90 Days</option>
                  <option value="all" className="bg-slate-800">All Time</option>
                </select>
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300 pointer-events-none" />
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all disabled:opacity-50 flex items-center gap-2 group"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Export
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors rounded-t-xl flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors rounded-b-xl flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium KPI Cards with Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Submissions Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                {stats.trends.submissionsChange !== 0 && (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stats.trends.submissionsChange > 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {stats.trends.submissionsChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.trends.submissionsChange)}%
                  </div>
                )}
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {stats.totalSubmissions.toLocaleString()}
              </div>
              <div className="text-sm text-blue-200 font-medium">Total Submissions</div>
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 animate-pulse" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                {stats.trends.scoreChange !== 0 && (
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stats.trends.scoreChange > 0 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {stats.trends.scoreChange > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(stats.trends.scoreChange)}%
                  </div>
                )}
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {Math.round(stats.averageScore)}
                <span className="text-2xl text-blue-200/70">/100</span>
              </div>
              <div className="text-sm text-blue-200 font-medium">Average Score</div>
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 animate-pulse" style={{ width: `${stats.averageScore}%` }}></div>
              </div>
            </div>
          </div>

          {/* Hot Leads Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform relative">
                  <Target className="w-7 h-7 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                </div>
                <div className="text-xs font-bold text-red-300 bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30">
                  {stats.conversionMetrics.hotLeadRate}% rate
                </div>
              </div>
              <div className="text-5xl font-bold text-white mb-2 flex items-center gap-2">
                {stats.hotLeads}
                <Zap className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div className="text-sm text-blue-200 font-medium">Hot Leads</div>
              <div className="mt-2 text-xs text-red-300">Ready to buy now</div>
            </div>
          </div>

          {/* Revenue Potential Card */}
          <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                ${(estimatedRevenue / 1000).toFixed(0)}K
              </div>
              <div className="text-sm text-blue-200 font-medium">Est. Revenue</div>
              <div className="mt-2 text-xs text-yellow-300">Potential pipeline value</div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics Banner with Glassmorphism */}
        <div className="relative bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="w-6 h-6 text-indigo-300 group-hover:scale-110 transition-transform" />
                <div className="text-sm text-indigo-200 font-semibold">Hot Lead Conversion</div>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{stats.conversionMetrics.hotLeadRate}%</div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-1000"
                  style={{ width: `${stats.conversionMetrics.hotLeadRate}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform" />
                <div className="text-sm text-purple-200 font-semibold">Avg Response Time</div>
              </div>
              <div className="text-5xl font-bold text-white mb-2">{stats.conversionMetrics.averageResponseTime}</div>
              <div className="text-xs text-purple-200 opacity-75">Industry avg: &lt; 4 hours</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center gap-2 mb-3">
                <PieChart className="w-6 h-6 text-pink-300 group-hover:scale-110 transition-transform" />
                <div className="text-sm text-pink-200 font-semibold">Top Industry</div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stats.conversionMetrics.topPerformingIndustry}</div>
              <div className="text-xs text-pink-200 opacity-75">Most active sector</div>
            </div>
          </div>
        </div>

        {/* Charts Row with Enhanced Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Lead Distribution Chart */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 overflow-hidden group hover:bg-white/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  Lead Distribution
                </h3>
                <span className="text-sm text-blue-200 font-medium bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/30">
                  {stats.totalSubmissions} total
                </span>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: '🔥 Hot Leads', count: stats.hotLeads, color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30', priority: 'Critical', textColor: 'text-red-300' },
                  { label: '⚡ Warm Leads', count: stats.warmLeads, color: 'from-yellow-500 to-orange-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30', priority: 'High', textColor: 'text-yellow-300' },
                  { label: '❄️ Cold Leads', count: stats.coldLeads, color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30', priority: 'Medium', textColor: 'text-blue-300' }
                ].map((item, index) => {
                  const percentage = stats.totalSubmissions > 0 ? (item.count / stats.totalSubmissions) * 100 : 0;
                  return (
                    <div key={index} className="group/item">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-bold text-white">{item.label}</span>
                          <span className={`text-xs ${item.textColor} ${item.bgColor} px-3 py-1 rounded-full border ${item.borderColor} font-bold`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">
                            {item.count} leads
                          </span>
                          <span className={`text-sm font-bold ${item.textColor}`}>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden border border-white/20">
                        <div
                          className={`bg-gradient-to-r ${item.color} h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden group-hover/item:opacity-90`}
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white">{stats.hotLeads + stats.warmLeads}</div>
                  <div className="text-xs text-blue-200 mt-1">Active Pipeline</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white">{Math.round((stats.hotLeads / stats.totalSubmissions) * 100)}%</div>
                  <div className="text-xs text-blue-200 mt-1">Quality Rate</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white">${((stats.hotLeads * 5000) / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-blue-200 mt-1">Hot Lead Value</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dimension Performance */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 overflow-hidden group hover:bg-white/20 transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Dimension Performance
              </h3>
              
              <div className="space-y-5">
                {stats.dimensionAverages
                  .sort((a, b) => b.avg_percentage - a.avg_percentage)
                  .map((dim, index) => (
                  <div key={index} className="group/dim">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-xs font-bold border border-white/20">
                          {index + 1}
                        </span>
                        {dim.dimension_name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-blue-200 bg-blue-500/20 px-2 py-1 rounded border border-blue-500/30">
                          {dim.count} responses
                        </span>
                        <span className={`text-base font-bold ${
                          dim.avg_percentage >= 70 ? 'text-green-400' :
                          dim.avg_percentage >= 50 ? 'text-blue-400' :
                          dim.avg_percentage >= 30 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {Math.round(dim.avg_percentage)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden border border-white/20">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 relative overflow-hidden ${
                          dim.avg_percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                          dim.avg_percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                          dim.avg_percentage >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-pink-500'
                        }`}
                        style={{ width: `${dim.avg_percentage}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Insights Panel */}
              <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-5 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-white mb-1">AI Insight</div>
                    <p className="text-xs text-purple-200 leading-relaxed">
                      Companies score highest in {stats.dimensionAverages[0]?.dimension_name} ({Math.round(stats.dimensionAverages[0]?.avg_percentage)}%), 
                      but struggle with {stats.dimensionAverages[stats.dimensionAverages.length - 1]?.dimension_name} ({Math.round(stats.dimensionAverages[stats.dimensionAverages.length - 1]?.avg_percentage)}%). 
                      This presents a major opportunity for service packages focused on improvement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Submissions Table */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
          {/* Table Header */}
          <div className="p-8 border-b border-white/20 bg-gradient-to-r from-white/5 to-transparent">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  Recent Submissions
                </h3>
                <p className="text-sm text-blue-200">Click on any lead for quick actions</p>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search companies or emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-blue-300/50 min-w-[280px] backdrop-blur-sm"
                  />
                </div>

                {/* Lead Filter */}
                <div className="relative">
                  <select
                    value={leadFilter}
                    onChange={(e) => setLeadFilter(e.target.value as LeadFilter)}
                    className="appearance-none px-6 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-white cursor-pointer backdrop-blur-sm pr-12"
                  >
                    <option value="all" className="bg-slate-800">All Leads ({stats.totalSubmissions})</option>
                    <option value="hot" className="bg-slate-800">🔥 Hot Only ({stats.hotLeads})</option>
                    <option value="warm" className="bg-slate-800">⚡ Warm Only ({stats.warmLeads})</option>
                    <option value="cold" className="bg-slate-800">❄️ Cold Only ({stats.coldLeads})</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-300 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b-2 border-white/20">
                <tr>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Readiness
                  </th>
                  <th className="text-left py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right py-5 px-6 text-xs font-bold text-blue-200 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                          <Search className="w-10 h-10 text-blue-300/50" />
                        </div>
                        <div className="text-blue-200 font-medium">No submissions found matching your filters</div>
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setLeadFilter('all');
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className="hover:bg-white/5 transition-all cursor-pointer group relative"
                      onClick={() => setSelectedLead(submission)}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">
                            {submission.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                              {submission.company_name}
                            </div>
                            <div className="text-xs text-blue-300/70 flex items-center gap-2 mt-0.5">
                              <Mail className="w-3 h-3" />
                              {submission.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-white">
                            {submission.total_score}
                          </div>
                          <span className="text-sm text-blue-300/70">/100</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 border ${
                          submission.total_stage === 'Leading' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          submission.total_stage === 'Scaling' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          submission.total_stage === 'Growing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                          'bg-orange-500/20 text-orange-300 border-orange-500/30'
                        }`}>
                          {submission.total_stage}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        {submission.lead_priority ? (
                          <span className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 border ${
                            submission.lead_priority === 'Hot' ? 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse' :
                            submission.lead_priority === 'Warm' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                            'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          }`}>
                            {submission.lead_priority === 'Hot' && '🔥'}
                            {submission.lead_priority === 'Warm' && '⚡'}
                            {submission.lead_priority === 'Cold' && '❄️'}
                            {submission.lead_priority}
                          </span>
                        ) : (
                          <span className="text-blue-300/50 text-xs">N/A</span>
                        )}
                      </td>
                      <td className="py-5 px-6">
                        <span className="text-sm text-blue-200 font-medium">
                          {submission.lead_readiness || 'N/A'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-sm text-blue-300">
                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${submission.email}`;
                            }}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-500/30"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLead(submission);
                            }}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Pagination Info */}
          <div className="p-6 border-t border-white/20 bg-white/5 flex items-center justify-between">
            <div className="text-sm text-blue-200">
              Showing <span className="font-bold text-white">{filteredSubmissions.length}</span> of <span className="font-bold text-white">{stats.totalSubmissions}</span> submissions
            </div>
            <div className="text-xs text-blue-300/70">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl max-w-2xl w-full border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-8 border-b border-white/20">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-bold text-white text-2xl">
                    {selectedLead.company_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedLead.company_name}</h3>
                    <p className="text-blue-300 flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {selectedLead.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-blue-300" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-blue-300 mb-1">Score</div>
                  <div className="text-3xl font-bold text-white">{selectedLead.total_score}/100</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-blue-300 mb-1">Stage</div>
                  <div className="text-xl font-bold text-white">{selectedLead.total_stage}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-blue-300 mb-1">Priority</div>
                  <div className="text-xl font-bold text-white">{selectedLead.lead_priority || 'N/A'}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-sm text-blue-300 mb-1">Readiness</div>
                  <div className="text-sm font-bold text-white">{selectedLead.lead_readiness || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h4 className="text-lg font-bold text-white mb-4">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-6 py-3 rounded-xl transition-all border border-blue-500/30 font-semibold"
                >
                  <Mail className="w-5 h-5" />
                  Send Email
                </a>
                <a
                  href={`tel:${selectedLead.email}`}
                  className="flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 px-6 py-3 rounded-xl transition-all border border-green-500/30 font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  Call
                </a>
                <a
                  href="https://bit.ly/africa-website"
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-6 py-3 rounded-xl transition-all border border-purple-500/30 font-semibold"
                >
                  <Calendar className="w-5 h-5" />
                  Book Meeting
                </a>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all border border-white/20 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chatbot Integration */}
      {stats && (
        <AIGrowthChatbot
          company="Dashboard Team"
          totalScore={Math.round(stats.averageScore)}
          stage="Analytics Mode"
          dimensionScores={stats.dimensionAverages.map(d => ({
            name: d.dimension_name,
            percentage: d.avg_percentage
          }))}
          mode="dashboard"
        />
      )}

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}