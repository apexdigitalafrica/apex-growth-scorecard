// app/client-portal/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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
  Star
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Show loading while checking auth
  if (isLoading || !isAuthenticated || user?.role !== 'client') {
    return <EliteLoadingScreen companyName={user?.client?.company_name || "Your Company"} />;
  }

  const clientUser = user;

  useEffect(() => {
    const loadClientData = async () => {
      setDataLoading(true);
      
      // Simulate API call with more realistic data
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
    if (score >= 90) return { label: 'ELITE', color: 'from-purple-500 to-pink-500', icon: Crown };
    if (score >= 80) return { label: 'LEADING', color: 'from-blue-500 to-cyan-500', icon: Award };
    if (score >= 70) return { label: 'GROWING', color: 'from-green-500 to-emerald-500', icon: TrendingUp };
    return { label: 'DEVELOPING', color: 'from-orange-500 to-red-500', icon: Zap };
  };

  const performanceBadge = getPerformanceBadge(stats?.averageScore || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Elite Navigation Header */}
      <header className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Brand Section */}
            <div className="flex items-center gap-4">
              <div 
                className="relative group"
                style={{ 
                  background: `linear-gradient(135deg, ${clientUser.client.primary_color || '#0066CC'}, ${clientUser.client.primary_color ? `${clientUser.client.primary_color}80` : '#004499'})` 
                }}
                className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
              >
                {clientUser.client.company_name.substring(0, 2).toUpperCase()}
                <div className="absolute inset-0 rounded-2xl bg-white/20 group-hover:bg-white/30 transition-colors"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {clientUser.client.company_name}
                </h1>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  Secure Growth Portal • {performanceBadge.label} Tier
                </p>
              </div>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search analytics..."
                  className="pl-10 pr-4 py-2.5 bg-white/80 border border-gray-200/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 text-sm backdrop-blur-sm min-w-[280px]"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl bg-white/60 border border-gray-200/40 hover:bg-white/80 transition-all group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                    {notifications}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="font-semibold text-gray-900">{clientUser.full_name}</div>
                  <div className="text-xs text-gray-500">{clientUser.role}</div>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm cursor-pointer group-hover:scale-110 transition-transform shadow-lg">
                    {clientUser.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-12 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <button className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50/80 transition-colors rounded-t-2xl flex items-center gap-3">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50/80 transition-colors rounded-b-2xl flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="relative z-10 max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Welcome & Performance Banner */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Welcome back, {clientUser.full_name.split(' ')[0]}! <span className="animate-wave inline-block">👋</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl">
                Your enterprise is performing in the <span className="font-semibold text-gray-900">{performanceBadge.label}</span> tier. 
                Here's what's driving your growth this week.
              </p>
            </div>
            
            {/* Performance Badge */}
            <div className={`bg-gradient-to-r ${performanceBadge.color} text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 min-w-[200px] group hover:scale-105 transition-transform duration-300`}>
              <div className="p-2 bg-white/20 rounded-xl">
                <performanceBadge.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Performance Tier</div>
                <div className="text-xl font-bold">{performanceBadge.label}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <QuickStat 
              label="Industry Rank" 
              value={`#${stats?.industryRank || 0}`} 
              trend="up" 
              change="+5"
              icon={<Award className="w-4 h-4" />}
            />
            <QuickStat 
              label="Completion Rate" 
              value={`${stats?.completionRate || 0}%`} 
              trend="up" 
              change="+8%"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <QuickStat 
              label="Active Users" 
              value={stats?.teamMembers || 0} 
              trend="stable" 
              change="+2"
              icon={<Users className="w-4 h-4" />}
            />
            <QuickStat 
              label="Response Time" 
              value="< 2h" 
              trend="down" 
              change="-30m"
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Elite Metrics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Growth Score Card */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500 group">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Growth Intelligence
                </h3>
                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-full">
                  <TrendingUp className="w-4 h-4" />
                  +{stats?.scoreTrend}% this month
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MetricCard
                  value={stats?.averageScore || 0}
                  max={100}
                  label="Digital Maturity Score"
                  trend={stats?.scoreTrend || 0}
                  color="blue"
                  precision={1}
                />
                <MetricCard
                  value={stats?.totalSubmissions || 0}
                  label="Team Assessments"
                  trend={stats?.submissionsTrend || 0}
                  color="green"
                  suffix="completed"
                />
              </div>

              {/* Progress Visualization */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                  <span>Growth Progress</span>
                  <span>{stats?.averageScore || 0}% Complete</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
                    style={{ width: `${stats?.averageScore || 0}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              AI Insights
            </h3>
            
            <div className="space-y-4">
              {stats?.performanceInsights.map((insight, index) => (
                <InsightCard
                  key={index}
                  title={insight.title}
                  description={insight.description}
                  impact={insight.impact}
                  trend={insight.trend}
                />
              ))}
            </div>

            <button className="w-full mt-6 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-600 transition-all flex items-center justify-center gap-2 group">
              View Detailed Analysis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Action Grid & Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
              Growth Tools
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EliteActionCard
                title="Digital Scorecard"
                description="Deep dive into your growth metrics with interactive analytics"
                icon="📊"
                gradient="from-blue-500 to-cyan-500"
                onClick={() => router.push('/client-portal/scorecard')}
                status="updated"
              />
              <EliteActionCard
                title="Funnel Intelligence"
                description="AI-powered funnel analysis and optimization recommendations"
                icon="🔍"
                gradient="from-purple-500 to-pink-500"
                onClick={() => router.push('/client-portal/funnel-analysis')}
                status="new"
              />
              <EliteActionCard
                title="Executive Reports"
                descriptionDownload comprehensive PDF reports and insights"
                icon="📄"
                gradient="from-green-500 to-emerald-500"
                onClick={() => router.push('/client-portal/reports')}
              />
              <EliteActionCard
                title="Growth Strategy"
                description="Personalized recommendations and implementation roadmap"
                icon="🚀"
                gradient="from-orange-500 to-red-500"
                onClick={() => router.push('/client-portal/recommendations')}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-blue-500" />
                Team Activity
              </h3>
              <Filter className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  user={activity.user}
                  action={activity.action}
                  timestamp={activity.timestamp}
                  avatar={activity.avatar}
                  priority={activity.priority}
                />
              ))}
            </div>

            <button className="w-full mt-6 border-2 border-gray-300/60 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50/50 transition-all flex items-center justify-center gap-2 group">
              View All Activity
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group">
          <Rocket className="w-6 h-6 group-hover:animate-bounce" />
        </button>
      </div>
    </div>
  );
}

// Elite Loading Screen
function EliteLoadingScreen({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-t-4 border-b-4 border-cyan-400 rounded-full animate-spin mx-auto"></div>
          <Sparkles className="w-8 h-8 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Initializing Elite Portal</h3>
        <p className="text-cyan-200 mb-6">Loading {companyName} analytics suite</p>
        
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Supporting Components
function QuickStat({ label, value, trend, change, icon }: any) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    stable: 'text-blue-600 bg-blue-50'
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/40 hover:bg-white/80 transition-all group hover:scale-105">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">{label}</div>
        <div className={`p-1.5 rounded-lg ${trendColors[trend]}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className={`text-xs font-semibold ${trendColors[trend].split(' ')[0]}`}>
          {change}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ value, max, label, trend, color, precision = 0, suffix }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    green: 'from-green-500 to-emerald-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className="text-center group hover:scale-105 transition-transform duration-300">
      <div className={`text-5xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent mb-2`}>
        {precision > 0 ? value.toFixed(precision) : value}
        {max && <span className="text-2xl text-gray-400">/{max}</span>}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-xs font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% {suffix}
      </div>
    </div>
  );
}

function InsightCard({ title, description, impact, trend }: any) {
  const impactColors = {
    high: 'border-l-red-400 bg-red-50/50',
    medium: 'border-l-yellow-400 bg-yellow-50/50',
    low: 'border-l-blue-400 bg-blue-50/50'
  };

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingUp className="w-4 h-4 text-red-500 transform rotate-180" />,
    stable: <div className="w-4 h-1 bg-gray-400 rounded" />
  };

  return (
    <div className={`border-l-4 ${impactColors[impact]} p-4 rounded-r-xl group hover:scale-102 transition-transform`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        {trendIcons[trend]}
      </div>
      <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function EliteActionCard({ title, description, icon, gradient, onClick, status }: any) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} text-white p-6 rounded-2xl text-left group hover:scale-105 transition-all duration-300 relative overflow-hidden shadow-lg hover:shadow-2xl`}
    >
      {/* Status Badge */}
      {status && (
        <div className="absolute top-4 right-4 bg-white/20 text-white/90 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {status}
        </div>
      )}
      
      <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="font-bold text-lg mb-2">{title}</h4>
      <p className="text-white/80 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-sm font-semibold opacity-90 group-hover:opacity-100">
        Explore <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
    </button>
  );
}

function ActivityItem({ user, action, timestamp, avatar, priority }: any) {
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-all group">
      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-sm font-semibold text-gray-600 flex-shrink-0">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-semibold text-gray-900 text-sm">{user}</div>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[priority]}`}>
            {priority}
          </span>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed">{action}</p>
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(timestamp).toLocaleDateString()} • {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

// Add CSS for wave animation
const styles = `
  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(10deg); }
    75% { transform: rotate(-10deg); }
  }
  .animate-wave {
    animation: wave 1s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) skewX(-12deg); }
    100% { transform: translateX(200%) skewX(-12deg); }
  }
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}