import { useLanguage } from '../../context/language-context';
import type { Language } from '../../i18n/translate';
import styles from './LanguageToggle.module.css';

const OPTIONS: { code: Language; flag: string; label: string }[] = [
  { code: 'id', flag: 'https://flagcdn.com/w40/id.png', label: 'Bahasa Indonesia' },
  { code: 'en', flag: 'https://flagcdn.com/w40/gb.png', label: 'English' },
];

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div className={styles.toggle} role="group" aria-label={t('chat.language')}>
      {OPTIONS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          className={`${styles.option} ${language === code ? styles.active : ''}`}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={label}
          title={label}
        >
          <img src={flag} alt="" width={24} />
        </button>
      ))}
    </div>
  );
}
