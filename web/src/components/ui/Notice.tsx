import styles from './Notice.module.css';

interface NoticeProps {
  tone: 'error' | 'success';
  children: string;
}

/** Inline status message (replaces alert() popups). */
export function Notice({ tone, children }: NoticeProps) {
  return (
    <div className={`${styles.notice} ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}
