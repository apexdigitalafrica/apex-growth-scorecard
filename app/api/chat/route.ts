// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function POST(request: NextRequest) {
  const ANTHROPIC_API_KEY = process.env.apex_scorecard_api_key;  

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ apex_scorecard_api_key not found in environment');
    return NextResponse.json(
      { 
        response: "I apologize, but I'm temporarily unavailable. Please email us at info@apexdigitalafrica.com or try again in a moment." 
      },
      { status: 200 }
    );
  }

  try {
    const { message, context } = await request.json();

    // ✅ ADD VALIDATION: Check if dimension data makes sense
    if (context?.dimensionScores?.length > 0) {
      const firstDim = context.dimensionScores[0];
      const lastDim = context.dimensionScores[context.dimensionScores.length - 1];
      
      // If "weakest" has higher % than "strongest", reverse the array
      if (firstDim.percentage > lastDim.percentage) {
        console.warn('⚠️ Dimensions reversed - fixing...');
        context.dimensionScores = context.dimensionScores.reverse();
      }
    }

    const contextString = context
      ? `Company: ${context.company || 'Unknown'}
Score: ${context.totalScore || 'N/A'}/100 (${context.stage || 'Unknown'})
Weakest area: ${context.dimensionScores?.[0]?.name || 'N/A'} (${
          context.dimensionScores?.[0]?.percentage || 0
        }%)
Strongest area: ${
          context.dimensionScores?.[context.dimensionScores.length - 1]?.name ||
          'N/A'
        } (${
          context.dimensionScores?.[context.dimensionScores.length - 1]
            ?.percentage || 0
        }%)
Mode: ${context.mode || 'scorecard'}`
      : 'General inquiry';

    console.log('📤 Sending to Claude:', { messageLength: message.length, hasContext: !!context });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        temperature: 0.7,
        system: `You are an expert AI Growth Consultant for Apex Digital Africa. 

Your role:
- Help African businesses improve their digital marketing
- Provide specific, actionable advice
- Be warm, professional, and encouraging
- Use African business context when relevant
- Keep responses concise but valuable
- Use emojis sparingly (1-2 per response)
- Always end with a clear next step

When users share their scorecard results, focus on:
1. Their weakest dimension (biggest opportunity)
2. Quick wins they can implement today
3. How to reach the next growth stage`,
        messages: [
          {
            role: 'user',
            content: `${contextString}\n\nUser: ${message}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', response.status, errorText);
      
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    console.log('✅ Claude responded successfully');

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('💥 Chat API error:', error);
    
    return NextResponse.json(
      {
        response: "I'm having trouble connecting right now. 😔\n\nWhile I get back online, you can:\n📧 Email: info@apexdigitalafrica.com\n📞 WhatsApp: +234-XXX-XXX-XXXX\n📅 Book a call: https://calendly.com/apexdigitalafrica\n\nI'll be back shortly!"
      },
      { status: 200 }
    );
  }
}
