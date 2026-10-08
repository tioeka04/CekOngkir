import type { ChatSessionSummary } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import styles from './SessionList.module.css';

interface SessionListProps {
  sessions: ChatSessionSummary[];
  activeId: string;
  onSelect: (sessionId: string) => void;
}

export function SessionList({ sessions, activeId, onSelect }: SessionListProps) {
  const { t, language } = useLanguage();
  const locale = language === 'id' ? 'id-ID' : 'en-US';

  if (sessions.length === 0) return <p className={styles.empty}>{t('nav.noHistory')}</p>;

  return (
    <ul className={styles.list}>
      {sessions.map((session) => (
        <li key={session.sessionId}>
          <button
            type="button"
            className={`${styles.item} ${session.sessionId === activeId ? styles.active : ''}`}
            onClick={() => onSelect(session.sessionId)}
          >
            <span className={styles.title}>{session.title}</span>
            <span className={styles.date}>{new Date(session.lastMessageAt).toLocaleDateString(locale)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
