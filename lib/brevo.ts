// lib/brevo.ts
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export interface BrevoEmail {
  sender: { name: string; email: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
}

export async function sendBrevoEmail(emailData: BrevoEmail) {
  if (!BREVO_API_KEY) {
    console.error('❌ Brevo API key not configured');
    throw new Error('Email service not configured');
  }

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Brevo API error:', error);
    throw new Error('Failed to send email');
  }

  return response.json();
}