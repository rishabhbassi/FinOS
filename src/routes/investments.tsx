import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import PortfolioSummary from '@/components/investments/PortfolioSummary';
import HoldingsList from '@/components/investments/HoldingsList';
import type { Investment } from '@/types/database';

export const Route = createFileRoute('/investments')({
  component: InvestmentsPage,
});

const MOCK_INVESTMENTS: Investment[] = [
  {
    id: 'inv-1',
    user_id: 'user-1',
    name: 'HDFC Midcap Opportunities',
    type: 'mutual_fund',
    amount_invested: 120000,
    current_value: 142000,
    sip_amount: 5000,
    sip_day: 5,
    provider: 'HDFC AMC',
    notes: null,
    created_at: '2025-01-15T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-2',
    user_id: 'user-1',
    name: 'SBI Bluechip Fund',
    type: 'mutual_fund',
    amount_invested: 80000,
    current_value: 76000,
    sip_amount: 3000,
    sip_day: 12,
    provider: 'SBI AMC',
    notes: null,
    created_at: '2025-02-10T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-3',
    user_id: 'user-1',
    name: 'Reliance Industries',
    type: 'stock',
    amount_invested: 45000,
    current_value: 52300,
    sip_amount: null,
    sip_day: null,
    provider: 'Zerodha',
    notes: null,
    created_at: '2025-03-05T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-4',
    user_id: 'user-1',
    name: 'TCS',
    type: 'stock',
    amount_invested: 32000,
    current_value: 29800,
    sip_amount: null,
    sip_day: null,
    provider: 'Zerodha',
    notes: null,
    created_at: '2025-04-20T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-5',
    user_id: 'user-1',
    name: 'ICICI FD',
    type: 'fd',
    amount_invested: 100000,
    current_value: 108500,
    sip_amount: null,
    sip_day: null,
    provider: 'ICICI Bank',
    notes: '1 year FD at 8.5%',
    created_at: '2025-05-01T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-6',
    user_id: 'user-1',
    name: 'PPF Account',
    type: 'ppf',
    amount_invested: 60000,
    current_value: 67200,
    sip_amount: null,
    sip_day: null,
    provider: 'SBI',
    notes: null,
    created_at: '2025-06-15T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
  {
    id: 'inv-7',
    user_id: 'user-1',
    name: 'Digital Gold',
    type: 'gold',
    amount_invested: 25000,
    current_value: 28700,
    sip_amount: null,
    sip_day: null,
    provider: 'PhonePe',
    notes: null,
    created_at: '2025-07-10T00:00:00Z',
    updated_at: '2026-06-28T00:00:00Z',
  },
];

function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>(MOCK_INVESTMENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 800));
    setInvestments(MOCK_INVESTMENTS);
    setLoading(false);
  }, []);

  const handleEdit = useCallback(
    (inv: Investment) => {
      showToast(`Edit: ${inv.name}`);
    },
    [showToast],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setInvestments((prev) => prev.filter((inv) => inv.id !== id));
      showToast('Investment removed');
    },
    [showToast],
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="demo-page"
    >
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--lagoon),transparent_84%)]">
            <TrendingUp className="h-5 w-5 text-[var(--lagoon-deep)]" />
          </div>
          <div>
            <h1 className="demo-title">Investments</h1>
            <p className="text-sm text-[var(--sea-ink-soft)]">
              Track and manage your investment portfolio
            </p>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={loading}
          className="demo-button-secondary"
        >
          <RefreshCw
            className={'h-4 w-4' + (loading ? ' animate-spin' : '')}
          />
          Refresh
        </button>
      </div>

      {/* Content area */}
      <div className="space-y-6">
        <PortfolioSummary
          data={investments}
          loading={loading}
          error={error}
          onRetry={handleRetry}
        />

        <div>
          <h2 className="demo-section-title mb-3">Holdings</h2>
          <HoldingsList
            data={investments}
            loading={loading}
            error={error}
            onRetry={handleRetry}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-3 text-sm font-semibold text-[var(--sea-ink)] shadow-lg backdrop-blur-md"
        >
          {toast}
        </motion.div>
      )}
    </motion.main>
  );
}

export default InvestmentsPage;
