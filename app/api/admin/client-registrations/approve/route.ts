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
  // Ensure password meets requirements (uppercase, lowercase, number, special char)
  return 'Aa1!' + result;
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
    const { data: registration, error: regError } = await supabaseAdmin
      .from('client_registration_requests')
      .select('*')
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      console.error('❌ Registration lookup error:', regError);
      return NextResponse.json(
        { error: 'Registration not found', details: regError?.message },
        { status: 404 }
      );
    }

    // Check if already approved
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

    // 2️⃣ Check if client already exists OR create new one
    if (!clientId) {
      // First check if client with this email already exists
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id, company_name')
        .eq('contact_email', contactEmail)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
        console.log('✅ Found existing client:', clientId);
        
        // Update registration with found client_id
        await supabaseAdmin
          .from('client_registration_requests')
          .update({ client_id: clientId })
          .eq('id', registrationId);
      } else {
        // Create new client
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
            { error: 'Failed to create client record', details: clientError?.message },
            { status: 500 }
          );
        }

        clientId = client.id;
        console.log('✅ Created new client:', clientId);

        // Update registration with client_id
        await supabaseAdmin
          .from('client_registration_requests')
          .update({ client_id: clientId })
          .eq('id', registrationId);
      }
    }

    // 3️⃣ Check if auth user already exists by email
    const { data: existingAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingAuthUsers?.users?.find(u => u.email === contactEmail);

    let authUserId: string;
    let password = generateRandomPassword(12);
    let isNewUser = false;

    if (existingAuthUser) {
      authUserId = existingAuthUser.id;
      console.log('✅ Found existing auth user:', authUserId);
      
      // Update user metadata
      await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          role: 'client',
          client_id: clientId,
          company_name: companyName,
        },
      });
    } else {
      // Create new auth user
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
          { 
            error: `Failed to create auth user: ${authError?.message || 'Unknown error'}`,
            details: authError 
          },
          { status: 500 }
        );
      }

      authUserId = authResult.user.id;
      isNewUser = true;
      console.log('✅ Created new auth user:', authUserId);
    }

    // 4️⃣ Check if client_user already exists
    const { data: existingClientUser } = await supabaseAdmin
      .from('client_users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (existingClientUser) {
      console.log('✅ Client user already exists, updating...');
      // Update existing record
      const { error: updateError } = await supabaseAdmin
        .from('client_users')
        .update({
          client_id: clientId,
          email: contactEmail,
          full_name: fullName || contactEmail,
          role: 'owner',
        })
        .eq('auth_user_id', authUserId);

      if (updateError) {
        console.error('❌ client_users update error:', updateError);
        return NextResponse.json(
          { 
            error: 'Failed to update client user record',
            details: updateError.message,
            hint: updateError.hint 
          },
          { status: 500 }
        );
      }
    } else {
      // Insert new client_user record
      // Note: password_hash is NOT NULL in your schema but we use Supabase Auth
      // We'll set it to a placeholder since auth is handled by Supabase
      const { error: insertError } = await supabaseAdmin
        .from('client_users')
        .insert({
          auth_user_id: authUserId,
          client_id: clientId,
          email: contactEmail,
          full_name: fullName || contactEmail,
          password_hash: 'supabase_auth', // Placeholder - actual auth via Supabase
          role: 'owner',
        });

      if (insertError) {
        console.error('❌ client_users insert error:', insertError);
        return NextResponse.json(
          { 
            error: 'Failed to create client user record',
            details: insertError.message,
            hint: insertError.hint,
            code: insertError.code
          },
          { status: 500 }
        );
      }
      console.log('✅ Created client_user record');
    }

    // 5️⃣ Mark registration as approved
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
        { error: 'Failed to update registration status', details: updateRegError?.message },
        { status: 500 }
      );
    }

    console.log('✅ Client approved successfully:', {
      clientId,
      authUserId,
      email: contactEmail,
      isNewUser,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Client approved and auth user created',
        request: updatedRegistration,
        tempPassword: isNewUser ? password : '(using existing account)',
        isNewUser,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Approve registration error:', err);
    return NextResponse.json(
      { 
        error: 'Unexpected error approving registration',
        details: err?.message || String(err),
        stack: process.env.NODE_ENV === 'development' ? err?.stack : undefined
      },
      { status: 500 }
    );
  }
}