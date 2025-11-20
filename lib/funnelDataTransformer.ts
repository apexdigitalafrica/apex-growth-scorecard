// lib/funnelDataTransformer.ts
import { DashboardStats, FunnelSnapshot, FunnelStage } from '@/types/dashboard';

export function transformToFunnelStages(dashboardStats: DashboardStats): FunnelSnapshot {
  const {
    totalSubmissions,
    hotLeads,
    warmLeads,
    dimensionAverages
  } = dashboardStats;

  // Use your actual dimension scores for realistic conversion rates
  const leadGenScore = dimensionAverages.find(d => 
    d.dimension_name === "Lead Generation" || d.dimension_name === "lead_generation"
  )?.avg_percentage || 71;

  const salesEnablementScore = dimensionAverages.find(d => 
    d.dimension_name === "Sales Enablement" || d.dimension_name === "sales_enablement" 
  )?.avg_percentage || 69;

  const africanMarketFit = dimensionAverages.find(d => 
    d.dimension_name === "African Market Fit" || d.dimension_name === "african_market_fit"
  )?.avg_percentage || 25;

  const customerRetention = dimensionAverages.find(d => 
    d.dimension_name === "Customer Retention" || d.dimension_name === "customer_retention"
  )?.avg_percentage || 70;

  // Calculate revenue based on your actual data
  const avgDealSize = 5000; // From your dashboard
  const estimatedRevenue = hotLeads * avgDealSize;

  // Create realistic funnel stages based on your actual data
  const stages: FunnelStage[] = [
    {
      input: totalSubmissions,
      output: Math.round(totalSubmissions * (leadGenScore / 100)),
      label: "Initial Contact"
    },
    {
      input: Math.round(totalSubmissions * (leadGenScore / 100)),
      output: hotLeads + warmLeads,
      label: "Qualified Leads"
    },
    {
      input: hotLeads + warmLeads,
      output: Math.round((hotLeads + warmLeads) * (salesEnablementScore / 100)),
      label: "Sales Engagement"
    },
    {
      input: Math.round((hotLeads + warmLeads) * (salesEnablementScore / 100)),
      output: Math.round((hotLeads + warmLeads) * (salesEnablementScore / 100) * (africanMarketFit / 100)),
      label: "Proposal Stage"
    },
    {
      input: Math.round((hotLeads + warmLeads) * (salesEnablementScore / 100) * (africanMarketFit / 100)),
      output: Math.round((hotLeads + warmLeads) * (salesEnablementScore / 100) * (africanMarketFit / 100) * (customerRetention / 100)),
      label: "Closed Deals"
    }
  ];

  return {
    businessName: "Apex Digital Africa",
    periodLabel: dashboardStats.metadata?.timeRange === '30d' ? 'Last 30 Days' : 
                dashboardStats.metadata?.timeRange === '7d' ? 'Last 7 Days' :
                dashboardStats.metadata?.timeRange === '90d' ? 'Last 90 Days' : 'All Time',
    currency: "$",
    estimatedRevenue,
    stages
  };
}

// Advanced transformer using actual submission patterns
export function createAdvancedFunnel(dashboardStats: DashboardStats): FunnelSnapshot {
  const { totalSubmissions, hotLeads, recentSubmissions, dimensionAverages } = dashboardStats;

  // Analyze actual submission patterns
  const readyToBuyCount = recentSubmissions.filter(submission => 
    submission.lead_readiness === 'Ready to Buy' || submission.lead_priority === 'Hot'
  ).length;

  const highScoreLeads = recentSubmissions.filter(submission => submission.total_score >= 70).length;
  const mediumScoreLeads = recentSubmissions.filter(submission => submission.total_score >= 50 && submission.total_score < 70).length;

  // Use dimension scores for conversion probabilities
  const leadGenDimension = dimensionAverages.find(dimension => 
    dimension.dimension_name.includes('Lead') || dimension.dimension_name.includes('lead')
  );
  const salesDimension = dimensionAverages.find(dimension => 
    dimension.dimension_name.includes('Sales') || dimension.dimension_name.includes('sales')
  );
  const marketFitDimension = dimensionAverages.find(dimension => 
    dimension.dimension_name.includes('Market') || dimension.dimension_name.includes('market')
  );

  const leadGenRate = leadGenDimension ? leadGenDimension.avg_percentage / 100 : 0.7;
  const salesConversionRate = salesDimension ? salesDimension.avg_percentage / 100 : 0.6;
  const marketFitRate = marketFitDimension ? marketFitDimension.avg_percentage / 100 : 0.3;

  const stages: FunnelStage[] = [
    {
      input: totalSubmissions,
      output: Math.round(totalSubmissions * leadGenRate),
      label: "Website Visitors"
    },
    {
      input: Math.round(totalSubmissions * leadGenRate),
      output: highScoreLeads + mediumScoreLeads,
      label: "Lead Capture"
    },
    {
      input: highScoreLeads + mediumScoreLeads,
      output: readyToBuyCount,
      label: "Qualification"
    },
    {
      input: readyToBuyCount,
      output: Math.round(readyToBuyCount * salesConversionRate),
      label: "Proposal Sent"
    },
    {
      input: Math.round(readyToBuyCount * salesConversionRate),
      output: Math.round(readyToBuyCount * salesConversionRate * marketFitRate),
      label: "Closed Won"
    }
  ];

  return {
    businessName: "Apex Digital Africa",
    periodLabel: "Last 30 Days",
    currency: "$",
    estimatedRevenue: hotLeads * 5000,
    stages
  };
}