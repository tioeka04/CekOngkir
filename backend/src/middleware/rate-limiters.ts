import { rateLimit } from 'express-rate-limit';

const limiter = (windowMinutes: number, max: number) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please slow down.' },
      });
    },
  });

/** Applied to the whole API. */
export const globalLimiter = limiter(1, 120);
/** Login / register: slows down password guessing. */
export const authLimiter = limiter(15, 20);
/** Every chat message costs an LLM call, so keep this tight. */
export const chatLimiter = limiter(1, 20);
