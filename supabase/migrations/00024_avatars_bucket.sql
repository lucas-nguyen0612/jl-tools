-- ============================================================
-- 00024_avatars_bucket.sql
--
-- WHAT
--   Public storage bucket `avatars` with per-user folder isolation:
--     1. Bucket: public, 2 MB cap, png/jpeg/webp allow-list.
--     2. Storage RLS: 4 owner policies (select/insert/update/delete)
--        keyed on (storage.foldername(name))[1] = auth.uid()::text.
--     3. Public read policy for anon so <img> tags work without auth.
--
-- WHY
--   Story 2 — Profile section + avatars storage bucket.
--   Mirrors the music bucket pattern from 00021_pomodoro_soundscapes.sql.
--
-- DESIGN NOTES
--   - Bucket is PUBLIC: avatar_url stored in DB stays valid without
--     signed URL refresh. Object keys are UUID-based (unguessable).
--   - Storage path layout: avatars/{user_id}/{uuid}.{ext}
--     RLS uses foldername[1] = auth.uid() to isolate per user.
--   - Splitting from 00023 keeps each migration independently revertible.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Bucket
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ------------------------------------------------------------
-- 2. Storage RLS — per-user folder isolation
-- ------------------------------------------------------------
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anonymous reads of the public bucket so <img> tags render
-- without an auth token. Bucket is public anyway; this makes intent
-- explicit at the policy layer (mirrors music_public_read).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select to anon
  using (bucket_id = 'avatars');
