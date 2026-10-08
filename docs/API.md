# API Reference

Base URL (local): `http://localhost:3000`. All routes are prefixed with `/api`.
All bodies are JSON. Protected routes need `Authorization: Bearer <accessToken>`.

## Error format

Every non-2xx response has the same shape:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Human readable message", "details": [] } }
```

| HTTP | `code`             | Meaning                                  |
| ---- | ------------------ | ---------------------------------------- |
| 400  | `VALIDATION_ERROR` | Body/query failed validation             |
| 401  | `UNAUTHORIZED`     | Missing, invalid or expired token        |
| 403  | `FORBIDDEN`        | Authenticated but not an admin           |
| 404  | `NOT_FOUND`        | Resource does not exist                  |
| 429  | `RATE_LIMITED`     | Too many requests                        |
| 502  | `UPSTREAM_ERROR`   | Groq / RajaOngkir / Supabase failed      |
| 500  | `INTERNAL_ERROR`   | Unexpected server error                  |

## Shared types

```ts
interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isAdmin: boolean;
}

interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
}

type ShippingPreference = 'cheapest' | 'fastest' | 'best_value' | 'all';

interface ShippingOption {
  courier: string; // "JNE", "TIKI", ...
  service: string; // "REG", "YES", ...
  description: string;
  cost: number; // rupiah
  etd: string; // "2-3 hari"
}

interface ShippingResult {
  originName: string;
  destinationName: string;
  weightKg: number;
  preference: ShippingPreference;
  options: ShippingOption[];
}

interface ChatTurn {
  id: string;
  sessionId: string;
  userMessage: string;
  botReply: string; // may be "" when `shipping` is set
  shipping: ShippingResult | null;
  createdAt: string; // ISO 8601
}

interface ChatSessionSummary {
  sessionId: string;
  title: string; // first user message of the session
  lastMessageAt: string; // ISO 8601
}
```

## Endpoints

### `GET /api/health`
`200 { "status": "ok", "uptime": 12.3 }`

### Auth

| Method | Path                  | Auth | Body                                         | Success                                |
| ------ | --------------------- | ---- | -------------------------------------------- | -------------------------------------- |
| POST   | `/api/auth/register`  | no   | `{ email, password(min 8), fullName, phone }` | `201 { "message": string }` (email confirmation may be required) |
| POST   | `/api/auth/login`     | no   | `{ email, password }`                        | `200 { user: User, session: AuthSession }` |
| POST   | `/api/auth/refresh`   | no   | `{ refreshToken }`                           | `200 { user: User, session: AuthSession }` (refresh token is rotated: store the new one) |
| GET    | `/api/auth/me`        | yes  | –                                            | `200 { user: User }`                   |

### Chat

| Method | Path                                   | Auth | Body / Query                                | Success                                                   |
| ------ | -------------------------------------- | ---- | ------------------------------------------- | --------------------------------------------------------- |
| POST   | `/api/chat`                            | yes  | `{ message: string(1..500), sessionId: uuid }` | `200 { sessionId, reply: string, shipping: ShippingResult \| null }` |
| GET    | `/api/chat/sessions`                   | yes  | –                                           | `200 { sessions: ChatSessionSummary[] }` (newest first)   |
| GET    | `/api/chat/sessions/:sessionId`        | yes  | –                                           | `200 { turns: ChatTurn[] }` (oldest first)                |

The server stores the conversation, so the client only sends the new message plus the
`sessionId` (generate a UUID v4 client side for a new chat). When `shipping` is not null the
client renders a result card; otherwise it renders `reply` as a normal bubble. The assistant
answers in the language the user writes in (Indonesian / English).

### Reviews

`POST /api/reviews` (auth) `{ rating: 1..5, comment?: string(<=500) }` → `201 { "message": string }`

### Admin

`GET /api/admin/stats?range=today|week|month|year|all` (auth, admin only; default `all`)

```ts
interface AdminStats {
  range: string;
  totalUsers: number;
  activeUsers: number; // users that chatted in the last 15 minutes
  totalSearches: number;
  topRoutes: { route: string; count: number }[]; // max 5
  ratings: {
    average: number; // 0 when no reviews
    total: number;
    breakdown: { '1': number; '2': number; '3': number; '4': number; '5': number };
  };
  recentReviews: { id: string; rating: number; comment: string; createdAt: string }[]; // max 5
}
```

Admins are the accounts whose email is listed in the backend `ADMIN_EMAILS` environment variable.
