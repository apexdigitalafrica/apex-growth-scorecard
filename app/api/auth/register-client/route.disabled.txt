// app/api/auth/register-client/route.ts - CONTROLLED CLIENT SIGNUP
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendBrevoEmail } from '@/lib/brevo'

export async function POST(request: NextRequest) {
  try {
    const { email, full_name, company_name } = await request.json()

    // Check if company exists and is approved
    const { data: company } = await supabaseAdmin
      .from('clients')
      .select('id, is_active, company_name')
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
      options: {
        data: {
          full_name,
          company_name,
          role: 'client'
        }
      }
    })

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError)
      return NextResponse.json({ error: 'Failed to create user account' }, { status: 400 })
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
      console.error('Client user creation error:', insertError)
      return NextResponse.json({ error: 'Failed to create client record' }, { status: 400 })
    }

    // Send welcome email with login credentials
    try {
      await sendBrevoEmail({
        sender: {
          name: 'Apex Growth Portal',
          email: 'notifications@apexdigitalafrica.com',
        },
        to: [{ email, name: full_name }],
        subject: 'Welcome to Apex Growth Portal - Your Account is Ready!',
        htmlContent: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
                .content { padding: 30px; background: #f9f9f9; }
                .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to Apex Growth Portal!</h1>
                  <p>Your client account has been approved</p>
                </div>
                <div class="content">
                  <h2>Hello ${full_name},</h2>
                  <p>Your access to the Apex Growth Portal for <strong>${company.company_name}</strong> has been approved!</p>
                  
                  <div class="credentials">
                    <h3>🔐 Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                    <p><strong>Login URL:</strong> <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client-portal/login">Access Client Portal</a></p>
                  </div>

                  <div class="warning">
                    <p><strong>⚠️ Security Notice:</strong></p>
                    <p>For security reasons, please change your password immediately after first login.</p>
                  </div>

                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client-portal/login" class="button">
                    🚀 Login to Your Portal
                  </a>

                  <p><strong>What you can do:</strong></p>
                  <ul>
                    <li>View your company's growth analytics</li>
                    <li>Access funnel performance reports</li>
                    <li>Track lead generation metrics</li>
                    <li>Monitor sales conversion data</li>
                  </ul>
                </div>
                <div class="footer">
                  <p>This is an automated message from Apex Growth Portal</p>
                  <p>Need help? Contact <a href="mailto:support@apexdigitalafrica.com">support@apexdigitalafrica.com</a></p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
      console.log('✅ Welcome email sent to:', email)
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError)
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Client account created successfully. Welcome email sent with login instructions.' 
    })

  } catch (error) {
    console.error('Client registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}