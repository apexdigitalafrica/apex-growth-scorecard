// app/api/auth/login/route.ts
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Move the check inside the function
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

    // 2️⃣ Try to load client user + client data
    let clientUser: any = null;
    let client: any = null;

    try {
      // Prefer auth_user_id if your client_users table has that column
      let clientUserQuery = supabase
        .from('client_users')
        .select('id, client_id, email, full_name, role')
        .eq('auth_user_id', authUser.id)
        .single();

      let { data: cuData, error: cuError } = await clientUserQuery;

      // Fallback: use email if auth_user_id is not set / not found
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

        // Now load the client row
        if (clientUser.client_id) {
          const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('id, company_name, primary_color, logo_url, subdomain')
            .eq('id', clientUser.client_id)
            .single();

          if (!clientError && clientData) {
            client = clientData;
          } else if (clientError) {
            console.error('❌ Error loading client row:', clientError.message);
          }
        }
      }
    } catch (lookupErr) {
      console.error('❌ Error looking up client user/client:', lookupErr);
    }

    // 3️⃣ Build a safe client object (so .primary_color is never undefined)
    const safeClient = {
      id: client?.id ?? clientUser?.client_id ?? null,
      company_name: client?.company_name ?? null,
      primary_color: client?.primary_color ?? '#0F172A', // default dark slate
      logo_url: client?.logo_url ?? null,
      subdomain: client?.subdomain ?? null,
    };

    // 4️⃣ Build a nicer user payload for the frontend
    const userPayload = {
      id: authUser.id,
      email: authUser.email,
      role:
        (authUser.user_metadata as any)?.role ||
        clientUser?.role ||
        'user',
      full_name:
        (authUser.user_metadata as any)?.full_name ||
        clientUser?.full_name ||
        null,
      permissions:
        ((authUser.user_metadata as any)?.permissions as string[]) || [],
      client: safeClient,
      // Keep raw metadata if you ever need it
      meta: authUser.user_metadata,
    };

    return NextResponse.json(
      {
        success: true,
        user: userPayload,
        session: data.session,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('🚨 /api/auth/login unexpected error:', err);
    return NextResponse.json(
      { error: 'Something went wrong during login' },
      { status: 500 }
    );
  }
}
