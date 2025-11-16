// app/api/track-chat/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type ChatTrackingPayload = {
  company: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
};

export async function POST(req: Request) {
  try {
    const body: ChatTrackingPayload = await req.json();
    const client = supabaseAdmin;

    if (!client) {
      console.warn('Supabase not available for chat tracking');
      return NextResponse.json({ success: false });
    }

    // Save to a chat_interactions table
    const { error } = await client
      .from('chat_interactions')
      .insert({
        company_name: body.company,
        user_message: body.userMessage,
        ai_response: body.aiResponse,
        created_at: body.timestamp,
      });

    if (error) {
      console.error('Chat tracking error:', error);
      return NextResponse.json({ success: false });
    }

    return NextResponse.json({ success: true });

  } catch (error: unknown) {
    console.error('Chat tracking error:', error);
    return NextResponse.json({ success: false });
  }
}