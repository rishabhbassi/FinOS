// Finance OS - Auth Store (Zustand)
// Mock auth store — real Supabase auth comes later

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: async (email: string, _password: string) => {
        // Mock login — simulates network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        set({
          isAuthenticated: true,
          user: {
            id: 'mock-user-1',
            name: 'Ravi Kumar',
            email,
          },
        });
      },
      logout: () => {
        set({ isAuthenticated: false, user: null });
      },
    }),
    { name: 'finos-auth' },
  ),
);
