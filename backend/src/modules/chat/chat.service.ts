import { cityNotFoundNote, noRatesNote } from '../llm/prompts';
import type { ShippingAssistant } from '../llm/shipping-assistant';
import type { ShippingService } from '../shipping/shipping.service';
import type { ChatTurn, LlmMessage, ShippingResult } from '../../types/domain';
import type { ChatRepository } from './chat.repository';

/** How many previous turns the model gets as context. */
const HISTORY_WINDOW = 10;
const NO_ANSWER_REPLY = 'Maaf, aku belum bisa menjawab itu. Coba tanyakan lagi ya. / Sorry, could you rephrase that?';
const SHIPPING_SHOWN_PLACEHOLDER = '[Shipping rates were shown to the user]';

export interface ChatReply {
  sessionId: string;
  reply: string;
  shipping: ShippingResult | null;
}

/** Converts stored turns into the alternating user/assistant messages the LLM expects. */
export function turnsToLlmMessages(turns: ChatTurn[]): LlmMessage[] {
  return turns.flatMap((turn): LlmMessage[] => [
    { role: 'user', content: turn.userMessage },
    { role: 'assistant', content: turn.shipping ? SHIPPING_SHOWN_PLACEHOLDER : turn.botReply },
  ]);
}

/** Use case: handle one user message in a conversation. */
export class ChatService {
  constructor(
    private readonly assistant: Pick<ShippingAssistant, 'respond'>,
    private readonly shipping: Pick<ShippingService, 'quote'>,
    private readonly chats: Pick<ChatRepository, 'getSessionTurns' | 'saveTurn' | 'listSessions'>,
  ) {}

  async sendMessage(userId: string, sessionId: string, message: string): Promise<ChatReply> {
    const history = turnsToLlmMessages(
      await this.chats.getSessionTurns(userId, sessionId, HISTORY_WINDOW),
    );

    let answer = await this.assistant.respond(history, message);
    let shipping: ShippingResult | null = null;

    if (answer.quote) {
      const outcome = await this.shipping.quote({
        userId,
        origin: answer.quote.origin,
        destination: answer.quote.destination,
        weightKg: answer.quote.weight_kg,
        preference: answer.quote.preference,
      });

      switch (outcome.kind) {
        case 'success':
          shipping = outcome.result;
          answer = { reply: '', quote: null };
          break;
        case 'city_not_found':
          answer = await this.assistant.respond(history, message, cityNotFoundNote(outcome.cityName));
          break;
        case 'no_rates':
          answer = await this.assistant.respond(history, message, noRatesNote);
          break;
      }
    }

    // Never persist or return an empty bubble (e.g. the model ignored the follow-up note).
    const botReply = shipping ? '' : answer.reply || NO_ANSWER_REPLY;

    await this.chats.saveTurn({ userId, sessionId, userMessage: message, botReply, shipping });
    return { sessionId, reply: botReply, shipping };
  }

  listSessions(userId: string) {
    return this.chats.listSessions(userId);
  }

  getSessionTurns(userId: string, sessionId: string) {
    return this.chats.getSessionTurns(userId, sessionId);
  }
}
