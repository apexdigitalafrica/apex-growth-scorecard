// app/client-portal/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Download,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Award,
  Clock,
  Eye,
  FileText,
  Rocket,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Search,
  Filter,
  Calendar,
  Mail,
  MessageSquare,
  Crown,
  Star,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flame
} from 'lucide-react';

interface ClientStats {
  averageScore: number;
  totalSubmissions: number;
  teamMembers: number;
  scoreTrend: number;
  submissionsTrend: number;
  industryRank: number;
  completionRate: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
    avatar: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  performanceInsights: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function ClientDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState(3);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while checking auth
  if (isLoading || !isAuthenticated || user?.role !== 'client') {
    return <EliteLoadingScreen companyName={user?.client?.company_name || "Your Company"} />;
  }

  const clientUser = user;
  const primaryColor = clientUser.client.primary_color || '#0066CC';
  const secondaryColor = clientUser.client.primary_color ? `${clientUser.client.primary_color}80` : '#004499';

  useEffect(() => {
    const loadClientData = async () => {
      setDataLoading(true);
      
      setTimeout(() => {
        setStats({
          averageScore: 89,
          totalSubmissions: 12,
          teamMembers: 8,
          scoreTrend: 12,
          submissionsTrend: 25,
          industryRank: 15,
          completionRate: 92,
          recentActivity: [
            {
              id: '1',
              action: 'Completed Digital Maturity Assessment',
              timestamp: new Date().toISOString(),
              user: 'Sarah Chen',
              avatar: 'SC',
              priority: 'high'
            },
            {
              id: '2', 
              action: 'Downloaded Executive Growth Report',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'Mike Rodriguez',
              avatar: 'MR',
              priority: 'medium'
            },
            {
              id: '3',
              action: 'Achieved Platinum Performance Tier',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              user: 'System',
              avatar: '⭐',
              priority: 'high'
            }
          ],
          performanceInsights: [
            {
              title: 'Digital Transformation Accelerating',
              description: 'Your digital maturity score increased by 12% this quarter',
              impact: 'high',
              trend: 'up'
            },
            {
              title: 'Team Engagement Growing',
              description: '85% of team members completed assessments',
              impact: 'medium',
              trend: 'up'
            },
            {
              title: 'Competitive Position Strengthening',
              description: 'Moved up 5 spots in industry rankings',
              impact: 'high',
              trend: 'up'
            }
          ]
        });
        setDataLoading(false);
      }, 1500);
    };

    loadClientData();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return { label: 'ELITE', color: 'from-purple-500 via-pink-500 to-purple-600', icon: Crown, glow: 'shadow-purple-500/50' };
    if (score >= 80) return { label: 'LEADING', color: 'from-blue-500 via-cyan-500 to-blue-600', icon: Award, glow: 'shadow-blue-500/50' };
    if (score >= 70) return { label: 'GROWING', color: 'from-green-500 via-emerald-500 to-green-600', icon: TrendingUp, glow: 'shadow-green-500/50' };
    return { label: 'DEVELOPING', color: 'from-orange-500 via-red-500 to-orange-600', icon: Zap, glow: 'shadow-orange-500/50' };
  };

  const performanceBadge = getPerformanceBadge(stats?.averageScore || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]"></div>
        
        {/* Animated Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Ultra-Premium Navigation */}
      <header className={`relative z-50 backdrop-blur-2xl bg-slate-900/60 border-b border-white/10 sticky top-0 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Elite Brand Section */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div 
                  className="relative h-14 w-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                  style={{ 
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` 
                  }}
                >
                  {clientUser.client.company_name.substring(0, 2).toUpperCase()}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${performanceBadge.color} rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity`}></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  {clientUser.client.company_name}
                </h1>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Enterprise Portal • {performanceBadge.label} Tier
                  </span>
                </div>
              </div>
            </div>
            
            {/* Premium Controls */}
            <div className="flex items-center gap-4">
              {/* Elite Search */}
              <div className="relative hidden lg:block group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search your empire..."
                  className="pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-sm backdrop-blur-xl min-w-[320px] text-white placeholder-white/40 transition-all duration-300 hover:bg-white/10"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-blue-500/0 to-purple-500/0 group-focus-within:from-cyan-500/10 group-focus-within:via-blue-500/10 group-focus-within:to-purple-500/10 pointer-events-none transition-all duration-500"></div>
              </div>

              {/* Premium Notifications */}
              <button className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <Bell className="w-5 h-5 text-white/70 group-hover:text-white group-hover:animate-wiggle" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse shadow-lg shadow-red-500/50">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Ultra User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="font-bold text-white text-sm">{clientUser.full_name}</div>
                  <div className="text-xs bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-semibold">{clientUser.role}</div>
                </div>
                <div className="relative group">
                  <div 
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-sm cursor-pointer transition-all duration-500 hover:scale-110 hover:rotate-3 shadow-lg shadow-blue-500/50 relative overflow-hidden"
                  >
                    <span className="relative z-10">{clientUser.full_name.split(' ').map(n => n[0]).join('')}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  
                  {/* Premium Dropdown */}
                  <div className="absolute right-0 top-16 w-56 backdrop-blur-2xl bg-slate-900/90 rounded-2xl shadow-2xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-14 transition-all duration-300 z-50 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <div className="font-bold text-white mb-1">{clientUser.full_name}</div>
                      <div className="text-xs text-white/60">{clientUser.email}</div>
                    </div>
                    <button className="w-full px-4 py-3 text-left text-white/80 hover:bg-white/10 transition-colors flex items-center gap-3 group/item">
                      <Settings className="w-4 h-4 group-hover/item:rotate-90 transition-transform duration-500" />
                      <span>Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 transition-colors rounded-b-2xl flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className={`relative z-10 max-w-7xl mx-auto py-8 px-6 lg:px-8 transition-all duration-1000 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Epic Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${performanceBadge.color} text-white font-bold text-sm shadow-lg ${performanceBadge.glow} flex items-center gap-2 animate-glow`}>
                  <performanceBadge.icon className="w-4 h-4" />
                  {performanceBadge.label} TIER
                </div>
                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-xl border border-emerald-500/30 text-emerald-300 font-bold text-sm flex items-center gap-2">
                  <Flame className="w-4 h-4 animate-pulse" />
                  🔥 On Fire This Month
                </div>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-4 leading-tight">
                Welcome back, {clientUser.full_name.split(' ')[0]}! 
                <span className="inline-block animate-wave ml-2">👋</span>
              </h2>
              <p className="text-xl text-white/70 max-w-3xl leading-relaxed">
                Your enterprise is crushing it in the <span className="font-bold text-white">{performanceBadge.label}</span> tier. 
                Here's the intelligence powering your competitive edge.
              </p>
            </div>
            
            {/* 3D Performance Badge */}
            <div className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-r ${performanceBadge.color} rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse`}></div>
              <div className={`relative bg-gradient-to-r ${performanceBadge.color} text-white px-8 py-6 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[240px] transform group-hover:scale-110 group-hover:rotate-2 transition-all duration-500 overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
                <div className="relative p-3 bg-white/20 rounded-2xl backdrop-blur-xl">
                  <performanceBadge.icon className="w-8 h-8 animate-float" />
                </div>
                <div className="relative">
                  <div className="text-sm opacity-90 font-semibold mb-1">Performance Tier</div>
                  <div className="text-2xl font-black tracking-tight">{performanceBadge.label}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Ultra Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <UltraQuickStat 
              label="Industry Rank" 
              value={`#${stats?.industryRank || 0}`} 
              trend="up" 
              change="+5 positions"
              icon={Award}
              gradient="from-yellow-500 to-orange-500"
            />
            <UltraQuickStat 
              label="Completion Rate" 
              value={`${stats?.completionRate || 0}%`} 
              trend="up" 
              change="+8% this week"
              icon={CheckCircle2}
              gradient="from-emerald-500 to-green-500"
            />
            <UltraQuickStat 
              label="Active Users" 
              value={stats?.teamMembers || 0} 
              trend="up" 
              change="+2 members"
              icon={Users}
              gradient="from-blue-500 to-cyan-500"
            />
            <UltraQuickStat 
              label="Response Time" 
              value="< 2h" 
              trend="down" 
              change="-30 minutes"
              icon={Clock}
              gradient="from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Premium Metrics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Ultra Growth Score */}
          <div className="xl:col-span-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 overflow-hidden">
                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
                      <BarChart3 className="w-8 h-8 text-blue-400" />
                      Growth Intelligence
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-emerald-400 font-bold bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/30 backdrop-blur-xl">
                      <TrendingUp className="w-4 h-4 animate-bounce" />
                      +{stats?.scoreTrend}% this month
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <UltraMetricCard
                      value={stats?.averageScore || 0}
                      max={100}
                      label="Digital Maturity Score"
                      trend={stats?.scoreTrend || 0}
                      gradient="from-blue-500 via-cyan-500 to-blue-600"
                      precision={1}
                    />
                    <UltraMetricCard
                      value={stats?.totalSubmissions || 0}
                      label="Team Assessments"
                      trend={stats?.submissionsTrend || 0}
                      gradient="from-emerald-500 via-green-500 to-emerald-600"
                      suffix="completed"
                    />
                  </div>

                  {/* Premium Progress Bar */}
                  <div className="mt-8">
                    <div className="flex justify-between text-sm text-white/70 mb-3">
                      <span className="font-semibold">Quarterly Growth Target</span>
                      <span className="font-bold text-white">{stats?.averageScore || 0}% Achieved</span>
                    </div>
                    <div className="relative h-4 bg-white/5 rounded-full overflow-hidden backdrop-blur-xl border border-white/10">
                      <div 
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${performanceBadge.color} rounded-full transition-all duration-1000 relative overflow-hidden`}
                        style={{ width: `${stats?.averageScore || 0}%` }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
                      </div>
                      {/* Milestone Markers */}
                      {[25, 50, 75].map((milestone) => (
                        <div 
                          key={milestone}
                          className="absolute top-0 bottom-0 w-px bg-white/30"
                          style={{ left: `${milestone}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-white/40">{milestone}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Premium */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 h-full">
              <h3 className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-yellow-400 animate-pulse" />
                AI Insights
              </h3>
              
              <div className="space-y-4">
                {stats?.performanceInsights.map((insight, index) => (
                  <UltraInsightCard
                    key={index}
                    title={insight.title}
                    description={insight.description}
                    impact={insight.impact}
                    trend={insight.trend}
                    index={index}
                  />
                ))}
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-purple-500/50 hover:shadow-pink-500/50 hover:scale-105">
                View AI Analysis
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Elite Action Cards & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Premium Tools */}
          <div className="xl:col-span-2">
            <h3 className="text-3xl font-black bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <Rocket className="w-7 h-7 text-cyan-400" />
              Growth Arsenal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UltraActionCard
                title="Digital Scorecard"
                description="Deep-dive analytics with real-time intelligence and predictive insights"
                icon="📊"
                gradient="from-blue-500 via-cyan-500 to-blue-600"
                onClick={() => router.push('/client-portal/scorecard')}
                status="LIVE"
                badge="Popular"
              />
              <UltraActionCard
                title="Funnel Intelligence"
                description="AI-powered funnel optimization with conversion acceleration strategies"
                icon="🔍"
                gradient="from-purple-500 via-pink-500 to-purple-600"
                onClick={() => router.push('/client-portal/funnel-analysis')}
                status="NEW"
                badge="AI-Powered"
              />
              <UltraActionCard
                title="Executive Reports"
                description="White-label PDF reports with executive summaries and action plans" 
                icon="📄"
                gradient="from-emerald-500 via-green-500 to-emerald-600"
                onClick={() => router.push('/client-portal/reports')}
                status="UPDATED"
                badge="Premium"
              />
              <UltraActionCard
                title="Growth Strategy"
                description="Personalized roadmap with implementation timelines and ROI projections"
                icon="🚀"
                gradient="from-orange-500 via-red-500 to-orange-600"
                onClick={() => router.push('/client-portal/recommendations')}
                badge="Strategic"
              />
            </div>
          </div>

          {/* Premium Activity Feed */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  Live Activity
                </h3>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  <Filter className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {stats?.recentActivity.map((activity, index) => (
                  <UltraActivityItem
                    key={activity.id}
                    user={activity.user}
                    action={activity.action}
                    timestamp={activity.timestamp}
                    avatar={activity.avatar}
                    priority={activity.priority}
                    index={index}
                  />
                ))}
              </div>

              <button className="w-full border-2 border-white/10 hover:border-cyan-500/50 bg-white/5 hover:bg-cyan-500/10 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn backdrop-blur-xl">
                View All Activity
                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Ultra Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse"></div>
          <button className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 group overflow-hidden">
            <Rocket className="w-6 h-6 group-hover:animate-bounce relative z-10" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer"></div>
          </button>
        </div>
      </div>

      {/* Add Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

// Ultra Loading Screen
function EliteLoadingScreen({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <div className="relative z-10 text-center">
        <div className="relative mb-8">
          {/* Spinning Ring */}
          <div className="w-24 h-24 border-4 border-transparent border-t-cyan-400 border-r-blue-400 rounded-full animate-spin mx-auto"></div>
          {/* Center Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-pulse" />
          </div>
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <h3 className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent mb-3">
          Initializing Elite Portal
        </h3>
        <p className="text-cyan-300 mb-8 text-lg">
          Loading <span className="font-bold text-white">{companyName}</span> intelligence suite
        </p>
        
        {/* Loading Dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Ultra Quick Stat Component
function UltraQuickStat({ label, value, trend, change, icon: Icon, gradient }: any) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity`}></div>
      <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all duration-300 group-hover:scale-105">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-white/60 font-semibold">{label}</div>
          <div className={`p-2 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-black text-white">{value}</div>
          <div className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-blue-400'} flex items-center gap-1`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {change}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ultra Metric Card
function UltraMetricCard({ value, max, label, trend, gradient, precision = 0, suffix }: any) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
      <div className="relative text-center p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 group-hover:scale-105">
        <div className={`text-6xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
          {precision > 0 ? value.toFixed(precision) : value}
          {max && <span className="text-3xl text-white/30">/{max}</span>}
        </div>
        <div className="text-sm text-white/70 font-semibold mb-2">{label}</div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${trend > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}% {suffix}
        </div>
      </div>
    </div>
  );
}

// Ultra Insight Card
function UltraInsightCard({ title, description, impact, trend, index }: any) {
  const impactConfig = {
    high: { gradient: 'from-red-500 to-pink-500', glow: 'shadow-red-500/50' },
    medium: { gradient: 'from-yellow-500 to-orange-500', glow: 'shadow-yellow-500/50' },
    low: { gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-blue-500/50' }
  };

  const config = impactConfig[impact];

  return (
    <div 
      className="relative group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`}></div>
      <div className={`relative bg-white/5 backdrop-blur-xl border-l-4 border-t border-r border-b border-white/10 p-4 rounded-r-xl hover:bg-white/10 transition-all duration-300 overflow-hidden group-hover:scale-102`}
        style={{ borderLeftColor: config.gradient.split(' ')[0].replace('from-', '') }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-bold text-white text-sm pr-2">{title}</h4>
          <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.gradient} shadow-lg ${config.glow}`}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-white" />
            ) : trend === 'down' ? (
              <TrendingDown className="w-4 h-4 text-white" />
            ) : (
              <div className="w-4 h-1 bg-white rounded" />
            )}
          </div>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// Ultra Action Card
function UltraActionCard({ title, description, icon, gradient, onClick, status, badge }: any) {
  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
      <button
        onClick={onClick}
        className={`relative w-full bg-gradient-to-br ${gradient} text-white p-8 rounded-3xl text-left group-hover:scale-105 transition-all duration-500 overflow-hidden shadow-2xl`}
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
        
        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {status && (
            <div className="bg-white/20 backdrop-blur-xl text-white/90 text-xs px-3 py-1 rounded-full font-bold border border-white/30">
              {status}
            </div>
          )}
          {badge && (
            <div className="bg-white text-gray-900 text-xs px-3 py-1 rounded-full font-bold shadow-lg">
              {badge}
            </div>
          )}
        </div>
        
        <div className="relative z-10">
          <div className="text-5xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
            {icon}
          </div>
          <h4 className="font-black text-2xl mb-3">{title}</h4>
          <p className="text-white/80 text-sm leading-relaxed mb-6">{description}</p>
          <div className="flex items-center text-sm font-bold opacity-90 group-hover:opacity-100">
            Launch Tool 
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 animate-shimmer"></div>
      </button>
    </div>
  );
}

// Ultra Activity Item
function UltraActivityItem({ user, action, timestamp, avatar, priority, index }: any) {
  const priorityConfig = {
    high: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500' },
    medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', dot: 'bg-yellow-500' },
    low: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', dot: 'bg-blue-500' }
  };

  const config = priorityConfig[priority];

  return (
    <div 
      className="flex items-start gap-3 p-4 rounded-2xl hover:bg-white/5 transition-all group backdrop-blur-xl border border-white/5 hover:border-white/10"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="relative">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg">
          {avatar}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${config.dot} rounded-full border-2 border-slate-900 animate-pulse`}></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="font-bold text-white text-sm">{user}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border} font-bold`}>
            {priority.toUpperCase()}
          </span>
        </div>
        <p className="text-white/70 text-sm leading-relaxed mb-2">{action}</p>
        <div className="text-xs text-white/40 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
