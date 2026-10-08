import type { SupabaseClient } from '@supabase/supabase-js';
import { UpstreamError } from '../../lib/errors';
import type { ChatSessionSummary, ChatTurn, ShippingResult } from '../../types/domain';

interface ChatRow {
  id: string;
  user_id: string;
  session_id: string;
  user_message: string;
  bot_reply: string | null;
  shipping_data: ShippingResult | null;
  created_at: string;
}

export interface NewChatTurn {
  userId: string;
  sessionId: string;
  userMessage: string;
  botReply: string;
  shipping: ShippingResult | null;
}

const SESSION_SCAN_LIMIT = 500;

const toTurn = (row: ChatRow): ChatTurn => ({
  id: row.id,
  sessionId: row.session_id,
  userMessage: row.user_message,
  botReply: row.bot_reply ?? '',
  shipping: row.shipping_data,
  createdAt: row.created_at,
});

/** Persistence for chat conversations (one row = one user message + bot answer). */
export class ChatRepository {
  constructor(private readonly db: SupabaseClient) {}

  async saveTurn(turn: NewChatTurn): Promise<void> {
    const { error } = await this.db.from('chat_history').insert({
      user_id: turn.userId,
      session_id: turn.sessionId,
      user_message: turn.userMessage,
      bot_reply: turn.botReply,
      shipping_data: turn.shipping,
    });
    if (error) throw new UpstreamError('Database', error);
  }

  /** Turns of one session, oldest first. Always scoped to the owner. */
  async getSessionTurns(userId: string, sessionId: string, limit?: number): Promise<ChatTurn[]> {
    let query = this.db
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: !limit });
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw new UpstreamError('Database', error);

    const turns = (data as ChatRow[]).map(toTurn);
    return limit ? turns.reverse() : turns;
  }

  /** One entry per conversation, newest first; the title is the first message of the session. */
  async listSessions(userId: string): Promise<ChatSessionSummary[]> {
    const { data, error } = await this.db
      .from('chat_history')
      .select('session_id, user_message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(SESSION_SCAN_LIMIT);
    if (error) throw new UpstreamError('Database', error);

    const sessions = new Map<string, ChatSessionSummary>();
    for (const row of data as Pick<ChatRow, 'session_id' | 'user_message' | 'created_at'>[]) {
      const existing = sessions.get(row.session_id);
      if (!existing) {
        sessions.set(row.session_id, {
          sessionId: row.session_id,
          title: row.user_message,
          lastMessageAt: row.created_at,
        });
      } else {
        // Rows arrive newest first, so the last one seen is the opening message.
        existing.title = row.user_message;
      }
    }
    return [...sessions.values()];
  }
}
