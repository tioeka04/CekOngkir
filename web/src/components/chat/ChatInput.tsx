import { Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLanguage } from '../../context/language-context';
import styles from './ChatInput.module.css';

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MAX_LENGTH = 500;

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useLanguage();
  const [text, setText] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  return (
    <form className={styles.section} onSubmit={submit}>
      <div className={styles.container}>
        <input
          className={styles.input}
          placeholder={t('chat.placeholder')}
          value={text}
          maxLength={MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          disabled={disabled}
          aria-label={t('chat.placeholder')}
        />
        <button className={styles.send} type="submit" disabled={disabled || !text.trim()} aria-label={t('chat.send')}>
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
