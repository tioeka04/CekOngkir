import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, NotFoundError, ValidationError } from '../lib/errors';
import { logger } from '../lib/logger';

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new NotFoundError('Route not found'));
};

/** Converts every thrown error into the `{ error: { code, message } }` response format. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const appError =
    error instanceof ZodError
      ? new ValidationError('Invalid request', error.issues.map(({ path, message }) => ({ path: path.join('.'), message })))
      : error;

  if (appError instanceof AppError) {
    if (appError.status >= 500) logger.error({ err: error }, appError.message);
    res.status(appError.status).json({
      error: { code: appError.code, message: appError.message, details: appError.details },
    });
    return;
  }

  logger.error({ err: error }, 'Unhandled error');
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
