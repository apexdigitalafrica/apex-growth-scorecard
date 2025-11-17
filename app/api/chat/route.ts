// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// CRITICAL: Use Edge runtime for external fetch() calls (required by Vercel + Claude)
export const runtime = 'edge';

// Optional: Faster region for Anthropic API
export const preferredRegion = 'iad1'; // Washington D.C. – closest & fastest

export async function POST(request: NextRequest) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // Debug (remove later if you want)
  console.log('Anthropic key exists:', !!ANTHROPIC_API_KEY);

  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'Anthropic API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { message, context } = await request.json();

    // Build rich context for Claude
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

    const userContent = `${contextString}\n\nUser message: ${message}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast + cheap, perfect for chat
        max_tokens: 512,
        temperature: 0.7,
        system:
          'You are an expert AI Growth Consultant for Apex Digital Africa. Be professional, helpful, concise, and action-oriented. Use African business context when relevant. Speak confidently but warmly. Use bullet points and emojis sparingly.',
        messages: [
          {
            role: 'user',
            content: userContent,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        response:
          "I'm having trouble connecting right now. Please try again in a moment or email us at info@apexdigitalafrica.com",
      },
      { status: 200 } // Return 200 so chatbot shows fallback message gracefully
    );
  }
}