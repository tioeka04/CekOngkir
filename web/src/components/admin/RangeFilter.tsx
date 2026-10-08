import type { StatsRange } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import type { TranslationKey } from '../../i18n/translate';
import styles from './RangeFilter.module.css';

const RANGES: StatsRange[] = ['today', 'week', 'month', 'year', 'all'];

interface RangeFilterProps {
  value: StatsRange;
  onChange: (range: StatsRange) => void;
}

export function RangeFilter({ value, onChange }: RangeFilterProps) {
  const { t } = useLanguage();
  return (
    <div className={styles.filter} role="group">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={`${styles.option} ${range === value ? styles.active : ''}`}
          aria-pressed={range === value}
          onClick={() => onChange(range)}
        >
          {t(`admin.range.${range}` as TranslationKey)}
        </button>
      ))}
    </div>
  );
}
