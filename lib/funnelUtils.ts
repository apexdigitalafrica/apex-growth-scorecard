import type { FunnelSnapshot, FunnelScoreSummary, StageScore, FunnelStageStatus } from './funnelTypes';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getStageStatus(conversionRate: number, target?: number): FunnelStageStatus {
  if (target == null) {
    if (conversionRate >= 0.35) return 'good';
    if (conversionRate >= 0.2) return 'warning';
    return 'bad';
  }
  const ratio = conversionRate / target;
  if (ratio >= 0.95) return 'good';
  if (ratio >= 0.7) return 'warning';
  return 'bad';
}

export function computeFunnelScore(snapshot: FunnelSnapshot): FunnelScoreSummary {
  const stageScores: StageScore[] = snapshot.stages.map((stage) => {
    const conversionRate = stage.input > 0 ? stage.output / stage.input : 0;
    const dropOffRate = clamp(1 - conversionRate, 0, 1);
    const status = getStageStatus(conversionRate, stage.targetConversion);
    const baseScore = conversionRate * 100;
    const penalty = dropOffRate * 25;
    const targetBoost = stage.targetConversion != null ? clamp((conversionRate / stage.targetConversion) * 100, 0, 120) * 0.15 : 0;
    const score = clamp(baseScore - penalty + targetBoost, 0, 100);
    return { stageId: stage.id, label: stage.label, conversionRate, dropOffRate, targetConversion: stage.targetConversion, status, score };
  });
  const overallScore = stageScores.length > 0 ? stageScores.reduce((sum, s) => sum + s.score, 0) / stageScores.length : 0;
  const avgConversionRate = stageScores.length > 0 ? stageScores.reduce((sum, s) => sum + s.conversionRate, 0) / stageScores.length : 0;
  const sortedByDropOff = [...stageScores].sort((a, b) => b.dropOffRate - a.dropOffRate);
  const sortedByScore = [...stageScores].sort((a, b) => b.score - a.score);
  return { overallScore: Math.round(overallScore), avgConversionRate, biggestLeakStage: sortedByDropOff[0], strongestStage: sortedByScore[0], stageScores };
}

export interface FunnelInsight {
  title: string;
  body: string;
  severity: 'high' | 'medium' | 'low';
  actionItems?: string[];
  estimatedImpact?: string;
}

export interface FunnelImpactEstimate {
  leadsLost: number;
  potentialRecoveredLeads: number;
  estimatedExtraRevenue?: number;
  averageRevenuePerCustomer?: number;
}

export function estimateLeakImpact(snapshot: FunnelSnapshot, summary: FunnelScoreSummary): FunnelImpactEstimate | null {
  if (!summary.biggestLeakStage) return null;
  const rawStage = snapshot.stages.find((s) => s.id === summary.biggestLeakStage.stageId);
  if (!rawStage) return null;
  const leadsLost = Math.max(rawStage.input - rawStage.output, 0);
  const potentialRecoveredLeads = Math.round(leadsLost * 0.25);
  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  const wonDeals = lastStage?.output ?? 0;
  if (!snapshot.estimatedRevenue || wonDeals <= 0) {
    return { leadsLost, potentialRecoveredLeads };
  }
  const averageRevenuePerCustomer = snapshot.estimatedRevenue / wonDeals;
  const estimatedExtraRevenue = potentialRecoveredLeads * averageRevenuePerCustomer;
  return { leadsLost, potentialRecoveredLeads, estimatedExtraRevenue, averageRevenuePerCustomer };
}

export function generateFunnelInsights(snapshot: FunnelSnapshot, summary: FunnelScoreSummary): FunnelInsight[] {
  const insights: FunnelInsight[] = [];
  if (summary.overallScore >= 80) {
    insights.push({ title: 'Elite Performance: Your Funnel is in the Top 10%', body: 'Your funnel is outperforming 90 percent of businesses. Focus on scaling what works.', severity: 'low', actionItems: ['Increase ad spend on best channels', 'Test your strongest stage', 'Document processes', 'Build automation'], estimatedImpact: 'Scaling could 2-3x revenue in 90 days' });
  } else if (summary.overallScore >= 60) {
    insights.push({ title: 'Solid Foundation with Revenue Leaks', body: 'Your funnel performs above average but has leaks. Small fixes unlock big revenue.', severity: 'medium', actionItems: ['Map customer journey at weakest stage', 'Add exit surveys', 'Set up retargeting', 'Automate follow-ups'], estimatedImpact: 'Fixing top 2 leaks could increase revenue 25-40 percent' });
  } else {
    insights.push({ title: 'Critical Revenue Leak', body: 'Your funnel loses 60 percent of customers. This is a conversion problem, not traffic.', severity: 'high', actionItems: ['Audit all stages TODAY', 'Simplify your offer', 'Reduce friction', 'Speed up follow-up'], estimatedImpact: 'Could double or triple revenue' });
  }
  if (summary.biggestLeakStage) {
    const rate = (summary.biggestLeakStage.dropOffRate * 100).toFixed(1);
    insights.push({ title: `Massive Leak: ${summary.biggestLeakStage.label}`, body: `This stage loses ${rate} percent of prospects. Your biggest opportunity.`, severity: 'high', actionItems: ['Record customer calls', 'Simplify by 50 percent', 'Add social proof', 'Add guarantees'], estimatedImpact: `Could recover ${rate} percent more customers` });
  }
  if (summary.strongestStage) {
    insights.push({ title: `Top Performer: ${summary.strongestStage.label}`, body: 'This stage converts exceptionally well. Replicate this success.', severity: 'medium', actionItems: ['Document what works', 'Interview customers', 'Apply to weaker stages', 'Train team'], estimatedImpact: 'Could improve weak stages 2-3x' });
  }
  const impact = estimateLeakImpact(snapshot, summary);
  if (impact?.estimatedExtraRevenue) {
    const revenue = Math.round(impact.estimatedExtraRevenue).toLocaleString();
    insights.push({ title: 'Hidden Revenue Opportunity', body: `About ${snapshot.currency}${revenue} trapped in your funnel right now.`, severity: 'high', actionItems: ['Calculate ROI of fixes', 'Focus on fixes not traffic', 'Set 30-day sprint', 'Measure daily'], estimatedImpact: `Recover 25 percent = ${snapshot.currency}${revenue}` });
  }
  return insights.slice(0, 5);
}

export function generateExecutiveSummary(snapshot: FunnelSnapshot, summary: FunnelScoreSummary): string {
  const impact = estimateLeakImpact(snapshot, summary);
  let text = `Funnel Health: ${summary.overallScore}/100\n\n`;
  if (summary.overallScore >= 80) {
    text += 'Status: HEALTHY - Top 10 percent. Ready to scale.\n\n';
  } else if (summary.overallScore >= 60) {
    text += 'Status: MODERATE - Has leaks. Optimize before scaling.\n\n';
  } else {
    text += 'Status: CRITICAL - Immediate action needed.\n\n';
  }
  text += `Avg Conversion: ${(summary.avgConversionRate * 100).toFixed(1)} percent\n`;
  text += `Biggest Leak: ${summary.biggestLeakStage?.label}\n`;
  text += `Top Stage: ${summary.strongestStage?.label}\n`;
  if (impact?.estimatedExtraRevenue) {
    const revenue = Math.round(impact.estimatedExtraRevenue).toLocaleString();
    text += `\nRevenue Opportunity: ${snapshot.currency}${revenue}\n`;
  }
  return text;
}
