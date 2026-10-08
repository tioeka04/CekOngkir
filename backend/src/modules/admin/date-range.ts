export const STATS_RANGES = ['today', 'week', 'month', 'year', 'all'] as const;
export type StatsRange = (typeof STATS_RANGES)[number];

/** Indonesia's main timezone (WIB) is UTC+7 all year; no daylight saving to worry about. */
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Start of the requested period in WIB, as an ISO string (UTC).
 * Weeks start on Monday. Returns undefined for "all".
 */
export function rangeStart(range: StatsRange, now: Date = new Date()): string | undefined {
  if (range === 'all') return undefined;

  // Shift into WIB so UTC getters read WIB wall-clock values.
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  const year = wib.getUTCFullYear();
  const month = wib.getUTCMonth();
  const day = wib.getUTCDate();

  let startWib: number;
  switch (range) {
    case 'today':
      startWib = Date.UTC(year, month, day);
      break;
    case 'week': {
      const daysSinceMonday = (wib.getUTCDay() + 6) % 7;
      startWib = Date.UTC(year, month, day - daysSinceMonday);
      break;
    }
    case 'month':
      startWib = Date.UTC(year, month, 1);
      break;
    case 'year':
      startWib = Date.UTC(year, 0, 1);
      break;
  }
  return new Date(startWib - WIB_OFFSET_MS).toISOString();
}
