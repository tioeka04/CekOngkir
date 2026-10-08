import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { authLimiter } from '../../middleware/rate-limiters';
import type { AuthService } from './auth.service';

const registerSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(72),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?[0-9]{8,15}$/, 'Phone must contain 8-15 digits'),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

const refreshSchema = z.object({ refreshToken: z.string().min(1) });

export function createAuthRouter(auth: AuthService, authenticate: RequestHandler): Router {
  const router = Router();

  router.post('/register', authLimiter, async (req, res) => {
    await auth.register(registerSchema.parse(req.body));
    res.status(201).json({
      message: 'Registration successful. Check your email to confirm your account before signing in.',
    });
  });

  router.post('/login', authLimiter, async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    res.json(await auth.login(email, password));
  });

  router.post('/refresh', authLimiter, async (req, res) => {
    res.json(await auth.refresh(refreshSchema.parse(req.body).refreshToken));
  });

  router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
  });

  return router;
}
