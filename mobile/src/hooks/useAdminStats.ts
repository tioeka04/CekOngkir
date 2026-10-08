import { useCallback, useEffect, useState } from 'react';

import { adminApi } from '../api';
import { ADMIN_POLL_INTERVAL_MS } from '../config/env';
import type { AdminRange, AdminStats } from '../types/api';

/** Fetches admin statistics for a range and keeps them fresh with background polling. */
export function useAdminStats() {
  const [range, setRange] = useState<AdminRange>('all');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async (selected: AdminRange, isCancelled: () => boolean) => {
    try {
      const result = await adminApi.fetchAdminStats(selected);
      if (isCancelled()) return;
      setStats(result);
      setError(null);
    } catch (caught) {
      if (!isCancelled()) setError(caught);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    setLoading(true);
    void load(range, isCancelled);
    const timer = setInterval(() => void load(range, isCancelled), ADMIN_POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [range, load]);

  const retry = () => {
    setLoading(true);
    void load(range, () => false);
  };

  return { range, setRange, stats, loading, error, retry };
}
