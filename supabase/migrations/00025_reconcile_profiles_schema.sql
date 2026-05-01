-- ============================================================
-- 00025_reconcile_profiles_schema.sql
--
-- WHAT
--   1. Fixes signup: rewrites on_auth_user_created() so it no longer
--      tries to INSERT into non-existent profiles columns (the previous
--      version referenced username/character_name and aborted the
--      auth.users transaction with "Database error saving new user").
--   2. Adds the profile columns the app actually uses:
--      character_name, character_class, goals, first_tool,
--      onboarding_completed.
--   3. Extends handle_new_user() to seed character_name on signup.
--   4. Backfills character_name for any pre-existing rows.
--
-- WHY
--   The 00009 trigger was authored against a Sprint-4 profiles shape
--   (id = auth.users.id, columns username/character_name) that never
--   actually shipped — the canonical schema from 00001 uses (id,
--   user_id, display_name). The trigger therefore failed on every new
--   signup. Meanwhile app code was written against the Sprint-4 shape,
--   so most pages would also fail at runtime once signup succeeded.
--   This migration reconciles to ONE shape: keep 00001's PK/user_id,
--   add the columns app code expects.
--
-- DESIGN NOTES
--   - profiles.id stays a separate UUID (no PK change). App code is
--     refactored separately to query .eq('user_id', ...).
--   - All ADD COLUMN statements are IF NOT EXISTS for idempotency.
--   - on_auth_user_created() keeps seeding character_stats /
--     pomodoro_settings / user_quests — those tables/usages are real.
-- ============================================================

-- ── 1. Add missing profile columns ───────────────────────────────────────────

alter table public.profiles
  add column if not exists character_name       text,
  add column if not exists character_class      text,
  add column if not exists goals                text[]    not null default '{}',
  add column if not exists first_tool           text,
  add column if not exists onboarding_completed boolean   not null default false;

-- ── 2. Backfill character_name for any pre-existing rows ─────────────────────

update public.profiles p
set character_name = coalesce(
  nullif(p.display_name, ''),
  nullif(split_part(u.email, '@', 1), ''),
  'Adventurer'
)
from auth.users u
where p.user_id = u.id and (p.character_name is null or p.character_name = '');

-- ── 3. Extend handle_new_user() to seed character_name ───────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name, character_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(new.email, '')
    ),
    coalesce(
      nullif(new.raw_user_meta_data->>'character_name', ''),
      nullif(new.raw_user_meta_data->>'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      'Adventurer'
    )
  );

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = pg_catalog, public;

-- ── 4. Fix on_auth_user_created(): drop the broken profiles insert ───────────

create or replace function public.on_auth_user_created()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  -- profiles is handled by handle_new_user() (the on_auth_user_created
  -- trigger from 00001). This function only seeds the gamification
  -- tables introduced in 00009.

  insert into public.character_stats (user_id) values (new.id) on conflict (user_id) do nothing;
  insert into public.pomodoro_settings (user_id) values (new.id) on conflict (user_id) do nothing;

  insert into public.user_quests (user_id, quest_id, assigned_date)
  select new.id, q.id, current_date
  from public.quests q
  where q.quest_type = 'daily' and q.is_active = true
  limit 3;

  return new;
end;
$$;

-- ── 5. Comments ──────────────────────────────────────────────────────────────

comment on column public.profiles.character_name      is 'Display name shown in the RPG UI; seeded from email local-part on signup';
comment on column public.profiles.character_class     is 'Optional RPG class (e.g., "Mage", "Warrior")';
comment on column public.profiles.goals               is 'Array of goal IDs selected during onboarding';
comment on column public.profiles.first_tool          is 'Tool the user picked at the end of onboarding (pomodoro/habits/flashcards)';
comment on column public.profiles.onboarding_completed is 'True once the user finishes the onboarding wizard';
