import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { authApi } from '../api/endpoints';
import { configureHttpClient } from '../api/http-client';
import type { AuthPayload, AuthSession, User } from '../api/types';
import { safeStorage } from '../utils/storage';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';

const STORAGE_KEY = 'cekongkirai.auth';

function loadStoredSession(): AuthSession | null {
  const raw = safeStorage.get(STORAGE_KEY);
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as AuthPayload).session;
  } catch {
    return null;
  }
}

/**
 * Owns the signed-in user and the token pair. Tokens live in localStorage so a page
 * refresh keeps you signed in; the HTTP client refreshes them transparently.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedSession] = useState(loadStoredSession);
  const sessionRef = useRef<AuthSession | null>(storedSession);
  const [status, setStatus] = useState<AuthStatus>(storedSession ? 'loading' : 'anonymous');
  const [user, setUser] = useState<User | null>(null);

  const applySession = useCallback((payload: AuthPayload) => {
    sessionRef.current = payload.session;
    safeStorage.set(STORAGE_KEY, JSON.stringify(payload));
    setUser(payload.user);
    setStatus('authenticated');
  }, []);

  const clearSession = useCallback(() => {
    sessionRef.current = null;
    safeStorage.remove(STORAGE_KEY);
    setUser(null);
    setStatus('anonymous');
  }, []);

  useEffect(() => {
    configureHttpClient({
      getSession: () => sessionRef.current,
      onSessionRefreshed: applySession,
      onSessionExpired: clearSession,
    });

    if (!sessionRef.current) return;
    authApi
      .me()
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(clearSession);
  }, [applySession, clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      login: async (email, password) => applySession(await authApi.login(email, password)),
      register: async (input) => (await authApi.register(input)).message,
      logout: clearSession,
    }),
    [status, user, applySession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
