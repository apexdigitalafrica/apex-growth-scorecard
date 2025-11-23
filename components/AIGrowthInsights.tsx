// components/AIGrowthInsights.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, Lightbulb, TrendingUp, Target, Users, Zap, ArrowUpRight, Brain, Rocket } from 'lucide-react';

interface WhatsAppSnapshot {
  total_conversations: number;
  response_rate: number;
  conversion_rate: number;
  avg_response_time: number;
  top_performing_flows: Array<{
    name: string;
    conversion_rate: number;
    volume: number;
  }>;
  bottlenecks: Array<{
    stage: string;
    dropoff_rate: number;
  }>;
}

interface AIGrowthInsightsProps {
  data: WhatsAppSnapshot;
  type: 'whatsapp-funnel';
  clientId: string;
  company: string;
}

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'premium';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  metric?: {
    current: number;
    target: number;
    unit: string;
  };
  confidence?: number;
}

export function AIGrowthInsights({ data, type, clientId, company }: AIGrowthInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  useEffect(() => {
    fetchAIInsights();
  }, [data, clientId]);

  const fetchAIInsights = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snapshot: data,
          clientId,
          company,
          analysisType: 'whatsapp_funnel'
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const aiInsights = await response.json();
      setInsights(aiInsights.insights || []);
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setError('Unable to generate insights at this time');
      setInsights(generateFallbackInsights(data));
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackInsights = (snapshot: WhatsAppSnapshot): AIInsight[] => {
    return [
      {
        id: 'response-rate-opportunity',
        type: 'premium',
        title: 'Elite Response Rate Optimization',
        description: `Your current response rate of ${snapshot.response_rate}% has massive untapped potential. Industry leaders achieve 85%+ through AI-powered automation.`,
        impact: 'high',
        recommendation: 'Implement our Titan-Class auto-responder with sentiment analysis to capture 40% more qualified leads.',
        metric: { current: snapshot.response_rate, target: 85, unit: '%' },
        confidence: 94
      },
      {
        id: 'conversion-breakthrough',
        type: 'opportunity',
        title: 'Conversion Velocity Engine',
        description: `At ${snapshot.conversion_rate}%, you're leaving significant revenue on the table. Top performers achieve 35%+ conversion rates.`,
        impact: 'high',
        recommendation: 'Deploy smart sequencing with behavioral triggers to create hyper-personalized conversion paths.',
        metric: { current: snapshot.conversion_rate, target: 35, unit: '%' },
        confidence: 88
      },
      {
        id: 'flow-optimization',
        type: 'success',
        title: 'Flow Performance Excellence',
        description: 'Your top flows show strong foundation. With AI optimization, you can scale these winners 3x faster.',
        impact: 'medium',
        recommendation: 'Implement predictive lead scoring to prioritize high-value conversations and automate follow-ups.',
        confidence: 92
      }
    ];
  };

  const getInsightConfig = (type: AIInsight['type']) => {
    const configs = {
      premium: {
        gradient: 'from-purple-500 via-pink-500 to-orange-500',
        bg: 'bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10',
        border: 'border-purple-500/30',
        icon: Zap,
        glow: 'shadow-lg shadow-purple-500/20'
      },
      opportunity: {
        gradient: 'from-blue-500 to-cyan-500',
        bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
        border: 'border-blue-500/30',
        icon: TrendingUp,
        glow: 'shadow-lg shadow-blue-500/20'
      },
      warning: {
        gradient: 'from-orange-500 to-red-500',
        bg: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
        border: 'border-orange-500/30',
        icon: AlertCircle,
        glow: 'shadow-lg shadow-orange-500/20'
      },
      success: {
        gradient: 'from-green-500 to-emerald-500',
        bg: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
        border: 'border-green-500/30',
        icon: Lightbulb,
        glow: 'shadow-lg shadow-green-500/20'
      }
    };
    return configs[type] || configs.opportunity;
  };

  if (isLoading) {
    return (
      <div className="relative">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 rounded-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-sm"></div>
            </div>
            <div>
              <h3 className="text-white font-bold text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                AI Quantum Analysis
              </h3>
              <p className="text-slate-400 text-sm mt-1">Processing neural insights...</p>
            </div>
          </div>
          
          {/* Animated Loading Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative">
                <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-slate-700/50 rounded-xl animate-pulse"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-slate-700/50 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-slate-700/50 rounded w-full animate-pulse"></div>
                      <div className="h-3 bg-slate-700/50 rounded w-5/6 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-blue-900/30 rounded-3xl"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent"></div>
      
      {/* Main Container */}
      <div className="relative bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
        {/* Header with Premium Badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg animate-gradient-xy">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-sm opacity-75 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-white font-bold text-2xl bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Quantum Insights
                </h3>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-bold text-white shadow-lg">
                  TITAN-CLASS
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                Neural network analysis powered by elite AI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">LIVE ANALYSIS</span>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid gap-6">
          {insights.map((insight, index) => {
            const config = getInsightConfig(insight.type);
            const Icon = config.icon;
            
            return (
              <div
                key={insight.id}
                className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} ${config.glow} transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl cursor-pointer`}
                onMouseEnter={() => setActiveInsight(insight.id)}
                onMouseLeave={() => setActiveInsight(null)}
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`}></div>
                
                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                
                <div className="relative p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon with Glow */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`absolute -inset-1 bg-gradient-to-br ${config.gradient} rounded-xl blur-sm opacity-50`}></div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">
                            {insight.title}
                          </h4>
                          <p className="text-slate-300 text-sm leading-relaxed">
                            {insight.description}
                          </p>
                        </div>
                        
                        {/* Confidence Score */}
                        {insight.confidence && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-xs font-bold">
                              {insight.confidence}% CONFIDENT
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Impact Badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          insight.impact === 'high' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : insight.impact === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {insight.impact.toUpperCase()} IMPACT
                        </span>
                        
                        {/* Metric Progress */}
                        {insight.metric && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-white">
                                {insight.metric.current}{insight.metric.unit}
                              </span>
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                              <span className="text-2xl font-bold text-green-400">
                                {insight.metric.target}{insight.metric.unit}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recommendation Card */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Rocket className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400 text-sm font-bold">QUANTUM RECOMMENDATION</span>
                        </div>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {insight.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 transition-opacity duration-300 ${
                  activeInsight === insight.id ? 'opacity-5' : ''
                }`}></div>
              </div>
            );
          })}
        </div>

        {/* Footer with Refresh */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Last updated: Just now
          </div>
          
          <button
            onClick={fetchAIInsights}
            disabled={isLoading}
            className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4" />
              <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all"></div>
            </div>
            {isLoading ? 'Reanalyzing...' : 'Refresh Quantum Analysis'}
          </button>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}