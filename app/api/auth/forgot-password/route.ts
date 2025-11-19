// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendBrevoEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log('🔐 Forgot password request for:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate reset token with Supabase
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL}/reset-password`,
    })

    if (error) {
      console.error('❌ Password reset error:', error.message)
      
      // Don't reveal if email exists or not for security
      return NextResponse.json(
        { error: 'If an account with that email exists, a reset link has been sent.' },
        { status: 200 } // Always return 200 for security
      )
    }

    console.log('✅ Password reset email sent via Supabase')

    // Optional: Send a custom email via Brevo as well
    try {
      await sendBrevoEmail({
        sender: {
          name: 'Apex Growth Portal',
          email: 'notifications@apexdigitalafrica.com'
        },
        to: [{ email, name: 'User' }],
        subject: 'Password Reset Request - Apex Growth Portal',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Password Reset</h1>
                  <p>Apex Growth Portal</p>
                </div>
                <div class="content">
                  <h2>Hello,</h2>
                  <p>We received a request to reset your password for the Apex Growth Portal.</p>
                  
                  <div class="info-box">
                    <p><strong>If you requested this reset:</strong></p>
                    <p>You should receive a password reset email from Supabase (our authentication provider) shortly. Click the link in that email to set a new password.</p>
                  </div>

                  <div class="info-box">
                    <p><strong>If you didn't request this:</strong></p>
                    <p>You can safely ignore this email. Your account remains secure.</p>
                  </div>

                  <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
                <div class="footer">
                  <p>This is an automated message from Apex Growth Portal</p>
                  <p>If you need help, contact <a href="mailto:support@apexdigitalafrica.com">support@apexdigitalafrica.com</a></p>
                </div>
              </div>
            </body>
          </html>
        `
      })
      console.log('✅ Brevo notification email sent')
    } catch (emailError) {
      console.error('❌ Brevo email failed, but Supabase reset was sent:', emailError)
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({ 
      success: true, 
      message: 'If an account with that email exists, a reset link has been sent.'
    })

  } catch (error) {
    console.error('🚨 Forgot password error:', error)
    return NextResponse.json(
      { error: 'If an account with that email exists, a reset link has been sent.' },
      { status: 200 } // Always return 200 for security
    )
  }
}