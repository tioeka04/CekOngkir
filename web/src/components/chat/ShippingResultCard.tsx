import { Activity, ArrowRight, Map, MapPin, Scale } from 'lucide-react';
import { useState } from 'react';
import { reviewsApi } from '../../api/endpoints';
import type { ShippingResult } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import { CourierRow } from './CourierRow';
import { StarRating } from './StarRating';
import styles from './ShippingResultCard.module.css';

type RatingState = 'idle' | 'saving' | 'saved' | 'failed';

export function ShippingResultCard({ result }: { result: ShippingResult }) {
  const { t } = useLanguage();
  const [ratingState, setRatingState] = useState<RatingState>('idle');

  const submitRating = async (rating: number) => {
    setRatingState('saving');
    try {
      await reviewsApi.create(rating, `${result.originName} → ${result.destinationName}`);
      setRatingState('saved');
    } catch {
      setRatingState('failed');
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.route}>
        <div>
          <span className={styles.label}>
            <MapPin size={14} /> {t('shipping.origin')}
          </span>
          <strong>{result.originName}</strong>
        </div>
        <ArrowRight size={28} color="#94a3b8" aria-hidden />
        <div className={styles.end}>
          <span className={styles.label}>
            {t('shipping.destination')} <Map size={14} />
          </span>
          <strong>{result.destinationName}</strong>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Scale size={18} />
          <div>
            <span className={styles.label}>{t('shipping.weight')}</span>
            <strong>{result.weightKg} kg</strong>
          </div>
        </div>
        <div className={styles.stat}>
          <Activity size={18} />
          <div>
            <span className={styles.label}>{t('shipping.options')}</span>
            <strong>{t('shipping.found', { count: result.options.length })}</strong>
          </div>
        </div>
      </div>

      <ul className={styles.options}>
        {result.options.map((option) => (
          <CourierRow key={`${option.courier}-${option.service}`} option={option} />
        ))}
      </ul>

      <footer className={styles.rating}>
        {ratingState === 'saved' ? (
          <p className={styles.thanks}>{t('shipping.rateThanks')}</p>
        ) : (
          <>
            <p className={styles.prompt}>{t('shipping.ratePrompt')}</p>
            <StarRating onRate={submitRating} disabled={ratingState === 'saving'} />
            {ratingState === 'saving' && <p className={styles.hint}>{t('shipping.rateSaving')}</p>}
            {ratingState === 'failed' && <p className={styles.error}>{t('shipping.rateError')}</p>}
          </>
        )}
      </footer>
    </section>
  );
}
