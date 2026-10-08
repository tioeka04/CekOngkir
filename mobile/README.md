# Skuy Ongkir - Mobile

Expo / React Native (TypeScript) client for Skuy Ongkir, an AI assistant that compares
Indonesian courier shipping costs through chat. It talks to the Skuy Ongkir backend
(`../backend`, contract in `../docs/API.md`).

Features: email login/register with silent token refresh, AI chat with server-side history,
shipping result cards with courier logos and a 5-star rating, an admin dashboard
(admin status is verified by the server) and an Indonesian / English toggle.

## Structure

```
App.tsx              composition root (providers + navigator)
src/
  api/               fetch client (Bearer token, typed ApiError, timeout, refresh-on-401) + endpoint modules
  components/        small presentational components
  config/            env.ts (API URL, timeouts)
  context/           AuthContext, LanguageContext
  hooks/             useChat, useChatSessions, useAdminStats, useAuthForm, useRating
  i18n/              id.ts, en.ts, translate()
  navigation/        state-based AppNavigator
  screens/           Auth, Chat, SessionsDrawer, AdminDashboard
  storage/           expo-secure-store wrapper (session persistence)
  theme/             colors, spacing, typography, shadows
  types/             API contract types and view models
  utils/             formatting, courier logos, validation, error messages
```

## Setup

```bash
npm install
cp .env.example .env     # then edit EXPO_PUBLIC_API_URL
npm start
```

### API URL

`EXPO_PUBLIC_API_URL` is the backend base URL (default `http://localhost:3000`).

- Real phone with Expo Go: use your laptop's LAN IP, e.g. `http://192.168.1.10:3000`
  (phone and laptop must be on the same Wi-Fi).
- Android emulator: `http://10.0.2.2:3000`.

### Run on a phone

Install **Expo Go**, run `npm start`, and scan the QR code.

## Scripts

| Script              | Purpose                       |
| ------------------- | ----------------------------- |
| `npm start`         | Start the Expo dev server     |
| `npm run android`   | Start and open on Android     |
| `npm run ios`       | Start and open on iOS         |
| `npm run web`       | Start in the browser          |
| `npm run typecheck` | `tsc --noEmit`                |
| `npm run lint`      | ESLint (eslint-config-expo)   |
