import { motion } from 'motion/react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeSettingsProps {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
}

interface ThemeOption {
  value: ThemeMode;
  icon: typeof Sun;
  label: string;
  description: string;
  preview: { bg: string; fg: string; accent: string };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: 'light',
    icon: Sun,
    label: 'Light',
    description: 'Bright and clean interface for daytime use',
    preview: { bg: '#f9fafb', fg: '#111827', accent: '#4fb8b2' },
  },
  {
    value: 'dark',
    icon: Moon,
    label: 'Dark',
    description: 'Easy on the eyes in low-light environments',
    preview: { bg: '#0f1a1e', fg: '#d7ece8', accent: '#60d7cf' },
  },
  {
    value: 'auto',
    icon: Monitor,
    label: 'System',
    description: 'Follows your device theme automatically',
    preview: { bg: '#f9fafb', fg: '#111827', accent: '#4fb8b2' },
  },
];

export default function ThemeSettings({ theme, onChange }: ThemeSettingsProps) {
  const selectedTheme = theme;

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--sea-ink-soft)]">
        Choose how FinOS looks. Your selection is saved locally and syncs across sessions.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTheme === option.value;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex flex-col items-center gap-4 rounded-xl border-2 p-5 text-left transition-colors',
                isSelected
                  ? 'border-[var(--lagoon)] bg-[color-mix(in_oklab,var(--lagoon),transparent_88%)]'
                  : 'border-[var(--line)] bg-[var(--chip-bg)] hover:border-[color-mix(in_oklab,var(--lagoon-deep),transparent_60%)]',
              )}
              aria-pressed={isSelected}
              role="radio"
              aria-checked={isSelected}
            >
              {/* Mini preview */}
              <div
                className={cn(
                  'flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border transition-colors',
                  option.value === 'auto' ? 'relative' : '',
                )}
                style={{
                  backgroundColor: option.value === 'auto' ? undefined : option.preview.bg,
                }}
              >
                {option.value === 'auto' ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, #0f1a1e 50%, #f9fafb 50%)' }}
                    />
                    <div className="relative z-10 flex items-center gap-2">
                      <Monitor
                        className="h-6 w-6 drop-shadow-md"
                        style={{ color: '#4fb8b2' }}
                      />
                      <span
                        className="text-xs font-bold drop-shadow-sm"
                        style={{ color: '#d7ece8' }}
                      >
                        Auto
                      </span>
                    </div>
                  </>
                ) : (
                  <div
                    className="flex items-center gap-2"
                    style={{ color: option.preview.fg }}
                  >
                    <Icon className="h-6 w-6" style={{ color: option.preview.accent }} />
                    <span className="text-xs font-bold">{option.label}</span>
                  </div>
                )}
              </div>

              {/* Label and description */}
              <div className="w-full text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-[var(--sea-ink)]">{option.label}</span>
                  {isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className="inline-flex items-center justify-center rounded-full bg-[var(--lagoon)] p-0.5"
                    >
                      <Check className="h-3.5 w-3.5 text-white" />
                    </motion.span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{option.description}</p>
              </div>

              {/* Radio ring indicator */}
              <div
                className={cn(
                  'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-[var(--lagoon)] bg-[var(--lagoon)]'
                    : 'border-[var(--line)]',
                )}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
