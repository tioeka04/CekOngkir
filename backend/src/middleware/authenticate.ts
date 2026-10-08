import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../lib/errors';
import type { AuthService } from '../modules/auth/auth.service';

/** Requires a valid `Authorization: Bearer <token>` header and exposes the user as `req.user`. */
export function authenticate(auth: Pick<AuthService, 'verifyToken'>): RequestHandler {
  return async (req, _res, next) => {
    const [scheme, token] = (req.headers.authorization ?? '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedError();

    req.user = await auth.verifyToken(token);
    next();
  };
}

/** Must run after `authenticate`. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) throw new UnauthorizedError();
  if (!req.user.isAdmin) throw new ForbiddenError('Admin access required');
  next();
};
