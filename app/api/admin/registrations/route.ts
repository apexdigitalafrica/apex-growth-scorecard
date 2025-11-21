// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Get cookies to pass to Supabase client
    const cookieStore = await cookies();
    const supabase = await createClient();
    
    // Get the current user from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Auth error:', userError);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: userError.message 
      }, { status: 401 });
    }

    if (!user) {
      console.error('❌ No user found in session');
      return NextResponse.json({ 
        error: 'Unauthorized - no session',
        details: 'Please log in to access this resource'
      }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    // Check admin permissions
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('permissions, role')
      .eq('email', user.email)
      .single();

    if (adminError) {
      console.error('❌ Admin check error:', adminError);
      
      if (adminError.code === 'PGRST116') {
        return NextResponse.json({ 
          error: 'Forbidden - not an admin user',
          details: 'Your account is not registered as an admin'
        }, { status: 403 });
      }
      
      return NextResponse.json({ 
        error: 'Admin verification failed',
        details: adminError.message 
      }, { status: 500 });
    }

    if (!adminData) {
      console.error('❌ No admin data found for:', user.email);
      return NextResponse.json({ 
        error: 'Forbidden - not an admin user' 
      }, { status: 403 });
    }

    console.log('✅ Admin data found:', adminData);

    // Parse permissions
    let permissions: string[] = [];
    if (typeof adminData.permissions === 'string') {
      try {
        permissions = JSON.parse(adminData.permissions);
      } catch (e) {
        console.error('❌ Failed to parse permissions:', e);
      }
    } else if (Array.isArray(adminData.permissions)) {
      permissions = adminData.permissions;
    }

    console.log('✅ Parsed permissions:', permissions);

    // Check if user has admin permission
    if (!permissions.includes('admin')) {
      console.error('❌ User lacks admin permission:', user.email);
      return NextResponse.json({ 
        error: 'Forbidden - insufficient permissions',
        details: `User has permissions: ${permissions.join(', ')} but needs: admin`
      }, { status: 403 });
    }

    console.log('✅ Admin permission verified, fetching registrations...');

    // Fetch registration requests
    const { data: requests, error: requestsError } = await supabase
      .from('client_registration_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (requestsError) {
      console.error('❌ Database error fetching requests:', requestsError);
      return NextResponse.json({ 
        error: 'Failed to fetch requests',
        details: requestsError.message 
      }, { status: 500 });
    }

    console.log('✅ Successfully fetched', requests?.length || 0, 'registration requests');

    return NextResponse.json({ requests: requests || [] });
    
  } catch (error: any) {
    console.error('❌ Unexpected error in admin API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Auth error in PATCH:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, action } = await req.json();
    
    if (!id || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: id and action' 
      }, { status: 400 });
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
      return NextResponse.json({ 
        error: 'Failed to update request',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ Successfully updated registration request:', id);

    return NextResponse.json({ request: data });
    
  } catch (error: any) {
    console.error('❌ Unexpected error in PATCH:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || String(error)
    }, { status: 500 });
  }
}
