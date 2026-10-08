import { Bot, LayoutDashboard, LogOut, MessageSquare, Plus, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/auth-context';
import { useLanguage } from '../context/language-context';
import styles from './AppShell.module.css';

interface AppShellProps {
  /** Content under the buttons (e.g. chat history). */
  sidebar?: ReactNode;
  onNewChat?: () => void;
  children: ReactNode;
}

/** Signed-in frame: sidebar (brand, navigation, profile) + main content. */
export function AppShell({ sidebar, onNewChat, children }: AppShellProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const onAdminPage = useLocation().pathname === '/admin';

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              <Bot size={20} />
            </span>
            {t('brand.name')}
          </div>

          <div className={styles.actions}>
            <Button icon={<Plus size={18} />} onClick={onNewChat ?? (() => navigate('/'))}>
              {t('nav.newChat')}
            </Button>

            {user?.isAdmin && (
              <>
                <span className={styles.sectionLabel}>{t('nav.adminPanel')}</span>
                <Link to={onAdminPage ? '/' : '/admin'} className={styles.linkButton}>
                  {onAdminPage ? <MessageSquare size={18} /> : <LayoutDashboard size={18} />}
                  {t(onAdminPage ? 'nav.backToChat' : 'nav.adminDashboard')}
                </Link>
              </>
            )}
          </div>

          <div className={styles.content}>{sidebar}</div>

          <footer className={styles.footer}>
            <div className={styles.profile}>
              <span className={styles.avatar}>
                <User size={16} />
              </span>
              <div className={styles.profileText}>
                <strong>{user?.fullName || 'User'}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            <Button variant="danger" icon={<LogOut size={16} />} onClick={logout}>
              {t('nav.logout')}
            </Button>
          </footer>
        </aside>

        {children}
      </div>
    </div>
  );
}
