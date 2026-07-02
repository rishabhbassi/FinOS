import { useState } from 'react';
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const signUp = useAuthStore((s) => s.signUp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignUp && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
      } else {
        await login(email, password);
      }
      navigate({ to: '/' });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="demo-center min-h-screen px-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--lagoon)] to-[var(--palm)] text-xl font-bold text-white shadow-lg">
            F
          </div>
          <h1 className="demo-title">Finance OS</h1>
          <p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="island-shell rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label
                  htmlFor="login-name"
                  className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
                >
                  Name
                </label>
                <input
                  id="login-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="demo-input"
                  autoComplete="name"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="demo-input"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="demo-input"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="demo-button mt-6 w-full"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : isSignUp ? (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            ) : (
              <>
                <LogIn size={16} />
                Sign in
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-xs font-medium text-[var(--lagoon-deep)] hover:text-[var(--lagoon)] transition"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-[var(--lagoon-deep)] no-underline transition hover:text-[var(--lagoon)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
export { LoginPage };
