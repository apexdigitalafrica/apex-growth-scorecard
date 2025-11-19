// app/api/auth/register-client-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendBrevoEmail } from '@/lib/brevo'
import { emailTemplates } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { company_name, contact_email, full_name, phone, message } = await request.json()

    console.log('📝 New client registration request:', { company_name, contact_email })

    // 1. Store in database
    const { data, error } = await supabaseAdmin
      .from('registration_requests')
      .insert({
        request_type: 'client',
        company_name,
        contact_email,
        full_name,
        phone,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to save registration request:', error)
      return NextResponse.json(
        { error: 'Failed to process registration request' },
        { status: 500 }
      )
    }

    console.log('✅ Registration request saved to database with ID:', data.id)

    // 2. Send email notification to YOUR TEAM
    try {
      await sendBrevoEmail({
        sender: {
          name: 'Apex Growth Portal',
          email: 'notifications@apexdigitalafrica.com'
        },
        to: [
          {
            email: 'support@apexdigitalafrica.com',
            name: 'Apex Support'
          }
        ],
        replyTo: {
          email: contact_email,
          name: full_name
        },
        ...emailTemplates.clientRegistrationNotification({
          company_name,
          contact_email,
          full_name,
          phone,
          message
        })
      })
      console.log('✅ Team notification email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send team email:', emailError)
    }

    // 3. Send confirmation email to CLIENT
    try {
      await sendBrevoEmail({
        sender: {
          name: 'Apex Growth Portal',
          email: 'notifications@apexdigitalafrica.com'
        },
        to: [
          {
            email: contact_email,
            name: full_name
          }
        ],
        replyTo: {
          email: 'support@apexdigitalafrica.com',
          name: 'Apex Support'
        },
        ...emailTemplates.clientConfirmation({
          company_name,
          contact_email,
          full_name
        })
      })
      console.log('✅ Client confirmation email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send client confirmation email:', emailError)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Registration request received. Check your email for confirmation.',
      requestId: data.id
    })

  } catch (error) {
    console.error('🚨 Registration request error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration request' },
      { status: 500 }
    )
  }
}