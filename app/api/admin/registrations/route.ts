// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient(); // Add await here!
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Auth error:', userError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions by email
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('email', user.email)
      .single();

    if (adminError) {
      console.error('Admin check error:', adminError);
      return NextResponse.json({ error: 'Admin check failed' }, { status: 500 });
    }

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

    // Fetch from the correct table
    const { data: requests, error: requestsError } = await supabase
      .from('client_registration_requests') // Make sure this table exists!
      .select('*')
      .order('requested_at', { ascending: false });

    if (requestsError) {
      console.error('Database error:', requestsError);
      return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }

    return NextResponse.json({ requests: requests || [] });

  } catch (error) {
    console.error('Unexpected error in admin API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient(); // Add await here!
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
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
      console.error('Update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ request: data });

  } catch (error) {
    console.error('Unexpected error in PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}