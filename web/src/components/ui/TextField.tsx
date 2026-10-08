import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import styles from './TextField.module.css';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  hint?: string;
}

export function TextField({ label, icon, hint, ...inputProps }: TextFieldProps) {
  const inputId = useId();
  return (
    <div className={styles.group}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        {icon}
        <input id={inputId} className={styles.input} {...inputProps} />
      </div>
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
