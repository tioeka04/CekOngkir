const DEFAULT_API_URL = 'http://localhost:3000';

/** Backend base URL without a trailing slash. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/+$/, '');

export const REQUEST_TIMEOUT_MS = 30_000;
export const ADMIN_POLL_INTERVAL_MS = 10_000;
