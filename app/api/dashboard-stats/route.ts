// app/api/dashboard-stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Response type for database queries
interface ResponseWithMeta {
  id: string;
  total_score: number;
  total_stage: string;
  company_name: string;
  email: string;
  created_at: string;
  lead_priority?: string | null;
  lead_score?: number | null;
  lead_readiness?: string | null;
  meta?: {
    leadPriority?: string;
    leadScore?: number;
    leadReadiness?: string;
  };
}

interface TrendData {
  submissionsChange: number;
  scoreChange: number;
  hotLeadsChange: number;
}

interface DimensionScoreResult {
  percentage: number;
  dimensions: { name: string } | null;
}

// Cache configuration (5 minutes for production)
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let cachedData: Record<string, unknown> | null = null;
let cacheTimestamp = 0;

export async function GET(request: NextRequest) {
  const client = supabaseAdmin;

  if (!client) {
    return NextResponse.json(
      { error: 'Database not available' },
      { status: 500 }
    );
  }

  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('range') || '30d';
    const skipCache = searchParams.get('skipCache') === 'true';

    // Check cache first (unless explicitly skipped)
    const now = Date.now();
    if (!skipCache && cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Returning cached dashboard data');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes browser cache
          'X-Cache': 'HIT',
        },
      });
    }

    console.log('🔄 Fetching fresh dashboard data...');

    // Calculate date filter based on time range
    const dateFilter = getDateFilter(timeRange);
    const previousDateFilter = getPreviousDateFilter(timeRange);

    // QUERY 1: Get current period responses with lead scoring data
    const { data: responses, error: responsesError } = await client
      .from('scorecard_responses')
      .select(`
        id,
        total_score,
        total_stage,
        company_name,
        email,
        created_at,
        lead_score,
        lead_priority,
        lead_readiness,
        meta
      `)
      .gte('created_at', dateFilter)
      .order('created_at', { ascending: false });

    if (responsesError) {
      console.error('❌ Responses query error:', responsesError);
      throw responsesError;
    }

    // QUERY 2: Get previous period for trend calculation
    const { data: previousResponses, error: prevError } = await client
      .from('scorecard_responses')
      .select('total_score, lead_priority, meta')
      .gte('created_at', previousDateFilter)
      .lt('created_at', dateFilter);

    if (prevError) {
      console.warn('⚠️ Previous period query error:', prevError);
    }

    // Cast responses to proper type
    const typedResponses = responses as ResponseWithMeta[] | null;
    const typedPreviousResponses = previousResponses as Array<{
      total_score: number;
      lead_priority?: string;
      meta?: Record<string, unknown>;
    }> | null;

    // Calculate current period metrics
    const totalSubmissions = typedResponses?.length || 0;
    const averageScore = totalSubmissions > 0
      ? typedResponses.reduce((sum, r) => sum + (r.total_score || 0), 0) / totalSubmissions
      : 0;

    // Count leads by priority (use direct columns, fallback to meta)
    const hotLeads = typedResponses?.filter(r => 
      r.lead_priority === 'Hot' || r.meta?.leadPriority === 'Hot'
    ).length || 0;
    
    const warmLeads = typedResponses?.filter(r => 
      r.lead_priority === 'Warm' || r.meta?.leadPriority === 'Warm'
    ).length || 0;
    
    const coldLeads = typedResponses?.filter(r => 
      r.lead_priority === 'Cold' || r.meta?.leadPriority === 'Cold'
    ).length || 0;

    // Calculate trends (compare to previous period)
    const trends = calculateTrends(typedResponses, typedPreviousResponses);

    // Get recent submissions (limit to 20 for performance)
    const recentSubmissions = typedResponses?.slice(0, 20).map(r => ({
      id: r.id,
      company_name: r.company_name,
      email: r.email,
      total_score: r.total_score,
      total_stage: r.total_stage,
      created_at: r.created_at,
      lead_priority: r.lead_priority || r.meta?.leadPriority || null,
      lead_score: r.lead_score || r.meta?.leadScore || null,
      lead_readiness: r.lead_readiness || r.meta?.leadReadiness || null,
    })) || [];

    // QUERY 3: Get dimension scores with optimized join
    const { data: dimensionScores, error: dimensionError } = await client
      .from('dimension_scores')
      .select(`
        percentage,
        dimension_id,
        dimensions!inner (
          name
        )
      `)
      .gte('created_at', dateFilter);

    if (dimensionError) {
      console.warn('⚠️ Dimension scores query error:', dimensionError);
    }

    // Cast dimension scores to proper type
    const typedDimensionScores = dimensionScores as DimensionScoreResult[] | null;

    // Aggregate dimension averages efficiently
    const dimensionMap = new Map<string, { sum: number; count: number }>();
    
    typedDimensionScores?.forEach((score) => {
      const dimName = score.dimensions?.name;
      if (dimName && score.percentage != null) {
        const current = dimensionMap.get(dimName) || { sum: 0, count: 0 };
        dimensionMap.set(dimName, {
          sum: current.sum + score.percentage,
          count: current.count + 1,
        });
      }
    });

    const dimensionAverages = Array.from(dimensionMap.entries())
      .map(([name, data]) => ({
        dimension_name: name,
        avg_percentage: data.sum / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avg_percentage - a.avg_percentage); // Sort by performance

    // Calculate conversion metrics
    const conversionMetrics = calculateConversionMetrics(typedResponses);

    // Build response object
    const dashboardData = {
      totalSubmissions,
      averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimals
      hotLeads,
      warmLeads,
      coldLeads,
      trends,
      conversionMetrics,
      recentSubmissions,
      dimensionAverages,
      metadata: {
        timeRange,
        generatedAt: new Date().toISOString(),
        dataFreshness: 'live',
      },
    };

    // Update cache
    cachedData = dashboardData;
    cacheTimestamp = now;

    console.log('✅ Dashboard data fetched successfully');

    return NextResponse.json(dashboardData, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Cache': 'MISS',
        'X-Generated-At': new Date().toISOString(),
      },
    });

  } catch (error: unknown) {
    console.error('💥 Dashboard stats error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard stats',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Helper: Calculate date filter based on time range
function getDateFilter(range: string): string {
  const now = new Date();
  
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    case 'all':
      return new Date('2020-01-01').toISOString();
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// Helper: Get previous period date filter for trend comparison
function getPreviousDateFilter(range: string): string {
  const now = new Date();
  
  switch (range) {
    case '7d':
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
    case '30d':
      return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
    case '90d':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString();
    case 'all':
      return new Date('2020-01-01').toISOString();
    default:
      return new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// Helper: Calculate trends by comparing current vs previous period
function calculateTrends(
  currentResponses: ResponseWithMeta[] | null,
  previousResponses: Array<{ 
    total_score: number; 
    lead_priority?: string; 
    meta?: Record<string, unknown> 
  }> | null
): TrendData {
  const current = {
    submissions: currentResponses?.length || 0,
    avgScore: currentResponses?.reduce((sum, r) => sum + (r.total_score || 0), 0) / (currentResponses?.length || 1) || 0,
    hotLeads: currentResponses?.filter(r => r.lead_priority === 'Hot' || r.meta?.leadPriority === 'Hot').length || 0,
  };

  const previous = {
    submissions: previousResponses?.length || 0,
    avgScore: previousResponses?.reduce((sum, r) => sum + (r.total_score || 0), 0) / (previousResponses?.length || 1) || 0,
    hotLeads: previousResponses?.filter(r => {
      const meta = r.meta as { leadPriority?: string } | undefined;
      return r.lead_priority === 'Hot' || meta?.leadPriority === 'Hot';
    }).length || 0,
  };

  return {
    submissionsChange: previous.submissions > 0
      ? Math.round(((current.submissions - previous.submissions) / previous.submissions) * 100)
      : 0,
    scoreChange: previous.avgScore > 0
      ? Math.round(((current.avgScore - previous.avgScore) / previous.avgScore) * 100)
      : 0,
    hotLeadsChange: previous.hotLeads > 0
      ? Math.round(((current.hotLeads - previous.hotLeads) / previous.hotLeads) * 100)
      : 0,
  };
}

// Helper: Calculate conversion metrics
function calculateConversionMetrics(responses: ResponseWithMeta[] | null) {
  if (!responses || responses.length === 0) {
    return {
      hotLeadRate: 0,
      averageResponseTime: 'N/A',
      topPerformingIndustry: 'N/A',
    };
  }

  const hotLeadCount = responses.filter(r => 
    r.lead_priority === 'Hot' || r.meta?.leadPriority === 'Hot'
  ).length;

  const hotLeadRate = Math.round((hotLeadCount / responses.length) * 100);

  // Calculate average response time (time between submission and first action)
  // For now, we'll use a placeholder - you can enhance this with real data
  const averageResponseTime = '< 2 hours';

  // Find most common industry/company type
  const industryMap = new Map<string, number>();
  responses.forEach(r => {
    // You could extract industry from company name or add an industry field
    // For now, we'll use a simple heuristic
    const company = r.company_name?.toLowerCase() || '';
    let industry = 'General';
    
    if (company.includes('tech') || company.includes('software')) industry = 'Technology';
    else if (company.includes('health') || company.includes('medical')) industry = 'Healthcare';
    else if (company.includes('finance') || company.includes('bank')) industry = 'Finance';
    else if (company.includes('retail') || company.includes('shop')) industry = 'Retail';
    
    industryMap.set(industry, (industryMap.get(industry) || 0) + 1);
  });

  const topPerformingIndustry = Array.from(industryMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';

  return {
    hotLeadRate,
    averageResponseTime,
    topPerformingIndustry,
  };
}

// Optional: Add a cache-clearing endpoint for admin use
export async function DELETE() {
  cachedData = null;
  cacheTimestamp = 0;
  
  return NextResponse.json({ 
    message: 'Cache cleared successfully',
    timestamp: new Date().toISOString(),
  });
}
