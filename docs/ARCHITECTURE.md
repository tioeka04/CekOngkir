# Architecture

## Backend (`backend/src`)

```
server.ts             composition root: builds every object and wires dependencies
app.ts                createApp(deps): Express app, middleware, routers (easy to test)
config/env.ts         Zod-validated environment, fails fast with a readable message
db/supabase.ts        two clients: anon (auth) and service-role (database)
lib/                  AppError hierarchy, logger, fetch wrapper with timeout
middleware/           authenticate / requireAdmin, error handler, rate limiters
modules/
  auth/               AuthService (Supabase Auth, admin check) + routes
  chat/               ChatService (use case), ChatRepository (DB), routes
  llm/                GroqClient, ShippingAssistant (validated JSON output), prompts
  shipping/           RajaOngkirClient, CityResolver, ShippingService, sorting rules
  reviews/ admin/     repositories, StatsService, date-range logic
  telegram/           optional TelegramGateway reusing ChatService
```

### Request flow for one chat message

1. `POST /api/chat` → `authenticate` verifies the JWT → Zod validates the body.
2. `ChatService` loads the last 10 turns of that session (always scoped to the user).
3. `ShippingAssistant` asks the LLM for a JSON answer: either a follow-up question or a complete *quote request*. The JSON is validated (weight range, allowed preferences, string lengths).
4. For a quote request, `ShippingService` resolves both cities (`CityResolver`: aliases, matching rules, 1-hour cache), fetches rates from RajaOngkir, sorts them with `sortByPreference` and logs the search.
5. If a city is unknown or no rates exist, the assistant is called again with a system note so it can explain in the user's language.
6. The turn (text + structured rates) is stored and returned to the client.

### Design decisions

- **The LLM never produces prices.** It only extracts intent; prices come from the courier API. This removes hallucinated rates and makes the behavior testable.
- **Structured output over regex.** The model is forced into JSON mode and validated with Zod, replacing the original "find a JSON blob in free text" approach.
- **Constructor injection, no framework.** Classes depend on small `Pick<…>` interfaces, so unit tests use plain fakes instead of mocking libraries or a real database.
- **One error format.** Everything throws `AppError` subclasses; one handler maps them to `{ error: { code, message } }`.
- **Server-side conversation state.** Clients send only the new message and a session id, so history cannot be forged and every client (web, mobile, Telegram) behaves the same.
- **Authorization on the server.** Admin = email listed in `ADMIN_EMAILS`, checked from the verified token, never from client-supplied data.

## Web (`web/src`)

`api/` (typed fetch client with refresh-on-401, endpoint modules) · `context/` (auth + language) · `hooks/` (all state and side effects) · `components/` (presentational, grouped by feature, CSS modules) · `pages/` (thin route components) · `layouts/` · `i18n/` (typed keys: a missing translation is a compile error) · `utils/`.

## Mobile (`mobile/src`)

Same layering as the web app: `api/`, `context/`, `hooks/`, `components/`, `screens/`, `navigation/`, `i18n/`, `theme/` (design tokens), `storage/` (tokens in the OS keychain through `expo-secure-store`).

## Known limitations / ideas

- Admin statistics aggregate in application code; for large datasets move them to a SQL function / view.
- The sessions list scans the latest 500 turns; add a dedicated `chat_sessions` table if conversations grow large.
- The web app stores tokens in `localStorage` (simple, but exposed to XSS); an HttpOnly-cookie flow would be stricter.
