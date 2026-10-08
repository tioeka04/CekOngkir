import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../../middleware/authenticate';
import { STATS_RANGES } from './date-range';
import type { StatsService } from './stats.service';

const statsQuerySchema = z.object({ range: z.enum(STATS_RANGES).default('all') });

export function createAdminRouter(stats: StatsService, authenticate: RequestHandler): Router {
  const router = Router();
  router.use(authenticate, requireAdmin);

  router.get('/stats', async (req, res) => {
    const { range } = statsQuerySchema.parse(req.query);
    res.json(await stats.getStats(range));
  });

  return router;
}
