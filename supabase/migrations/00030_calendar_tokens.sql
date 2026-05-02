-- ============================================================
-- 00030_calendar_tokens.sql
-- Stores Google OAuth tokens for Calendar integration.
-- One row per user (upsert on reconnect).
-- ============================================================

create table public.calendar_tokens (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  scope         text not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (user_id)
);

alter table public.calendar_tokens enable row level security;

create policy "owner access"
  on public.calendar_tokens
  for all
  using (auth.uid() = user_id);

-- Grant to authenticated role
grant select, insert, update, delete on public.calendar_tokens to authenticated;
