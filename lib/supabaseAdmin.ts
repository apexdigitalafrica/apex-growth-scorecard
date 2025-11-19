// lib/supabaseAdmin.ts - FIXED VERSION
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdmin: SupabaseClient | null = null;

// Use the EXACT environment variable names from your Vercel dashboard
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Supabase init - Environment check:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!serviceRoleKey,
  url: supabaseUrl ? '***' + supabaseUrl.slice(-10) : 'missing',
  serviceKey: serviceRoleKey ? '***' + serviceRoleKey.slice(-10) : 'missing'
});

if (supabaseUrl && serviceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✅ Supabase admin client initialized successfully');
} else {
  console.error('❌ Supabase admin client NOT initialized. Missing:', {
    url: !supabaseUrl,
    serviceKey: !serviceRoleKey
  });
}

export { supabaseAdmin };