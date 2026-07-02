import { createFileRoute } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});

function AuthCallback() {
  return (
    <div className="demo-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--lagoon)]" />
        <p className="text-sm text-[var(--sea-ink-soft)]">Redirecting...</p>
      </div>
    </div>
  );
}
