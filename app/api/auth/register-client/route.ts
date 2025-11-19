// app/api/auth/register-client/route.ts - CONTROLLED CLIENT SIGNUP
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, company_name, phone } = await request.json()

    // Check if company exists and is approved
    const { data: company } = await supabaseAdmin
      .from('clients')
      .select('id, is_active')
      .eq('company_name', company_name)
      .eq('is_active', true)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found or not approved' }, { status: 400 })
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

    // Create client user record
    const { error: insertError } = await supabaseAdmin
      .from('client_users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        client_id: company.id,
        role: 'user'
      })

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create client record' }, { status: 400 })
    }

    // TODO: Send welcome email with temp password

    return NextResponse.json({ 
      success: true, 
      message: 'Client account created successfully' 
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}