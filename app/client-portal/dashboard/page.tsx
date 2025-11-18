// app/client-portal/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClientAuth } from '@/hooks/use-client-auth';
import { ClientLoadingScreen } from '@/components/client-loading-screen';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Download,
  BarChart3,
  ArrowRight,
  Sparkles,
  Shield
} from 'lucide-react';

interface ClientStats {
  averageScore: number;
  totalSubmissions: number;
  teamMembers: number;
  scoreTrend: number;
  submissionsTrend: number;
  recentActivity: Array<{
    id: string;
    action: string;
    timestamp: string;
    user: string;
  }>;
}
export default function ClientDashboard() {
  const { clientUser, isAuthenticated, isLoading } = useClientAuth(true);
export default function ClientDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock client data - replace with real auth later
  const clientUser = {
    id: 'client-1',
    full_name: 'John CEO',
    role: 'owner' as const,
    client: {
      id: 'company-1',
      company_name: 'Moratech Limited',
      primary_color: '#0066CC',
      logo_url: null
    }
  };

  useEffect(() => {
    // Simulate loading client-specific data
    const loadClientData = async () => {
      setIsLoading(true);
      
      // This would be your API call to get client-specific stats
      setTimeout(() => {
        setStats({
          averageScore: 89,
          totalSubmissions: 5,
          teamMembers: 8,
          scoreTrend: 12,
          submissionsTrend: 25,
          recentActivity: [
            {
              id: '1',
              action: 'Completed Digital Maturity Assessment',
              timestamp: new Date().toISOString(),
              user: 'Sarah Chen'
            },
            {
              id: '2', 
              action: 'Downloaded Growth Report',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              user: 'Mike Rodriguez'
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    };

    loadClientData();
  }, []);

 	 // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return <ClientLoadingScreen companyName="Your Company" />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Client Branded Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div 
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: clientUser.client.primary_color }}
              >
                {clientUser.client.company_name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {clientUser.client.company_name} Portal
                </h1>
                <p className="text-sm text-gray-500">Growth Analytics Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Secure Client Portal</span>
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {clientUser.full_name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {clientUser.full_name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Here's your latest growth analytics and insights for {clientUser.client.company_name}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              {stats?.scoreTrend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stats.scoreTrend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stats.scoreTrend > 0 ? '↗' : '↘'} {Math.abs(stats.scoreTrend)}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.averageScore || 0}
              <span className="text-lg text-gray-500">/100</span>
            </div>
            <div className="text-sm text-gray-600">Overall Growth Score</div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats?.averageScore || 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              {stats?.submissionsTrend && (
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  ↗ {stats.submissionsTrend}%
                </div>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.totalSubmissions || 0}
            </div>
            <div className="text-sm text-gray-600">Team Assessments</div>
            <div className="mt-3 text-xs text-gray-500">
              {stats?.teamMembers || 0} team members enrolled
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-50">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats && stats.averageScore >= 80 ? 'Leading' : 
               stats && stats.averageScore >= 60 ? 'Growing' : 'Developing'}
            </div>
            <div className="text-sm text-gray-600">Performance Tier</div>
            <div className="mt-3 text-xs text-gray-500">
              {stats && stats.averageScore >= 80 ? 'Top 20% performer' : 
               stats && stats.averageScore >= 60 ? 'Strong growth potential' : 'Significant upside'}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <ActionCard
            title="Digital Scorecard"
            description="View your detailed growth assessment"
            icon="📊"
            color="blue"
            onClick={() => router.push('/client-portal/scorecard')}
          />
          <ActionCard
            title="Funnel Analysis"
            description="Analyze your business performance"
            icon="🔍"
            color="green"
            onClick={() => router.push('/client-portal/funnel-analysis')}
          />
          <ActionCard
            title="Download Reports"
            description="Export PDF reports and insights"
            icon="📄"
            color="purple"
            onClick={() => router.push('/client-portal/reports')}
          />
          <ActionCard
            title="Growth Plan"
            description="Personalized recommendations"
            icon="🚀"
            color="orange"
            onClick={() => router.push('/client-portal/recommendations')}
          />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Recent Team Activity
          </h3>
          <div className="space-y-4">
            {stats?.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                  <div className="text-sm text-gray-600">{activity.action}</div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Supporting Components
function ClientLoadingScreen({ companyName }: { companyName: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Loading {companyName} Portal
        </h3>
        <p className="text-gray-600">Preparing your analytics...</p>
      </div>
    </div>
  );
}

function ActionCard({ 
  title, 
  description, 
  icon, 
  color, 
  onClick 
}: { 
  title: string;
  description: string;
  icon: string;
  color: string;
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
    green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700'
  };

  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-xl border-2 transition-all hover:scale-105 text-left group ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm opacity-80 mb-3">{description}</p>
      <div className="flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
        Explore <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </button>
  );
}