// lib/session-client.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BaseUser {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'client';
}

interface AdminUser extends BaseUser {
  role: 'admin';
  permissions: string[];
}

interface ClientUser extends BaseUser {
  role: 'client';
  client: {
    company_name: string;
    primary_color?: string;
    logo_url?: string;
  };
}

type User = AdminUser | ClientUser;

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user) => {
        console.log('🔄 AuthStore: User logged in', user.role)
        set({ user, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        console.log('🔄 AuthStore: User logged out')
        set({ user: null, isAuthenticated: false, isLoading: false })
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'apex-unified-auth',
    }
  )
);