// lib/whatsappUtils.ts
import type {
  WhatsAppFunnelSnapshot,
  WhatsAppFunnelScoreSummary,
  WhatsAppStageScore,
  WhatsAppStageStatus,
} from './whatsappTypes';

export interface WhatsAppInsight {
  title: string;
  body: string;
  severity: 'high' | 'medium' | 'low';
}

export interface WhatsAppImpactEstimate {
  conversationsLost: number;
  potentialRecoveredConversations: number;
  estimatedExtraRevenue?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getStageStatus(
  conversionRate: number,
  avgResponseMinutes?: number,
  targetResponseMinutes?: number,
  targetConversion?: number
): WhatsAppStageStatus {
  // Response time influence
  const responsePenalty =
    avgResponseMinutes != null && targetResponseMinutes != null
      ? avgResponseMinutes / Math.max(targetResponseMinutes, 1)
      : 1;

  const effectiveConversion = conversionRate / responsePenalty;

  if (targetConversion != null) {
    const ratio = effectiveConversion / targetConversion;
    if (ratio >= 0.95) return 'good';
    if (ratio >= 0.7) return 'warning';
    return 'bad';
  }

  if (effectiveConversion >= 0.4) return 'good';
  if (effectiveConversion >= 0.2) return 'warning';
  return 'bad';
}

export function computeWhatsAppFunnelScore(
  snapshot: WhatsAppFunnelSnapshot
): WhatsAppFunnelScoreSummary {
  const stageScores: WhatsAppStageScore[] = snapshot.stages.map((stage) => {
    const conversionRate =
      stage.input > 0 ? stage.output / stage.input : 0;
    const dropOffRate = clamp(1 - conversionRate, 0, 1);

    const status = getStageStatus(
      conversionRate,
      stage.avgResponseMinutes,
      stage.targetResponseMinutes,
      stage.targetConversion
    );

    // Base score: conversion
    let score = conversionRate * 100;

    // Penalty for slow response times
    if (
      stage.avgResponseMinutes != null &&
      stage.targetResponseMinutes != null
    ) {
      const responseRatio =
        stage.avgResponseMinutes / Math.max(stage.targetResponseMinutes, 1);
      if (responseRatio > 1) {
        const penalty = clamp((responseRatio - 1) * 25, 0, 40);
        score -= penalty;
      }
    }

    // Penalty for huge drop-off
    score -= dropOffRate * 20;

    // Target boost
    if (stage.targetConversion != null && stage.targetConversion > 0) {
      const targetRatio = clamp(
        conversionRate / stage.targetConversion,
        0,
        1.3
      );
      score += targetRatio * 10;
    }

    score = clamp(score, 0, 100);

    return {
      stageId: stage.id,
      label: stage.label,
      conversionRate,
      dropOffRate,
      avgResponseMinutes: stage.avgResponseMinutes,
      targetResponseMinutes: stage.targetResponseMinutes,
      targetConversion: stage.targetConversion,
      status,
      score,
    };
  });

  const overallScore =
    stageScores.length > 0
      ? stageScores.reduce((sum, s) => sum + s.score, 0) / stageScores.length
      : 0;

  const avgConversionRate =
    stageScores.length > 0
      ? stageScores.reduce((sum, s) => sum + s.conversionRate, 0) /
        stageScores.length
      : 0;

  const responseStages = stageScores.filter(
    (s) => s.avgResponseMinutes != null
  );
  const avgResponseMinutes =
    responseStages.length > 0
      ? responseStages.reduce(
          (sum, s) => sum + (s.avgResponseMinutes ?? 0),
          0
        ) / responseStages.length
      : undefined;

  const sortedByDropOff = [...stageScores].sort(
    (a, b) => b.dropOffRate - a.dropOffRate
  );
  const sortedByScore = [...stageScores].sort(
    (a, b) => b.score - a.score
  );
  const sortedByResponse = [...stageScores]
    .filter((s) => s.avgResponseMinutes != null)
    .sort(
      (a, b) =>
        (b.avgResponseMinutes ?? 0) - (a.avgResponseMinutes ?? 0)
    );

  const biggestLeakStage = sortedByDropOff[0];
  const strongestStage = sortedByScore[0];
  const worstResponseStage = sortedByResponse[0];

  return {
    overallScore: Math.round(overallScore),
    avgConversionRate,
    avgResponseMinutes,
    worstResponseStage,
    biggestLeakStage,
    strongestStage,
    stageScores,
  };
}

export function estimateWhatsAppImpact(
  snapshot: WhatsAppFunnelSnapshot,
  summary: WhatsAppFunnelScoreSummary
): WhatsAppImpactEstimate | null {
  if (!summary.biggestLeakStage) return null;
  const rawStage = snapshot.stages.find(
    (s) => s.id === summary.biggestLeakStage?.stageId
  );
  if (!rawStage) return null;

  const conversationsLost = Math.max(rawStage.input - rawStage.output, 0);
  const potentialRecoveredConversations = Math.round(
    conversationsLost * 0.3 // assume 30% recoverable if we fix messaging + response time
  );

  if (!snapshot.estimatedRevenue) {
    return {
      conversationsLost,
      potentialRecoveredConversations,
    };
  }

  // Very rough estimate: revenue per successful conversation
  const lastStage = snapshot.stages[snapshot.stages.length - 1];
  const closedDeals = lastStage?.output ?? 0;
  if (closedDeals <= 0) {
    return {
      conversationsLost,
      potentialRecoveredConversations,
    };
  }

  const revenuePerDeal = snapshot.estimatedRevenue / closedDeals;
  const estimatedExtraRevenue =
    potentialRecoveredConversations * revenuePerDeal;

  return {
    conversationsLost,
    potentialRecoveredConversations,
    estimatedExtraRevenue,
  };
}

export function generateWhatsAppInsights(
  snapshot: WhatsAppFunnelSnapshot,
  summary: WhatsAppFunnelScoreSummary
): WhatsAppInsight[] {
  const insights: WhatsAppInsight[] = [];

  // Overall health
  if (summary.overallScore >= 80) {
    insights.push({
      title: 'Your WhatsApp funnel is a strength — now scale it with automation.',
      body:
        'Your current numbers show that WhatsApp is already performing as a high-conversion channel. This is the moment to add automation: quick replies, smarter routing, and nurture flows so you can handle more conversations without losing quality.',
      severity: 'low',
    });
  } else if (summary.overallScore >= 60) {
    insights.push({
      title: 'Solid WhatsApp funnel, but response time and follow-up are limiting growth.',
      body:
        'You are capturing demand, but slow or inconsistent responses are leaving money on the table. The goal for the next 14–30 days should be to tighten response SLAs and standardise follow-up messages.',
      severity: 'medium',
    });
  } else {
    insights.push({
      title: 'You are generating conversations, but losing most of them in the chat.',
      body:
        'This is not an ad problem; it is a WhatsApp operations problem. Slow responses, unclear next steps, and poor qualification are causing prospects to go cold. Fixing this can transform your revenue without increasing spend.',
      severity: 'high',
    });
  }

  // Biggest leak
  if (summary.biggestLeakStage) {
    insights.push({
      title: `Biggest drop-off: ${summary.biggestLeakStage.label}`,
      body: `This stage loses ${(summary.biggestLeakStage.dropOffRate * 100).toFixed(
        1
      )}% of people. Audit your scripts, questions, and follow-up cadence at this exact point. Replace long paragraphs with short, clear prompts, and always give a simple next action.`,
      severity: 'high',
    });
  }

  // Worst response time
  if (summary.worstResponseStage && summary.worstResponseStage.avgResponseMinutes != null) {
    insights.push({
      title: `Slowest response: ${summary.worstResponseStage.label}`,
      body: `Average response time here is about ${
        summary.worstResponseStage.avgResponseMinutes
      } minutes. For WhatsApp, every extra minute increases the risk that the lead gets distracted, talks to a competitor, or goes cold. Aim to bring this below ${
        summary.worstResponseStage.targetResponseMinutes ??
        Math.max(
          Math.round(
            (summary.worstResponseStage.avgResponseMinutes ?? 10) * 0.6
          ),
          3
        )
      } minutes.`,
      severity: 'high',
    });
  }

  // Conversion efficiency
  if (summary.avgConversionRate >= 0.35) {
    insights.push({
      title: 'Strong conversion through the chat stages.',
      body:
        'Your WhatsApp agents are doing a good job moving people from conversation to decision. Document the exact phrases, offers, and questions that are working, and turn them into a playbook or template library.',
      severity: 'low',
    });
  } else if (summary.avgConversionRate <= 0.18) {
    insights.push({
      title: 'Low conversion inside WhatsApp — refine your chat scripts.',
      body:
        'When many conversations do not turn into qualified leads or bookings, it usually means the script is confusing, not directive enough, or doesn’t build urgency. Introduce clear benefit statements, social proof, and a time-bound call to action.',
      severity: 'medium',
    });
  }

  // Revenue impact
  const impact = estimateWhatsAppImpact(snapshot, summary);
  if (impact && impact.estimatedExtraRevenue && impact.estimatedExtraRevenue > 0) {
    insights.push({
      title: 'Hidden revenue trapped in your WhatsApp chats.',
      body: `If you improve response time and scripts at your biggest leak by just 30%, you could unlock around ${
        snapshot.currency ?? '₦'
      }${Math.round(
        impact.estimatedExtraRevenue
      ).toLocaleString()} in additional revenue from conversations you are already having.`,
      severity: 'medium',
    });
  }

  return insights;
}
