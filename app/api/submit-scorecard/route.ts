// app/api/submit-scorecard/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type ScorePayload = {
  email: string;
  company: string;
  answers: Record<string, number | number[]>;
  score: {
    totalScore: number;
    dimensionScores: {
      name: string;
      percentage: number;
      weight: number;
      weightedScore: number;
    }[];
  };
  // optional in future: meta, utm, userAgent, etc.
};

export async function POST(req: Request) {
  try {
    const body: ScorePayload = await req.json();
    const { email, company, answers, score } = body;

    if (!email || !company) {
      return NextResponse.json(
        { error: 'Missing email or company' },
        { status: 400 }
      );
    }

    // 1) Get the scorecard + dimensions
    const { data: scorecard, error: scError } = await supabaseAdmin
      .from('scorecards')
      .select('id')
      .eq('code', 'apex_b2b_growth_v1')
      .single();

    if (scError || !scorecard) {
      console.error('Scorecard lookup error', scError);
      return NextResponse.json(
        { error: 'Scorecard not configured' },
        { status: 500 }
      );
    }

    const scorecardId = scorecard.id as string;

    const { data: dims, error: dimsError } = await supabaseAdmin
      .from('dimensions')
      .select('id, name, code')
      .eq('scorecard_id', scorecardId);

    if (dimsError || !dims) {
      console.error('Dimensions lookup error', dimsError);
      return NextResponse.json(
        { error: 'Dimensions not configured' },
        { status: 500 }
      );
    }

    // 2) Upsert organization
    const slug = company.trim().toLowerCase().replace(/\s+/g, '-');

    const { data: org, error: orgError } = await supabaseAdmin
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
      console.error('Org upsert error', orgError);
      // not fatal – continue without org id
    }

    const organizationId = org?.id ?? null;

    // 3) Upsert contact
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .upsert(
        {
          organization_id: organizationId,
          email: email.toLowerCase().trim(),
        },
        { onConflict: 'email,organization_id' }
      )
      .select()
      .single();

    if (contactError) {
      console.error('Contact upsert error', contactError);
    }

    const contactId = contact?.id ?? null;

    // 4) Determine stage label from totalScore
    const totalScore = score.totalScore ?? 0;
    let totalStage: string;

    if (totalScore >= 80) totalStage = 'Leading';
    else if (totalScore >= 60) totalStage = 'Growing';
    else if (totalScore >= 40) totalStage = 'Developing';
    else totalStage = 'Starting';

    // 5) Insert main response
    const { data: response, error: respError } = await supabaseAdmin
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
      console.error('Response insert error', respError);
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      );
    }

    const responseId = response.id as string;

    // 6) Insert dimension scores
    const dimScoreRows = score.dimensionScores.map((dimScore) => {
      const dimMeta = dims.find((d) => d.name === dimScore.name);

      return {
        response_id: responseId,
        dimension_id: dimMeta?.id ?? null,
        percentage: dimScore.percentage,
        weighted_score: dimScore.weightedScore,
      };
    });

    if (dimScoreRows.length > 0) {
      const { error: dsError } = await supabaseAdmin
        .from('dimension_scores')
        .insert(dimScoreRows);

      if (dsError) {
        console.error('Dimension scores insert error', dsError);
      }
    }

    // 7) Log analytics event
    await supabaseAdmin.from('analytics_events').insert({
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

    return NextResponse.json({ ok: true, responseId, totalScore, totalStage });
  } catch (error) {
    console.error('Unhandled submit-scorecard error', error);
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    );
  }
}
