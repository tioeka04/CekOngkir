import type { ChatTurn } from '../types/api';
import type { ChatMessage } from '../types/chat';

/** Expands stored turns (one row per exchange) into alternating user/bot messages. */
export function turnsToMessages(turns: ChatTurn[]): ChatMessage[] {
  return turns.flatMap((turn) => {
    const userMessage: ChatMessage = {
      id: `${turn.id}-user`,
      role: 'user',
      text: turn.userMessage,
      shipping: null,
      createdAt: turn.createdAt,
    };
    const hasBotContent = turn.botReply !== '' || turn.shipping !== null;
    if (!hasBotContent) return [userMessage];
    const botMessage: ChatMessage = {
      id: `${turn.id}-bot`,
      role: 'bot',
      text: turn.botReply,
      shipping: turn.shipping,
      createdAt: turn.createdAt,
    };
    return [userMessage, botMessage];
  });
}
