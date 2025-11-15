// app/api/send-results-email/route.ts
import { NextResponse } from 'next/server';

type DimensionScore = {
  name: string;
  percentage: number;
  weight: number;
  weightedScore: number;
  recommendations?: string[]; // Add this for future use
};

type EmailPayload = {
  email: string;
  company: string;
  totalScore: number;
  stage: string;
  dimensionScores: DimensionScore[];
};

export async function POST(req: Request) {
  try {
    const body: EmailPayload = await req.json();
    const { email, company, totalScore, stage, dimensionScores } = body;

    const BREVO_API_KEY = process.env.BREVO_API_KEY;

    if (!BREVO_API_KEY) {
      console.error('BREVO_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Get top 3 weakest dimensions
    const sorted = [...dimensionScores].sort((a, b) => a.percentage - b.percentage);
    const top3Priorities = sorted.slice(0, 3);

    // Build HTML email (your existing beautiful template)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px; text-align: center;">
              <img src="https://apexdigitalafrica.com/wp-content/uploads/2025/09/cropped-cropped-apex-_logo.png" alt="Apex Digital Africa" style="height: 60px; margin-bottom: 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Your Growth Score Results</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Comprehensive Digital Growth Assessment</p>
            </td>
          </tr>

          <!-- Score Section -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 24px;">Hi ${company} Team! 👋</h2>
              <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for completing the Apex Growth Scorecard™. Here are your results:
              </p>

              <!-- Score Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="font-size: 56px; font-weight: bold; color: #ffffff; margin-bottom: 10px;">${totalScore}/100</div>
                    <div style="font-size: 24px; color: #e0e7ff; font-weight: 600;">${stage} Stage</div>
                    <div style="font-size: 14px; color: #bfdbfe; margin-top: 10px;">
                      ${getStageDescription(stage)}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Dimension Scores -->
              <h3 style="color: #1f2937; margin: 30px 0 20px 0; font-size: 20px;">📊 Your Dimension Scores</h3>
              ${dimensionScores.map(dim => `
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #374151; font-weight: 600;">${dim.name}</span>
                    <span style="color: ${getScoreColor(dim.percentage)}; font-weight: bold;">${dim.percentage}%</span>
                  </div>
                  <div style="background-color: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
                    <div style="background-color: ${getScoreColor(dim.percentage)}; height: 10px; width: ${dim.percentage}%; border-radius: 5px;"></div>
                  </div>
                  <div style="color: #6b7280; font-size: 12px; margin-top: 5px;">
                    Weight: ${Math.round(dim.weight * 100)}% | Contribution: ${Math.round(dim.weightedScore)} points
                  </div>
                </div>
              `).join('')}

              <!-- Top Priorities -->
              <h3 style="color: #1f2937; margin: 30px 0 20px 0; font-size: 20px;">🎯 Your Top 3 Priorities</h3>
              ${top3Priorities.map((priority, index) => `
                <div style="background-color: ${getPriorityColor(index)}; border-left: 4px solid ${getPriorityBorderColor(index)}; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                  <div style="color: #92400e; font-weight: bold; margin-bottom: 5px;">
                    ${index + 1}. ${priority.name} (${priority.percentage}%)
                  </div>
                  <div style="color: #78350f; font-size: 14px;">
                    ${getPriorityAction(priority.percentage)}
                  </div>
                </div>
              `).join('')}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="https://apexdigitalafrica.com/contact" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  📅 Book Your Free Strategy Session
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                Ready to improve your score? Book a free 30-minute strategy session to discuss your results and create a custom 90-day growth plan.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                Apex Digital Africa | Digital Marketing Excellence
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Apex Digital Africa. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                📧 apexdigitalafrica@gmail.com | 🌐 apexdigitalafrica.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send via Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Apex Digital Africa',
          email: 'apexdigitalafrica@gmail.com', // Your verified sender
        },
        to: [
          {
            email: email,
            name: company,
          },
        ],
        replyTo: {
          email: 'apexdigitalafrica@gmail.com',
          name: 'Apex Digital Africa',
        },
        subject: `Your Growth Score: ${totalScore}/100 - ${stage} Stage 🎯`,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API error:', errorData);
      throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    });

  } catch (error: unknown) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    'Leading': "Best-in-class performance! You're setting the benchmark.",
    'Scaling': 'Strong foundation. Ready for aggressive growth.',
    'Building': 'Good foundation. Optimization will accelerate growth.',
    'Starting': 'Significant opportunities for improvement ahead.',
  };
  return descriptions[stage] || 'Growing your digital presence.';
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return '#10b981'; // green
  if (percentage >= 60) return '#3b82f6'; // blue
  if (percentage >= 40) return '#f59e0b'; // yellow
  return '#ef4444'; // red
}

function getPriorityColor(index: number): string {
  const colors = ['#fef3c7', '#fee2e2', '#fef9c3'];
  return colors[index] || '#f3f4f6';
}

function getPriorityBorderColor(index: number): string {
  const colors = ['#f59e0b', '#ef4444', '#eab308'];
  return colors[index] || '#9ca3af';
}

function getPriorityAction(percentage: number): string {
  if (percentage < 40) return 'Critical gaps requiring immediate attention';
  if (percentage < 60) return 'Needs optimization for better performance';
  return 'Good foundation, refine for excellence';
}
