-- ============================================================
-- 00021_pomodoro_soundscapes.sql
--
-- WHAT
--   Adds user-uploaded soundscape support for the Pomodoro tool:
--     1. Public storage bucket `music` (20 MB cap, audio/* mime allow-list)
--        with per-user folder isolation enforced via storage.objects RLS.
--     2. Table `pomodoro_soundscapes` storing one row per uploaded file
--        (display name, storage_path, public file_url, size).
--     3. RLS so each user only sees / mutates their own rows.
--
-- WHY
--   The built-in soundscape presets (rain/cafe/forest/space/lofi) are kept
--   as quick-select options but currently have no audio assets bundled.
--   Letting users upload their own MP3/WAV/OGG lets them get audio playback
--   working without us having to ship licensed audio. Storing the file in
--   storage and the *link* in DB matches the user request and keeps row
--   size small.
--
-- DESIGN NOTES
--   - Bucket is PUBLIC: file_url stored in DB stays valid forever, no signed
--     URL refresh dance. Object keys are UUID-based so URLs are unguessable.
--   - Storage path layout: {user_id}/{soundscape_id}.{ext}
--     storage.objects RLS uses (storage.foldername(name))[1] = auth.uid()
--     to confine each user to their own subfolder.
--   - settings.soundscape (text) keeps the preset IDs ('silent','rain',...)
--     but for custom uploads stores the row UUID. The client distinguishes
--     by checking whether the value is a UUID (custom) or a known preset id.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'music',
  'music',
  true,
  20971520, -- 20 MB
  array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- 2. Storage RLS — per-user folder isolation
-- ------------------------------------------------------------
drop policy if exists "music_select_own" on storage.objects;
create policy "music_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'music'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "music_insert_own" on storage.objects;
create policy "music_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'music'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "music_update_own" on storage.objects;
create policy "music_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'music'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'music'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "music_delete_own" on storage.objects;
create policy "music_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'music'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anonymous reads of the public bucket so <audio> tags can stream
-- without an auth token. Bucket is public anyway; this just makes the
-- intent explicit at the policy layer.
drop policy if exists "music_public_read" on storage.objects;
create policy "music_public_read" on storage.objects
  for select to anon
  using (bucket_id = 'music');

-- ------------------------------------------------------------
-- 3. Table: pomodoro_soundscapes
-- ------------------------------------------------------------
create table if not exists pomodoro_soundscapes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null check (char_length(name) between 1 and 80),
  storage_path text not null,
  file_url text not null,
  file_size_bytes integer not null check (file_size_bytes between 0 and 20971520),
  mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pomodoro_soundscapes_user
  on pomodoro_soundscapes (user_id, created_at desc);

alter table pomodoro_soundscapes enable row level security;

drop policy if exists "soundscapes_select_own" on pomodoro_soundscapes;
create policy "soundscapes_select_own" on pomodoro_soundscapes
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "soundscapes_insert_own" on pomodoro_soundscapes;
create policy "soundscapes_insert_own" on pomodoro_soundscapes
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "soundscapes_update_own" on pomodoro_soundscapes;
create policy "soundscapes_update_own" on pomodoro_soundscapes
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "soundscapes_delete_own" on pomodoro_soundscapes;
create policy "soundscapes_delete_own" on pomodoro_soundscapes
  for delete to authenticated
  using (user_id = auth.uid());
