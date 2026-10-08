import { en } from './en';
import { id, type TranslationKey } from './id';

export type Language = 'id' | 'en';
export type TranslationParams = Record<string, string | number>;
export type { TranslationKey };

const dictionaries: Record<Language, Record<TranslationKey, string>> = { id, en };

/** Looks up a key and fills `{placeholders}` from params. */
export function translate(language: Language, key: TranslationKey, params?: TranslationParams): string {
  const template = dictionaries[language][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match));
}
