import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, configureHttpClient, request } from '../src/api/http-client';
import type { AuthPayload, AuthSession } from '../src/api/types';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const user = { id: '1', email: 'a@b.c', fullName: 'A', phone: null, isAdmin: false };
let session: AuthSession | null;
const onSessionExpired = vi.fn();

beforeEach(() => {
  session = { accessToken: 'old', refreshToken: 'r1', expiresAt: 0 };
  onSessionExpired.mockReset();
  configureHttpClient({
    getSession: () => session,
    onSessionRefreshed: (payload: AuthPayload) => {
      session = payload.session;
    },
    onSessionExpired,
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('http client', () => {
  it('sends the bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/api/auth/me');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer old');
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const newSession = { accessToken: 'new', refreshToken: 'r2', expiresAt: 1 };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json(401, { error: { code: 'UNAUTHORIZED', message: 'expired' } }))
      .mockResolvedValueOnce(json(200, { user, session: newSession }))
      .mockResolvedValueOnce(json(200, { data: 42 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/api/chat/sessions')).resolves.toEqual({ data: 42 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const retryInit = fetchMock.mock.calls[2]?.[1] as RequestInit;
    expect((retryInit.headers as Record<string, string>).Authorization).toBe('Bearer new');
  });

  it('signs the user out when the refresh fails', async () => {
    const unauthorized = () => json(401, { error: { code: 'UNAUTHORIZED', message: 'nope' } });
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => unauthorized()));

    await expect(request('/api/chat/sessions')).rejects.toMatchObject({ status: 401 });
    expect(onSessionExpired).toHaveBeenCalledOnce();
  });

  it('turns error responses into ApiError with the server message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json(400, { error: { code: 'VALIDATION_ERROR', message: 'Bad input' } })),
    );
    const error = await request('/api/reviews', { method: 'POST', body: {} }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: 'VALIDATION_ERROR', message: 'Bad input' });
  });

  it('reports network failures with a friendly error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
    await expect(request('/api/health', { anonymous: true })).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});
