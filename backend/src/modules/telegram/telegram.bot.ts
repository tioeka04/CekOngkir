import { createHash } from 'node:crypto';
import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../../lib/logger';
import type { ChatService } from '../chat/chat.service';
import type { ShippingResult } from '../../types/domain';

const COURIER_EMOJI: [match: string, emoji: string][] = [
  ['jne', '🦅'],
  ['j&t', '🔴'],
  ['sicepat', '⚡'],
  ['pos', '🏤'],
  ['tiki', '🚚'],
  ['anteraja', '🏃'],
];

const courierEmoji = (name: string) =>
  COURIER_EMOJI.find(([match]) => name.toLowerCase().includes(match))?.[1] ?? '🔹';

/** Telegram chat ids are not UUIDs, so derive stable, deterministic ones for our tables. */
export function telegramUuid(namespace: string, chatId: number | string): string {
  const hex = createHash('md5').update(`${namespace}-${chatId}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function formatShippingMessage(result: ShippingResult): string {
  const lines = result.options.map(
    (option) =>
      `${courierEmoji(option.courier)} *${option.courier.toUpperCase()}* - ${option.service}\n` +
      `   Rp ${option.cost.toLocaleString('id-ID')}` +
      (option.etd ? ` • ${option.etd}` : ''),
  );
  return [
    `📦 *${result.originName} ➡️ ${result.destinationName}* (${result.weightKg} kg)`,
    '',
    ...lines,
  ].join('\n');
}

/** Optional Telegram front-end that reuses the same ChatService as the web and mobile apps. */
export class TelegramGateway {
  private readonly bot: TelegramBot;

  constructor(
    token: string,
    private readonly chat: Pick<ChatService, 'sendMessage'>,
  ) {
    this.bot = new TelegramBot(token, { polling: true });
  }

  start(): void {
    this.bot.on('message', (message) => {
      void this.handle(message).catch((error: unknown) => {
        logger.error({ err: error }, 'Telegram handler failed');
        void this.bot.sendMessage(message.chat.id, 'Maaf, sistem sedang sibuk. Coba lagi nanti ya.');
      });
    });
    logger.info('Telegram bot is running');
  }

  stop(): Promise<void> {
    return this.bot.stopPolling();
  }

  private async handle(message: TelegramBot.Message): Promise<void> {
    const chatId = message.chat.id;
    const text = message.text?.trim();
    if (!text) return;

    if (text === '/start') {
      await this.bot.sendMessage(chatId, 'Halo! Saya Ongkir AI. Mau cek ongkir ke mana hari ini?');
      return;
    }

    void this.bot.sendChatAction(chatId, 'typing');
    const reply = await this.chat.sendMessage(
      telegramUuid('user', chatId),
      telegramUuid('session', chatId),
      text,
    );

    if (reply.reply) await this.bot.sendMessage(chatId, reply.reply);
    if (reply.shipping) {
      await this.bot.sendMessage(chatId, formatShippingMessage(reply.shipping), {
        parse_mode: 'Markdown',
      });
    }
  }
}
