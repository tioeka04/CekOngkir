import { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/language-context';
import type { ChatMessage } from '../../hooks/useChat';
import { formatTime } from '../../utils/format';
import { ShippingResultCard } from './ShippingResultCard';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: ChatMessage[];
  greeting: string;
  sending: boolean;
}

export function MessageList({ messages, greeting, sending }: MessageListProps) {
  const { t, language } = useLanguage();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, sending]);

  const locale = language === 'id' ? 'id-ID' : 'en-US';

  return (
    <div className={styles.list} aria-live="polite">
      {messages.length === 0 && <Bubble role="bot">{greeting}</Bubble>}

      {messages.map((message) => (
        <div key={message.id} className={`${styles.wrapper} ${styles[message.role]}`}>
          {message.shipping ? (
            <ShippingResultCard result={message.shipping} />
          ) : (
            <>
              <Bubble role={message.role}>{message.text}</Bubble>
              <time className={styles.time}>{formatTime(message.timestamp, locale)}</time>
            </>
          )}
        </div>
      ))}

      {sending && (
        <div className={`${styles.wrapper} ${styles.bot}`}>
          <Bubble role="bot" dimmed>
            {t('chat.thinking')}
          </Bubble>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function Bubble({ role, dimmed, children }: { role: 'user' | 'bot'; dimmed?: boolean; children: string }) {
  return <div className={`${styles.bubble} ${styles[`${role}Bubble`]} ${dimmed ? styles.dimmed : ''}`}>{children}</div>;
}
