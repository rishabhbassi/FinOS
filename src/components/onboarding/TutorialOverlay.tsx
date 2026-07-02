// Finance OS - Onboarding Tutorial
// Shows a guided tour for new users on first sign-in

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Wallet,
  Plus,
  LayoutDashboard,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    title: 'Welcome to Finance OS',
    icon: Sparkles,
    description:
      'Your personal budget operating system. Track spending, plan savings, and know exactly what you can afford — every day.',
    tip: 'No fake data, no clutter. Just your money, your way.',
  },
  {
    title: 'Add Your Accounts',
    icon: Wallet,
    description:
      'Start by adding your bank accounts, cash, or wallets. This helps Finance OS track where your money lives.',
    tip: 'Go to Settings → Accounts to add them. You can add multiple accounts.',
    action: 'Navigate to Settings → Accounts',
  },
  {
    title: 'Add Your First Transaction',
    icon: Plus,
    description:
      'Log your income and expenses daily. Use Quick Entry (⌘K) for lightning-fast logging — just type "Coffee 180" and you\'re done.',
    tip: 'Categorize transactions to see where your money goes.',
    action: 'Press ⌘K or tap + to add a transaction',
  },
  {
    title: 'Explore Your Dashboard',
    icon: LayoutDashboard,
    description:
      'Your dashboard shows what matters: today\'s remaining budget, weekly progress, monthly savings, and spending breakdown.',
    tip: 'The Budget Timeline shows your daily available amount at a glance.',
    action: 'Visit the Dashboard to see your finances',
  },
  {
    title: 'Track Reports & Goals',
    icon: BarChart3,
    description:
      'Use Reports to analyze spending trends. Set Goals for big purchases or savings targets — Finance OS tracks progress automatically.',
    tip: 'Start with 1-2 goals. You can always add more later.',
    action: 'Explore Reports and Goals from the sidebar',
  },
];

const STORAGE_KEY = 'finos-onboarding';

interface OnboardingState {
  completed: boolean;
  currentStep: number;
}

function getStoredState(): OnboardingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { completed: true, currentStep: 0 };
}

function setStoredState(state: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(getStoredState);

  const start = useCallback(() => {
    const newState = { completed: false, currentStep: 0 };
    setState(newState);
    setStoredState(newState);
  }, []);

  const complete = useCallback(() => {
    const newState = { completed: true, currentStep: STEPS.length };
    setState(newState);
    setStoredState(newState);
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= STEPS.length - 1) {
        const newState = { completed: true, currentStep: STEPS.length };
        setStoredState(newState);
        return newState;
      }
      const newState = {
        ...prev,
        currentStep: prev.currentStep + 1,
      };
      setStoredState(newState);
      return newState;
    });
  }, []);

  const prev = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 0) return prev;
      const newState = { ...prev, currentStep: prev.currentStep - 1 };
      setStoredState(newState);
      return newState;
    });
  }, []);

  // Auto-start on first visit (when no state is stored)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      start();
    }
  }, [start]);

  return {
    show: !state.completed,
    currentStep: state.currentStep,
    totalSteps: STEPS.length,
    start,
    complete,
    next,
    prev,
  };
}

export default function TutorialOverlay() {
  const { show, currentStep, totalSteps, complete, next, prev } =
    useOnboarding();
  const step = STEPS[currentStep] ?? STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Card */}
        <motion.div
          className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] p-6 shadow-xl sm:p-8"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Step indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep
                      ? 'w-6 bg-[var(--lagoon-deep)]'
                      : i < currentStep
                        ? 'w-1.5 bg-[var(--lagoon)]'
                        : 'w-1.5 bg-[var(--line)]'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={complete}
              className="text-xs font-medium text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition"
            >
              Skip
            </button>
          </div>

          {/* Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--lagoon-deep)] text-white">
            <step.icon className="h-6 w-6" />
          </div>

          {/* Title */}
          <h2 className="mb-2 text-xl font-bold text-[var(--sea-ink)]">
            {step.title}
          </h2>

          {/* Description */}
          <p className="mb-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
            {step.description}
          </p>

          {/* Tip */}
          <div className="mb-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2.5">
            <p className="text-xs font-medium text-[var(--sea-ink-soft)]">
              <span className="font-semibold text-[var(--lagoon-deep)]">
                💡 Tip:{' '}
              </span>
              {step.tip}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              disabled={isFirst}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isFirst
                  ? 'opacity-0 pointer-events-none'
                  : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] hover:bg-[var(--surface)]'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            {isLast ? (
              <button
                type="button"
                onClick={complete}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Check className="h-4 w-4" />
                Get Started
              </button>
            ) : (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-1.5 rounded-lg bg-[var(--lagoon-deep)] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
