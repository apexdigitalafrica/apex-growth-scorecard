// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Throw clear error messages during build if env vars are missing
function getEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
      `Please check your Vercel project settings and ensure this variable is set.`
    );
  }
  return value;
}

// Initialize Supabase admin client
let supabaseAdmin: SupabaseClient;

try {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL', supabaseUrl);
  const key = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', serviceRoleKey);

  supabaseAdmin = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  // Test connection in development
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Supabase admin client initialized');
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase admin client:', error);
  
  // Create a mock client that throws informative errors
  supabaseAdmin = new Proxy({} as SupabaseClient, {
    get(_, prop) {
      throw new Error(
        `Supabase admin client not initialized. Check environment variables: ${error}`
      );
    }
  });
}

export { supabaseAdmin };