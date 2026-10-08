import { Bot, ChevronRight, Lock, Mail, Phone, User } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ApiError } from '../../api/http-client';
import { useAuth } from '../../context/auth-context';
import { useLanguage } from '../../context/language-context';
import { Button } from '../ui/Button';
import { LanguageToggle } from '../ui/LanguageToggle';
import { Notice } from '../ui/Notice';
import { TextField } from '../ui/TextField';
import styles from './AuthForm.module.css';

type Mode = 'login' | 'register';

const EMPTY_FORM = { email: '', password: '', fullName: '', phone: '' };

export function AuthForm() {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const update = (field: keyof typeof EMPTY_FORM) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const missing = !form.email || !form.password || (isRegister && (!form.fullName || !form.phone));
    if (missing) return setError(t('auth.fillAll'));

    setBusy(true);
    setError(null);
    try {
      if (isRegister) {
        await register(form);
        setSuccess(t('auth.registered'));
        setMode('login');
        setForm({ ...EMPTY_FORM, email: form.email });
      } else {
        await login(form.email, form.password);
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t('chat.sendError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.card}>
      <header className={styles.header}>
        <div className={styles.language}>
          <LanguageToggle />
        </div>
        <div className={styles.icon}>
          <Bot size={34} />
        </div>
        <h1 className={styles.title}>{t('brand.name')}</h1>
        <p className={styles.subtitle}>{t(isRegister ? 'auth.subtitleRegister' : 'auth.subtitleLogin')}</p>
      </header>

      <form className={styles.body} onSubmit={handleSubmit} noValidate>
        {error && <Notice tone="error">{error}</Notice>}
        {success && <Notice tone="success">{success}</Notice>}

        {isRegister && (
          <>
            <TextField
              label={t('auth.fullName')}
              icon={<User size={18} />}
              value={form.fullName}
              onChange={(e) => update('fullName')(e.target.value)}
              autoComplete="name"
            />
            <TextField
              label={t('auth.phone')}
              icon={<Phone size={18} />}
              type="tel"
              placeholder="081234567890"
              value={form.phone}
              onChange={(e) => update('phone')(e.target.value)}
              autoComplete="tel"
            />
          </>
        )}

        <TextField
          label={t('auth.email')}
          icon={<Mail size={18} />}
          type="email"
          placeholder="name@email.com"
          value={form.email}
          onChange={(e) => update('email')(e.target.value)}
          autoComplete="email"
        />
        <TextField
          label={t('auth.password')}
          icon={<Lock size={18} />}
          type="password"
          hint={isRegister ? t('auth.passwordHint') : undefined}
          value={form.password}
          onChange={(e) => update('password')(e.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
        />

        <Button type="submit" disabled={busy} icon={!busy && <ChevronRight size={18} />}>
          {busy ? t('auth.processing') : t(isRegister ? 'auth.signUp' : 'auth.signIn')}
        </Button>

        <p className={styles.toggle}>
          {t(isRegister ? 'auth.haveAccount' : 'auth.noAccount')}
          <button type="button" onClick={switchMode}>
            {t(isRegister ? 'auth.goLogin' : 'auth.goRegister')}
          </button>
        </p>
      </form>
    </div>
  );
}
