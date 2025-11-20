// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { email, password, loginType } = await req.json();

  // Use Supabase auth (this sets the session cookie automatically)
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Fetch admin permissions if needed
  let permissions = null;
  if (loginType === 'admin') {
    const { data: admin } = await supabaseAdmin
      .from('admin_users')
      .select('permissions')
      .eq('id', data.user.id)
      .single();

    permissions = admin?.permissions || null;
  }

  const userResponse = {
    id: data.user.id,
    email: data.user.email,
    role: data.user.role,
    permissions,
  };

  // This sets the session cookie automatically
  const response = NextResponse.json({ user: userResponse });
  
  // Optional: also set a secure httpOnly cookie for server-side access
  response.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return response;
}