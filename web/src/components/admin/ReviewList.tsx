import type { AdminStats } from '../../api/types';
import { useLanguage } from '../../context/language-context';
import { formatShortDate } from '../../utils/format';
import styles from './Panel.module.css';

export function ReviewList({ reviews }: { reviews: AdminStats['recentReviews'] }) {
  const { t, language } = useLanguage();

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('admin.recentReviews')}</h3>
        <span className={styles.badge}>{t('admin.reviewCount', { count: reviews.length })}</span>
      </div>

      {reviews.length === 0 ? (
        <p className={styles.empty}>{t('admin.noReviews')}</p>
      ) : (
        <ul className={styles.reviews}>
          {reviews.map((review) => (
            <li key={review.id} className={styles.review}>
              <div className={styles.reviewTop}>
                <span className={styles.stars} aria-label={`${review.rating}/5`}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </span>
                <span className={styles.date}>{formatShortDate(review.createdAt, language === 'id' ? 'id-ID' : 'en-US')}</span>
              </div>
              <p>{review.comment || t('admin.noComment')}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
