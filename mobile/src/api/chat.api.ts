import type { ChatReply, ChatSessionSummary, ChatTurn } from '../types/api';
import { request } from './client';

export function sendMessage(message: string, sessionId: string): Promise<ChatReply> {
  return request('/chat', { method: 'POST', body: { message, sessionId } });
}

export async function fetchSessions(): Promise<ChatSessionSummary[]> {
  const { sessions } = await request<{ sessions: ChatSessionSummary[] }>('/chat/sessions');
  return sessions;
}

export async function fetchSessionTurns(sessionId: string): Promise<ChatTurn[]> {
  const { turns } = await request<{ turns: ChatTurn[] }>(`/chat/sessions/${sessionId}`);
  return turns;
}
