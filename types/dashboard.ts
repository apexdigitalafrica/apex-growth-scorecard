// types/dashboard.ts
export interface DashboardStats {
  totalSubmissions: number;
  averageScore: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  recentSubmissions: SubmissionRecord[];
  dimensionAverages: DimensionAverage[];
  trends: {
    submissionsChange: number;
    scoreChange: number;
    hotLeadsChange: number;
  };
  conversionMetrics: {
    hotLeadRate: number;
    averageResponseTime: string;
    topPerformingIndustry: string;
  };
  metadata?: {
    timeRange: string;
    generatedAt: string;
    dataFreshness: string;
  };
}

export interface SubmissionRecord {
  id: string;
  company_name: string;
  email: string;
  total_score: number;
  total_stage: string;
  lead_priority?: string | null;
  lead_score?: number | null;
  lead_readiness?: string | null;
  created_at: string;
}

export interface DimensionAverage {
  dimension_name: string;
  avg_percentage: number;
  count: number;
}

export interface FunnelSnapshot {
  businessName: string;
  periodLabel: string;
  currency: string;
  estimatedRevenue: number;
  stages: FunnelStage[];
}

export interface FunnelStage {
  input: number;
  output: number;
  label: string;
}