'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Download,
  RefreshCw,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

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
  // State Management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [leadFilter, setLeadFilter] = useState<LeadFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  // Export Function
  const handleExport = useCallback(() => {
    if (!stats) return;
    
    const csv = [
      ['Company', 'Email', 'Score', 'Stage', 'Priority', 'Date'].join(','),
      ...filteredSubmissions.map(s => 
        [
          s.company_name,
          s.email,
          s.total_score,
          s.total_stage,
          s.lead_priority || 'N/A',
          new Date(s.created_at).toLocaleDateString()
        ].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scorecard-data-${timeRange}.csv`;
    a.click();
  }, [stats, filteredSubmissions, timeRange]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-red-500 text-5xl mb-4 text-center">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-600 text-center mb-6">{error || 'Unknown error occurred'}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                Growth Scorecard Analytics
              </h1>
              <p className="text-gray-600 text-lg">
                Real-time insights and lead intelligence from your scorecard submissions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={() => fetchDashboardData(true)}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Submissions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              {stats.trends.submissionsChange !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                  stats.trends.submissionsChange > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.submissionsChange > 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stats.trends.submissionsChange)}%
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.totalSubmissions.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 font-medium">Total Submissions</div>
          </div>

          {/* Average Score */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              {stats.trends.scoreChange !== 0 && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                  stats.trends.scoreChange > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {stats.trends.scoreChange > 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {Math.abs(stats.trends.scoreChange)}%
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {Math.round(stats.averageScore)}
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">Average Score</div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-bold text-gray-500">
                {stats.conversionMetrics.hotLeadRate}% rate
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.hotLeads}
            </div>
            <div className="text-sm text-gray-600 font-medium">Hot Leads</div>
            <div className="mt-2 text-xs text-gray-500">Ready to buy</div>
          </div>

          {/* Warm Leads */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs font-bold text-gray-500">
                {Math.round((stats.warmLeads / stats.totalSubmissions) * 100)}%
              </div>
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              {stats.warmLeads}
            </div>
            <div className="text-sm text-gray-600 font-medium">Warm Leads</div>
            <div className="mt-2 text-xs text-gray-500">Evaluating solutions</div>
          </div>
        </div>

        {/* Conversion Metrics Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 mb-8 shadow-xl text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm opacity-90 mb-1">Hot Lead Conversion</div>
              <div className="text-3xl font-bold">{stats.conversionMetrics.hotLeadRate}%</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Avg Response Time</div>
              <div className="text-3xl font-bold">{stats.conversionMetrics.averageResponseTime}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Top Industry</div>
              <div className="text-3xl font-bold">{stats.conversionMetrics.topPerformingIndustry}</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Lead Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Lead Distribution
              </h3>
              <span className="text-sm text-gray-500 font-medium">
                {stats.totalSubmissions} total
              </span>
            </div>
            
            <div className="space-y-5">
              {[
                { label: '🔥 Hot Leads', count: stats.hotLeads, color: 'red', priority: 'Critical' },
                { label: '⚡ Warm Leads', count: stats.warmLeads, color: 'yellow', priority: 'High' },
                { label: '❄️ Cold Leads', count: stats.coldLeads, color: 'blue', priority: 'Medium' }
              ].map((item, index) => {
                const percentage = (item.count / stats.totalSubmissions) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.priority}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {item.count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`bg-${item.color}-500 h-3 rounded-full transition-all duration-500 group-hover:opacity-80`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dimension Performance */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Dimension Performance
            </h3>
            
            <div className="space-y-4">
              {stats.dimensionAverages
                .sort((a, b) => b.avg_percentage - a.avg_percentage)
                .map((dim, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      {dim.dimension_name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{dim.count} responses</span>
                      <span className="text-sm font-bold text-gray-900">
                        {Math.round(dim.avg_percentage)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        dim.avg_percentage >= 70 ? 'bg-green-500' :
                        dim.avg_percentage >= 50 ? 'bg-blue-500' :
                        dim.avg_percentage >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${dim.avg_percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-900">
                Recent Submissions
              </h3>
              
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Lead Filter */}
                <select
                  value={leadFilter}
                  onChange={(e) => setLeadFilter(e.target.value as LeadFilter)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="all">All Leads</option>
                  <option value="hot">🔥 Hot Only</option>
                  <option value="warm">⚡ Warm Only</option>
                  <option value="cold">❄️ Cold Only</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Company
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Score
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Stage
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Priority
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Readiness
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No submissions found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr 
                      key={submission.id} 
                      className="hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {submission.company_name}
                        </div>
                        <div className="text-xs text-gray-500">{submission.email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">
                            {submission.total_score}
                          </span>
                          <span className="text-sm text-gray-500">/100</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                          submission.total_stage === 'Leading' ? 'bg-green-100 text-green-800' :
                          submission.total_stage === 'Growing' ? 'bg-blue-100 text-blue-800' :
                          submission.total_stage === 'Developing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {submission.total_stage}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {submission.lead_priority && (
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${
                            submission.lead_priority === 'Hot' ? 'bg-red-100 text-red-800' :
                            submission.lead_priority === 'Warm' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {submission.lead_priority === 'Hot' && '🔥 '}
                            {submission.lead_priority === 'Warm' && '⚡ '}
                            {submission.lead_priority === 'Cold' && '❄️ '}
                            {submission.lead_priority}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-700 font-medium">
                          {submission.lead_readiness || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(submission.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
