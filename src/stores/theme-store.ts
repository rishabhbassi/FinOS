// FinOS - Theme Store (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function computeResolved(theme: ThemeMode): 'light' | 'dark' {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyToDOM(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const resolved = computeResolved(theme);
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  if (theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', theme);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: (theme: ThemeMode) => {
        applyToDOM(theme);
        set({ theme, resolvedTheme: computeResolved(theme) });
      },
    }),
    {
      name: 'finos-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.resolvedTheme = computeResolved(state.theme);
        }
      },
    },
  ),
);
