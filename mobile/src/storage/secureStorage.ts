import * as SecureStore from 'expo-secure-store';

import type { AuthSession } from '../types/api';

const SESSION_KEY = 'skuy.session';

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.expiresAt === 'number'
  );
}

/**
 * Keystore access is best-effort: a failure (or the web platform, where the
 * module is unsupported) must never crash the app, it just means no persistence.
 */
export async function saveSession(session: AuthSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } catch {
    // The in-memory session keeps working for this app run.
  }
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAuthSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // Nothing to clean up if the keystore is unavailable.
  }
}
