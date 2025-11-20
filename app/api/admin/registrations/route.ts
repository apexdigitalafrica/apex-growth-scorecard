// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type RegistrationStatus = 'pending' | 'approved' | 'rejected';

// Helper: Check if a user is admin via permissions array
async function isAdminUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('permissions')
    .eq('id', userId)
    .single();

  if (error || !data) return false;

  const permissions = data.permissions as string[] | null;
  return permissions?.includes('admin') === true;
}

// GET: List all registration requests (admin only)
export async function GET(req: NextRequest) {
  const adminId = req.headers.get('x-admin-id') || req.cookies.get('adminId')?.value;

  if (!adminId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await isAdminUser(adminId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests: data ?? [] });
  } catch (err) {
    console.error('Error loading registration requests:', err);
    return NextResponse.json(
      { error: 'Failed to load registration requests' },
      { status: 500 }
    );
  }
}

// PATCH: Approve or reject a request (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, adminId } = body;

    if (!id || !action || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields: id, action, or adminId' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Verify admin permission
    const hasAccess = await isAdminUser(adminId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can perform this action' },
        { status: 403 }
      );
    }

    const newStatus: RegistrationStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ request: data });
  } catch (err) {
    console.error('Error updating registration request:', err);
    return NextResponse.json(
      { error: 'Failed to update request status' },
      { status: 500 }
    );
  }
}