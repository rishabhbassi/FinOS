// Finance OS - Product Tour
// A guided tour that highlights actual UI elements on the page

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Menu,
  BarChart3,
  LayoutDashboard,
  Sparkles,
  Keyboard,
} from 'lucide-react';

// ─── Tour Steps ──────────────────────────────────────────────────────────────
// Each step targets a UI element via CSS selector and shows a tooltip near it

interface TourStepDef {
  title: string;
  description: string;
  icon: typeof Sparkles;
  /** CSS selector for the element to highlight. Empty string = center overlay (no highlight) */
  selector: string;
  /** Where to place the tooltip relative to the target */
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center';
  /** Extra tip shown below the description */
  tip: string;
}

const STEPS: TourStepDef[] = [
  {
    title: 'Welcome to Finance OS',
    description:
      'Your personal budget operating system. Let\'s take a quick tour of the key features so you can hit the ground running.',
    icon: Sparkles,
    selector: '',
    placement: 'center',
    tip: 'This tour takes about 30 seconds. You can skip it anytime.',
  },
  {
    title: 'Sidebar — Your Command Center',
    description:
      'Use the sidebar to navigate between pages. Each icon takes you to a different part of Finance OS — Dashboard, Planner, Transactions, Budget, and more.',
    icon: Menu,
    selector: '[class*="sidebar"], aside, nav.fin-sidebar, .fin-sidebar',
    placement: 'right',
    tip: 'The sidebar is always visible on desktop. On mobile, use the bottom navigation bar.',
  },
  {
    title: 'Dashboard — At a Glance',
    description:
      'Your dashboard shows what matters most: today\'s remaining budget, weekly progress, monthly savings, and recent transactions.',
    icon: LayoutDashboard,
    selector: '[class*="DailyDecision"], .demo-panel',
    placement: 'bottom',
    tip: 'The big number at the top is your available-to-spend today. Everything updates in real-time.',
  },
  {
    title: 'Quick Entry — ⌘K',
    description:
      'Press ⌘K (or Ctrl+K on Windows/ Linux) anytime to open Quick Entry. Type "Coffee 180" and it\'s logged instantly.',
    icon: Keyboard,
    selector: 'body',
    placement: 'center',
    tip: 'Quick Entry auto-categorizes based on keywords. Try "Salary 59000" or "Zomato 450".',
  },
  {
    title: 'Reports & Insights',
    description:
      'Visit Reports to see spending trends, category breakdowns, and savings analysis. Use Goals to track big purchases.',
    icon: BarChart3,
    selector: 'a[href="/reports"], [href="/reports"]',
    placement: 'right',
    tip: 'Reports are fully interactive — hover charts for details, filter by period and category.',
  },
  {
    title: 'You\'re All Set!',
    description:
      'Start by adding your accounts, then log your first transaction. The dashboard will populate with real data automatically.',
    icon: Check,
    selector: '',
    placement: 'center',
    tip: 'Go to Settings → Accounts to add bank accounts and wallets.',
  },
];

// ─── Storage ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'finos-tour';

interface TourState {
  completed: boolean;
  currentStep: number;
}

function getStoredState(): TourState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { completed: true, currentStep: 0 };
}

function setStoredState(state: TourState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* ignore */ }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOnboarding() {
  const [state, setState] = useState<TourState>(getStoredState);

  const start = useCallback(() => {
    const s = { completed: false, currentStep: 0 };
    setState(s);
    setStoredState(s);
  }, []);

  const complete = useCallback(() => {
    const s = { completed: true, currentStep: STEPS.length };
    setState(s);
    setStoredState(s);
  }, []);

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep >= STEPS.length - 1) {
        const s = { completed: true, currentStep: STEPS.length };
        setStoredState(s);
        return s;
      }
      const s = { ...prev, currentStep: prev.currentStep + 1 };
      setStoredState(s);
      return s;
    });
  }, []);

  const prev = useCallback(() => {
    setState((prev) => {
      if (prev.currentStep <= 0) return prev;
      const s = { ...prev, currentStep: prev.currentStep - 1 };
      setStoredState(s);
      return s;
    });
  }, []);

  // Auto-start on first visit
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) start();
  }, [start]);

  return {
    show: !state.completed,
    currentStep: state.currentStep,
    totalSteps: STEPS.length,
    start, complete, next, prev,
  };
}

// ─── Spot Calculator ─────────────────────────────────────────────────────────

interface Spot {
  left: number;
  top: number;
  width: number;
  height: number;
}

function getTargetSpot(selector: string): Spot | null {
  if (!selector) return null;
  try {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  } catch {
    return null;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const PADDING = 14;
const TOOLTIP_GAP = 16;

export default function TutorialOverlay() {
  const { show, currentStep, totalSteps, complete, next, prev } = useOnboarding();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [winSize, setWinSize] = useState({ w: 0, h: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const step = STEPS[currentStep] ?? STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Measure target element position
  const measure = useCallback(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight });
    setSpot(getTargetSpot(step.selector));
  }, [step.selector]);

  useEffect(() => {
    if (!show) return;
    // Wait for render, then measure
    rafRef.current = requestAnimationFrame(() => {
      measure();
    });
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [show, measure]);

  // Calculate tooltip position relative to the spotlight
  const getTooltipStyle = (): React.CSSProperties => {
    if (step.placement === 'center' || !spot) {
      return {
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: 440,
        width: 'calc(100% - 32px)',
      };
    }

    const tooltipW = 340;
    const tooltipH = 240;

    switch (step.placement) {
      case 'right':
        return {
          position: 'fixed',
          left: Math.min(spot.left + spot.width + PADDING + TOOLTIP_GAP, winSize.w - tooltipW - 16),
          top: Math.max(16, Math.min(spot.top + spot.height / 2 - tooltipH / 2, winSize.h - tooltipH - 16)),
          width: tooltipW,
        };
      case 'bottom':
        return {
          position: 'fixed',
          left: Math.max(16, Math.min(spot.left + spot.width / 2 - tooltipW / 2, winSize.w - tooltipW - 16)),
          top: Math.min(spot.top + spot.height + PADDING + TOOLTIP_GAP, winSize.h - tooltipH - 16),
          width: tooltipW,
        };
      case 'left':
        return {
          position: 'fixed',
          left: Math.max(16, spot.left - tooltipW - TOOLTIP_GAP),
          top: Math.max(16, Math.min(spot.top + spot.height / 2 - tooltipH / 2, winSize.h - tooltipH - 16)),
          width: tooltipW,
        };
      default:
        return {
          position: 'fixed',
          left: Math.max(16, spot.left + spot.width / 2 - tooltipW / 2),
          top: spot.top + spot.height + PADDING + TOOLTIP_GAP,
          width: tooltipW,
        };
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {/* Fullscreen dark overlay */}
      <motion.div
        className="fixed inset-0 z-[200]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Dark backdrop */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Spotlight cutout — creates transparent "window" over target */}
        {spot && step.placement !== 'center' && (
          <div
            className="absolute z-10"
            style={{
              left: spot.left - PADDING,
              top: spot.top - PADDING,
              width: spot.width + PADDING * 2,
              height: spot.height + PADDING * 2,
              borderRadius: 14,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            }}
          />
        )}

        {/* Glow ring around spotlight */}
        {spot && step.placement !== 'center' && (
          <div
            className="absolute z-10 pointer-events-none"
            style={{
              left: spot.left - PADDING - 3,
              top: spot.top - PADDING - 3,
              width: spot.width + PADDING * 2 + 6,
              height: spot.height + PADDING * 2 + 6,
              borderRadius: 16,
              border: '2px solid var(--lagoon)',
              boxShadow: '0 0 24px rgba(45,212,191,0.35), inset 0 0 24px rgba(45,212,191,0.05)',
            }}
          />
        )}

        {/* Tooltip Card */}
        <motion.div
          ref={tooltipRef}
          className="absolute z-20"
          style={getTooltipStyle()}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-base)] p-5 shadow-xl">
            {/* Step indicator */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep
                        ? 'w-6 bg-[var(--lagoon)]'
                        : i < currentStep
                          ? 'w-1.5 bg-[var(--lagoon-deep)]'
                          : 'w-1.5 bg-[var(--line)]'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={complete}
                className="text-xs font-medium text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)] transition-colors"
              >
                Skip
              </button>
            </div>

            {/* Icon */}
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--lagoon-deep)] text-white">
              <step.icon className="h-5 w-5" />
            </div>

            {/* Title */}
            <h3 className="mb-1.5 text-lg font-bold text-[var(--sea-ink)]">
              {step.title}
            </h3>

            {/* Description */}
            <p className="mb-3 text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              {step.description}
            </p>

            {/* Tip */}
            <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
              <p className="text-xs text-[var(--sea-ink-soft)]">
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
                  Finish Tour
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
