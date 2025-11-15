// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: SupabaseClient | null = null;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    'Supabase admin not initialised: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
  );
} else {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export { supabaseAdmin };
