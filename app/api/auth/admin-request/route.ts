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

    // 2. Send email notification to admin via Brevo
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
        ...emailTemplates.adminRequestNotification({
          contact_email,
          full_name,
          phone,
          message
        })
      })

      console.log('✅ Admin notification email sent successfully')
    } catch (emailError) {
      console.error('❌ Failed to send admin notification email:', emailError)
      // Don't fail the request if email fails
    }

    // 3. Send confirmation email to requester
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
        subject: 'Admin Access Request Received - Apex Growth Portal',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1>🔐 Admin Access Request Received</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${full_name},</h2>
              <p>Thank you for your admin access request for the Apex Growth Portal.</p>
              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will review your request</li>
                <li>We'll verify your credentials</li>
                <li>You'll receive login details within 24 hours</li>
              </ul>
              <p>If you have any questions, contact <a href="mailto:support@apexdigitalafrica.com">support@apexdigitalafrica.com</a></p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                <p>Request ID: ${data.id}</p>
                <p>© 2025 Apex Digital Africa. All rights reserved.</p>
              </div>
            </div>
          </div>
        `
      })
      
      console.log('✅ Confirmation email sent to requester')
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
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
