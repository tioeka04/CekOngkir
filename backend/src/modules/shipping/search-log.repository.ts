import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../lib/logger';
import type { ShippingPreference } from '../../types/domain';

export interface SearchLogEntry {
  userId: string;
  origin: string;
  destination: string;
  weightKg: number;
  preference: ShippingPreference;
}

/** Records every successful route lookup so the admin dashboard can show popular routes. */
export class SearchLogRepository {
  constructor(private readonly db: SupabaseClient) {}

  /** A logging failure is reported but never thrown: it must not break the user's request. */
  async record(entry: SearchLogEntry): Promise<void> {
    const { error } = await this.db.from('search_logs').insert({
      user_id: entry.userId,
      origin: entry.origin,
      destination: entry.destination,
      weight_kg: entry.weightKg,
      preference: entry.preference,
    });
    if (error) logger.warn({ err: error }, 'Could not write search log');
  }
}
