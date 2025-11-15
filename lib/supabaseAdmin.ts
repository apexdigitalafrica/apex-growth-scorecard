// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Don’t crash build – just warn and export null if misconfigured
if (!supabaseUrl || !serviceRoleKey) {
  console.warn(
    'Supabase env vars are missing. supabaseAdmin will be null – check Vercel environment variables.',
  );
}

export const supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          persistSession: false,
        },
      })
    : null;
