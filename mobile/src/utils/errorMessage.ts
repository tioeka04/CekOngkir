import { ApiError } from '../api';
import type { TranslateParams, TranslationKey } from '../i18n';

type Translator = (key: TranslationKey, params?: TranslateParams) => string;

/** Turns any thrown value into a localized, user-facing message. */
export function errorMessage(error: unknown, t: Translator): string {
  if (!(error instanceof ApiError)) return t('errors.UNKNOWN');
  // Validation messages from the server name the offending field, so they are more useful.
  if (error.code === 'VALIDATION_ERROR' && error.message) return error.message;
  return t(`errors.${error.code}`);
}
