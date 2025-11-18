// lib/session-client.ts
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ClientUser } from './client-auth';

interface AuthState {
  clientUser: ClientUser | null;
  isAuthenticated: boolean;
  login: (user: ClientUser) => void;
  logout: () => void;
  isLoading: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      clientUser: null,
      isAuthenticated: false,
      isLoading: false,
      login: (user: ClientUser) => set({ 
        clientUser: user, 
        isAuthenticated: true 
      }),
      logout: () => set({ 
        clientUser: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'client-auth-storage',
    }
  )
);

// Session utilities
export function getStoredUser(): ClientUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('client-auth-storage');
  if (!stored) return null;
  
  try {
    const data = JSON.parse(stored);
    return data.state.clientUser || null;
  } catch {
    return null;
  }
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('client-auth-storage');
}