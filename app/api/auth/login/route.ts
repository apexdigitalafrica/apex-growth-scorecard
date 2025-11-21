// app/api/auth/login/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check env vars at runtime, not build time
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ Missing Supabase env vars in /api/auth/login');
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const { email, password, loginType } = await request.json();
    console.log('🔐 Login attempt for:', email, 'type:', loginType);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1️⃣ Basic auth login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Supabase login error:', error.message);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'No user returned from Supabase' },
        { status: 500 }
      );
    }

    const authUser = data.user;
    console.log('✅ Login success for:', email, 'user id:', authUser.id);

    // 2️⃣ 🔥 CRITICAL FIX: Check if user is admin in admin_users table
    console.log('🔍 Checking admin access for:', email);
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('role, permissions, full_name')
      .eq('email', email)
      .single();

    console.log('🎯 Admin check result:', adminData);

    // 3️⃣ If user is admin, return admin role immediately
    if (adminData && !adminError) {
      console.log('🚀 User is ADMIN - granting admin access');
      
      const userPayload = {
        id: authUser.id,
        email: authUser.email,
        role: 'admin', // Force admin role
        permissions: adminData.permissions || ['admin'],
        full_name: adminData.full_name || email,
        user_metadata: authUser.user_metadata,
      };

      console.log('🎯 Final user payload (ADMIN):', userPayload);
      
      return NextResponse.json({
        success: true,
        user: userPayload,
        session: data.session,
      });
    }

    // 4️⃣ If not admin, check client users (your existing logic)
    console.log('ℹ️ User is not admin, checking client access...');
    let clientUser: any = null;
    let client: any = null;

    try {
      let clientUserQuery = supabase
        .from('client_users')
        .select('id, client_id, email, full_name, role')
        .eq('auth_user_id', authUser.id)
        .single();

      let { data: cuData, error: cuError } = await clientUserQuery;

      if (cuError || !cuData) {
        console.warn('⚠ No client_users row by auth_user_id, trying by email:', cuError?.message);
        const fallback = await supabase
          .from('client_users')
          .select('id, client_id, email, full_name, role')
          .eq('email', authUser.email)
          .single();
        cuData = fallback.data;
        cuError = fallback.error;
      }

      if (!cuError && cuData) {
        clientUser = cuData;

        if (clientUser.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('id, company_name, primary_color, logo_url, subdomain')
            .eq('id', clientUser.client_id)
            .single();

          if (!clientError && clientData) {
            client = clientData;
          }
        }
      }
    } catch (lookupErr) {
      console.error('❌ Error looking up client user/client:', lookupErr);
    }

    // 5️⃣ Build client user payload
    const safeClient = {
      id: client?.id ?? clientUser?.client_id ?? null,
      company_name: client?.company_name ?? null,
      primary_color: client?.primary_color ?? '#0F172A',
      logo_url: client?.logo_url ?? null,
      subdomain: client?.subdomain ?? null,
    };

    const userPayload = {
      id: authUser.id,
      email: authUser.email,
      role: clientUser?.role || 'user',
      full_name: clientUser?.full_name || null,
      permissions: [],
      client: safeClient,
      meta: authUser.user_metadata,
    };

    console.log('🎯 Final user payload (CLIENT):', userPayload);

    return NextResponse.json({
      success: true,
      user: userPayload,
      session: data.session,
    });

  } catch (err) {
    console.error('🚨 /api/auth/login unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    );
  }
}