// lib/funnelTypes.ts

export interface FunnelStage {
  id: string;
  label: string;
  input: number;
  output: number;
  targetConversion?: number; // Optional target (e.g., 0.3 = 30%)
}

export interface FunnelSnapshot {
  businessName: string;
  periodLabel: string; // e.g., "Q4 2025" or "Last 30 Days"
  stages: FunnelStage[];
  estimatedRevenue?: number; // Total revenue from won deals
  currency?: string; // e.g., "₦", "$", "€"
  timestamp?: string;
}

export type FunnelStageStatus = 'good' | 'warning' | 'bad';

export interface StageScore {
  stageId: string;
  label: string;
  conversionRate: number; // 0 to 1
  dropOffRate: number; // 0 to 1
  targetConversion?: number;
  status: FunnelStageStatus;
  score: number; // 0 to 100
}

export interface FunnelScoreSummary {
  overallScore: number; // 0 to 100
  avgConversionRate: number; // 0 to 1
  biggestLeakStage?: StageScore;
  strongestStage?: StageScore;
  stageScores: StageScore[];
}
