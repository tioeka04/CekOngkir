import { describe, expect, it, vi } from 'vitest';
import { ChatService, turnsToLlmMessages } from '../src/modules/chat/chat.service';
import type { ChatTurn, ShippingResult } from '../src/types/domain';

const shippingResult: ShippingResult = {
  originName: 'Jakarta',
  destinationName: 'Bali',
  weightKg: 2,
  preference: 'cheapest',
  options: [{ courier: 'JNE', service: 'REG', description: '', cost: 30_000, etd: '3 hari' }],
};

const quote = { origin: 'Jakarta', destination: 'Bali', weight_kg: 2, preference: 'cheapest' as const };

function setup(overrides: { quoteOutcome?: unknown; assistantReplies?: unknown[] } = {}) {
  const respond = vi.fn();
  (overrides.assistantReplies ?? [{ reply: 'confirm', quote }]).forEach((reply) =>
    respond.mockResolvedValueOnce(reply),
  );
  const shipping = {
    quote: vi.fn().mockResolvedValue(overrides.quoteOutcome ?? { kind: 'success', result: shippingResult }),
  };
  const chats = {
    getSessionTurns: vi.fn().mockResolvedValue([]),
    saveTurn: vi.fn().mockResolvedValue(undefined),
    listSessions: vi.fn(),
  };
  return { service: new ChatService({ respond }, shipping, chats), respond, shipping, chats };
}

describe('ChatService.sendMessage', () => {
  it('returns shipping rates (and no text) when the assistant produced a quote', async () => {
    const { service, chats, shipping } = setup();

    const reply = await service.sendMessage('u1', 's1', 'jakarta ke bali 2kg termurah');

    expect(reply).toEqual({ sessionId: 's1', reply: '', shipping: shippingResult });
    expect(shipping.quote).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', origin: 'Jakarta', weightKg: 2 }),
    );
    expect(chats.saveTurn).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', sessionId: 's1', shipping: shippingResult }),
    );
  });

  it('passes the assistant question straight through when no quote is ready', async () => {
    const { service, shipping } = setup({
      assistantReplies: [{ reply: 'Berat berapa kg?', quote: null }],
    });

    const reply = await service.sendMessage('u1', 's1', 'ongkir ke bali');

    expect(reply).toMatchObject({ reply: 'Berat berapa kg?', shipping: null });
    expect(shipping.quote).not.toHaveBeenCalled();
  });

  it('asks the assistant to explain an unknown city', async () => {
    const { service, respond } = setup({
      quoteOutcome: { kind: 'city_not_found', cityName: 'Gotham' },
      assistantReplies: [{ reply: 'x', quote }, { reply: 'Kota tidak ditemukan', quote: null }],
    });

    const reply = await service.sendMessage('u1', 's1', 'gotham ke bali 2kg');

    expect(reply).toMatchObject({ reply: 'Kota tidak ditemukan', shipping: null });
    expect(respond.mock.calls[1]?.[2]).toContain('Gotham');
  });

  it('feeds previous turns to the assistant as context', async () => {
    const { service, chats, respond } = setup({ assistantReplies: [{ reply: 'ok', quote: null }] });
    const previous: ChatTurn = {
      id: '1',
      sessionId: 's1',
      userMessage: 'halo',
      botReply: 'Hai!',
      shipping: null,
      createdAt: '',
    };
    chats.getSessionTurns.mockResolvedValue([previous]);

    await service.sendMessage('u1', 's1', 'lanjut');

    expect(respond.mock.calls[0]?.[0]).toEqual([
      { role: 'user', content: 'halo' },
      { role: 'assistant', content: 'Hai!' },
    ]);
  });
});

describe('turnsToLlmMessages', () => {
  it('replaces rendered shipping cards with a short placeholder', () => {
    const turn: ChatTurn = {
      id: '1',
      sessionId: 's',
      userMessage: 'cek',
      botReply: '',
      shipping: shippingResult,
      createdAt: '',
    };
    expect(turnsToLlmMessages([turn])[1]?.content).toMatch(/Shipping rates/);
  });
});
