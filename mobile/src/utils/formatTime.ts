import type { Language } from '../i18n';

const LOCALES: Record<Language, string> = { id: 'id-ID', en: 'en-US' };

export function formatTime(iso: string, language: Language): string {
  return new Date(iso).toLocaleTimeString(LOCALES[language], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string, language: Language): string {
  return new Date(iso).toLocaleDateString(LOCALES[language], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
