// app/api/submit-scorecard/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, company, answers, score, timestamp } = body || {};

    if (!email || !company || !score) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email sanity check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // 1) Log or store submission (DB, Airtable, etc.)
    console.log('New Apex Growth Scorecard submission:', {
      email,
      company,
      score,
      timestamp,
    });

    // TODO: Example – send to a database / Google Sheet / etc.
    // await saveToDatabase({ email, company, answers, score, timestamp });

    // 2) Send follow-up email via Brevo
    const apiKey = process.env.BREVO_API_KEY;
    if (apiKey) {
      // Construct a simple email payload
      const brevoPayload = {
        sender: {
          name: 'Apex Digital Africa',
          email: 'growth@apexdigitalafrica.com', // use a verified sender
        },
        to: [{ email, name: company }],
        subject: `Your Apex Growth Score: ${score.totalScore}/100`,
        htmlContent: `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Hi there 👋</h2>
              <p>Thank you for completing the <strong>Apex Growth Scorecard™</strong>.</p>
              <p><strong>Your Score:</strong> ${score.totalScore}/100 (${score.totalScore >= 80 ? 'Leading' : score.totalScore >= 60 ? 'Scaling' : score.totalScore >= 40 ? 'Building' : 'Foundation'} Stage)</p>
              <p>We’ve identified your top opportunities for growth and prepared a brief summary of your results.</p>
              <p>Next step: Let's walk through your score together and map out a 90-day growth plan tailored to <strong>${company}</strong>.</p>
              <p>
                👉 <a href="https://bit.ly/africa-website" target="_blank">Book your free 30-minute strategy session</a>
              </p>
              <hr />
              <p style="font-size: 12px; color: #777;">
                You’re receiving this email because you completed the Apex Growth Scorecard on our website.
              </p>
            </body>
          </html>
        `,
      };

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(brevoPayload),
      });
    } else {
      console.warn('BREVO_API_KEY not set – skipping email send');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Scorecard API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
