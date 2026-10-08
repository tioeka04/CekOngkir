import { env } from '../config/env';
import type { AuthPayload, AuthSession } from './types';

/** Error thrown for every non-2xx API response, carrying the backend's error code. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Bridge between the HTTP client and the auth state, so the client can attach tokens,
 * refresh them on 401, and tell the app when the session is truly over.
 */
export interface SessionBridge {
  getSession(): AuthSession | null;
  onSessionRefreshed(payload: AuthPayload): void;
  onSessionExpired(): void;
}

interface RequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  /** Skip the Authorization header and the refresh-on-401 logic (login, register...). */
  anonymous?: boolean;
}

const REQUEST_TIMEOUT_MS = 30_000;

let bridge: SessionBridge | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function configureHttpClient(sessionBridge: SessionBridge): void {
  bridge = sessionBridge;
}

async function send(path: string, { method = 'GET', body, anonymous }: RequestOptions, token?: string) {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!anonymous && token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server. Check your connection.');
  }
}

/** Refreshes the access token once, even when several requests fail at the same time. */
function refreshSession(): Promise<boolean> {
  refreshInFlight ??= (async () => {
    const session = bridge?.getSession();
    if (!session) return false;
    try {
      const response = await send('/api/auth/refresh', {
        method: 'POST',
        body: { refreshToken: session.refreshToken },
        anonymous: true,
      });
      if (!response.ok) return false;
      bridge?.onSessionRefreshed((await response.json()) as AuthPayload);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function toApiError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as { error?: { code?: string; message?: string } };
    return new ApiError(
      response.status,
      body.error?.code ?? 'UNKNOWN',
      body.error?.message ?? 'Unexpected error',
    );
  } catch {
    return new ApiError(response.status, 'UNKNOWN', 'Unexpected error');
  }
}

/** Typed JSON request against the backend. Handles auth headers and silent token refresh. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await send(path, options, bridge?.getSession()?.accessToken);

  if (response.status === 401 && !options.anonymous && bridge?.getSession()) {
    if (await refreshSession()) {
      response = await send(path, options, bridge.getSession()?.accessToken);
    } else {
      bridge.onSessionExpired();
    }
  }

  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}
