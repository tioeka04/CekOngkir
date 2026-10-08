import { z } from 'zod';
import type { LlmMessage } from '../../types/domain';
import type { GroqClient } from './groq.client';
import { SHIPPING_ASSISTANT_PROMPT } from './prompts';

const MAX_WEIGHT_KG = 500;
const FALLBACK_REPLY =
  'Maaf, bisa diulangi? / Sorry, could you rephrase that?';

const quoteSchema = z.object({
  origin: z.string().trim().min(1).max(60),
  destination: z.string().trim().min(1).max(60),
  weight_kg: z.number().positive().max(MAX_WEIGHT_KG),
  preference: z.enum(['cheapest', 'fastest', 'best_value', 'all']),
});

const assistantReplySchema = z.object({
  reply: z.string().default(''),
  quote: quoteSchema.nullable().default(null),
});

export type QuoteIntent = z.infer<typeof quoteSchema>;
export type AssistantReply = z.infer<typeof assistantReplySchema>;

/**
 * Conversational layer: turns the chat so far into either a follow-up question
 * or a complete quote request. Its output is validated, so a misbehaving model
 * can never push unchecked data into the rest of the system.
 */
export class ShippingAssistant {
  constructor(private readonly llm: Pick<GroqClient, 'complete'>) {}

  async respond(
    history: LlmMessage[],
    userMessage: string,
    systemNote?: string,
  ): Promise<AssistantReply> {
    const messages: LlmMessage[] = [
      { role: 'system', content: SHIPPING_ASSISTANT_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
      ...(systemNote ? [{ role: 'system' as const, content: systemNote }] : []),
    ];

    const raw = await this.llm.complete(messages, { json: true });
    return this.parse(raw);
  }

  private parse(raw: string): AssistantReply {
    try {
      const parsed = assistantReplySchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      // fall through to the fallback below
    }
    return { reply: FALLBACK_REPLY, quote: null };
  }
}
