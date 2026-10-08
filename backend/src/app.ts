import cors from 'cors';
import express, { type Express, type RequestHandler } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import { globalLimiter } from './middleware/rate-limiters';
import { createAdminRouter } from './modules/admin/admin.routes';
import type { StatsService } from './modules/admin/stats.service';
import { createAuthRouter } from './modules/auth/auth.routes';
import type { AuthService } from './modules/auth/auth.service';
import { createChatRouter } from './modules/chat/chat.routes';
import type { ChatService } from './modules/chat/chat.service';
import { createReviewRouter } from './modules/reviews/review.routes';
import type { ReviewRepository } from './modules/reviews/review.repository';

export interface AppDependencies {
  corsOrigins: string[];
  authenticate: RequestHandler;
  auth: AuthService;
  chat: ChatService;
  reviews: ReviewRepository;
  stats: StatsService;
}

/** Builds the Express app from already-constructed services (makes it trivial to test). */
export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.set('trust proxy', 1); // correct client IPs behind Render / Vercel proxies
  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigins.length ? deps.corsOrigins : false }));
  app.use(express.json({ limit: '20kb' }));
  app.use(
    pinoHttp({
      logger,
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({ id: req.id, method: req.method, url: req.url }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
    }),
  );
  app.use('/api', globalLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/auth', createAuthRouter(deps.auth, deps.authenticate));
  app.use('/api/chat', createChatRouter(deps.chat, deps.authenticate));
  app.use('/api/reviews', createReviewRouter(deps.reviews, deps.authenticate));
  app.use('/api/admin', createAdminRouter(deps.stats, deps.authenticate));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
