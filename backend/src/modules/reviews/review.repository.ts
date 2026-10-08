import type { SupabaseClient } from '@supabase/supabase-js';
import { UpstreamError } from '../../lib/errors';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Persistence for star ratings and comments left by users. */
export class ReviewRepository {
  constructor(private readonly db: SupabaseClient) {}

  async create(userId: string, rating: number, comment: string): Promise<void> {
    const { error } = await this.db.from('reviews').insert({ user_id: userId, rating, comment });
    if (error) throw new UpstreamError('Database', error);
  }

  /** Newest first. `since` is an ISO date; omit it for all-time. */
  async list(since?: string): Promise<Review[]> {
    let query = this.db
      .from('reviews')
      .select('id, rating, comment, created_at')
      .order('created_at', { ascending: false });
    if (since) query = query.gte('created_at', since);

    const { data, error } = await query;
    if (error) throw new UpstreamError('Database', error);

    return (data as ReviewRow[]).map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment ?? '',
      createdAt: row.created_at,
    }));
  }
}
