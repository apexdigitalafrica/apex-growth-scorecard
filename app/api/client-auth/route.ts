// app/api/client-auth/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Authenticate using the admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Check if user exists in client_users table
    const { data: clientUser, error: clientError } = await supabaseAdmin
      .from('client_users')
      .select(`
        *,
        clients (*)
      `)
      .eq('id', authData.user.id)
      .single()

    if (clientError || !clientUser) {
      return NextResponse.json(
        { error: 'User not found in client portal' },
        { status: 403 }
      )
    }

    // Return user data (excluding sensitive information)
    const userData = {
      user: {
        id: authData.user.id,
        email: authData.user.email,
        client_id: clientUser.client_id,
        role: clientUser.role,
        client: clientUser.clients
      },
      session: authData.session
    }

    return NextResponse.json(userData)

  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}