// Finance OS - Auth Guard Component

import { useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import { type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import TutorialOverlay from '@/components/onboarding/TutorialOverlay';

export interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { isAuthenticated, initialized, initialize } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  // Skip the guard on auth-related pages (login, callback, etc.)
  if (location.pathname.startsWith('/auth/')) {
    return <>{children}</>;
  }

  // Show a loading state while auth is initializing
  if (!initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--lagoon)]" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className={cn(!isAuthenticated && 'pointer-events-none select-none blur-sm')}>
        {children}
      </div>

      {!isAuthenticated && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
          <div className="demo-panel max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--lagoon-deep)] text-xl font-bold text-white">
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

      {/* Onboarding tutorial for new users */}
      {isAuthenticated && <TutorialOverlay />}
    </div>
  );
}
