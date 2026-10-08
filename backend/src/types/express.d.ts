import type { User } from './domain';

declare global {
  namespace Express {
    interface Request {
      /** Set by the `authenticate` middleware. */
      user?: User;
    }
  }
}

export {};
