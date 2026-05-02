-- 00027_grant_sprint4_table_permissions.sql
-- Tables created in 00009_sprint4_full_schema.sql were missing GRANT statements.
-- Without these, PostgREST returns "permission denied" even when RLS policies exist.
-- Supabase only adds default grants when tables are created via the Dashboard;
-- raw SQL migrations require explicit GRANTs.

-- ── User-owned tables (authenticated users only) ───────────────────────────

-- character_stats: users can SELECT their own row (no direct write; triggers update it)
GRANT SELECT ON public.character_stats TO authenticated;
GRANT ALL    ON public.character_stats TO service_role;

-- pomodoro_settings
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pomodoro_settings TO authenticated;
GRANT ALL ON public.pomodoro_settings TO service_role;

-- pomodoro_tasks
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pomodoro_tasks TO authenticated;
GRANT ALL ON public.pomodoro_tasks TO service_role;

-- pomodoro_sessions (SELECT only; inserts go via security-definer triggers)
GRANT SELECT ON public.pomodoro_sessions TO authenticated;
GRANT ALL    ON public.pomodoro_sessions TO service_role;

-- habits
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;

-- habit_completions
GRANT SELECT, INSERT, DELETE ON public.habit_completions TO authenticated;
GRANT ALL ON public.habit_completions TO service_role;

-- habit_notes
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_notes TO authenticated;
GRANT ALL ON public.habit_notes TO service_role;

-- flashcard_decks
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_decks TO authenticated;
GRANT ALL ON public.flashcard_decks TO service_role;

-- flashcard_cards
GRANT SELECT, INSERT, UPDATE, DELETE ON public.flashcard_cards TO authenticated;
GRANT ALL ON public.flashcard_cards TO service_role;

-- flashcard_reviews (SELECT only; writes go via apply_sm2_and_award_xp SECURITY DEFINER)
GRANT SELECT ON public.flashcard_reviews TO authenticated;
GRANT ALL    ON public.flashcard_reviews TO service_role;

-- xp_transactions (SELECT + INSERT; habits/actions.ts inserts directly, 00010 adds INSERT policy)
GRANT SELECT, INSERT ON public.xp_transactions TO authenticated;
GRANT ALL            ON public.xp_transactions TO service_role;

-- user_badges
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL    ON public.user_badges TO service_role;

-- user_quests (SELECT only; writes go via ensure_daily_quests RPC and triggers)
GRANT SELECT ON public.user_quests TO authenticated;
GRANT ALL    ON public.user_quests TO service_role;

-- user_unlockables
GRANT SELECT ON public.user_unlockables TO authenticated;
GRANT ALL    ON public.user_unlockables TO service_role;

-- ── Public lookup tables (readable by everyone, including anon) ────────────

-- badges
GRANT SELECT ON public.badges TO anon, authenticated;
GRANT ALL    ON public.badges TO service_role;

-- quests
GRANT SELECT ON public.quests TO anon, authenticated;
GRANT ALL    ON public.quests TO service_role;

-- unlockables
GRANT SELECT ON public.unlockables TO anon, authenticated;
GRANT ALL    ON public.unlockables TO service_role;

-- level_thresholds
GRANT SELECT ON public.level_thresholds TO anon, authenticated;
GRANT ALL    ON public.level_thresholds TO service_role;
