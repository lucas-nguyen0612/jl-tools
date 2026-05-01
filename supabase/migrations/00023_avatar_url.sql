-- ============================================================
-- 00023_avatar_url.sql
--
-- WHAT
--   Additive migration: adds avatar_url column to profiles.
--
-- WHY
--   Story 2 — Profile section + avatars storage bucket.
--   The UI labels this field "Display name" / avatar but the DB
--   column for the name remains character_name (no rename).
--
-- DESIGN NOTES
--   - Column is nullable; NULL means "use the local SVG default".
--   - Length cap of 2048 chars matches typical URL limits.
--   - IF NOT EXISTS guards are safe for re-runs.
-- ============================================================

alter table profiles
  add column if not exists avatar_url text
  check (avatar_url is null or char_length(avatar_url) <= 2048);
