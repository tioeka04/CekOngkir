import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  icon?: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className}`} {...rest}>
      {icon}
      {children}
    </button>
  );
}
