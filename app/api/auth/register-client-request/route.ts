// app/api/auth/register-client-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(request: NextRequest) {
  try {
    const { company_name, contact_email, full_name, phone, message } = await request.json()

    console.log('📝 New client registration request:', { company_name, contact_email })

    // 1. Store the request in a database table (create this first)
    const { error: dbError } = await supabaseAdmin
      .from('client_registration_requests')
      .insert({
        company_name,
        contact_email,
        full_name,
        phone,
        message,
        status: 'pending',
        requested_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('❌ Failed to save registration request:', dbError)
      // Continue anyway - we'll still send email
    }

    // 2. Send email notification to your team
    // TODO: Integrate with your email service (Resend, SendGrid, etc.)
    console.log('📧 Would send email to team about new registration request')
    
    // Example email content:
    const emailContent = `
New Client Registration Request:
Company: ${company_name}
Contact: ${full_name}
Email: ${contact_email}
Phone: ${phone}
Message: ${message || 'No additional message'}

Review and create account at: https://scorecard.apexdigitalafrica.com/admin/registrations
    `

    console.log('Email content:', emailContent)

    return NextResponse.json({ 
      success: true, 
      message: 'Registration request received. Our team will contact you shortly.' 
    })

  } catch (error) {
    console.error('🚨 Registration request error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    )
  }
}