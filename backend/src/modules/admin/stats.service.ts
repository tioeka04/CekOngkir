import type { SupabaseClient } from '@supabase/supabase-js';
import { UpstreamError } from '../../lib/errors';
import type { Review, ReviewRepository } from '../reviews/review.repository';
import { rangeStart, type StatsRange } from './date-range';

const ACTIVE_WINDOW_MS = 15 * 60 * 1000;
const TOP_ROUTES_LIMIT = 5;
const RECENT_REVIEWS_LIMIT = 5;

type RatingBreakdown = Record<'1' | '2' | '3' | '4' | '5', number>;

export interface AdminStats {
  range: StatsRange;
  totalUsers: number;
  activeUsers: number;
  totalSearches: number;
  topRoutes: { route: string; count: number }[];
  ratings: { average: number; total: number; breakdown: RatingBreakdown };
  recentReviews: Review[];
}

export function summarizeRatings(reviews: Review[]): AdminStats['ratings'] {
  const breakdown: RatingBreakdown = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let sum = 0;
  for (const { rating } of reviews) {
    breakdown[String(rating) as keyof RatingBreakdown] += 1;
    sum += rating;
  }
  const average = reviews.length ? Math.round((sum / reviews.length) * 10) / 10 : 0;
  return { average, total: reviews.length, breakdown };
}

export function rankRoutes(logs: { origin: string; destination: string }[]) {
  const counts = new Map<string, number>();
  for (const { origin, destination } of logs) {
    const route = `${origin} → ${destination}`;
    counts.set(route, (counts.get(route) ?? 0) + 1);
  }
  return [...counts]
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_ROUTES_LIMIT);
}

/** Read-only analytics for the admin dashboard. */
export class StatsService {
  constructor(
    private readonly db: SupabaseClient,
    private readonly reviews: Pick<ReviewRepository, 'list'>,
  ) {}

  async getStats(range: StatsRange): Promise<AdminStats> {
    const since = rangeStart(range);
    const [chatUsers, activeUsers, searchLogs, reviews] = await Promise.all([
      this.distinctChatUsers(since),
      this.distinctChatUsers(new Date(Date.now() - ACTIVE_WINDOW_MS).toISOString()),
      this.searchLogs(since),
      this.reviews.list(since),
    ]);

    return {
      range,
      totalUsers: chatUsers.size,
      activeUsers: activeUsers.size,
      totalSearches: searchLogs.length,
      topRoutes: rankRoutes(searchLogs),
      ratings: summarizeRatings(reviews),
      recentReviews: reviews.slice(0, RECENT_REVIEWS_LIMIT),
    };
  }

  private async distinctChatUsers(since?: string): Promise<Set<string>> {
    let query = this.db.from('chat_history').select('user_id');
    if (since) query = query.gte('created_at', since);
    const { data, error } = await query;
    if (error) throw new UpstreamError('Database', error);
    return new Set((data as { user_id: string }[]).map((row) => row.user_id));
  }

  private async searchLogs(since?: string): Promise<{ origin: string; destination: string }[]> {
    let query = this.db.from('search_logs').select('origin, destination');
    if (since) query = query.gte('created_at', since);
    const { data, error } = await query;
    if (error) throw new UpstreamError('Database', error);
    return data as { origin: string; destination: string }[];
  }
}
