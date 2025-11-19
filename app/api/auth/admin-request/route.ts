// app/api/auth/admin-request/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendBrevoEmail } from '@/lib/brevo'
import { emailTemplates } from '@/lib/email-templates'

export async function POST(request: NextRequest) {
  try {
    const { contact_email, full_name, phone, message } = await request.json()

    console.log('📝 New admin access request:', { contact_email })

    // 1. Store in database
    const { data, error } = await supabaseAdmin
      .from('registration_requests')
      .insert({
        request_type: 'admin',
        contact_email,
        full_name,
        phone,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to save admin request:', error)
      return NextResponse.json(
        { error: 'Failed to process request' },
        { status: 500 }
      )
    }

    console.log('✅ Admin request saved to database with ID:', data.id)

    // 2. Send email notification via Brevo
    try {
      await sendBrevoEmail({
        sender: {
          name: 'Apex Growth Portal',
          email: 'notifications@apexdigitalafrica.com' // Use your verified Brevo sender
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
        ...emailTemplates.adminRequestNotification({
          contact_email,
          full_name,
          message
        })
      })

      console.log('✅ Brevo email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send Brevo email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin access request received. Our team will review it shortly.',
      requestId: data.id
    })

  } catch (error) {
    console.error('🚨 Admin request error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}