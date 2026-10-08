import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import type { ReviewRepository } from './review.repository';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).default(''),
});

export function createReviewRouter(reviews: ReviewRepository, authenticate: RequestHandler): Router {
  const router = Router();

  router.post('/', authenticate, async (req, res) => {
    const { rating, comment } = createReviewSchema.parse(req.body);
    await reviews.create(req.user!.id, rating, comment);
    res.status(201).json({ message: 'Review saved.' });
  });

  return router;
}
