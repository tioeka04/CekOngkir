import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { authenticate } from '../src/middleware/authenticate';
import type { AuthService } from '../src/modules/auth/auth.service';
import type { ChatService } from '../src/modules/chat/chat.service';
import type { StatsService } from '../src/modules/admin/stats.service';
import type { ReviewRepository } from '../src/modules/reviews/review.repository';
import { UnauthorizedError } from '../src/lib/errors';
import type { User } from '../src/types/domain';

const member: User = { id: 'u1', email: 'member@test.dev', fullName: 'Member', phone: null, isAdmin: false };
const admin: User = { ...member, id: 'u2', email: 'admin@test.dev', isAdmin: true };
const SESSION_ID = '5f1a4c1e-8f43-4a56-9c0e-2f1f3a1b2c3d';

function buildApp() {
  const auth = {
    verifyToken: vi.fn(async (token: string) => {
      if (token === 'member-token') return member;
      if (token === 'admin-token') return admin;
      throw new UnauthorizedError('Invalid or expired token');
    }),
    login: vi.fn(),
    register: vi.fn(),
  } as unknown as AuthService;

  const chat = {
    sendMessage: vi.fn().mockResolvedValue({ sessionId: SESSION_ID, reply: 'Halo!', shipping: null }),
    listSessions: vi.fn().mockResolvedValue([]),
    getSessionTurns: vi.fn().mockResolvedValue([]),
  } as unknown as ChatService;

  const stats = { getStats: vi.fn().mockResolvedValue({ range: 'all' }) } as unknown as StatsService;
  const reviews = { create: vi.fn().mockResolvedValue(undefined) } as unknown as ReviewRepository;

  const app = createApp({ corsOrigins: [], authenticate: authenticate(auth), auth, chat, reviews, stats });
  return { app, chat, stats, reviews };
}

describe('API', () => {
  it('GET /api/health is public', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('returns the standard error format for unknown routes', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  describe('authentication', () => {
    it('rejects requests without a token', async () => {
      const { app } = buildApp();
      const res = await request(app).get('/api/chat/sessions');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects an invalid token', async () => {
      const { app } = buildApp();
      const res = await request(app).get('/api/chat/sessions').set('Authorization', 'Bearer nope');
      expect(res.status).toBe(401);
    });

    it('does not accept the old "admin email as token" trick', async () => {
      const { app } = buildApp();
      const res = await request(app).get('/api/admin/stats').set('Authorization', 'admin@cekongkir.com');
      expect(res.status).toBe(401);
    });
  });

  describe('admin', () => {
    it('forbids normal users', async () => {
      const { app } = buildApp();
      const res = await request(app).get('/api/admin/stats').set('Authorization', 'Bearer member-token');
      expect(res.status).toBe(403);
    });

    it('serves stats to admins and validates the range', async () => {
      const { app, stats } = buildApp();
      const ok = await request(app).get('/api/admin/stats?range=week').set('Authorization', 'Bearer admin-token');
      expect(ok.status).toBe(200);
      expect(stats.getStats).toHaveBeenCalledWith('week');

      const bad = await request(app).get('/api/admin/stats?range=decade').set('Authorization', 'Bearer admin-token');
      expect(bad.status).toBe(400);
    });
  });

  describe('chat', () => {
    it('sends a message on behalf of the authenticated user', async () => {
      const { app, chat } = buildApp();
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', 'Bearer member-token')
        .send({ message: 'cek ongkir', sessionId: SESSION_ID });

      expect(res.status).toBe(200);
      expect(res.body.reply).toBe('Halo!');
      expect(chat.sendMessage).toHaveBeenCalledWith('u1', SESSION_ID, 'cek ongkir');
    });

    it('validates the body', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/api/chat')
        .set('Authorization', 'Bearer member-token')
        .send({ message: '', sessionId: 'not-a-uuid' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('reviews', () => {
    it('stores a valid review for the authenticated user', async () => {
      const { app, reviews } = buildApp();
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer member-token')
        .send({ rating: 5, comment: 'Mantap' });

      expect(res.status).toBe(201);
      expect(reviews.create).toHaveBeenCalledWith('u1', 5, 'Mantap');
    });

    it('rejects out-of-range ratings', async () => {
      const { app } = buildApp();
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', 'Bearer member-token')
        .send({ rating: 9 });
      expect(res.status).toBe(400);
    });
  });
});
