// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is admin
  const { data: admin } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('id', user.id)
    .single();

  const permissions = admin?.permissions as string[] | null;
  if (!permissions?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('client_registration_requests')
    .select('*')
    .order('requested_at', { ascending: false });

  if (error) throw error;

  return NextResponse.json({ requests: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('id', user.id)
    .single();

  const permissions = admin?.permissions as string[] | null;
  if (!permissions?.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, action } = await req.json();
  const newStatus = action === 'approve' ? 'approved' : 'rejected';

  const { data, error } = await supabase
    .from('client_registration_requests')
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return NextResponse.json({ request: data });
}