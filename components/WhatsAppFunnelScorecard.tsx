// components/WhatsAppFunnelScorecard.tsx
'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import type { WhatsAppFunnelSnapshot } from '@/lib/whatsappTypes';
import {
  computeWhatsAppFunnelScore,
  generateWhatsAppInsights,
  estimateWhatsAppImpact,
} from '@/lib/whatsappUtils';

interface WhatsAppFunnelScorecardProps {
  snapshot: WhatsAppFunnelSnapshot;
}

const statusColors: Record<string, string> = {
  good: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/40',
  warning: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/40',
  bad: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/40',
};

const statusLabel: Record<string, string> = {
  good: 'Healthy',
  warning: 'Needs Attention',
  bad: 'Critical',
};

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function formatScore(value: number): string {
  return `${value.toFixed(0)}/100`;
}

export default function WhatsAppFunnelScorecard({
  snapshot,
}: WhatsAppFunnelScorecardProps) {
  const summary = computeWhatsAppFunnelScore(snapshot);
  const insights = generateWhatsAppInsights(snapshot, summary);
  const impact = estimateWhatsAppImpact(snapshot, summary);

  const chartData = summary.stageScores.map((s) => ({
    name: s.label,
    Conversion: Number((s.conversionRate * 100).toFixed(1)),
    Score: Number(s.score.toFixed(1)),
  }));

  const overallMood =
    summary.overallScore >= 80
      ? 'text-emerald-400 border-emerald-500/50'
      : summary.overallScore >= 60
      ? 'text-amber-300 border-amber-500/50'
      : 'text-rose-300 border-rose-500/50';

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 shadow-2xl shadow-emerald-500/10 sm:p-8">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row">
        {/* LEFT: Overview & Insights */}
        <div className="flex flex-[1.2] flex-col gap-4">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                Apex WhatsApp Intelligence
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
                WhatsApp Funnel Scorecard – {snapshot.businessName}
              </h2>
              <p className="text-sm text-slate-400">
                {snapshot.periodLabel}{' '}
                <span className="text-slate-300">
                  • How fast conversations turn into real opportunities.
                </span>
              </p>
            </div>

            {/* Overall Score + Meta */}
            <div className="flex items-center gap-4">
              <div
                className={`relative flex h-24 w-24 items-center justify-center rounded-full border-2 bg-slate-950/60 shadow-inner transition-transform duration-300 hover:scale-105 ${overallMood}`}
              >
                <div className="absolute inset-[6px] rounded-full bg-slate-900/80" />
                <span className="relative text-3xl font-black tracking-tight">
                  {summary.overallScore}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <p>
                  Avg conversion:{' '}
                  <span className="font-semibold text-slate-100">
                    {formatPercent(summary.avgConversionRate)}
                  </span>
                </p>
                {summary.avgResponseMinutes != null && (
                  <p>
                    Avg response:{' '}
                    <span className="font-semibold text-emerald-300">
                      {Math.round(summary.avgResponseMinutes)} min
                    </span>
                  </p>
                )}
                {snapshot.estimatedRevenue != null && (
                  <p>
                    Est. influenced revenue:{' '}
                    <span className="font-semibold text-emerald-300">
                      {snapshot.currency ?? '₦'}
                      {snapshot.estimatedRevenue.toLocaleString()}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Leak + Response Card */}
          <div className="grid gap-3 sm:grid-cols-2">
            {summary.biggestLeakStage && (
              <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-rose-500/60 hover:shadow-lg hover:shadow-rose-500/20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-400">
                  Biggest Chat Drop-Off
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-50">
                  {summary.biggestLeakStage.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Drop-off:{' '}
                  <span className="font-semibold text-rose-300">
                    {formatPercent(summary.biggestLeakStage.dropOffRate)}
                  </span>{' '}
                  • Score:{' '}
                  <span className="text-rose-300">
                    {formatScore(summary.biggestLeakStage.score)}
                  </span>
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  Many people go cold here. Shorten messages, add clarity, and make
                  the next step obvious (book call, send details, or pick a plan).
                </p>
                {impact && (
                  <p className="mt-2 text-[11px] text-rose-200/90">
                    Conversations lost:{' '}
                    <span className="font-semibold">
                      {impact.conversationsLost.toLocaleString()}
                    </span>{' '}
                    • If you recover ~30%, that&apos;s{' '}
                    <span className="font-semibold">
                      {impact.potentialRecoveredConversations.toLocaleString()}
                    </span>{' '}
                    extra hot conversations.
                  </p>
                )}
              </div>
            )}

            {summary.worstResponseStage && summary.worstResponseStage.avgResponseMinutes != null && (
              <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/20">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  Slowest Response Stage
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-50">
                  {summary.worstResponseStage.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Avg response:{' '}
                  <span className="font-semibold text-amber-200">
                    {Math.round(
                      summary.worstResponseStage.avgResponseMinutes ?? 0
                    )}{' '}
                    min
                  </span>
                  {summary.worstResponseStage.targetResponseMinutes && (
                    <>
                      {' '}
                      • Target:{' '}
                      <span className="font-semibold text-slate-100">
                        ≤ {summary.worstResponseStage.targetResponseMinutes} min
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  WhatsApp is a real-time channel. Every extra minute gives room
                  for distraction or competition. This is the first place to enforce
                  SLAs and automation.
                </p>
              </div>
            )}
          </div>

          {/* AI-style Insights */}
          <div className="mt-2 rounded-2xl border border-slate-800/80 bg-slate-950/90 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Apex AI Chat Insights
              </p>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40">
                Auto-analysis of your WhatsApp funnel
              </span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {insights.slice(0, 4).map((insight, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs text-slate-300"
                >
                  <p className="font-semibold text-slate-50">
                    {insight.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                    {insight.body}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      insight.severity === 'high'
                        ? 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40'
                        : insight.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40'
                    }`}
                  >
                    {insight.severity === 'high'
                      ? 'High Impact'
                      : insight.severity === 'medium'
                      ? 'Moderate Impact'
                      : 'Optimisation'}
                  </span>
                </div>
              ))}
            </div>

            {impact && impact.estimatedExtraRevenue && (
              <p className="mt-3 text-[11px] text-emerald-200/90">
                <span className="font-semibold">Board-ready insight:</span> By
                tightening scripts and response times at your weakest stage, you
                could unlock roughly{' '}
                <span className="font-semibold">
                  {snapshot.currency ?? '₦'}
                  {Math.round(impact.estimatedExtraRevenue).toLocaleString()}
                </span>{' '}
                in additional revenue from conversations you&apos;re already
                paying to generate.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: Chart + Stage Breakdown */}
        <div className="flex w-full flex-1 flex-col gap-4 lg:max-w-md">
          {/* Chart */}
          <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Conversion & Score by WhatsApp Stage
            </p>
            <div className="mt-3 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={14}>
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      border: '1px solid #1f2937',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="Conversion"
                    radius={[6, 6, 0, 0]}
                    className="fill-emerald-400/80"
                  />
                  <Bar
                    dataKey="Score"
                    radius={[6, 6, 0, 0]}
                    className="fill-cyan-400/70"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage List */}
          <div className="space-y-2">
            {summary.stageScores.map((stage) => (
              <div
                key={stage.stageId}
                className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/80 px-3 py-2.5 transition-colors duration-150 hover:border-slate-600"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {stage.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Conversion:{' '}
                    <span className="font-semibold text-slate-100">
                      {formatPercent(stage.conversionRate)}
                    </span>{' '}
                    • Drop-off:{' '}
                    <span className="font-semibold text-rose-300">
                      {formatPercent(stage.dropOffRate)}
                    </span>
                  </p>
                  {stage.avgResponseMinutes != null && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Avg response:{' '}
                      <span className="font-semibold text-emerald-200">
                        {Math.round(stage.avgResponseMinutes)} min
                      </span>
                      {stage.targetResponseMinutes && (
                        <>
                          {' '}
                          • Target:{' '}
                          <span className="font-semibold text-slate-200">
                            ≤ {stage.targetResponseMinutes} min
                          </span>
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-slate-100">
                    {formatScore(stage.score)}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColors[stage.status]}`}
                  >
                    {statusLabel[stage.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
