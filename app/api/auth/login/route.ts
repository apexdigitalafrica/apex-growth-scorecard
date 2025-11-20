// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase env vars in /api/auth/login')
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('🔐 Login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('❌ Supabase login error:', error.message)
      // 401 is appropriate here: wrong email/password
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    console.log('✅ Login success for:', email)

    // You can store session/access_token in a cookie here if you want.
    // For now just return the user + session to the client.
    return NextResponse.json(
      {
        success: true,
        user: data.user,
        session: data.session,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('🚨 /api/auth/login unexpected error:', err)
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    )
  }
}
