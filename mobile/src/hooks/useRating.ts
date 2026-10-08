import { useState } from 'react';

import { reviewsApi } from '../api';

type RatingStatus = 'idle' | 'submitting' | 'done';

/** Submits a one-shot star rating for a shipping result. */
export function useRating(routeLabel: string) {
  const [status, setStatus] = useState<RatingStatus>('idle');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState<unknown>(null);

  const rate = async (value: number) => {
    if (status !== 'idle') return;
    setRating(value);
    setStatus('submitting');
    setError(null);
    try {
      await reviewsApi.submitReview({ rating: value, comment: routeLabel });
      setStatus('done');
    } catch (caught) {
      setError(caught);
      setStatus('idle');
    }
  };

  return { rating, status, error, rate };
}
