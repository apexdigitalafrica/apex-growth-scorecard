// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Consider switching to nodejs for more reliable Anthropic API handling
// export const runtime = 'edge'; 
// export const preferredRegion = 'iad1';

export async function POST(request: NextRequest) {
  // ✅ USE YOUR EXACT ENVIRONMENT VARIABLE NAME
  const ANTHROPIC_API_KEY = process.env.apex_scorecard_api_key;  

  if (!ANTHROPIC_API_KEY) {
    console.error('❌ apex_scorecard_api_key not found in environment variables');
    return NextResponse.json(
      { 
        response: "🔧 I'm currently undergoing maintenance. Please email us at info@apexdigitalafrica.com for immediate assistance, or try again in a few minutes.",
        error: "Missing API configuration"
      },
      { status: 503 }
    );
  }

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (parseError) {
    console.error('❌ Failed to parse request JSON:', parseError);
    return NextResponse.json(
      { 
        response: "There was an issue with your message. Please try rephrasing or contact us directly at info@apexdigitalafrica.com.",
        error: "Invalid JSON"
      },
      { status: 400 }
    );
  }

  const { message, context } = requestBody;

  if (!message || typeof message !== 'string') {
    return NextResponse.json(
      { 
        response: "Please provide a valid message to continue our conversation.",
        error: "Missing message"
      },
      { status: 400 }
    );
  }

  try {
    // ✅ ENHANCED CONTEXT VALIDATION & PROCESSING
    let validatedDimensionScores = [];
    if (context?.dimensionScores?.length > 0) {
      validatedDimensionScores = [...context.dimensionScores]
        .filter(dim => dim && typeof dim.percentage === 'number')
        .sort((a, b) => a.percentage - b.percentage);
      
      // Log data quality issues
      if (validatedDimensionScores.length !== context.dimensionScores.length) {
        console.warn('⚠️ Filtered invalid dimension scores:', {
          original: context.dimensionScores.length,
          filtered: validatedDimensionScores.length
        });
      }
    }

    const weakestDim = validatedDimensionScores[0];
    const strongestDim = validatedDimensionScores[validatedDimensionScores.length - 1];

    // ✅ PRESERVE FRONTEND SYSTEM PROMPT - THIS IS CRITICAL
    const systemPrompt = context?.systemPrompt || `You are "Synthesis," an elite AI Growth Consultant for Apex Digital Africa.

CONTEXT:
- Company: ${context?.company || 'Prospective Client'}
- Growth Score: ${context?.totalScore || 'N/A'}/100
- Growth Stage: ${context?.stage || 'Unknown'}
- Mode: ${context?.mode || 'scorecard'}

CORE DIRECTIVES:
1. Provide hyper-specific, actionable growth strategies
2. Focus on converting weaknesses into opportunities  
3. Guide toward strategic next steps naturally
4. Use African business context when relevant
5. Maintain expert but approachable tone

RESPONSE PROTOCOL:
- Be concise but immensely valuable
- Use clear section headings (##) and bullet points
- Include 1-2 relevant emojis maximum
- Always end with a strategic next step question`;

    // ✅ ENHANCED MESSAGE HISTORY PROCESSING
    const conversationHistory = context?.conversationHistory?.slice(-4) || [];
    const messages = [];

    // Add conversation history for context continuity
    conversationHistory.forEach(msg => {
      if (msg.content && msg.role) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    });

    // Add current message with structured context
    messages.push({
      role: 'user',
      content: `Company Context: ${context?.company || 'N/A'} | Score: ${context?.totalScore || 'N/A'}/100 | Stage: ${context?.stage || 'N/A'}
Weakest Area: ${weakestDim?.name || 'N/A'} (${weakestDim?.percentage || 0}%)
Strongest Area: ${strongestDim?.name || 'N/A'} (${strongestDim?.percentage || 0}%)

User Question: ${message}`
    });

    console.log('📤 Sending to Claude:', {
      company: context?.company,
      score: context?.totalScore,
      messageLength: message.length,
      historyLength: conversationHistory.length,
      mode: context?.mode
    });

    const apiPayload = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 1200,
      temperature: 0.2, // Lower temperature for more consistent business responses
      system: systemPrompt,
      messages: messages
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(apiPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Anthropic API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText.substring(0, 500)
      });
      
      let userMessage = "I'm experiencing temporary technical difficulties. ";
      
      switch (response.status) {
        case 401:
          userMessage += "Please contact support: info@apexdigitalafrica.com";
          break;
        case 429:
          userMessage += "We're receiving high traffic. Please try again in a moment.";
          break;
        case 500:
        case 502:
        case 503:
          userMessage += "Our AI service is temporarily overloaded. Please try again shortly.";
          break;
        default:
          userMessage += "Please email us at info@apexdigitalafrica.com for immediate assistance.";
      }
      
      return NextResponse.json(
        { 
          response: userMessage,
          error: `API_${response.status}`
        },
        { status: 200 }
      );
    }

    const data = await response.json();
    
    if (!data.content?.[0]?.text) {
      throw new Error('Invalid response format from AI service');
    }

    const aiResponse = data.content[0].text;

    console.log('✅ Claude response successful:', {
      company: context?.company,
      responseLength: aiResponse.length,
      usage: data.usage
    });

    return NextResponse.json({ 
      response: aiResponse,
      metadata: {
        usage: data.usage,
        model: data.model
      }
    });

  } catch (error: any) {
    console.error('💥 Chat API processing error:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 300)
    });

    let userFriendlyMessage = "I apologize, but I'm having connection issues. ";
    
    if (error.name === 'AbortError') {
      userFriendlyMessage += "The request timed out. ";
    } else if (error.message?.includes('API key')) {
      userFriendlyMessage += "There's a configuration issue. ";
    }

    userFriendlyMessage += "\n\nFor immediate assistance:\n📧 Email: info@apexdigitalafrica.com  \n📅 Book directly: https://calendly.com/apexdigitalafrica\n\nI'll be back online shortly!";

    return NextResponse.json(
      {
        response: userFriendlyMessage,
        error: error.name || 'UNKNOWN_ERROR'
      },
      { status: 200 }
    );
  }
}