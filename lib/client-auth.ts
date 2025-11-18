// lib/client-auth.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export interface ClientUser {
  id: string;
  client_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'viewer';
  last_login?: string;
  client: {
    id: string;
    company_name: string;
    logo_url?: string;
    primary_color: string;
    contact_email: string;
  };
}

export async function authenticateClient(email: string, password: string): Promise<ClientUser | null> {
  try {
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
      console.error('Client user not found:', error);
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, clientUser.password_hash);
    if (!isValidPassword) {
      console.error('Invalid password for client:', email);
      return null;
    }

    // Update last login
    await supabaseAdmin
      .from('client_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', clientUser.id);

    // Return user without password
    const { password_hash, ...userWithoutPassword } = clientUser;
    return userWithoutPassword as ClientUser;

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createClientUser(
  clientId: string,
  email: string,
  fullName: string,
  password: string,
  role: 'owner' | 'admin' | 'viewer' = 'viewer'
): Promise<ClientUser | null> {
  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const { data: clientUser, error } = await supabaseAdmin
      .from('client_users')
      .insert({
        client_id: clientId,
        email: email.toLowerCase(),
        full_name: fullName,
        password_hash: passwordHash,
        role
      })
      .select(`
        id,
        client_id,
        email,
        full_name,
        role,
        clients (
          id,
          company_name,
          logo_url,
          primary_color,
          contact_email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating client user:', error);
      return null;
    }

    return clientUser as ClientUser;
  } catch (error) {
    console.error('Create client user error:', error);
    return null;
  }
}