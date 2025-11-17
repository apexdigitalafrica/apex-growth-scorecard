// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD;

export function middleware(request: NextRequest) {
  // Only protect /dashboard and its subpaths
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const authorizationHeader = request.headers.get('authorization');

    if (authorizationHeader) {
      const basicAuth = authorizationHeader.split(' ')[1];
      const [user, password] = atob(basicAuth).split(':');

      if (password === DASHBOARD_PASSWORD) {
        return NextResponse.next();
      }
    }

    // Ask for password
    return new NextResponse('Access to Apex Dashboard requires authentication', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Apex Growth Dashboard"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};