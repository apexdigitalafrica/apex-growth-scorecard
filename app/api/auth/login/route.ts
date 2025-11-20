// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const { email, password, loginType } = await req.json();
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  **IF YOU GET 401 HERE → YOUR EMAIL/PASSWORD IS WRONG OR USER DOES NOT EXIST**

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  let permissions: string[] | null = null;
  if (loginType === 'admin') {
    const { data: admin } = await supabase
      .from('admin_users')
      .select('permissions')
      .eq('id', data.user.id)
      .single();

    permissions = (admin?.permissions as string[] | null) ?? null;
  }

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: data.user.role,
      permissions,
    },
  });
}