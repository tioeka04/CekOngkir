import { requestJson } from '../../lib/http';
import type { LlmMessage } from '../../types/domain';

const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices?: { message?: { content?: string } }[];
}

/** Minimal client for Groq's OpenAI-compatible chat completions API. */
export class GroqClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  /** Returns the assistant message. `json: true` forces the model to answer with a JSON object. */
  async complete(messages: LlmMessage[], { json = false }: { json?: boolean } = {}): Promise<string> {
    const body = await requestJson<GroqResponse>('Groq', ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.3,
        ...(json && { response_format: { type: 'json_object' } }),
      }),
      timeoutMs: 20_000,
    });

    return body.choices?.[0]?.message?.content?.trim() ?? '';
  }
}
