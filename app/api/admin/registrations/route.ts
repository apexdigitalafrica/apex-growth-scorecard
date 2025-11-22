// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function parsePermissions(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      // maybe it's a comma-separated string
      return raw.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    // ✅ getUser() uses SSR cookies
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('❌ Auth error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized', details: userError?.message ?? 'No session' },
        { status: 401 }
      );
    }

    // ✅ IMPORTANT: role column doesn't exist in your table, so don't select it
    const { data: adminRow, error: adminError } = await supabase
      .from('admin_users')
      .select('permissions')   // <-- removed role
      .eq('email', user.email)
      .maybeSingle();

    if (adminError) {
      console.error('❌ Admin check error:', adminError);
      return NextResponse.json(
        { error: 'Admin verification failed', details: adminError.message },
        { status: 500 }
      );
    }

    if (!adminRow) {
      return NextResponse.json(
        { error: 'Forbidden - not an admin user' },
        { status: 403 }
      );
    }

    const permissions = parsePermissions(adminRow.permissions);
    const isAdmin = permissions.includes('admin');

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden - insufficient permissions',
          details: `Permissions found: ${permissions.join(', ') || 'none'}`
        },
        { status: 403 }
      );
    }

    // Optional filter (?status=pending)
    const status = req.nextUrl.searchParams.get('status');

    let query = supabase
      .from('client_registration_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: requests, error: requestsError } = await query;

    if (requestsError) {
      console.error('❌ Fetch requests error:', requestsError);
      return NextResponse.json(
        { error: 'Failed to fetch requests', details: requestsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ requests: requests ?? [] });
  } catch (err: any) {
    console.error('❌ Unexpected error in GET:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ Auth error in PATCH:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, action } = body ?? {};

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id and action' },
        { status: 400 }
      );
    }

    // Re-check admin (same logic as GET)
    const { data: adminRow } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('email', user.email)
      .maybeSingle();

    const permissions = parsePermissions(adminRow?.permissions);
    if (!permissions.includes('admin')) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    const { data, error } = await supabase
      .from('client_registration_requests')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ request: data });
  } catch (err: any) {
    console.error('❌ Unexpected error in PATCH:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
