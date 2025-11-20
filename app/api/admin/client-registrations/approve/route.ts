// app/api/admin/client-registrations/approve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or anon key environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple random password generator (for now)
function generateRandomPassword(length = 12): string {
  const chars =
    'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
  let result = '';

  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    result += chars[idx];
  }

  return result;
}

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json(
        { error: 'registrationId is required' },
        { status: 400 }
      );
    }

    // 1️⃣ Load the registration request
    const { data: registration, error: regError } = await supabase
      .from('client_registration_requests') // ✅ your table
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('Registration lookup error:', regError);
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    if (registration.status === 'approved') {
      return NextResponse.json(
        { success: true, message: 'Already approved', request: registration },
        { status: 200 }
      );
    }

    const contactEmail: string | null = registration.contact_email;
    const fullName: string | null =
      registration.full_name || registration.company_name || null;
    const clientId: string | null = registration.client_id ?? null;
    const companyName: string | null = registration.company_name ?? null;

    if (!contactEmail) {
      return NextResponse.json(
        { error: 'Registration is missing contact_email' },
        { status: 400 }
      );
    }

    if (!clientId) {
      return NextResponse.json(
        {
          error:
            'Registration is missing client_id. Ensure the client record is created first.',
        },
        { status: 400 }
      );
    }

    // 2️⃣ Create Supabase Auth user
    const password = generateRandomPassword(12);

    const { data: authResult, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: contactEmail,
        password,
        email_confirm: true,
        user_metadata: {
          role: 'client',
          client_id: clientId,
          company_name: companyName,
        },
      });

    if (authError || !authResult?.user) {
      console.error('Create auth user error:', authError);
      return NextResponse.json(
        { error: 'Failed to create auth user' },
        { status: 500 }
      );
    }

    const authUserId = authResult.user.id;

    // 3️⃣ Upsert row into client_users and link auth_user_id
    const { error: clientUserError } = await supabase
      .from('client_users')
      .upsert(
        {
          auth_user_id: authUserId,
          client_id: clientId,
          email: contactEmail,
          full_name: fullName || contactEmail,
          role: 'owner',
          last_login: null,
        },
        { onConflict: 'auth_user_id' }
      );

    if (clientUserError) {
      console.error('client_users upsert error:', clientUserError);
      return NextResponse.json(
        { error: 'Failed to create client user record' },
        { status: 500 }
      );
    }

    // 4️⃣ Mark registration as approved and return updated row
    const { data: updatedRegistration, error: updateRegError } = await supabase
      .from('client_registration_requests')
      .update({
        status: 'approved',
      })
      .eq('id', registrationId)
      .select('*')
      .single();

    if (updateRegError || !updatedRegistration) {
      console.error('registration update error:', updateRegError);
      return NextResponse.json(
        { error: 'Failed to update registration status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Client approved and auth user created',
        request: updatedRegistration,
        tempPassword: password, // show once in UI so you can copy it for the client
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Approve registration error:', err);
    return NextResponse.json(
      { error: 'Unexpected error approving registration' },
      { status: 500 }
    );
  }
}
