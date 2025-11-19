// app/api/auth/login/route.ts
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

    let authEmail = email;
    let username = null;

    // Handle username login for admins
    if (loginType === 'admin' && !email.includes('@')) {
      console.log('🔄 Admin username detected, looking up email...')
      
      const { data: adminUser, error: adminLookupError } = await supabaseAdmin
        .from('admin_users')
        .select('email, username')
        .eq('username', email)
        .single()

      if (!adminLookupError && adminUser) {
        authEmail = adminUser.email;
        username = email;
        console.log('✅ Found email for username:', authEmail)
      }
    }

    // Authenticate with Supabase
    console.log('🔐 Attempting Supabase auth with:', authEmail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: authEmail,
      password,
    })

    // If authentication fails, try to create user
    if (authError && authError.message.includes('Invalid login credentials')) {
      console.log('🔄 Authentication failed, attempting to create user...')
      
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
        email: authEmail,
        password,
      })

      if (signUpError) {
        console.error('❌ Sign up error:', signUpError.message)
        return NextResponse.json(
          { error: 'Invalid credentials and cannot create account' },
          { status: 401 }
        )
      }

      if (!signUpData.user) {
        return NextResponse.json(
          { error: 'Account creation failed' },
          { status: 401 }
        )
      }

      console.log('✅ User created successfully, ID:', signUpData.user.id)

      // AUTO-CREATE ADMIN USER IN admin_users TABLE
      if (loginType === 'admin') {
        const { error: insertError } = await supabaseAdmin
          .from('admin_users')
          .insert({
            id: signUpData.user.id,
            email: signUpData.user.email!,
            username: username || 'admin',
            full_name: signUpData.user.email!.split('@')[0],
            permissions: ['read', 'write', 'manage', 'admin']
          })

        if (insertError) {
          console.error('❌ Failed to create admin user:', insertError.message)
        } else {
          console.log('✅ Admin user created in admin_users table')
        }
      }

      // Return the newly created user
      const userData = {
        id: signUpData.user.id,
        email: signUpData.user.email!,
        full_name: signUpData.user.email!.split('@')[0],
        role: loginType as 'admin' | 'client',
        permissions: loginType === 'admin' ? ['read', 'write', 'manage', 'admin'] : undefined
      }

      return NextResponse.json({ user: userData })
    }

    if (authError) {
      console.error('❌ Authentication error:', authError.message)
      return NextResponse.json(
        { error: 'Invalid email/username or password' },
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