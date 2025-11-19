// lib/session-client.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  client: {
    company_name: string;
    primary_color?: string;
    logo_url?: string;
  };
}

interface AuthState {
  clientUser: ClientUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: ClientUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      clientUser: null,
      isAuthenticated: false,
      isLoading: true,
      login: (user) => set({ clientUser: user, isAuthenticated: true, isLoading: false }),
      logout: () => set({ clientUser: null, isAuthenticated: false, isLoading: false }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'apex-client-auth',
    }
  )
);