// hooks/use-client-auth.ts
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/session-client';

export function useClientAuth(requireAuth = true) {
  const { clientUser, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push('/client-portal/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  return {
    clientUser,
    isAuthenticated,
    isLoading,
    requireAuth
  };
}