// Finance OS - Auth Store (Zustand)
// Real Supabase Auth — replaces mock

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      initialized: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            set({
              isAuthenticated: true,
              user: {
                id: session.user.id,
                name: session.user.user_metadata?.full_name ?? session.user.email ?? 'User',
                email: session.user.email ?? '',
              },
              initialized: true,
            });
          } else {
            set({ initialized: true });
          }
        } catch {
          set({ initialized: true });
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user) {
            set({
              isAuthenticated: true,
              user: {
                id: session.user.id,
                name: session.user.user_metadata?.full_name ?? session.user.email ?? 'User',
                email: session.user.email ?? '',
              },
            });
          } else {
            set({ isAuthenticated: false, user: null });
          }
        });
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          set({
            isAuthenticated: true,
            user: {
              id: data.user.id,
              name: data.user.user_metadata?.full_name ?? email,
              email,
            },
          });
        }
      },

      signUp: async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        if (data.user) {
          set({
            isAuthenticated: true,
            user: {
              id: data.user.id,
              name,
              email,
            },
          });
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: 'finos-auth',
      // Only persist the auth state metadata — session is managed by Supabase
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
);
