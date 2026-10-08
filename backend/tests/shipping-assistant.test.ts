import { describe, expect, it, vi } from 'vitest';
import { ShippingAssistant } from '../src/modules/llm/shipping-assistant';

const assistantReturning = (raw: string) =>
  new ShippingAssistant({ complete: vi.fn().mockResolvedValue(raw) });

describe('ShippingAssistant', () => {
  it('returns a follow-up question while details are missing', async () => {
    const result = await assistantReturning('{"reply":"Berat paketnya berapa kg?","quote":null}').respond(
      [],
      'cek ongkir jakarta ke bandung',
    );
    expect(result).toEqual({ reply: 'Berat paketnya berapa kg?', quote: null });
  });

  it('returns a validated quote once everything is known', async () => {
    const raw = JSON.stringify({
      reply: 'Siap!',
      quote: { origin: 'Jakarta', destination: 'Bali', weight_kg: 2, preference: 'cheapest' },
    });
    const result = await assistantReturning(raw).respond([], 'jakarta ke bali 2kg termurah');
    expect(result.quote).toEqual({
      origin: 'Jakarta',
      destination: 'Bali',
      weight_kg: 2,
      preference: 'cheapest',
    });
  });

  it('rejects quotes that fail validation (negative or absurd weight, bad preference)', async () => {
    const bad = (quote: object) => JSON.stringify({ reply: 'x', quote });
    const base = { origin: 'A', destination: 'B', weight_kg: 1, preference: 'all' };

    for (const quote of [
      { ...base, weight_kg: -1 },
      { ...base, weight_kg: 100_000 },
      { ...base, preference: 'free' },
    ]) {
      const result = await assistantReturning(bad(quote)).respond([], 'hi');
      expect(result.quote).toBeNull();
    }
  });

  it('falls back to a polite message when the model does not return JSON', async () => {
    const result = await assistantReturning('Sure! Here is some prose.').respond([], 'hi');
    expect(result.quote).toBeNull();
    expect(result.reply).not.toBe('');
  });

  it('appends the system note after the user message', async () => {
    const complete = vi.fn().mockResolvedValue('{"reply":"ok","quote":null}');
    await new ShippingAssistant({ complete }).respond([], 'halo', 'NOTE');

    const messages = complete.mock.calls[0]?.[0] as { role: string; content: string }[];
    expect(messages.at(-1)).toEqual({ role: 'system', content: 'NOTE' });
    expect(messages.at(-2)).toEqual({ role: 'user', content: 'halo' });
  });
});
