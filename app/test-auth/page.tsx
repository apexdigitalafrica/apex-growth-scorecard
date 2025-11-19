// app/test-auth/page.tsx - TEMPORARY DEBUG PAGE
'use client';

import { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { authenticateClient } from '@/lib/client-auth';

export default function TestAuth() {
  const [status, setStatus] = useState<string>('Testing...');

  useEffect(() => {
    const testAuth = async () => {
      try {
        // Test 1: Check Supabase client
        setStatus('Checking Supabase client...');
        if (!supabaseAdmin) {
          setStatus('❌ Supabase client is null');
          return;
        }
        setStatus('✅ Supabase client exists');

        // Test 2: Test database connection
        setStatus('Testing database connection...');
        const { data, error } = await supabaseAdmin
          .from('client_users')
          .select('count')
          .limit(1);

        if (error) {
          setStatus(`❌ Database error: ${error.message}`);
          return;
        }
        setStatus('✅ Database connection works');

        // Test 3: Test authentication
        setStatus('Testing authentication...');
        const user = await authenticateClient('test@example.com', 'test123');
        
        if (user) {
          setStatus('🎉 AUTHENTICATION SUCCESS! User: ' + user.email);
        } else {
          setStatus('❌ Authentication failed');
        }

      } catch (error) {
        setStatus('💥 Error: ' + error.message);
      }
    };

    testAuth();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
      <div className="p-4 bg-gray-100 rounded">
        <pre>{status}</pre>
      </div>
    </div>
  );
}