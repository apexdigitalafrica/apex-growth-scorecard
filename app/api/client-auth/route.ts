// app/api/client-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find the client user
    const { data: clientUser, error } = await supabaseAdmin
      .from('client_users')
      .select(`
        id,
        client_id,
        email,
        full_name,
        role,
        last_login,
        password_hash,
        clients (
          id,
          company_name,
          logo_url,
          primary_color,
          contact_email
        )
      `)
      .eq('email', email.toLowerCase())
      .single();

    if (error || !clientUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, clientUser.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await supabaseAdmin
      .from('client_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', clientUser.id);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = clientUser;

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}