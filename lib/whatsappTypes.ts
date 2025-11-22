// lib/whatsappTypes.ts

export type WhatsAppStageStatus = 'good' | 'warning' | 'bad';

export interface WhatsAppStage {
  id: string;                      // e.g. "new_inbound", "first_response"
  label: string;                   // e.g. "New Inbound Chats"
  input: number;                   // number of chats entering this stage
  output: number;                  // number progressing to next stage
  avgResponseMinutes?: number;     // average response time at this stage
  targetResponseMinutes?: number;  // SLA target (e.g. 5 mins)
  targetConversion?: number;       // expected conversion (0–1)
}

export interface WhatsAppFunnelSnapshot {
  id: string;
  businessName: string;
  periodLabel: string;             // e.g. "Last 7 Days"
  currency?: string;               // e.g. "₦"
  estimatedRevenue?: number;       // Optional: revenue influenced by WhatsApp
  stages: WhatsAppStage[];
}

export interface WhatsAppStageScore {
  stageId: string;
  label: string;
  conversionRate: number;          // 0–1
  dropOffRate: number;             // 0–1
  avgResponseMinutes?: number;
  targetResponseMinutes?: number;
  targetConversion?: number;
  status: WhatsAppStageStatus;
  score: number;                   // 0–100
}

export interface WhatsAppFunnelScoreSummary {
  overallScore: number;            // 0–100
  avgConversionRate: number;       // 0–1
  avgResponseMinutes?: number;
  worstResponseStage?: WhatsAppStageScore;
  biggestLeakStage?: WhatsAppStageScore;
  strongestStage?: WhatsAppStageScore;
  stageScores: WhatsAppStageScore[];
}
