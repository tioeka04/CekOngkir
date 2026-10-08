import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tint: string;
  color: string;
}

export function StatCard({ label, value, icon, tint, color }: StatCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.icon} style={{ background: tint, color }}>
        {icon}
      </div>
      <div>
        <span className={styles.label}>{label}</span>
        <strong className={styles.value}>{value}</strong>
      </div>
    </div>
  );
}
