import { createApp } from './app';
import { loadEnv } from './config/env';
import { createSupabaseClients } from './db/supabase';
import { logger } from './lib/logger';
import { authenticate } from './middleware/authenticate';
import { StatsService } from './modules/admin/stats.service';
import { AuthService } from './modules/auth/auth.service';
import { ChatRepository } from './modules/chat/chat.repository';
import { ChatService } from './modules/chat/chat.service';
import { GroqClient } from './modules/llm/groq.client';
import { ShippingAssistant } from './modules/llm/shipping-assistant';
import { ReviewRepository } from './modules/reviews/review.repository';
import { CityResolver } from './modules/shipping/city-resolver';
import { RajaOngkirClient } from './modules/shipping/rajaongkir.client';
import { SearchLogRepository } from './modules/shipping/search-log.repository';
import { ShippingService } from './modules/shipping/shipping.service';
import { TelegramGateway } from './modules/telegram/telegram.bot';

/** Composition root: the only place where concrete classes are wired together. */
function main(): void {
  const env = loadEnv();
  const supabase = createSupabaseClients(env);

  const rajaOngkir = new RajaOngkirClient(env.RAJAONGKIR_API_KEY);
  const shipping = new ShippingService(
    new CityResolver(rajaOngkir),
    rajaOngkir,
    new SearchLogRepository(supabase.db),
  );
  const assistant = new ShippingAssistant(new GroqClient(env.GROQ_API_KEY, env.GROQ_MODEL));
  const reviews = new ReviewRepository(supabase.db);
  const auth = new AuthService(supabase.auth, env.ADMIN_EMAILS);
  const chat = new ChatService(assistant, shipping, new ChatRepository(supabase.db));

  const app = createApp({
    corsOrigins: env.CORS_ORIGINS,
    authenticate: authenticate(auth),
    auth,
    chat,
    reviews,
    stats: new StatsService(supabase.db, reviews),
  });

  const server = app.listen(env.PORT, () => logger.info(`API listening on http://localhost:${env.PORT}`));

  const telegram = env.TELEGRAM_BOT_TOKEN ? new TelegramGateway(env.TELEGRAM_BOT_TOKEN, chat) : null;
  telegram?.start();

  const shutdown = () => {
    logger.info('Shutting down');
    void telegram?.stop();
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
