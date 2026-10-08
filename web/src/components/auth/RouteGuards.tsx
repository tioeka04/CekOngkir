import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import { useLanguage } from '../../context/language-context';

function FullScreenMessage({ children }: { children: string }) {
  return <p style={{ padding: 40, textAlign: 'center', color: 'var(--primary)', fontWeight: 600 }}>{children}</p>;
}

/** Only signed-in users may see the children; everyone else goes to /login. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const { t } = useLanguage();

  if (status === 'loading') return <FullScreenMessage>{t('common.loading')}</FullScreenMessage>;
  if (status === 'anonymous') return <Navigate to="/login" replace />;
  return children;
}

/** Only admins may see the children (the server enforces this too). */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return user?.isAdmin ? children : <Navigate to="/" replace />;
}

/** Signed-in users skip the login page. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  return status === 'authenticated' ? <Navigate to="/" replace /> : children;
}
