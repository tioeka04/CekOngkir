import type { TranslationKey } from '../i18n';

export type AuthField = 'fullName' | 'phone' | 'email' | 'password';
export type AuthFormValues = Record<AuthField, string>;
export type AuthFormErrors = Partial<Record<AuthField, TranslationKey>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;
const MIN_PASSWORD_LENGTH = 8;

/** Client-side checks that mirror the backend rules, to fail fast before a request. */
export function validateAuthForm(values: AuthFormValues, isRegister: boolean): AuthFormErrors {
  const errors: AuthFormErrors = {};

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'validation.email';
  }
  if (!values.password) {
    errors.password = 'validation.required';
  } else if (isRegister && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = 'validation.password';
  }
  if (isRegister) {
    if (!values.fullName.trim()) {
      errors.fullName = 'validation.required';
    }
    if (!PHONE_PATTERN.test(values.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'validation.phone';
    }
  }
  return errors;
}
