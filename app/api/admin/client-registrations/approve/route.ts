import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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

    // 1️⃣ Load the registration request (use supabaseAdmin)
    const { data: registration, error: regError } = await supabaseAdmin
      .from('client_registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('❌ Registration lookup error:', regError);
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
    let clientId: string | null = registration.client_id ?? null;
    const companyName: string | null = registration.company_name ?? null;

    if (!contactEmail) {
      return NextResponse.json(
        { error: 'Registration is missing contact_email' },
        { status: 400 }
      );
    }

    // 2️⃣ If client_id is missing, create a client record now (use supabaseAdmin)
    if (!clientId) {
      const { data: client, error: clientError } = await supabaseAdmin
        .from('clients')
        .insert({
          company_name: companyName || 'Unnamed Company',
          contact_email: contactEmail,
          is_active: true,
        })
        .select('id, company_name')
        .single();

      if (clientError || !client) {
        console.error('❌ Create client error:', clientError);
        return NextResponse.json(
          { error: 'Failed to create client record' },
          { status: 500 }
        );
      }

      clientId = client.id;

      // Update registration with client_id (use supabaseAdmin)
      const { error: updateClientIdError } = await supabaseAdmin
        .from('client_registration_requests')
        .update({ client_id: clientId })
        .eq('id', registrationId);

      if (updateClientIdError) {
        console.error('❌ Failed to update registration with client_id:', updateClientIdError);
      }
    }

    // 3️⃣ Create Supabase Auth user
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
      console.error('❌ Create auth user error:', authError);
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const authUserId = authResult.user.id;

    // 4️⃣ Upsert row into client_users (use supabaseAdmin)
    const { error: clientUserError } = await supabaseAdmin
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
      console.error('❌ client_users upsert error:', clientUserError);
      return NextResponse.json(
        { error: 'Failed to create client user record' },
        { status: 500 }
      );
    }

    // 5️⃣ Mark registration as approved (use supabaseAdmin)
    const { data: updatedRegistration, error: updateRegError } = await supabaseAdmin
      .from('client_registration_requests')
      .update({
        status: 'approved',
      })
      .eq('id', registrationId)
      .select('*')
      .single();

    if (updateRegError || !updatedRegistration) {
      console.error('❌ registration update error:', updateRegError);
      return NextResponse.json(
        { error: 'Failed to update registration status' },
        { status: 500 }
      );
    }

    console.log('✅ Client approved successfully:', {
      clientId,
      authUserId,
      email: contactEmail,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Client approved and auth user created',
        request: updatedRegistration,
        tempPassword: password,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('❌ Approve registration error:', err);
    return NextResponse.json(
      { error: 'Unexpected error approving registration' },
      { status: 500 }
    );
  }
}
