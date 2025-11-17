// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ✅ Get password from environment variable
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || 'ApexDashboard2025!';

// ✅ Rate limiting to prevent brute force
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rateLimit = rateLimitMap.get(ip);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (rateLimit.count >= MAX_ATTEMPTS) {
    return false;
  }

  rateLimit.count++;
  return true;
}

export function middleware(request: NextRequest) {
  // ✅ Only protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    // ✅ Check rate limit first
    if (!checkRateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too many failed attempts. Please try again in 15 minutes.' 
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '900',
          },
        }
      );
    }

    const authorizationHeader = request.headers.get('authorization');

    if (authorizationHeader) {
      try {
        const basicAuth = authorizationHeader.split(' ')[1];
        const [user, password] = atob(basicAuth).split(':');

        if (password === DASHBOARD_PASSWORD) {
          // ✅ Log successful access (optional - add to analytics)
          console.log(`✅ Dashboard access: ${ip} at ${new Date().toISOString()}`);
          
          // ✅ Reset rate limit on success
          rateLimitMap.delete(ip);
          
          return NextResponse.next();
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    }

    // ✅ Log failed attempt
    console.warn(`⚠️ Failed dashboard access: ${ip} at ${new Date().toISOString()}`);

    return new NextResponse(
      '🔒 Access to Apex Dashboard requires authentication',
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Apex Growth Dashboard", charset="UTF-8"',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/dashboard-stats/:path*',  
  ],
};
