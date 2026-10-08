import { API_URL, REQUEST_TIMEOUT_MS } from '../config/env';
import type { AuthSession, LoginResponse } from '../types/api';
import { ApiError, parseApiError } from './ApiError';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string>;
  /** Set to false for public endpoints (login, register). */
  authenticated?: boolean;
}

interface SessionHandlers {
  /** Persist a session obtained through a silent refresh. */
  onRefreshed: (session: AuthSession) => void;
  /** The session could not be recovered: the user must sign in again. */
  onExpired: () => void;
}

let session: AuthSession | null = null;
let handlers: SessionHandlers | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setSession(next: AuthSession | null): void {
  session = next;
}

export function setSessionHandlers(next: SessionHandlers | null): void {
  handlers = next;
}

function buildUrl(path: string, query?: Record<string, string>): string {
  const search = query ? `?${new URLSearchParams(query).toString()}` : '';
  return `${API_URL}/api${path}${search}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function send(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new ApiError(0, aborted ? 'TIMEOUT' : 'NETWORK_ERROR', 'Network request failed');
  } finally {
    clearTimeout(timer);
  }
}

/** Exchanges the refresh token once; parallel callers share the same promise. */
function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    const refreshToken = session?.refreshToken;
    refreshInFlight = (async () => {
      if (!refreshToken) return false;
      try {
        const response = await send(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return false;
        const { session: renewed } = (await parseBody(response)) as LoginResponse;
        session = renewed;
        handlers?.onRefreshed(renewed);
        return true;
      } catch {
        return false;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return execute<T>(path, options, true);
}

async function execute<T>(path: string, options: RequestOptions, mayRefresh: boolean): Promise<T> {
  const { method = 'GET', body, query, authenticated = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = authenticated ? (session?.accessToken ?? null) : null;

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await send(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await parseBody(response);

  if (response.ok) {
    // The contract guarantees the success shape per endpoint; the typed wrappers in *.api.ts own it.
    return payload as T;
  }
  // Only a rejected *token* means the session is stale; bad login credentials also return 401.
  if (response.status === 401 && token) {
    // A parallel request may already have renewed the session; then just retry with it.
    const alreadyRenewed = session !== null && session.accessToken !== token;
    if (mayRefresh && (alreadyRenewed || (await refreshSession()))) {
      return execute<T>(path, options, false);
    }
    handlers?.onExpired();
  }
  throw parseApiError(response.status, payload);
}
