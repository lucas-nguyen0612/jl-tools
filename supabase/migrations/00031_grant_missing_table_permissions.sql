-- 00031_grant_missing_table_permissions.sql
-- Tables created in 00021 and 00022 were missing GRANT statements
-- (same class of bug fixed for Sprint-4 tables in 00027). Without these,
-- PostgREST returns "permission denied for table ..." even when RLS
-- policies are correct, because the role has no base table privilege.
-- Supabase only auto-grants when tables are created via the Dashboard;
-- raw SQL migrations require explicit GRANTs.

-- ── pomodoro_soundscapes (00021) ─────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pomodoro_soundscapes TO authenticated;
GRANT ALL                            ON public.pomodoro_soundscapes TO service_role;

-- ── user_preferences (00022) ─────────────────────────────────
-- Row is seeded by handle_new_user trigger (SECURITY DEFINER → postgres),
-- but client reads/updates go through the authenticated role and need GRANTs.
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT ALL                    ON public.user_preferences TO service_role;
