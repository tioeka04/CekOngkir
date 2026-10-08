import { Activity, User } from 'lucide-react';
import { useState } from 'react';
import type { StatsRange } from '../api/types';
import { RangeFilter } from '../components/admin/RangeFilter';
import { ReviewList } from '../components/admin/ReviewList';
import { RoutesChart } from '../components/admin/RoutesChart';
import { StatCard } from '../components/admin/StatCard';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { Notice } from '../components/ui/Notice';
import { useLanguage } from '../context/language-context';
import { useAdminStats } from '../hooks/useAdminStats';
import styles from './AdminPage.module.css';

export function AdminPage() {
  const { t } = useLanguage();
  const [range, setRange] = useState<StatsRange>('all');
  const { stats, error, loading } = useAdminStats(range);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t('admin.title')}</h1>
          <p>{t('admin.subtitle')}</p>
        </div>
        <div className={styles.controls}>
          <LanguageToggle />
          <RangeFilter value={range} onChange={setRange} />
        </div>
      </header>

      {error && !stats && <Notice tone="error">{t('admin.error')}</Notice>}
      {loading && <p className={styles.loading}>{t('admin.loading')}</p>}

      {stats && (
        <>
          <div className={styles.cards}>
            <StatCard label={t('admin.searches')} value={stats.totalSearches} icon={<Activity size={28} />} tint="var(--primary-light)" color="var(--primary)" />
            <StatCard label={t('admin.totalUsers')} value={stats.totalUsers} icon={<User size={28} />} tint="#eefbf7" color="#10b981" />
            <StatCard
              label={t('admin.online')}
              value={
                <>
                  {stats.activeUsers}
                  {stats.activeUsers > 0 && <span className={styles.liveDot} />}
                </>
              }
              icon={<Activity size={28} />}
              tint="var(--danger-light)"
              color="var(--danger)"
            />
            <StatCard label={t('admin.avgRating')} value={`${stats.ratings.average} / 5.0`} icon="⭐" tint="#fff9ee" color="var(--star)" />
          </div>

          <div className={styles.grid}>
            <RoutesChart routes={stats.topRoutes} />
            <ReviewList reviews={stats.recentReviews} />
          </div>
        </>
      )}
    </main>
  );
}
