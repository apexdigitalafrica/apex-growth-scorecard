// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, password, loginType } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/username and password are required' },
        { status: 400 }
      )
    }

    console.log('🔐 Login attempt for:', email, 'Type:', loginType)

    let authEmail = email;
    
    // Handle username login for admins
    if (loginType === 'admin' && !email.includes('@')) {
      console.log('🔄 Admin username detected, looking up email...')
      
      // Look up the email from username in admin_users table
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

      authEmail = adminUser.email;
      console.log('✅ Found email for username:', authEmail)
    }

    // Authenticate with Supabase using the resolved email
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    if (authError) {
      console.error('❌ Authentication error:', authError.message)
      
      // Better error messages based on login type
      const errorMessage = loginType === 'admin' && !email.includes('@') 
        ? 'Invalid username or password'
        : authError.message.includes('Invalid login credentials')
        ? 'Invalid email/username or password'
        : authError.message;

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    console.log('✅ Supabase auth successful, checking user type...')

    // Check if user exists in admin_users table (admins)
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (!adminError && adminUser) {
      console.log('👑 Admin user detected:', adminUser.email)
      // This is an admin user
      const userData = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: adminUser.full_name,
        role: 'admin' as const,
        permissions: adminUser.permissions || ['read', 'write', 'manage']
      }
      return NextResponse.json({ user: userData })
    }

    // Check if user exists in client_users table (clients)
    const { data: clientUser, error: clientError } = await supabaseAdmin
      .from('client_users')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', authData.user.id)
      .single()

    if (!clientError && clientUser) {
      console.log('👤 Client user detected:', clientUser.email)
      // This is a client user
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
    
    // User not found in either table
    return NextResponse.json(
      { error: 'User not authorized for any portal. Please contact support.' },
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