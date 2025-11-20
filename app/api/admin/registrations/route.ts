// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin permissions by email (since user is in auth.users but permissions are in admin_users)
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('permissions')
    .eq('email', user.email)  // Match by email instead of ID
    .single();

  // Handle JSON string permissions
  let permissions: string[] = [];
  if (typeof adminData?.permissions === 'string') {
    try {
      permissions = JSON.parse(adminData.permissions);
    } catch (e) {
      console.error('Failed to parse permissions:', e);
    }
  } else if (Array.isArray(adminData?.permissions)) {
    permissions = adminData.permissions;
  }

  if (!permissions.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: requests, error } = await supabase
    .from('client_registration_requests')
    .select('*')
    .order('requested_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ requests: requests || [] });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, action } = await req.json();
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ request: data });
}