# Free deployment guide (web + API)

Stack: **Supabase** (database + auth) · **Render** (backend) · **Vercel** (web). All have free tiers; check each provider's current limits and terms before relying on them.

## 1. Supabase

1. Create a project, then run [`supabase/schema.sql`](../supabase/schema.sql) in *SQL Editor*.
2. *Project Settings → API*: copy the **Project URL**, the **anon** key and the **service_role** key.
3. *Authentication → URL Configuration*: set *Site URL* to your Vercel URL once you have it (so the confirmation email links back to your site).

## 2. Backend on Render

1. Push this repo to GitHub.
2. Render → *New → Blueprint* → pick the repo. It reads [`render.yaml`](../render.yaml) (a free Node web service in `backend/`).
3. Fill the environment variables Render asks for:

   | Variable | Value |
   | --- | --- |
   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | from step 1 |
   | `GROQ_API_KEY`, `RAJAONGKIR_API_KEY` | your keys |
   | `ADMIN_EMAILS` | your email |
   | `CORS_ORIGINS` | your Vercel URL, e.g. `https://cekongkirai.vercel.app` (comma-separate several) |
   | `TELEGRAM_BOT_TOKEN` | leave empty (see below) |

4. Deploy, then open `https://<your-service>.onrender.com/api/health`; it should return `{"status":"ok"}`.

> **Free-tier behaviour:** Render puts idle free services to sleep, so the first request after ~15 minutes takes about 30-60 seconds. That is fine for a portfolio demo; mention it in your README or ping `/api/health` with a free uptime monitor. For the same reason keep `TELEGRAM_BOT_TOKEN` empty in production: a sleeping server cannot poll Telegram. Run the bot locally when you want to demo it.

## 3. Web on Vercel

1. Vercel → *Add New → Project* → import the repo, set **Root Directory** to `web`.
2. Framework preset: Vite (auto-detected). Add the environment variable `VITE_API_URL` = your Render URL (no trailing slash).
3. Deploy. [`web/vercel.json`](../web/vercel.json) already rewrites every path to `index.html` so deep links such as `/admin` work.
4. Go back to Render and make sure `CORS_ORIGINS` contains the final Vercel URL, then redeploy the backend if you changed it.

## 4. Mobile

The mobile app is not hosted; run it with Expo Go (`npm start`) and point `EXPO_PUBLIC_API_URL` at your deployed Render URL. Building a store-ready binary needs `eas build`, which is outside the free-hosting goal.

## Checklist before making the repo public

- [ ] No `.env` file committed (`git ls-files | grep .env` must only show `.env.example` files).
- [ ] Any key that was ever committed or shared in the old project is **rotated** (Groq, RajaOngkir, Supabase, Telegram).
- [ ] `ADMIN_EMAILS` contains only your email.
- [ ] Screenshots added to `docs/screenshots` and the README badge's `OWNER` replaced with your GitHub username.
