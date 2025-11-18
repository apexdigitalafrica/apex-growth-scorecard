// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score = searchParams.get('score') || '68';
  const name = searchParams.get('name') || 'Your Business';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'Geist',
        }}
      >
        <img src="https://scorecard.apexdigitalafrica.com/logo-white.png" width="120" height="120" />
        <div style={{ fontSize: 80, fontWeight: 900, color: '#10b981', margin: '40px 0 20px' }}>
          {score}/100
        </div>
        <div style={{ fontSize: 36, color: '#e2e8f0', textAlign: 'center', maxWidth: 800 }}>
          {name}'s Funnel Scorecard
        </div>
        <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 20 }}>
          Powered by Apex Growth Intelligence
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}