import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { authApi, setSession, setSessionHandlers } from '../api';
import { clearSession, loadSession, saveSession } from '../storage/secureStorage';
import type { LoginInput, RegisterInput, User } from '../types/api';

type AuthStatus = 'restoring' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring');
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(async () => {
    setSession(null);
    setUser(null);
    setStatus('signedOut');
    await clearSession();
  }, []);

  useEffect(() => {
    setSessionHandlers({
      onRefreshed: (renewed) => void saveSession(renewed),
      onExpired: () => void logout(),
    });
    return () => setSessionHandlers(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const stored = await loadSession();
      if (!stored) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      // An expired access token is fine: the first 401 triggers a silent refresh.
      setSession(stored);
      try {
        const restoredUser = await authApi.fetchCurrentUser();
        if (cancelled) return;
        setUser(restoredUser);
        setStatus('signedIn');
      } catch {
        setSession(null);
        if (!cancelled) setStatus('signedOut');
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user: loggedInUser, session } = await authApi.login({
      email: input.email.trim(),
      password: input.password,
    });
    setSession(session);
    await saveSession(session);
    setUser(loggedInUser);
    setStatus('signedIn');
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await authApi.register({
      ...input,
      email: input.email.trim(),
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
    });
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
