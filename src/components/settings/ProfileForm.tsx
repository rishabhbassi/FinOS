import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Camera, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
];

interface ProfileFormProps {
  profile: {
    name: string;
    currency: string;
    avatar_url?: string | null;
  };
  onSave: (profile: {
    name: string;
    currency: string;
    avatar_url?: string | null;
  }) => void;
}

export default function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [currency, setCurrency] = useState(profile.currency);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setName(profile.name);
    setCurrency(profile.currency);
    setAvatarUrl(profile.avatar_url ?? null);
    setIsDirty(false);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    setError(null);
    setIsDirty(true);
  }

  function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setCurrency(e.target.value);
    setIsDirty(true);
  }

  function handleAvatarClick() {
    alert('Avatar upload coming soon!');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      return;
    }

    setError(null);
    onSave({ name: trimmedName, currency, avatar_url: avatarUrl });
    setIsDirty(false);

    setSaved(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            onClick={handleAvatarClick}
            className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--line)] bg-[var(--chip-bg)] transition hover:border-[var(--lagoon-deep)]"
            aria-label="Upload avatar"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-[var(--sea-ink-soft)]" />
            )}
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </button>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--chip-bg)]">
            <Camera className="h-3 w-3 text-[var(--sea-ink-soft)]" />
          </span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--sea-ink)]">Profile Photo</h3>
          <p className="text-sm text-[var(--sea-ink-soft)]">
            Click the camera icon to upload a new photo
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="profile-name"
            className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your full name"
            className="demo-input"
            required
            aria-required="true"
            aria-invalid={!!error}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1.5 text-xs font-medium text-red-500"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div>
          <label
            htmlFor="profile-currency"
            className="mb-1.5 block text-sm font-semibold text-[var(--sea-ink)]"
          >
            Preferred Currency
          </label>
          <select
            id="profile-currency"
            value={currency}
            onChange={handleCurrencyChange}
            className="demo-select"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!isDirty}
          className={cn(
            'demo-button',
            !isDirty && 'cursor-not-allowed opacity-55',
          )}
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>

        <AnimatePresence mode="wait">
          {saved && (
            <motion.span
              key="saved-indicator"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Saved!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
