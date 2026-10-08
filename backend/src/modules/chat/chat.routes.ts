import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { chatLimiter } from '../../middleware/rate-limiters';
import type { ChatService } from './chat.service';

const sendMessageSchema = z.object({
  message: z.string().trim().min(1).max(500),
  sessionId: z.string().uuid(),
});

const sessionParamsSchema = z.object({ sessionId: z.string().uuid() });

export function createChatRouter(chat: ChatService, authenticate: RequestHandler): Router {
  const router = Router();
  router.use(authenticate);

  router.post('/', chatLimiter, async (req, res) => {
    const { message, sessionId } = sendMessageSchema.parse(req.body);
    res.json(await chat.sendMessage(req.user!.id, sessionId, message));
  });

  router.get('/sessions', async (req, res) => {
    res.json({ sessions: await chat.listSessions(req.user!.id) });
  });

  router.get('/sessions/:sessionId', async (req, res) => {
    const { sessionId } = sessionParamsSchema.parse(req.params);
    res.json({ turns: await chat.getSessionTurns(req.user!.id, sessionId) });
  });

  return router;
}
