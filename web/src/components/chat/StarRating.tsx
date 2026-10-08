import { useState } from 'react';
import { useLanguage } from '../../context/language-context';
import styles from './StarRating.module.css';

interface StarRatingProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export function StarRating({ onRate, disabled }: StarRatingProps) {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState(0);

  return (
    <div className={styles.stars} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${styles.star} ${star <= hovered ? styles.lit : ''}`}
          onMouseEnter={() => setHovered(star)}
          onClick={() => onRate(star)}
          disabled={disabled}
          aria-label={t('shipping.rateStar', { count: star })}
        >
          ★
        </button>
      ))}
    </div>
  );
}
