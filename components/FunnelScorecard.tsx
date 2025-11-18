// components/FunnelScorecard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Target,
  DollarSign,
  Users,
  ArrowRight,
  Sparkles,
  Download,
  Share2,
  RefreshCw,
} from 'lucide-react';
import type { FunnelSnapshot } from '@/lib/funnelTypes';
import {
  computeFunnelScore,
  estimateLeakImpact,
  generateFunnelInsights,
} from '@/lib/funnelUtils';

interface FunnelScorecardProps {
  snapshot: FunnelSnapshot;
}

const statusColors: Record<string, { bg: string; text: string; ring: string; icon: string }> = {
  good: {
    bg: 'bg-gradient-to-br from-emerald-500/20 to-green-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/50',
    icon: 'text-emerald-400',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10',
    text: 'text-amber-400',
    ring: 'ring-amber-500/50',
    icon: 'text-amber-400',
  },
  bad: {
    bg: 'bg-gradient-to-br from-rose-500/20 to-red-500/10',
    text: 'text-rose-400',
    ring: 'ring-rose-500/50',
    icon: 'text-rose-400',
  },
};

const statusLabel: Record<string, string> = {
  good: '✅ Healthy',
  warning: '⚠️ Needs Attention',
  bad: '🚨 Critical Leak',
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatScore(value: number): string {
  return `${value.toFixed(0)}`;
}

export default function FunnelScorecard({ snapshot }: FunnelScorecardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedInsight, setSelectedInsight] = useState(0);

  const summary = computeFunnelScore(snapshot);
  const insights = generateFunnelInsights(snapshot, summary);
  const impact = estimateLeakImpact(snapshot, summary);

  // Calculate overall conversion
  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  const totalWon = lastStage?.output ?? 0;
  const firstStage = snapshot.stages[0];
  const totalTop = firstStage?.input ?? 0;
  const overallConversion = totalTop > 0 ? (totalWon / totalTop) * 100 : 0;

  // PDF Export Function
  const handleExportPDF = async () => {
    try {
      const element = document.getElementById('funnel-scorecard-content');
      if (!element) return;

      const btn = document.getElementById('export-pdf-btn');
      if (btn) btn.textContent = 'Generating PDF...';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${snapshot.businessName}-Funnel-Analysis-${new Date().toISOString().split('T')[0]}.pdf`);

      if (btn) btn.textContent = '📥 Export PDF';
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Full Report Download Function
  const handleDownloadFullReport = () => {
    const report = `
FUNNEL ANALYSIS REPORT
${snapshot.businessName}
${snapshot.periodLabel}
Generated: ${new Date().toLocaleString()}

========================================
EXECUTIVE SUMMARY
========================================
Overall Funnel Health: ${summary.overallScore}/100
Average Conversion Rate: ${formatPercent(summary.avgConversionRate)}
Overall Flow: ${overallConversion.toFixed(1)}%

${summary.biggestLeakStage ? `
BIGGEST LEAK: ${summary.biggestLeakStage.label}
Drop-off Rate: ${formatPercent(summary.biggestLeakStage.dropOffRate)}
Stage Score: ${formatScore(summary.biggestLeakStage.score)}
` : ''}

${summary.strongestStage ? `
TOP PERFORMER: ${summary.strongestStage.label}
Conversion Rate: ${formatPercent(summary.strongestStage.conversionRate)}
Stage Score: ${formatScore(summary.strongestStage.score)}
` : ''}

========================================
STAGE BREAKDOWN
========================================
${summary.stageScores.map((stage, idx) => `
${idx + 1}. ${stage.label}
   Conversion: ${formatPercent(stage.conversionRate)}
   Drop-off: ${formatPercent(stage.dropOffRate)}
   Score: ${formatScore(stage.score)}/100
   Status: ${statusLabel[stage.status]}
`).join('\n')}

========================================
AI INSIGHTS
========================================
${insights.map((insight, idx) => `
${idx + 1}. ${insight.title}
   ${insight.body}
   Impact: ${insight.estimatedImpact || 'N/A'}
`).join('\n')}

${impact && impact.estimatedExtraRevenue ? `
========================================
REVENUE OPPORTUNITY
========================================
Leads Lost: ${impact.leadsLost.toLocaleString()}
Potential Recoverable: ${impact.potentialRecoveredLeads.toLocaleString()}
Estimated Revenue Gain: ${snapshot.currency}${Math.round(impact.estimatedExtraRevenue).toLocaleString()}
` : ''}

Report generated by Apex Digital Africa
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${snapshot.businessName}-Full-Funnel-Report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share Function
  const handleShare = async () => {
    const shareData = {
      title: `${snapshot.businessName} - Funnel Analysis Report`,
      text: `Check out our funnel performance: ${summary.overallScore}/100 score with ${formatPercent(summary.avgConversionRate)} avg conversion rate.`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Book Call Function
  const handleBookCall = () => {
    window.open('https://calendly.com/apexdigitalafrica', '_blank');
  };

  // Animated score counter
  useEffect(() => {
    setIsVisible(true);
    let current = 0;
    const target = summary.overallScore;
    const increment = target / 50;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setAnimatedScore(target);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [summary.overallScore]);

  // Auto-rotate insights
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedInsight((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const chartData = summary.stageScores.map((s) => ({
    name: s.label.length > 15 ? s.label.substring(0, 12) + '...' : s.label,
    fullName: s.label,
    conversion: Number((s.conversionRate * 100).toFixed(1)),
    score: Number(s.score.toFixed(1)),
    dropOff: Number((s.dropOffRate * 100).toFixed(1)),
    status: s.status,
  }));

  const overallMood =
    summary.overallScore >= 80
      ? 'good'
      : summary.overallScore >= 60
      ? 'warning'
      : 'bad';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 blur-3xl animate-pulse" />
          <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/5 blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 blur-3xl animate-pulse delay-500" />
        </div>

        <section
          id="funnel-scorecard-content"
          className={`relative z-10 overflow-hidden rounded-3xl border-2 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-2xl transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          } ${statusColors[overallMood].ring} border-slate-800/50`}
        >
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

          <div className="relative z-10 p-6 sm:p-8 lg:p-10">
            {/* Header with Actions */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div className="flex-1 min-w-[280px]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                    <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-md animate-pulse" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400/90">
                    Apex Growth Intelligence
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-cyan-100 leading-tight mb-2">
                  Funnel Scorecard
                </h1>
                <p className="text-lg font-semibold text-slate-300 mb-2">
                  {snapshot.businessName}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                    <Target className="w-4 h-4 text-cyan-400" />
                    {snapshot.periodLabel}
                  </span>
                  {totalTop > 0 && (
                    <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                      <Users className="w-4 h-4 text-blue-400" />
                      {totalTop.toLocaleString()} leads entered
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="group flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all hover:scale-105">
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh
                </button>
                <button 
                  onClick={handleShare}
                  className="group flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-all hover:scale-105"
                >
                  <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Share
                </button>
                <button 
                  onClick={handleDownloadFullReport}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
                >
                  <Download className="w-4 h-4" />
                  Download Full Report
                </button>
                <button 
                  id="export-pdf-btn"
                  onClick={handleExportPDF}
                  className="group flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                  Export PDF
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
              {/* LEFT COLUMN: Score + Key Metrics + Insights */}
              <div className="xl:col-span-7 space-y-6">
                {/* Main Score Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className={`relative overflow-hidden rounded-2xl border-2 p-6 sm:p-8 backdrop-blur-sm ${statusColors[overallMood].bg} ${statusColors[overallMood].ring}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      {/* Score Circle */}
                      <div className="relative">
                        <div className={`relative flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full border-4 bg-gradient-to-br from-slate-950 to-slate-900 shadow-2xl transition-all duration-500 group-hover:scale-110 ${statusColors[overallMood].ring}`}>
                          <div className="absolute inset-[8px] rounded-full bg-gradient-to-br from-slate-900/90 to-slate-950/90" />
                          <div className="relative text-center">
                            <span className={`block text-5xl sm:text-6xl font-black tabular-nums tracking-tighter ${statusColors[overallMood].text}`}>
                              {animatedScore}
                            </span>
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                              / 100
                            </span>
                          </div>
                        </div>
                        {/* Animated ring */}
                        <div className={`absolute inset-0 rounded-full border-4 border-t-transparent animate-spin ${statusColors[overallMood].ring}`} style={{ animationDuration: '3s' }} />
                      </div>

                      {/* Score Description */}
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {summary.overallScore >= 80 ? 'Excellent Performance! 🚀' : summary.overallScore >= 60 ? 'Room for Improvement 📈' : 'Critical Issues Detected ⚠️'}
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-4">
                          {summary.overallScore >= 80
                            ? 'Your funnel is performing at an elite level. Focus on scaling what works.'
                            : summary.overallScore >= 60
                            ? 'Your funnel has a solid foundation but revenue is leaking at key stages.'
                            : 'Significant opportunities to recover lost revenue and multiply conversions.'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">Avg Conversion</p>
                            <p className="text-xl font-bold text-emerald-400">
                              {formatPercent(summary.avgConversionRate)}
                            </p>
                          </div>
                          <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">Overall Flow</p>
                            <p className="text-xl font-bold text-cyan-400">
                              {overallConversion.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Metrics */}
                {snapshot.estimatedRevenue != null && totalWon > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 hover:border-emerald-500/50 transition-all hover:scale-105">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all" />
                      <DollarSign className="w-8 h-8 text-emerald-400 mb-3" />
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Est. Revenue
                      </p>
                      <p className="text-2xl font-black text-white">
                        {snapshot.currency ?? '₦'}
                        {snapshot.estimatedRevenue.toLocaleString()}
                      </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 hover:border-cyan-500/50 transition-all hover:scale-105">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all" />
                      <Users className="w-8 h-8 text-cyan-400 mb-3" />
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Customers Won
                      </p>
                      <p className="text-2xl font-black text-white">
                        {totalWon.toLocaleString()}
                      </p>
                    </div>

                    <div className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 hover:border-blue-500/50 transition-all hover:scale-105">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all" />
                      <Target className="w-8 h-8 text-blue-400 mb-3" />
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Rev / Customer
                      </p>
                      <p className="text-2xl font-black text-white">
                        {snapshot.currency ?? '₦'}
                        {Math.round(snapshot.estimatedRevenue / totalWon).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Biggest Leak + Strongest Stage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Biggest Leak */}
                  {summary.biggestLeakStage && (
                    <div className="group relative overflow-hidden rounded-2xl border-2 border-rose-500/30 bg-gradient-to-br from-rose-950/40 to-slate-950/60 p-6 hover:border-rose-500/60 transition-all hover:shadow-2xl hover:shadow-rose-500/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
                          <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/40">
                            CRITICAL
                          </span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-400/80 mb-2">
                          Biggest Leak
                        </p>
                        <h4 className="text-xl font-bold text-white mb-3">
                          {summary.biggestLeakStage.label}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-slate-400">Drop-off Rate</p>
                            <p className="text-2xl font-black text-rose-300">
                              {formatPercent(summary.biggestLeakStage.dropOffRate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Stage Score</p>
                            <p className="text-2xl font-black text-rose-300">
                              {formatScore(summary.biggestLeakStage.score)}
                            </p>
                          </div>
                        </div>
                        {impact && (
                          <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                            <p className="text-xs text-rose-200 leading-relaxed">
                              💰 <span className="font-bold">{impact.leadsLost.toLocaleString()}</span> people lost here. 
                              Recover 25% = <span className="font-bold">{impact.potentialRecoveredLeads.toLocaleString()}</span> extra opportunities
                              {impact.estimatedExtraRevenue && (
                                <span className="block mt-1">
                                  Worth ≈ <span className="font-bold text-rose-100">{snapshot.currency ?? '₦'}{Math.round(impact.estimatedExtraRevenue).toLocaleString()}</span>
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Strongest Stage */}
                  {summary.strongestStage && (
                    <div className="group relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-950/60 p-6 hover:border-emerald-500/60 transition-all hover:shadow-2xl hover:shadow-emerald-500/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all" />
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <Zap className="w-8 h-8 text-emerald-400" />
                          <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
                            TOP PERFORMER
                          </span>
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/80 mb-2">
                          Strongest Stage
                        </p>
                        <h4 className="text-xl font-bold text-white mb-3">
                          {summary.strongestStage.label}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <p className="text-xs text-slate-400">Conversion</p>
                            <p className="text-2xl font-black text-emerald-300">
                              {formatPercent(summary.strongestStage.conversionRate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Stage Score</p>
                            <p className="text-2xl font-black text-emerald-300">
                              {formatScore(summary.strongestStage.score)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
                          <p className="text-xs text-emerald-200 leading-relaxed">
                            ✨ Study this stage carefully. Whatever is working here (copy, timing, offer) is your growth blueprint. Replicate it across weaker stages.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Insights Carousel */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-slate-950/60 p-6 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-lg font-bold text-white">
                          AI Growth Insights
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        {insights.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedInsight(idx)}
                            className={`h-1.5 rounded-full transition-all ${
                              selectedInsight === idx
                                ? 'w-8 bg-cyan-400'
                                : 'w-1.5 bg-slate-600 hover:bg-slate-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {insights[selectedInsight] && (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                              insights[selectedInsight].severity === 'high'
                                ? 'bg-rose-500/20 text-rose-400'
                                : insights[selectedInsight].severity === 'medium'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {insights[selectedInsight].severity === 'high' ? (
                              <AlertTriangle className="w-6 h-6" />
                            ) : insights[selectedInsight].severity === 'medium' ? (
                              <TrendingUp className="w-6 h-6" />
                            ) : (
                              <Zap className="w-6 h-6" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">
                              {insights[selectedInsight].title}
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                              {insights[selectedInsight].body}
                            </p>
                            <span
                              className={`inline-flex mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                                insights[selectedInsight].severity === 'high'
                                  ? 'bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/40'
                                  : insights[selectedInsight].severity === 'medium'
                                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                              }`}
                            >
                              {insights[selectedInsight].severity === 'high'
                                ? '🎯 High Impact'
                                : insights[selectedInsight].severity === 'medium'
                                ? '📈 Moderate Impact'
                                : '✨ Optimisation'}
                            </span>
                          </div>
                        </div>

                        {impact && impact.estimatedExtraRevenue && selectedInsight === 0 && (
                          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <DollarSign className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-bold text-emerald-300 mb-1">
                                  💰 Hidden Revenue Opportunity
                                </p>
                                <p className="text-xs text-emerald-200/90 leading-relaxed">
                                  Fix your biggest leak and recover 25% of lost traffic = approximately{' '}
                                  <span className="font-bold text-white">
                                    {snapshot.currency ?? '₦'}
                                    {Math.round(impact.estimatedExtraRevenue).toLocaleString()}
                                  </span>{' '}
                                  in additional revenue without increasing ad spend.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Charts + Stage Breakdown */}
              <div className="xl:col-span-5 space-y-6">
                {/* Conversion Chart */}
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                      Conversion & Performance
                    </h3>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-emerald-400/80" />
                        <span className="text-slate-400">Conversion</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded bg-cyan-400/70" />
                        <span className="text-slate-400">Score</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} barSize={20} barGap={4}>
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 11 }}
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 12,
                            fontSize: 12,
                            padding: 12,
                          }}
                          cursor={{ fill: '#1e293b' }}
                          formatter={(value, name) => [
                            `${value}%`,
                            name === 'conversion' ? 'Conversion' : 'Score',
                          ]}
                          labelFormatter={(label) => {
                            const item = chartData.find((d) => d.name === label);
                            return item?.fullName || label;
                          }}
                        />
                        <Bar dataKey="conversion" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.status === 'good'
                                  ? '#10b981'
                                  : entry.status === 'warning'
                                  ? '#f59e0b'
                                  : '#ef4444'
                              }
                              opacity={0.9}
                            />
                          ))}
                        </Bar>
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} fill="#06b6d4" opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Drop-off Visualization */}
                <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                    Drop-off Analysis
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="dropOffGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tick={{ fill: '#94A3B8', fontSize: 10 }}
                          unit="%"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #334155',
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                          formatter={(value) => [`${value}%`, 'Drop-off Rate']}
                        />
                        <Area
                          type="monotone"
                          dataKey="dropOff"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="url(#dropOffGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stage List */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 px-1">
                    Stage Breakdown
                  </h3>
                  {summary.stageScores.map((stage, idx) => (
                    <div
                      key={stage.stageId}
                      className="group relative overflow-hidden rounded-xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-950/80 p-4 hover:border-slate-700 transition-all hover:scale-[1.02]"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        stage.status === 'good'
                          ? 'bg-emerald-500'
                          : stage.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`} />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-500">
                              #{idx + 1}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {stage.label}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                                Conversion
                              </p>
                              <p className="text-lg font-black text-emerald-400">
                                {formatPercent(stage.conversionRate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                                Drop-off
                              </p>
                              <p className="text-lg font-black text-rose-400">
                                {formatPercent(stage.dropOffRate)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-2xl font-black text-white">
                            {formatScore(stage.score)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[stage.status].bg} ${statusColors[stage.status].text} ${statusColors[stage.status].ring} ring-1`}
                          >
                            {stage.status === 'good' && <TrendingUp className="w-3 h-3" />}
                            {stage.status === 'warning' && <AlertTriangle className="w-3 h-3" />}
                            {stage.status === 'bad' && <TrendingDown className="w-3 h-3" />}
                            {statusLabel[stage.status]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Action CTA */}
                <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 to-blue-950/40 p-6">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
                  <div className="relative">
                    <Zap className="w-8 h-8 text-cyan-400 mb-3" />
                    <h4 className="text-lg font-bold text-white mb-2">
                      Ready to Fix Your Funnel?
                    </h4>
                    <p className="text-sm text-slate-300 mb-4">
                      Book a 30-minute strategy session and we'll show you exactly how to plug these leaks.
                    </p>
                    <button 
                      onClick={handleBookCall}
                      className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/25"
                    >
                      <span>Book Strategy Call</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}