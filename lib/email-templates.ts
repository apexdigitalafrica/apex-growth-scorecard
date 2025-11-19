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
};