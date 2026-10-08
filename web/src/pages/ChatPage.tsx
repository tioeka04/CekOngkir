import { Package } from 'lucide-react';
import { ChatInput } from '../components/chat/ChatInput';
import { MessageList } from '../components/chat/MessageList';
import { SessionList } from '../components/chat/SessionList';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { Notice } from '../components/ui/Notice';
import { useAuth } from '../context/auth-context';
import { useLanguage } from '../context/language-context';
import { useChat } from '../hooks/useChat';
import { AppShell } from '../layouts/AppShell';
import styles from './ChatPage.module.css';

export function ChatPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const firstName = user?.fullName.split(' ')[0] || 'User';
  const chat = useChat(firstName);

  return (
    <AppShell
      onNewChat={chat.startNewChat}
      sidebar={
        <>
          <h2 className={styles.sectionLabel}>{t('nav.history')}</h2>
          <SessionList sessions={chat.sessions} activeId={chat.sessionId} onSelect={chat.openSession} />
        </>
      }
    >
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.agent}>
            <span className={styles.agentIcon}>
              <Package size={22} />
            </span>
            <div>
              <strong>{t('chat.agentName')}</strong>
              <span className={styles.status}>
                <i className={styles.dot} />
                {t('chat.agentOnline')}
              </span>
            </div>
          </div>
          <LanguageToggle />
        </header>

        <MessageList messages={chat.messages} greeting={chat.greeting} sending={chat.sending} />
        {chat.error && (
          <div className={styles.error}>
            <Notice tone="error">{chat.error}</Notice>
          </div>
        )}
        <ChatInput onSend={chat.sendMessage} disabled={chat.sending} />
      </main>
    </AppShell>
  );
}
