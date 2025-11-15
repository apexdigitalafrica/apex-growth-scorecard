// app/api/submit-scorecard/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type DimensionScoreInput = {
  name: string;
  percentage: number;
  weight: number;
  weightedScore: number;
};

type ScorePayload = {
  email: string;
  company: string;
  answers: Record<string, number | number[]>;
  score: {
    totalScore: number;
    dimensionScores: DimensionScoreInput[];
  };
};

export async function POST(req: Request) {
  console.log('🚀 Submit scorecard API called');

  // Safely handle the "possibly null" client
  const client = supabaseAdmin;

  if (!client) {
    console.error('❌ Supabase admin client is not initialized');
    return NextResponse.json(
      {
        error: 'Server misconfiguration: database not available',
        details: 'supabaseAdmin was null',
      },
      { status: 500 }
    );
  }

  try {
    const body: ScorePayload = await req.json();
    const { email, company, answers, score } = body;

    console.log('📧 Submission received:', { email, company, totalScore: score.totalScore });

    if (!email || !company) {
      return NextResponse.json(
        { error: 'Missing email or company' },
        { status: 400 }
      );
    }

    // Determine stage from totalScore
    const totalScore = score.totalScore ?? 0;
    let totalStage: string;
    if (totalScore >= 80) totalStage = 'Leading';
    else if (totalScore >= 60) totalStage = 'Growing';
    else if (totalScore >= 40) totalStage = 'Developing';
    else totalStage = 'Starting';

    // STEP 1: Get the scorecard (with detailed logging)
    console.log('🔍 Looking up scorecard...');
    const { data: scorecard, error: scError } = await client
      .from('scorecards')
      .select('id')
      .eq('code', 'apex_b2b_growth_v1')
      .single();

    if (scError) {
      console.error('❌ Scorecard lookup error:', scError);
      return NextResponse.json(
        { 
          error: 'Scorecard not configured', 
          details: scError.message,
          hint: 'Run the seed SQL to create the scorecard' 
        },
        { status: 500 }
      );
    }

    if (!scorecard) {
      console.error('❌ Scorecard not found');
      return NextResponse.json(
        { 
          error: 'Scorecard not found in database',
          details: 'No scorecard row found for code: apex_b2b_growth_v1'
        },
        { status: 500 }
      );
    }

    console.log('✅ Scorecard found:', scorecard.id);
    const scorecardId = scorecard.id as string;

    // STEP 2: Get dimensions
    console.log('🔍 Looking up dimensions...');
    const { data: dims, error: dimsError } = await client
      .from('dimensions')
      .select('id, name, code')
      .eq('scorecard_id', scorecardId);

    if (dimsError) {
      console.error('❌ Dimensions lookup error:', dimsError);
      return NextResponse.json(
        { 
          error: 'Dimensions not configured', 
          details: dimsError.message 
        },
        { status: 500 }
      );
    }

    if (!dims || dims.length === 0) {
      console.error('❌ No dimensions found');
      return NextResponse.json(
        { 
          error: 'No dimensions found for scorecard',
          details: 'Dimensions table is empty for this scorecard'
        },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${dims.length} dimensions`);

    // STEP 3: Upsert organization
    console.log('🏢 Upserting organization...');
    const slug = company.trim().toLowerCase().replace(/\s+/g, '-');

    const { data: org, error: orgError } = await client
      .from('organizations')
      .upsert(
        {
          name: company.trim(),
          slug,
        },
        { onConflict: 'slug' }
      )
      .select()
      .single();

    if (orgError) {
      console.error('⚠️ Org upsert error (non-critical):', orgError);
      // Not fatal – we can still store the response without an organization_id
    } else {
      console.log('✅ Organization upserted:', org?.id);
    }

    const organizationId = org?.id ?? null;

    // STEP 4: Upsert contact
    console.log('👤 Upserting contact...');
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .upsert(
        {
          organization_id: organizationId,
          email: email.toLowerCase().trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email,organization_id' }
      )
      .select()
      .single();

    if (contactError) {
      console.error('⚠️ Contact upsert error (non-critical):', contactError);
    } else {
      console.log('✅ Contact upserted:', contact?.id);
    }

    const contactId = contact?.id ?? null;

    // STEP 6: Insert main response
    console.log('💾 Inserting scorecard response...');
    const { data: response, error: respError } = await client
      .from('scorecard_responses')
      .insert({
        scorecard_id: scorecardId,
        organization_id: organizationId,
        contact_id: contactId,
        email: email.toLowerCase().trim(),
        company_name: company.trim(),
        total_score: totalScore,
        total_stage: totalStage,
        raw_answers: answers,
        meta: {
          source: 'apex_growth_scorecard',
          userAgent: req.headers.get('user-agent'),
        },
      })
      .select()
      .single();

    if (respError || !response) {
      console.error('❌ Response insert error:', respError);
      return NextResponse.json(
        { 
          error: 'Failed to save score', 
          details: respError?.message ?? 'Unknown insert error' 
        },
        { status: 500 }
      );
    }

    console.log('✅ Response saved:', response.id);
    const responseId = response.id as string;

    // STEP 7: Insert dimension scores
    console.log('📊 Inserting dimension scores...');
    const dimensionScores = score.dimensionScores ?? [];

    const dimScoreRows = dimensionScores
      .map((dimScore) => {
        const dimMeta = dims.find((d) => d.name === dimScore.name);

        if (!dimMeta) {
          console.warn(
            `No matching dimension found for "${dimScore.name}". Skipping this dimension score.`
          );
          return null;
        }

        return {
          response_id: responseId,
          dimension_id: dimMeta.id,
          percentage: dimScore.percentage,
          weighted_score: dimScore.weightedScore,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (dimScoreRows.length > 0) {
      const { error: dsError } = await client
        .from('dimension_scores')
        .insert(dimScoreRows);

      if (dsError) {
        console.error('⚠️ Dimension scores insert error (non-critical):', dsError);
        // We don't fail the whole request here; scores are still saved in the main table.
      } else {
        console.log(`✅ Inserted ${dimScoreRows.length} dimension scores`);
      }
    }

    // STEP 8: Log analytics event (non-blocking if it fails)
    console.log('📈 Logging analytics event...');
    const { error: analyticsError } = await client
      .from('analytics_events')
      .insert({
        event_name: 'scorecard_submitted',
        scorecard_id: scorecardId,
        organization_id: organizationId,
        contact_id: contactId,
        response_id: responseId,
        properties: {
          totalScore,
          totalStage,
        },
      });

    if (analyticsError) {
      console.error('⚠️ Analytics insert error (non-critical):', analyticsError);
    } else {
      console.log('✅ Analytics event logged');
    }

    console.log('🎉 Scorecard submission complete!');
    return NextResponse.json({ 
      ok: true, 
      responseId, 
      totalScore, 
      totalStage 
    });

  } catch (error: unknown) {
    console.error('💥 Unhandled submit-scorecard error:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected server error',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}