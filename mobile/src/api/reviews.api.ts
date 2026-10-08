import type { ReviewInput } from '../types/api';
import { request } from './client';

export function submitReview(input: ReviewInput): Promise<{ message: string }> {
  return request('/reviews', { method: 'POST', body: input });
}
