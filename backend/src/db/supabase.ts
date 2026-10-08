import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Env } from '../config/env';

const options = { auth: { persistSession: false, autoRefreshToken: false } };

export interface SupabaseClients {
  /** Anon-key client: used only for sign-up / sign-in / token verification. */
  auth: SupabaseClient;
  /** Service-role client: used for database access. Bypasses RLS, so keep it server-side. */
  db: SupabaseClient;
}

export function createSupabaseClients(env: Env): SupabaseClients {
  return {
    auth: createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, options),
    db: createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options),
  };
}
