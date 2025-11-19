// lib/email-templates.ts
export const emailTemplates = {
  adminRequestNotification: (data: {
    contact_email: string;
    full_name: string;
    message?: string;
  }) => ({
    subject: `New Admin Access Request - ${data.contact_email}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
            .content { padding: 30px; background: #f9f9f9; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 New Admin Access Request</h1>
              <p>Apex Growth Portal</p>
            </div>
            <div class="content">
              <h2>Request Details</h2>
              <div class="details">
                <p><strong>👤 Name:</strong> ${data.full_name}</p>
                <p><strong>📧 Email:</strong> ${data.contact_email}</p>
                <p><strong>💬 Message:</strong> ${data.message || 'No additional message provided'}</p>
                <p><strong>⏰ Requested At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <a href="https://scorecard.apexdigitalafrica.com/admin/registrations" class="button">
                Review Request in Dashboard
              </a>
            </div>
            <div class="footer">
              <p>This is an automated message from Apex Growth Portal</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  clientRegistrationNotification: (data: {
    company_name: string;
    contact_email: string;
    full_name: string;
    phone?: string;
    message?: string;
  }) => ({
    subject: `New Client Registration - ${data.company_name}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
            .header { background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 30px; text-align: center; color: white; }
            .content { padding: 30px; background: #f9f9f9; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #48bb78; }
            .button { background: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏢 New Client Registration</h1>
              <p>Apex Growth Portal</p>
            </div>
            <div class="content">
              <h2>Company Registration Request</h2>
              <div class="details">
                <p><strong>🏢 Company:</strong> ${data.company_name}</p>
                <p><strong>👤 Contact Person:</strong> ${data.full_name}</p>
                <p><strong>📧 Email:</strong> ${data.contact_email}</p>
                <p><strong>📞 Phone:</strong> ${data.phone || 'Not provided'}</p>
                <p><strong>💬 Additional Info:</strong> ${data.message || 'No additional message'}</p>
                <p><strong>⏰ Requested At:</strong> ${new Date().toLocaleString()}</p>
              </div>
              
              <a href="https://scorecard.apexdigitalafrica.com/admin/registrations" class="button">
                Review Registration
              </a>
            </div>
            <div class="footer">
              <p>This is an automated message from Apex Growth Portal</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  clientConfirmation: (data: {
    company_name: string;
    contact_email: string;
    full_name: string;
  }) => ({
    subject: `Your Apex Growth Portal Registration Request - ${data.company_name}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0066CC 0%, #004499 100%); padding: 30px; text-align: center; color: white; }
            .logo { max-width: 120px; margin-bottom: 15px; }
            .content { padding: 40px 30px; background: #ffffff; }
            .details { background: #f8fafc; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0066CC; }
            .button { background: #0066CC; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: 600; font-size: 14px; }
            .footer { text-align: center; padding: 25px; color: #64748b; font-size: 12px; background: #f1f5f9; border-top: 1px solid #e2e8f0; }
            .timeline { margin: 25px 0; }
            .timeline-step { display: flex; align-items: center; margin: 18px 0; padding: 12px; background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
            .timeline-number { background: #0066CC; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; font-size: 14px; }
            .contact-info { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0; }
            .highlight { color: #0066CC; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" alt="Apex Digital Africa" class="logo" />
              <h1 style="margin: 10px 0 5px 0; font-size: 24px; font-weight: 700;">Welcome to Apex Growth Portal</h1>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">Your registration request has been received</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${data.full_name},</h2>
              
              <p style="font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for registering <span class="highlight">${data.company_name}</span> for the Apex Growth Portal. 
                Our team is reviewing your request and will contact you within <span class="highlight">24 hours</span>.
              </p>
              
              <div class="details">
                <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 20px;">📋 What happens next?</h3>
                <div class="timeline">
                  <div class="timeline-step">
                    <div class="timeline-number">1</div>
                    <div style="flex: 1;">
                      <strong>Review Company Details</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">We verify your business information</p>
                    </div>
                  </div>
                  <div class="timeline-step">
                    <div class="timeline-number">2</div>
                    <div style="flex: 1;">
                      <strong>Portal Setup</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Configure your company dashboard</p>
                    </div>
                  </div>
                  <div class="timeline-step">
                    <div class="timeline-number">3</div>
                    <div style="flex: 1;">
                      <strong>Credentials Delivery</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Send secure login details</p>
                    </div>
                  </div>
                  <div class="timeline-step">
                    <div class="timeline-number">4</div>
                    <div style="flex: 1;">
                      <strong>Access Analytics</strong>
                      <p style="margin: 5px 0 0 0; color: #64748b; font-size: 13px;">Start using growth insights</p>
                    </div>
                  </div>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 20px;">
                  <p style="margin: 0; color: #1e40af; font-size: 14px;">
                    <strong>⏰ Expected Timeline:</strong> 1-2 business days
                  </p>
                </div>
              </div>
              
              <div class="contact-info">
                <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 15px;">💬 Need immediate assistance?</h3>
                <p style="margin: 8px 0;">
                  <strong>📧 Email:</strong> 
                  <a href="mailto:support@apexdigitalafrica.com" style="color: #0066CC; text-decoration: none;">
                    support@apexdigitalafrica.com
                  </a>
                </p>
                <p style="margin: 8px 0;">
                  <strong>🌐 Website:</strong> 
                  <a href="https://apexdigitalafrica.com" style="color: #0066CC; text-decoration: none;">
                    apexdigitalafrica.com
                  </a>
                </p>
                <p style="margin: 8px 0;">
                  <strong>📍 Location:</strong> Lagos, Nigeria
                </p>
              </div>
              
              <a href="https://apexdigitalafrica.com" class="button">
                Visit Our Website
              </a>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 10px 0;">
                <img src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" alt="Apex Digital Africa" style="height: 20px; opacity: 0.7;" />
              </p>
              <p style="margin: 5px 0; font-size: 11px;">
                This is an automated message from Apex Growth Portal
              </p>
              <p style="margin: 5px 0; font-size: 11px;">
                &copy; 2025 Apex Digital Africa. All rights reserved.
              </p>
              <p style="margin: 5px 0; font-size: 11px; color: #94a3b8;">
                Transforming businesses through digital innovation
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
};  
