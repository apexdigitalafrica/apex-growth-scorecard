// app/api/auth/login/route.ts - Refined Secure Version
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, loginType = 'client' } = await request.json()

    console.log('🔐 Login attempt for:', email, 'Type:', loginType)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    let authEmail = email

    // Handle admin username login by looking up email
    if (loginType === 'admin' && !email.includes('@')) {
      console.log('🔄 Admin username detected, looking up email...')

      const { data: adminUser, error: adminLookupError } = await supabaseAdmin
        .from('admin_users')
        .select('email, username')
        .eq('username', email)
        .single()

      if (adminLookupError || !adminUser) {
        console.error('❌ Admin username not found:', email)
        return NextResponse.json(
          { error: 'Invalid username or password' },
          { status: 401 }
        )
      }

      authEmail = adminUser.email
      console.log('✅ Found email for username:', authEmail)
    }

    // Authenticate with Supabase Auth
    console.log('🔐 Attempting Supabase auth with:', authEmail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    if (authError) {
      console.error('❌ Authentication error:', authError.message)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user is admin by permissions
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('full_name, permissions, username')
      .eq('id', authData.user.id)
      .single()

    if (!adminError && adminUser && adminUser.permissions?.includes('admin')) {
      console.log('👑 Admin user detected:', adminUser.email)
      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: adminUser.full_name,
        role: 'admin' as const,
        permissions: adminUser.permissions,
        username: adminUser.username
      }
      return NextResponse.json({ user: userData })
    }

    // Check if user is client
    const { data: clientUser, error: clientError } = await supabaseAdmin
      .from('client_users')
      .select(`
        full_name,
        clients (company_name, primary_color, logo_url)
      `)
      .eq('id', authData.user.id)
      .single()

    if (!clientError && clientUser) {
      console.log('👤 Client user detected:', clientUser.email)
      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: clientUser.full_name,
        role: 'client' as const,
        client: {
          company_name: clientUser.clients?.company_name || 'Unknown Company',
          primary_color: clientUser.clients?.primary_color,
          logo_url: clientUser.clients?.logo_url
        }
      }
      return NextResponse.json({ user: userData })
    }

    console.error('❌ User not found in admin_users or client_users tables')
    
    // No auto-creation - must be pre-registered
    return NextResponse.json(
      { error: 'Account not found. Please contact support to create an account.' },
      { status: 403 }
    )

  } catch (error) {
    console.error('🚨 Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
