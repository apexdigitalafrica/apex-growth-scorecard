// app/api/auth/register-admin/route.ts - ADMIN INVITATION ONLY
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, username, full_name} = await request.json()

    // SECURITY: Only existing admins can create new admins
    const { data: { user } } = await supabaseAdmin.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: inviter } = await supabaseAdmin
      .from('admin_users')
      .select('permissions')
      .eq('id', user.id)
      .single()

    if (!inviter || !inviter.permissions.includes('manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Create user in auth system
    const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password: tempPassword,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
    }

    // Create admin user record
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        username,
        full_name,
        permissions: ['read', 'write'] // Default permissions
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create admin record' }, { status: 400 })
    }

    // TODO: Send invitation email with temp password

    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      tempPassword // Remove this in production - send via email instead
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}