import { en } from './en';
import { id } from './id';
import type { TranslationKey } from './id';

export type { TranslationKey };
export type Language = 'id' | 'en';
export type TranslateParams = Record<string, string | number>;

export const DEFAULT_LANGUAGE: Language = 'id';

const dictionaries: Record<Language, Record<TranslationKey, string>> = { id, en };

/** Looks up a key and substitutes `{placeholder}` tokens. */
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslateParams,
): string {
  const template = dictionaries[language][key];
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (token, name: string) =>
    name in params ? String(params[name]) : token,
  );
}
