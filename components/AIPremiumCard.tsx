// components/AIPremiumCard.tsx
'use client';

import { Sparkles, Zap } from 'lucide-react';

interface AIPremiumCardProps {
  performanceBadge: {
    label: string;
  };
  stats: {
    scoreTrend?: number;
    averageScore?: number;
  };
  setShowAIChat: (show: boolean) => void;
}

export default function AIPremiumCard({ performanceBadge, stats, setShowAIChat }: AIPremiumCardProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
      <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500 h-full">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                AI Strategist
              </h3>
              <p className="text-slate-400 text-sm">Ready to analyze your growth</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-xs font-bold">ONLINE</span>
          </div>
        </div>

        {/* Interactive AI Features */}
        <div className="space-y-4 mb-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="text-white font-semibold text-sm mb-2">Quick Analysis</div>
            <div className="text-slate-300 text-xs leading-relaxed">
              Your <span className="text-emerald-400 font-semibold">{performanceBadge.label}</span> performance shows strong momentum. 
              {stats?.scoreTrend && stats.scoreTrend > 0 ? ` Growing at ${stats.scoreTrend}% monthly.` : ' Stable elite performance.'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                // Simple alert for now - replace with actual AI
                alert('AI Analysis: Your growth trajectory is excellent! Focus on scaling your top-performing channels.');
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all group hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-white text-xs font-semibold">Quick Analysis</div>
              </div>
            </button>
            <button 
              onClick={() => setShowAIChat(true)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all group hover:scale-105"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-white text-xs font-semibold">Chat with AI</div>
              </div>
            </button>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-cyan-400">
            <Zap className="w-4 h-4" />
            AI RECOMMENDATIONS
          </div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 flex-shrink-0">
                ↗
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Scale Top Channels</div>
                <div className="text-slate-400 text-xs">Your conversion rate is 35% above industry average</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 flex-shrink-0">
                ⚡
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">Optimize Response Time</div>
                <div className="text-slate-400 text-xs">Reduce response time to increase conversions by 15%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main CTA */}
        <button 
          onClick={() => setShowAIChat(true)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 group/btn shadow-lg shadow-purple-500/50 hover:shadow-pink-500/50 hover:scale-105"
        >
          <Sparkles className="w-5 h-5 group-hover/btn:animate-pulse" />
          Start AI Conversation
        </button>
      </div>
    </div>
  );
}