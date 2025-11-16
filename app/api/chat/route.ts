// app/api/chat/route.ts
import { NextResponse } from 'next/server';

type DimensionScore = {
  name: string;
  percentage: number;
};

type ChatContext = {
  company: string;
  totalScore: number;
  stage: string;
  dimensionScores: DimensionScore[];
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
};

type ChatPayload = {
  message: string;
  context: ChatContext;
};

export async function POST(req: Request) {
  try {
    const body: ChatPayload = await req.json();
    const { message, context } = body;

    // Build system prompt with scorecard context
    const weakestDimensions = [...context.dimensionScores]
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 3);

    const systemPrompt = `You are a senior digital growth consultant at Apex Digital Africa, analyzing scorecard results.

CLIENT CONTEXT:
- Company: ${context.company}
- Overall Score: ${context.totalScore}/100 (${context.stage} Stage)
- Top 3 Weakest Areas:
${weakestDimensions.map((d, i) => `  ${i + 1}. ${d.name}: ${d.percentage}%`).join('\n')}

YOUR ROLE:
- Provide specific, actionable advice based on their scorecard results
- Be friendly, consultative, and helpful (not salesy)
- Reference their actual scores when relevant
- Suggest booking a strategy session when appropriate
- Answer questions about Apex Digital Africa's services

APEX DIGITAL AFRICA SERVICES:
- Digital Strategy & Consulting
- Website Design & Development
- SEO & Content Marketing
- Paid Advertising (Google, Facebook, LinkedIn)
- Marketing Automation & CRM Setup
- B2B Lead Generation
- Custom Growth Programs (90-day accelerators)

BOOKING INFO:
- Free 30-minute strategy sessions available
- Book at: https://bit.ly/africa-website
- Contact: info@apexdigitalafrica.com

TONE:
- Professional but conversational
- Data-driven and specific
- Encouraging and solution-focused
- Use emojis sparingly (1-2 per message max)

Keep responses concise (3-5 sentences unless asked for detail).`;

    // Build conversation history for Claude
    const messages = [
      {
        role: 'user' as const,
        content: systemPrompt,
      },
      ...context.conversationHistory.slice(-6), // Last 3 exchanges
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Track chat interactions (optional)
    try {
      await fetch(`${req.headers.get('origin')}/api/track-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: context.company,
          userMessage: message,
          aiResponse: aiResponse,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (trackError) {
      console.error('Chat tracking error (non-critical):', trackError);
    }

    return NextResponse.json({ response: aiResponse });

  } catch (error: unknown) {
    console.error('Chat API error:', error);
    
    // Fallback response if API fails
    return NextResponse.json({
      response: "I apologize, but I'm experiencing technical difficulties right now. Please book a strategy session directly at https://bit.ly/africa-website or email us at info@apexdigitalafrica.com. Our team will be happy to discuss your results!",
    });
  }
}