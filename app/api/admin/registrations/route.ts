// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET  /api/admin/registrations
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      console.error('Error loading registration requests:', error.message);
      return NextResponse.json(
        { error: 'Failed to load registration requests' },
        { status: 500 },
      );
    }

    return NextResponse.json({ requests: data ?? [] });
  } catch (err) {
    console.error('GET /admin/registrations error:', err);
    return NextResponse.json(
      { error: 'Failed to load registration requests' },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/registrations  { id, action: 'approve' | 'reject', adminId? }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, adminId } = body as {
      id?: string;
      action?: 'approve' | 'reject';
      adminId?: string | null;
    };

    if (!id || (action !== 'approve' && action !== 'reject')) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId ?? null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating registration request:', error.message);
      return NextResponse.json(
        { error: 'Failed to update registration request' },
        { status: 500 },
      );
    }

    return NextResponse.json({ request: data });
  } catch (err) {
    console.error('PATCH /admin/registrations error:', err);
    return NextResponse.json(
      { error: 'Failed to perform authorization check. Please try again later.' },
      { status: 500 },
    );
  }
}
