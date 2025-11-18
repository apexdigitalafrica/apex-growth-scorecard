// lib/funnelUtils.ts
import type {
  FunnelSnapshot,
  FunnelScoreSummary,
  StageScore,
  FunnelStageStatus,
} from './funnelTypes';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getStageStatus(
  conversionRate: number,
  target?: number
): FunnelStageStatus {
  if (target == null) {
    // Industry benchmarks
    if (conversionRate >= 0.35) return 'good';
    if (conversionRate >= 0.2) return 'warning';
    return 'bad';
  }

  const ratio = conversionRate / target;

  if (ratio >= 0.95) return 'good';
  if (ratio >= 0.7) return 'warning';
  return 'bad';
}

/**
 * Compute comprehensive funnel score with advanced metrics
 */
export function computeFunnelScore(snapshot: FunnelSnapshot): FunnelScoreSummary {
  const stageScores: StageScore[] = snapshot.stages.map((stage) => {
    const conversionRate =
      stage.input > 0 ? stage.output / stage.input : 0;

    const dropOffRate = clamp(1 - conversionRate, 0, 1);
    const status = getStageStatus(conversionRate, stage.targetConversion);

    // Advanced scoring algorithm
    const baseScore = conversionRate * 100;
    
    // Penalize high drop-offs more severely
    const dropOffPenalty = Math.pow(dropOffRate, 1.5) * 30;
    
    // Reward meeting/exceeding targets
    const targetBonus =
      stage.targetConversion != null && conversionRate >= stage.targetConversion
        ? 15
        : 0;

    // Progressive bonus for exceptional performance
    const excellenceBonus = conversionRate >= 0.5 ? 10 : 0;

    const score = clamp(
      baseScore - dropOffPenalty + targetBonus + excellenceBonus,
      0,
      100
    );

    return {
      stageId: stage.id,
      label: stage.label,
      conversionRate,
      dropOffRate,
      targetConversion: stage.targetConversion,
      status,
      score: Math.round(score),
    };
  });

  // Weighted average (later stages matter more)
  const weights = stageScores.map((_, idx) => 1 + idx * 0.1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  
  const overallScore =
    stageScores.length > 0
      ? stageScores.reduce((sum, s, idx) => sum + s.score * weights[idx], 0) /
        totalWeight
      : 0;

  const avgConversionRate =
    stageScores.length > 0
      ? stageScores.reduce((sum, s) => sum + s.conversionRate, 0) /
        stageScores.length
      : 0;

  const sortedByDropOff = [...stageScores].sort(
    (a, b) => b.dropOffRate - a.dropOffRate
  );
  const sortedByScore = [...stageScores].sort((a, b) => b.score - a.score);

  const biggestLeakStage = sortedByDropOff[0];
  const strongestStage = sortedByScore[0];

  return {
    overallScore: Math.round(overallScore),
    avgConversionRate,
    biggestLeakStage,
    strongestStage,
    stageScores,
  };
}

/* -------------------------------------------------------------------------- */
/*                          Insight / Narrative Engine                        */
/* -------------------------------------------------------------------------- */

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
  breakdownByStage?: {
    stageId: string;
    stageName: string;
    leadsLost: number;
    potentialRevenue: number;
  }[];
}

/**
 * Enhanced impact estimation with stage-by-stage breakdown
 */
export function estimateLeakImpact(
  snapshot: FunnelSnapshot,
  summary: FunnelScoreSummary
): FunnelImpactEstimate | null {
  if (!summary.biggestLeakStage) return null;

  const leakStageScore = summary.biggestLeakStage;
  const rawStage = snapshot.stages.find(
    (s) => s.id === leakStageScore.stageId
  );
  if (!rawStage) return null;

  const leadsLost = Math.max(rawStage.input - rawStage.output, 0);
  
  // Conservative 25% recovery estimate
  const potentialRecoveredLeads = Math.round(leadsLost * 0.25);

  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  const wonDeals = lastStage?.output ?? 0;

  if (!snapshot.estimatedRevenue || wonDeals <= 0) {
    return {
      leadsLost,
      potentialRecoveredLeads,
    };
  }

  const averageRevenuePerCustomer = snapshot.estimatedRevenue / wonDeals;
  const estimatedExtraRevenue = potentialRecoveredLeads * averageRevenuePerCustomer;

  // Stage-by-stage breakdown
  const breakdownByStage = snapshot.stages
    .map((stage) => {
      const stageLoss = Math.max(stage.input - stage.output, 0);
      const stageRecovery = Math.round(stageLoss * 0.25);
      return {
        stageId: stage.id,
        stageName: stage.label,
        leadsLost: stageLoss,
        potentialRevenue: stageRecovery * averageRevenuePerCustomer,
      };
    })
    .filter((s) => s.leadsLost > 0)
    .sort((a, b) => b.potentialRevenue - a.potentialRevenue);

  return {
    leadsLost,
    potentialRecoveredLeads,
    estimatedExtraRevenue,
    averageRevenuePerCustomer,
    breakdownByStage,
  };
}

/**
 * Generate AI-powered insights with actionable recommendations
 */
export function generateFunnelInsights(
  snapshot: FunnelSnapshot,
  summary: FunnelScoreSummary
): FunnelInsight[] {
  const insights: FunnelInsight[] = [];

  // 1. Overall health insight with specific actions
  if (summary.overallScore >= 80) {
    insights.push({
      title: '🚀 Elite Performance: Your Funnel is in the Top 10%',
      body:
        'Your funnel is outperforming 90% of businesses. This is the perfect time to scale aggressively. Focus on optimizing what already works rather than fixing problems.',
      severity: 'low',
      actionItems: [
        'Increase ad spend on best-performing channels by 30-50%',
        'A/B test your strongest stage to find marginal gains',
        'Document your processes for replication',
        'Build automation around proven workflows',
      ],
      estimatedImpact: 'Scaling now could 2-3x your current revenue in 90 days',
    });
  } else if (summary.overallScore >= 60) {
    insights.push({
      title: '📈 Solid Foundation with Hidden Revenue Leaks',
      body:
        'Your funnel performs above average (top 40%), but you're leaving money on the table. Small improvements at leak points will unlock significant revenue without increasing traffic.',
      severity: 'medium',
      actionItems: [
        'Map the customer journey at your weakest stage',
        'Implement exit-intent surveys to understand drop-offs',
        'Add retargeting pixels for lost prospects',
        'Set up automated follow-up sequences',
      ],
      estimatedImpact: 'Fixing top 2 leaks could increase revenue by 25-40%',
    });
  } else {
    insights.push({
      title: '🚨 Critical Revenue Leak: Immediate Action Required',
      body:
        'Your funnel is losing 60%+ of potential customers. This is NOT a traffic problem—it's a conversion and follow-up issue. Every day you delay fixing this costs you real revenue.',
      severity: 'high',
      actionItems: [
        'Audit all stages for friction points TODAY',
        'Simplify your offer and clarify value proposition',
        'Reduce steps between awareness and purchase',
        'Implement aggressive follow-up (call within 5 minutes)',
      ],
      estimatedImpact:
        'Fixing these leaks could double or triple your current revenue',
    });
  }

  // 2. Biggest leak insight with surgical precision
  if (summary.biggestLeakStage) {
    const leakRate = (summary.biggestLeakStage.dropOffRate * 100).toFixed(1);
    insights.push({
      title: `💧 Massive Leak Detected: ${summary.biggestLeakStage.label}`,
      body: `This stage is hemorrhaging ${leakRate}% of your prospects. This single leak is likely costing you more than any other issue in your business right now.`,
      severity: 'high',
      actionItems: [
        'Record 5-10 customer calls at this stage to identify objections',
        'Test a simplified version with 50% fewer steps',
        'Add social proof (testimonials, case studies, reviews)',
        'Implement a "risk-reversal" guarantee or trial',
        'Speed up response time—aim for under 5 minutes',
      ],
      estimatedImpact: `Fixing this one stage could recover ${leakRate}% more customers`,
    });
  }

  // 3. Strongest stage insight with replication strategy
  if (summary.strongestStage) {
    insights.push({
      title: `⚡ Your Secret Weapon: ${summary.strongestStage.label}`,
      body:
        'This stage is converting at an exceptional rate. Whatever you're doing here is working brilliantly. Your growth playbook should be built around replicating this excellence.',
      severity: 'medium',
      actionItems: [
        'Document exactly what makes this stage work (copy, timing, offer)',
        'Interview customers who converted here about their experience',
        'Apply the same messaging/structure to weaker stages',
        'Train team members on what makes this stage successful',
      ],
      estimatedImpact: 'Replicating this success could improve weak stages by 2-3x',
    });
  }

  // 4. Conversion efficiency insight
  if (summary.avgConversionRate >= 0.3) {
    insights.push({
      title: '✅ Strong Conversion Rate—Now Optimize for Speed',
      body:
        'Your messaging resonates. The bottleneck isn't convincing people; it's moving them through faster. Every hour of delay decreases conversion by ~5%.',
      severity: 'low',
      actionItems: [
        'Automate follow-ups with email sequences',
        'Set up instant notifications for new leads',
        'Implement chatbots for 24/7 engagement',
        'Use calendar booking tools to reduce scheduling friction',
      ],
      estimatedImpact: 'Faster response could boost conversions by 15-25%',
    });
  } else if (summary.avgConversionRate <= 0.15) {
    insights.push({
      title: '🎯 Low Conversion = Misaligned Offer or Audience',
      body:
        'Your average conversion rate suggests a fundamental mismatch. Either your message isn't clear, your audience is wrong, or your offer doesn't resonate.',
      severity: 'high',
      actionItems: [
        'Clarify your value proposition in one sentence',
        'Survey your best customers about why they bought',
        'Refine targeting to attract higher-intent prospects',
        'Test 3 different offer structures within 30 days',
      ],
      estimatedImpact: 'Fixing offer-market fit could 3-5x your conversion rate',
    });
  }

  // 5. Revenue opportunity insight
  const impact = estimateLeakImpact(snapshot, summary);
  if (impact && impact.estimatedExtraRevenue && impact.estimatedExtraRevenue > 0) {
    const formattedRevenue = Math.round(impact.estimatedExtraRevenue).toLocaleString();
    insights.push({
      title: '💰 Hidden Revenue Inside Your Existing Funnel',
      body: `There's approximately ${snapshot.currency ?? '₦'}${formattedRevenue} in revenue trapped inside your funnel right now—no new traffic needed. This is money you've already paid to acquire, just not captured.`,
      severity: 'high',
      actionItems: [
        'Calculate exact ROI of fixing vs. buying more traffic',
        'Allocate 70% of resources to fixing leaks, 30% to new traffic',
        'Set a 30-day sprint to plug your biggest 3 leaks',
        'Measure daily improvement to track momentum',
      ],
      estimatedImpact: `Recovering 25% = ${snapshot.currency ?? '₦'}${formattedRevenue} additional revenue`,
    });
  }

  // 6. Benchmark insight
  const firstStage = snapshot.stages[0];
  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  if (firstStage && lastStage) {
    const overallConversion =
      firstStage.input > 0 ? (lastStage.output / firstStage.input) * 100 : 0;
    
    if (overallConversion < 5) {
      insights.push({
        title: '⚠️ End-to-End Conversion Below Industry Standard',
        body:
          `Only ${overallConversion.toFixed(1)}% of people who enter your funnel become customers. Industry average is 5-10%. You're losing 95%+ of prospects.`,
        severity: 'high',
        actionItems: [
          'Audit every stage for unnecessary friction',
          'Implement nurture sequences for "not ready now" prospects',
          'Add retargeting for people who drop off',
          'Test shorter funnels (remove 1-2 stages)',
        ],
        estimatedImpact: 'Reaching 5% conversion could double your revenue',
      });
    }
  }

  return insights.slice(0, 5); // Return top 5 most impactful insights
}

/**
 * Generate executive summary for C-level reporting
 */
export function generateExecutiveSummary(
  snapshot: FunnelSnapshot,
  summary: FunnelScoreSummary
): string {
  const impact = estimateLeakImpact(snapshot, summary);
  
  let executiveSummary = `**Funnel Health: ${summary.overallScore}/100**\n\n`;
  
  if (summary.overallScore >= 80) {
    executiveSummary += `✅ **Status: HEALTHY** - Funnel is performing in top 10%. Recommend scaling investment.\n\n`;
  } else if (summary.overallScore >= 60) {
    executiveSummary += `⚠️ **Status: MODERATE** - Funnel works but has revenue leaks. Optimization recommended before scaling.\n\n`;
  } else {
    executiveSummary += `🚨 **Status: CRITICAL** - Significant revenue loss. Immediate intervention required.\n\n`;
  }
  
  executiveSummary += `**Key Metrics:**\n`;
  executiveSummary += `• Average Conversion: ${(summary.avgConversionRate * 100).toFixed(1)}%\n`;
  executiveSummary += `• Biggest Leak: ${summary.biggestLeakStage?.label} (${(summary.biggestLeakStage?.dropOffRate * 100).toFixed(1)}% drop-off)\n`;
  executiveSummary += `• Top Performer: ${summary.strongestStage?.label} (${(summary.strongestStage?.conversionRate * 100).toFixed(1)}% conversion)\n\n`;
  
  if (impact && impact.estimatedExtraRevenue) {
    executiveSummary += `**Revenue Opportunity:**\n`;
    executiveSummary += `• Leads Lost: ${impact.leadsLost.toLocaleString()}\n`;
    executiveSummary += `• Recoverable (25%): ${impact.potentialRecoveredLeads.toLocaleString()} leads\n`;
    executiveSummary += `• Estimated Value: ${snapshot.currency ?? '₦'}${Math.round(impact.estimatedExtraRevenue).toLocaleString()}\n\n`;
  }
  
  executiveSummary += `**Recommended Action:** ${
    summary.overallScore >= 80
      ? 'Scale winning strategies'
      : summary.overallScore >= 60
      ? 'Fix top 2 leaks before scaling'
      : 'Immediate funnel rebuild required'
  }`;
  
  return executiveSummary;
}
