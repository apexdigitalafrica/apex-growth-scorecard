// hooks/use-client-auth.ts
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/session-client';

export function useClientAuth(requireAuth = true) {
  const { clientUser, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated && !pathname.includes('/client-portal/login')) {
        router.replace('/client-portal/login');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname]);

  return { clientUser, isAuthenticated, isLoading };
}