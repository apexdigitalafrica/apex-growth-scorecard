import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Received WhatsApp webhook:', body);

    const { client_id, phone, event, message, timestamp, meta, secret } = body;

    // Verify secret
    const WEBHOOK_SECRET = process.env.WHATSAPP_WEBHOOK_SECRET || 'apex_super_secret_2025';
    if (secret !== WEBHOOK_SECRET) {
      console.error('❌ Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!client_id || !phone || !event) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: client_id, phone, event' },
        { status: 400 }
      );
    }

    // Map incoming event types to your database enum
    const eventMap: Record<string, string> = {
      'inbound_message': 'new_inbound',
      'new_inbound': 'new_inbound',
      'first_response': 'first_response',
      'qualified': 'qualified',
      'booking': 'booking',
      'closed_won': 'closed_won',
    };

    const mappedEvent = eventMap[event] || 'new_inbound'; // Default to 'new_inbound' if unknown

    console.log(`🔄 Event mapping: "${event}" → "${mappedEvent}"`);

    // Connect to Supabase
    const supabase = await createClient();

    // Insert the event into your database
    const { data, error } = await supabase
      .from('whatsapp_events')
      .insert({
        client_id,
        phone,
        event: mappedEvent, // Use mapped event
        message,
        meta: meta || {}, // Store meta as JSONB
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to store event', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ WhatsApp event stored:', data);

    return NextResponse.json(
      { 
        success: true,
        message: 'Event captured successfully',
        id: data.id,
        event: mappedEvent
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Unexpected error in WhatsApp webhook:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/whatsapp/capture',
    message: 'WhatsApp webhook endpoint is running',
    allowed_events: ['new_inbound', 'first_response', 'qualified', 'booking', 'closed_won']
  });
}
