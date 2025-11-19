// app/api/admin/registrations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

type RegistrationStatus = 'pending' | 'approved' | 'rejected'

/**
 * GET /api/admin/registrations
 * List all client registration requests
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .select('*')
      .order('requested_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      requests: data ?? [],
    })
  } catch (err) {
    console.error('❌ Error loading registration requests', err)
    return NextResponse.json(
      { error: 'Failed to load registration requests' },
      { status: 500 },
    )
  }
}

/**
 * PATCH /api/admin/registrations
 * Body: { id, action: "approve" | "reject", adminId }
 */
export async function PATCH(req: NextRequest) {
  try {
    const { id, action, adminId } = await req.json()

    if (!id || !action || !adminId) {
      return NextResponse.json(
        { error: 'Missing id, action or adminId' },
        { status: 400 },
      )
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 },
      )
    }

    // 🔐 Simple server-side admin check using admin_users table
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, role')
      .eq('id', adminId)
      .single()

    if (adminError || !admin) {
      console.error('❌ Admin auth failed', adminError)
      return NextResponse.json(
        { error: 'Not authorised to perform this action' },
        { status: 403 },
      )
    }

    const newStatus: RegistrationStatus =
      action === 'approve' ? 'approved' : 'rejected'

    const { data, error } = await supabaseAdmin
      .from('client_registration_requests')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({ request: data })
  } catch (err) {
    console.error('❌ Error updating registration request', err)
    return NextResponse.json(
      { error: 'Failed to update request status' },
      { status: 500 },
    )
  }
}
