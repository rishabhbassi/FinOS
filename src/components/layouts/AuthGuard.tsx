// Finance OS - Auth Guard Component

import { Link, useLocation } from '@tanstack/react-router';
import { type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';

export interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  // Skip the guard on auth-related pages (login, callback, etc.)
  if (location.pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <div className={cn(!isAuthenticated && 'pointer-events-none select-none blur-sm')}>
        {children}
      </div>

      {!isAuthenticated && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="demo-panel max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-xl font-bold text-white">
              F
            </div>
            <h2 className="demo-title mb-1">Finance OS</h2>
            <p className="demo-muted mb-6">Sign in to manage your finances</p>
            <Link
              to="/auth/login"
              className="demo-button inline-flex items-center gap-2"
            >
              Sign in to continue
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
