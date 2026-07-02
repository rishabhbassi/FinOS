import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { createFileRoute } from '@tanstack/react-router';
import PortfolioSummary from '@/components/investments/PortfolioSummary';
import HoldingsList from '@/components/investments/HoldingsList';
import { investmentQueries } from '@/lib/supabase/queries';
import type { Investment } from '@/types/database';

export const Route = createFileRoute('/investments')({
  component: InvestmentsPage,
});


function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Fetch investments from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchInvestments() {
      setLoading(true);
      setError(null);
      try {
        const data = await investmentQueries.list();
        if (!cancelled) setInvestments(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load investments');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchInvestments();
    return () => { cancelled = true; };
  }, []);

  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await investmentQueries.list();
      setInvestments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback(
    (inv: Investment) => {
      showToast(`Edit: ${inv.name}`);
    },
    [showToast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await investmentQueries.delete(id);
        setInvestments((prev) => prev.filter((inv) => inv.id !== id));
        showToast('Investment removed');
      } catch (err) {
        showToast('Failed to remove investment');
      }
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
