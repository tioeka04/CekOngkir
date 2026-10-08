import { useState } from 'react';

import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { errorMessage } from '../utils/errorMessage';
import { validateAuthForm } from '../utils/validation';
import type { AuthField, AuthFormErrors, AuthFormValues } from '../utils/validation';

const EMPTY_VALUES: AuthFormValues = { fullName: '', phone: '', email: '', password: '' };

/** State and submit logic for the combined login / register form. */
export function useAuthForm() {
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [isRegister, setIsRegister] = useState(false);
  const [values, setValues] = useState<AuthFormValues>(EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AuthFormErrors>({});
  const [requestError, setRequestError] = useState<unknown>(null);
  const [registered, setRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const setField = (field: AuthField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleMode = () => {
    setIsRegister((current) => !current);
    setFieldErrors({});
    setRequestError(null);
    setRegistered(false);
  };

  const submit = async () => {
    const errors = validateAuthForm(values, isRegister);
    setFieldErrors(errors);
    setRegistered(false);
    setRequestError(null);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(values);
        setRegistered(true);
        setIsRegister(false);
        setValues((current) => ({ ...current, fullName: '', phone: '', password: '' }));
      } else {
        await login(values);
      }
    } catch (error) {
      setRequestError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isRegister,
    values,
    fieldErrors,
    errorText: requestError === null ? null : errorMessage(requestError, t),
    registered,
    submitting,
    setField,
    toggleMode,
    submit,
  };
}
