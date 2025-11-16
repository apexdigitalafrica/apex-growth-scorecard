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
  email?: string;
  mode?: 'scorecard' | 'dashboard';
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
};

type ChatPayload = {
  message: string;
  context: ChatContext;
};

// Simple in-memory cache for common questions
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 15; // 15 minutes

// Rate limiting per company (simple implementation)
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS_PER_HOUR = 30;

function checkRateLimit(company: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(company);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(company, {
      count: 1,
      resetTime: now + (1000 * 60 * 60), // 1 hour
    });
    return true;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }
  
  limit.count++;
  return true;
}

function getCacheKey(message: string, context: ChatContext): string {
  // Simple cache key based on message and context
  return `${message.toLowerCase().trim()}_${context.totalScore}_${context.stage}`;
}

export async function POST(req: Request) {
  try {
    const body: ChatPayload = await req.json();
    const { message, context } = body;

    // Validate input
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(context.company)) {
      return NextResponse.json({
        response: `I notice you've been asking many questions! 😊 That's great engagement!\n\nFor faster assistance, please:\n📧 Email: info@apexdigitalafrica.com\n📅 Book a call: https://bit.ly/africa-website\n\nOur team will provide unlimited consultation time!`,
      });
    }

    // Check cache for common questions
    const cacheKey = getCacheKey(message, context);
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('🎯 Cache hit for:', message.substring(0, 50));
      return NextResponse.json({ response: cached.response, cached: true });
    }

    // Build context-aware system prompt
    const sortedDims = [...context.dimensionScores]
      .sort((a, b) => a.percentage - b.percentage);
    const weakestDimensions = sortedDims.slice(0, 3);
    const strongestDimensions = sortedDims.slice(-2);

    let systemPrompt = '';

    if (context.mode === 'dashboard') {
      systemPrompt = `You are a senior B2B marketing consultant at Apex Digital Africa, helping analyze dashboard insights.

CONTEXT:
- Analyzing scorecard submission data
- Multiple companies being tracked
- Focus on lead qualification, conversion, and growth strategies

YOUR ROLE:
- Help interpret dashboard metrics
- Provide strategic recommendations for lead conversion
- Suggest outreach strategies based on lead scores
- Recommend service packages for different lead types
- Share industry benchmarks

APEX SERVICES FOR CLIENTS:
- Hot Leads (70+ score): Immediate implementation packages ($5K-15K)
- Warm Leads (50-69): Consultation + 90-day plans ($2K-5K)
- Cold Leads (<50): Educational nurture + audit services ($500-2K)

TONE:
- Analytical and strategic
- Data-driven insights
- Focused on ROI and conversion
- Professional consultant voice`;
    } else {
      systemPrompt = `You are a senior digital growth consultant at Apex Digital Africa, analyzing scorecard results for ${context.company}.

CLIENT PROFILE:
- Company: ${context.company}
- Overall Score: ${context.totalScore}/100 (${context.stage} Stage)
${context.email ? `- Contact: ${context.email}` : ''}

PERFORMANCE ANALYSIS:
Top Strengths:
${strongestDimensions.map((d, i) => `  ${i + 1}. ${d.name}: ${d.percentage}% ✅`).join('\n')}

Critical Focus Areas:
${weakestDimensions.map((d, i) => `  ${i + 1}. ${d.name}: ${d.percentage}% ⚠️`).join('\n')}

YOUR ROLE:
- Provide specific, actionable advice based on their actual scores
- Be consultative and helpful (not pushy or salesy)
- Reference their dimension scores when giving recommendations
- Suggest booking a strategy session for detailed roadmap
- Answer questions about services, pricing, and next steps

APEX DIGITAL AFRICA SERVICES:
📊 Digital Strategy & Consulting
🌐 Website Design & Development (WordPress, Custom)
📈 SEO & Content Marketing
🎯 Paid Advertising (Google Ads, Meta, LinkedIn)
⚙️ Marketing Automation & CRM Setup
🔥 B2B Lead Generation Systems
🚀 Custom 90-Day Growth Programs

PRICING CONTEXT (share when asked):
- Strategy Session: FREE (30 min)
- Audit Services: $500-1,500
- Consultation Packages: $2,000-5,000
- Implementation Programs: $5,000-15,000
- Retainer Services: $2,000-10,000/month

BOOKING & CONTACT:
- 📅 Free Strategy Session: https://bit.ly/africa-website
- 📧 Email: info@apexdigitalafrica.com
- 🌍 Focus: African B2B businesses

RESPONSE STYLE:
- Professional but conversational
- Data-driven with specific examples
- Encouraging and solution-focused
- Use emojis sparingly (1-2 per response)
- Keep responses concise (4-6 sentences unless asked for detail)
- Always relate back to their actual scorecard results

SPECIAL CONSIDERATIONS:
${context.totalScore >= 70 ? '- This is a HIGH PERFORMER - focus on scaling and optimization strategies' : ''}
${context.totalScore < 50 ? '- This company needs foundational work - emphasize quick wins and education' : ''}
${weakestDimensions[0].percentage < 30 ? `- Critical gap in ${weakestDimensions[0].name} - make this a priority recommendation` : ''}`;
    }

    // Build messages array with conversation history
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      {
        role: 'user',
        content: systemPrompt,
      },
      ...context.conversationHistory.slice(-8), // Last 4 exchanges for context
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API with retry logic
    let response;
    let retries = 2;
    
    while (retries >= 0) {
      try {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            temperature: 0.7,
            messages: messages,
          }),
        });

        if (response.ok) break;
        
        if (response.status === 429) {
          // Rate limited - wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          retries--;
          continue;
        }

        throw new Error(`API returned ${response.status}`);
      } catch (error) {
        if (retries === 0) throw error;
        retries--;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!response || !response.ok) {
      throw new Error('Failed to get AI response after retries');
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Cache the response
    responseCache.set(cacheKey, {
      response: aiResponse,
      timestamp: Date.now(),
    });

    // Clean old cache entries
    if (responseCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          responseCache.delete(key);
        }
      }
    }

    // Track chat interaction (optional - non-blocking)
    if (process.env.NODE_ENV === 'production') {
      fetch(`${req.headers.get('origin')}/api/track-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: context.company,
          email: context.email,
          userMessage: message,
          aiResponse: aiResponse,
          score: context.totalScore,
          stage: context.stage,
          mode: context.mode || 'scorecard',
          timestamp: new Date().toISOString(),
        }),
      }).catch(err => console.error('Chat tracking error (non-critical):', err));
    }

    // Log for analytics
    console.log(`💬 Chat: ${context.company} (${context.totalScore}/100) - ${message.substring(0, 50)}...`);

    return NextResponse.json({ 
      response: aiResponse,
      cached: false,
    });

   } catch (error: unknown) {
    console.error('❌ Chat API error:', error);
    
    // Get error message for logging
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMsg);  // ✅ NOW USED
    
    const message = (error as { message?: string }).message?.toLowerCase() || '';
    
    let fallbackResponse = `I apologize, but I'm experiencing technical difficulties right now. 😔\n\n`;
    
    if (message.includes('improve') || message.includes('score')) {
      fallbackResponse += `For personalized recommendations on improving your score:\n📅 Book a FREE strategy call: https://bit.ly/africa-website\n📧 Email: info@apexdigitalafrica.com\n\nOur team will analyze your results in detail!`;
    } else if (message.includes('price') || message.includes('cost')) {
      fallbackResponse += `For pricing information:\n📧 Email: info@apexdigitalafrica.com\n📞 Schedule a call: https://bit.ly/africa-website\n\nWe'll create a custom quote based on your needs!`;
    } else {
      fallbackResponse += `Please reach out directly:\n📧 info@apexdigitalafrica.com\n📅 https://bit.ly/africa-website\n\nWe're here to help! 💪`;
    }
    
    return NextResponse.json({
      response: fallbackResponse,
      error: true,
    }, { status: 200 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Apex Digital Africa AI Chat',
    version: '2.0',
    features: [
      'Claude Sonnet 4',
      'Context-aware responses',
      'Rate limiting',
      'Response caching',
      'Retry logic',
    ],
  });
}
