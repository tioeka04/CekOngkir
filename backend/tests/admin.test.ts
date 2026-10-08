import { describe, expect, it } from 'vitest';
import { rangeStart } from '../src/modules/admin/date-range';
import { rankRoutes, summarizeRatings } from '../src/modules/admin/stats.service';

describe('rangeStart (WIB, UTC+7)', () => {
  // Wed 2026-10-07 20:00 UTC == Thu 2026-10-08 03:00 WIB
  const now = new Date('2026-10-07T20:00:00Z');

  it('uses the WIB calendar day, not the UTC one', () => {
    expect(rangeStart('today', now)).toBe('2026-10-07T17:00:00.000Z'); // 2026-10-08 00:00 WIB
  });

  it('starts the week on Monday', () => {
    expect(rangeStart('week', now)).toBe('2026-10-04T17:00:00.000Z'); // Mon 2026-10-05 00:00 WIB
  });

  it('computes month and year starts', () => {
    expect(rangeStart('month', now)).toBe('2026-09-30T17:00:00.000Z');
    expect(rangeStart('year', now)).toBe('2025-12-31T17:00:00.000Z');
  });

  it('returns undefined for all-time', () => {
    expect(rangeStart('all', now)).toBeUndefined();
  });
});

describe('summarizeRatings', () => {
  const review = (rating: number) => ({ id: String(rating), rating, comment: '', createdAt: '' });

  it('averages to one decimal and fills the breakdown', () => {
    const summary = summarizeRatings([review(5), review(4), review(4)]);
    expect(summary.average).toBe(4.3);
    expect(summary.total).toBe(3);
    expect(summary.breakdown).toEqual({ '1': 0, '2': 0, '3': 0, '4': 2, '5': 1 });
  });

  it('is zero when there are no reviews', () => {
    expect(summarizeRatings([]).average).toBe(0);
  });
});

describe('rankRoutes', () => {
  it('counts, sorts descending and keeps the top 5', () => {
    const logs = [
      ...Array(3).fill({ origin: 'A', destination: 'B' }),
      ...Array(2).fill({ origin: 'C', destination: 'D' }),
      ...['E', 'F', 'G', 'H', 'I'].map((d) => ({ origin: 'X', destination: d })),
    ];
    const top = rankRoutes(logs);
    expect(top).toHaveLength(5);
    expect(top[0]).toEqual({ route: 'A → B', count: 3 });
    expect(top[1]).toEqual({ route: 'C → D', count: 2 });
  });
});
