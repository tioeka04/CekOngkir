-- CekOngkirAI database schema.
-- Run this once in Supabase → SQL Editor. It is idempotent, so it is safe to re-run
-- and also upgrades the tables of the original student version.

-- ── Chat history: one row per user message + bot answer ──────────────────────
create table if not exists public.chat_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,        -- Supabase auth user, or a derived id for Telegram users
  session_id    uuid not null,
  user_message  text not null,
  bot_reply     text,
  shipping_data jsonb,                -- structured rates so old chats can re-render result cards
  created_at    timestamptz not null default now()
);
alter table public.chat_history add column if not exists shipping_data jsonb;
create index if not exists chat_history_user_idx    on public.chat_history (user_id, created_at desc);
create index if not exists chat_history_session_idx on public.chat_history (session_id, created_at);

-- ── Search log: powers "popular routes" on the admin dashboard ───────────────
create table if not exists public.search_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid,
  origin      text not null,
  destination text not null,
  weight_kg   numeric,
  preference  text,
  created_at  timestamptz not null default now()
);
alter table public.search_logs add column if not exists user_id uuid;
alter table public.search_logs add column if not exists weight_kg numeric;
alter table public.search_logs add column if not exists preference text;
create index if not exists search_logs_created_idx on public.search_logs (created_at desc);

-- ── Reviews ───────────────────────────────────────────────────────────────────
create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid,
  rating     smallint not null check (rating between 1 and 5),
  comment    text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists reviews_created_idx on public.reviews (created_at desc);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Only the backend (service-role key, which bypasses RLS) touches these tables.
-- Enabling RLS without policies blocks anyone using the public anon key.
alter table public.chat_history enable row level security;
alter table public.search_logs  enable row level security;
alter table public.reviews      enable row level security;
