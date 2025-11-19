// app/api/client-auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔐 Auth API called for:', email);

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not available');
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

    console.log('📊 Database query result:', { clientUser, error });

    if (error || !clientUser) {
      console.error('❌ User not found:', error);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, clientUser.password_hash);
    console.log('🔐 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.error('❌ Invalid password');
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
    console.log('✅ Authentication successful for:', email);

    return NextResponse.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('💥 Auth API error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}