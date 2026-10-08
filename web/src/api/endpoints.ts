import { request } from './http-client';
import type {
  AdminStats,
  AuthPayload,
  ChatReply,
  ChatSessionSummary,
  ChatTurn,
  RegisterInput,
  StatsRange,
  User,
} from './types';

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthPayload>('/api/auth/login', { method: 'POST', body: { email, password }, anonymous: true }),

  register: (input: RegisterInput) =>
    request<{ message: string }>('/api/auth/register', { method: 'POST', body: input, anonymous: true }),

  me: () => request<{ user: User }>('/api/auth/me').then(({ user }) => user),
};

export const chatApi = {
  send: (message: string, sessionId: string) =>
    request<ChatReply>('/api/chat', { method: 'POST', body: { message, sessionId } }),

  listSessions: () =>
    request<{ sessions: ChatSessionSummary[] }>('/api/chat/sessions').then(({ sessions }) => sessions),

  getSession: (sessionId: string) =>
    request<{ turns: ChatTurn[] }>(`/api/chat/sessions/${sessionId}`).then(({ turns }) => turns),
};

export const reviewsApi = {
  create: (rating: number, comment: string) =>
    request<{ message: string }>('/api/reviews', { method: 'POST', body: { rating, comment } }),
};

export const adminApi = {
  getStats: (range: StatsRange) => request<AdminStats>(`/api/admin/stats?range=${range}`),
};
