import { useEffect, useState } from 'react';
import { adminApi } from '../api/endpoints';
import type { AdminStats, StatsRange } from '../api/types';

const REFRESH_INTERVAL_MS = 15_000;

/** Loads dashboard statistics for a range and keeps them fresh while the page is open. */
export function useAdminStats(range: StatsRange) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      adminApi
        .getStats(range)
        .then((next) => {
          if (cancelled) return;
          setStats(next);
          setError(false);
        })
        .catch(() => !cancelled && setError(true));

    void load();
    const timer = setInterval(() => void load(), REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [range]);

  return { stats, error, loading: stats === null && !error };
}
