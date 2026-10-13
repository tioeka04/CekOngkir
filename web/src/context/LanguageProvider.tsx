import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { translate, type Language } from '../i18n/translate';
import { safeStorage } from '../utils/storage';
import { LanguageContext, type LanguageContextValue } from './language-context';

const STORAGE_KEY = 'cekongkirai.language';

function loadInitialLanguage(): Language {
  return safeStorage.get(STORAGE_KEY) === 'en' ? 'en' : 'id';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    safeStorage.set(STORAGE_KEY, next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: (key, params) => translate(language, key, params) }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
