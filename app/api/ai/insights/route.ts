// app/api/ai/insights/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ANTHROPIC_API_KEY = process.env.apex_scorecard_api_key;

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({
      insights: [] // Fallback to client-side generated insights
    });
  }

  try {
    const { snapshot, clientId, company, analysisType } = await request.json();

    const systemPrompt = `You are "Synthesis," an elite AI Growth Consultant specializing in WhatsApp funnel optimization for African businesses.

ANALYSIS CONTEXT:
- Company: ${company}
- Client ID: ${clientId}
- Analysis Type: WhatsApp Funnel Performance

YOUR MISSION:
Generate 3-5 hyper-specific, actionable insights that will directly impact conversion rates and revenue.

DATA PROVIDED:
- Total Conversations: ${snapshot.total_conversations}
- Response Rate: ${snapshot.response_rate}%
- Conversion Rate: ${snapshot.conversion_rate}%
- Average Response Time: ${snapshot.avg_response_time} seconds
- Top Performing Flows: ${JSON.stringify(snapshot.top_performing_flows)}
- Bottlenecks: ${JSON.stringify(snapshot.bottlenecks)}

INSIGHT FRAMEWORK:
For each insight, provide:
1. Type (opportunity/warning/success)
2. Clear, compelling title
3. Data-driven description
4. Impact level (high/medium/low)
5. Specific, actionable recommendation
6. Metric targets where applicable

FOCUS AREAS:
- Response rate optimization
- Conversion funnel improvements
- Bottleneck elimination
- Flow performance scaling
- African market specific tactics

RESPONSE FORMAT:
Return ONLY valid JSON array with this exact structure:
[
  {
    "id": "unique-id-1",
    "type": "opportunity",
    "title": "Specific insight title",
    "description": "Data-driven insight description",
    "impact": "high",
    "recommendation": "Specific actionable step",
    "metric": {
      "current": 25,
      "target": 40,
      "unit": "%"
    }
  }
]`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0.3,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this WhatsApp funnel data and provide elite-level growth insights for ${company}. Focus on immediate impact opportunities.`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Parse JSON response from Claude
    try {
      const insights = JSON.parse(aiResponse);
      return NextResponse.json({ insights });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json({ insights: [] });
    }

  } catch (error) {
    console.error('AI insights API error:', error);
    return NextResponse.json({ insights: [] });
  }
}