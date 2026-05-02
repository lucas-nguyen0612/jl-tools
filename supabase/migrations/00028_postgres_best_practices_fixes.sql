-- ============================================================
-- 00028_postgres_best_practices_fixes.sql
-- Applies Supabase/Postgres best-practice fixes found by audit.
--
-- ISSUES FIXED:
--   1. [CRITICAL] RLS performance: wrap auth.uid() in (select auth.uid())
--      so the function is evaluated once per query, not once per row.
--      Affects all user-owned tables in 00007, 00009, 00010, 00021, 00022.
--      Reference: security-rls-performance.md
--
--   2. [HIGH] Missing FK indexes on Sprint-4 tables (00009).
--      Postgres does NOT auto-index FK columns; missing indexes cause full
--      table scans on JOINs and slow ON DELETE CASCADE operations.
--      Reference: schema-foreign-key-indexes.md
--
--   3. [MEDIUM] SECURITY DEFINER functions in 00009 missing SET search_path.
--      Without it, a superuser with CREATE privilege could hijack the
--      search path and inject malicious functions.
--      Reference: security-privileges.md
-- ============================================================


-- ============================================================
-- 1. RLS PERFORMANCE: (select auth.uid()) caching
-- Drop and recreate every policy that compares auth.uid() directly.
-- ============================================================

-- ── profiles (00007) ─────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_owner_all" ON public.profiles;
CREATE POLICY "profiles_owner_all" ON public.profiles
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── pomo_sessions (00007 — old legacy table) ─────────────────
DROP POLICY IF EXISTS "pomo_sessions_owner_all" ON public.pomo_sessions;
CREATE POLICY "pomo_sessions_owner_all" ON public.pomo_sessions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── habit_definitions (00007) ────────────────────────────────
DROP POLICY IF EXISTS "habit_definitions_owner_all" ON public.habit_definitions;
CREATE POLICY "habit_definitions_owner_all" ON public.habit_definitions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── habit_entries (00007) ─────────────────────────────────────
DROP POLICY IF EXISTS "habit_entries_owner_all" ON public.habit_entries;
CREATE POLICY "habit_entries_owner_all" ON public.habit_entries
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── gam_xp_transactions (00007) ──────────────────────────────
DROP POLICY IF EXISTS "gam_xp_transactions_owner_all" ON public.gam_xp_transactions;
CREATE POLICY "gam_xp_transactions_owner_all" ON public.gam_xp_transactions
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── character_stats (00009) ───────────────────────────────────
DROP POLICY IF EXISTS "Users can view own stats" ON public.character_stats;
CREATE POLICY "Users can view own stats" ON public.character_stats
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── pomodoro_settings (00009) ────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own pomodoro settings" ON public.pomodoro_settings;
CREATE POLICY "Users can manage own pomodoro settings" ON public.pomodoro_settings
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── pomodoro_tasks (00009) ───────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own tasks" ON public.pomodoro_tasks;
CREATE POLICY "Users can manage own tasks" ON public.pomodoro_tasks
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── pomodoro_sessions / Sprint-4 (00009) ─────────────────────
DROP POLICY IF EXISTS "Users can view own sessions" ON public.pomodoro_sessions;
CREATE POLICY "Users can view own sessions" ON public.pomodoro_sessions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── habits (00009) ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own habits" ON public.habits;
CREATE POLICY "Users can manage own habits" ON public.habits
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── habit_completions (00009) ────────────────────────────────
DROP POLICY IF EXISTS "Users can view own completions" ON public.habit_completions;
CREATE POLICY "Users can view own completions" ON public.habit_completions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own completions" ON public.habit_completions;
CREATE POLICY "Users can insert own completions" ON public.habit_completions
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own completions" ON public.habit_completions;
CREATE POLICY "Users can delete own completions" ON public.habit_completions
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ── habit_notes (00009) ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own notes" ON public.habit_notes;
CREATE POLICY "Users can manage own notes" ON public.habit_notes
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── flashcard_decks (00009) ──────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own decks" ON public.flashcard_decks;
CREATE POLICY "Users can manage own decks" ON public.flashcard_decks
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── flashcard_cards (00009) ──────────────────────────────────
DROP POLICY IF EXISTS "Users can manage own cards" ON public.flashcard_cards;
CREATE POLICY "Users can manage own cards" ON public.flashcard_cards
  FOR ALL
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ── flashcard_reviews (00009) ────────────────────────────────
DROP POLICY IF EXISTS "Users can view own reviews" ON public.flashcard_reviews;
CREATE POLICY "Users can view own reviews" ON public.flashcard_reviews
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── xp_transactions (00009 + 00010) ─────────────────────────
DROP POLICY IF EXISTS "Users can view own XP transactions" ON public.xp_transactions;
CREATE POLICY "Users can view own XP transactions" ON public.xp_transactions
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own XP transactions" ON public.xp_transactions;
CREATE POLICY "Users can insert own XP transactions" ON public.xp_transactions
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- ── user_badges (00009) ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_badges;
CREATE POLICY "Users can view own badges" ON public.user_badges
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── user_quests (00009) ──────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own quests" ON public.user_quests;
CREATE POLICY "Users can view own quests" ON public.user_quests
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── user_unlockables (00009) ─────────────────────────────────
DROP POLICY IF EXISTS "Users can view own unlockables" ON public.user_unlockables;
CREATE POLICY "Users can view own unlockables" ON public.user_unlockables
  FOR SELECT
  USING ((select auth.uid()) = user_id);

-- ── pomodoro_soundscapes (00021) ─────────────────────────────
DROP POLICY IF EXISTS "soundscapes_select_own" ON public.pomodoro_soundscapes;
CREATE POLICY "soundscapes_select_own" ON public.pomodoro_soundscapes
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "soundscapes_insert_own" ON public.pomodoro_soundscapes;
CREATE POLICY "soundscapes_insert_own" ON public.pomodoro_soundscapes
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "soundscapes_update_own" ON public.pomodoro_soundscapes;
CREATE POLICY "soundscapes_update_own" ON public.pomodoro_soundscapes
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "soundscapes_delete_own" ON public.pomodoro_soundscapes;
CREATE POLICY "soundscapes_delete_own" ON public.pomodoro_soundscapes
  FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

-- ── user_preferences (00022) ─────────────────────────────────
DROP POLICY IF EXISTS "user_preferences_select_own" ON public.user_preferences;
CREATE POLICY "user_preferences_select_own" ON public.user_preferences
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_preferences_insert_own" ON public.user_preferences;
CREATE POLICY "user_preferences_insert_own" ON public.user_preferences
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "user_preferences_update_own" ON public.user_preferences;
CREATE POLICY "user_preferences_update_own" ON public.user_preferences
  FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);


-- ============================================================
-- 2. MISSING FK INDEXES (Sprint-4 tables from 00009)
-- ============================================================

-- pomodoro_sessions.task_id (FK → pomodoro_tasks)
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_task_id
  ON public.pomodoro_sessions (task_id)
  WHERE task_id IS NOT NULL;

-- habits.user_id (FK → auth.users)
CREATE INDEX IF NOT EXISTS idx_habits_user_id
  ON public.habits (user_id);

-- habit_notes.user_id (FK → auth.users; UNIQUE(user_id, note_date) already covers this
--   but an explicit index makes the FK lookup explicit)
CREATE INDEX IF NOT EXISTS idx_habit_notes_user_id
  ON public.habit_notes (user_id);

-- flashcard_decks.user_id (FK → auth.users)
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_user_id
  ON public.flashcard_decks (user_id);

-- flashcard_cards.user_id (FK → auth.users)
-- deck_id is covered by idx_flashcard_cards_deck_due; user_id needs its own.
CREATE INDEX IF NOT EXISTS idx_flashcard_cards_user_id
  ON public.flashcard_cards (user_id);

-- flashcard_reviews.card_id (FK → flashcard_cards)
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_id
  ON public.flashcard_reviews (card_id);

-- flashcard_reviews.deck_id (FK → flashcard_decks)
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_deck_id
  ON public.flashcard_reviews (deck_id);

-- user_badges.badge_id (FK → badges)
-- UNIQUE(user_id, badge_id) covers user_id lookups; badge_id direction needs own index.
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id
  ON public.user_badges (badge_id);

-- user_quests.quest_id (FK → quests)
-- idx_user_quests_user_date covers user_id; quest_id needs own index.
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_id
  ON public.user_quests (quest_id);

-- user_unlockables.user_id (FK → auth.users)
-- UNIQUE(user_id, unlockable_id) exists but we add explicit idx for clarity.
CREATE INDEX IF NOT EXISTS idx_user_unlockables_user_id
  ON public.user_unlockables (user_id);

-- user_unlockables.unlockable_id (FK → unlockables)
CREATE INDEX IF NOT EXISTS idx_user_unlockables_unlockable_id
  ON public.user_unlockables (unlockable_id);


-- ============================================================
-- 3. SECURITY DEFINER functions: add SET search_path
-- Functions from 00009 are SECURITY DEFINER but lack SET search_path,
-- which allows search_path hijacking by a superuser.
-- We re-declare only the final versions (matching the last migration
-- that touches each function).
-- ============================================================

-- update_updated_at (00009): simple trigger, low risk, still worth fixing
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- check_and_award_badges (last version: 00011)
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_stats character_stats%rowtype;
  v_badge record;
BEGIN
  SELECT * INTO v_stats FROM character_stats WHERE user_id = p_user_id;
  IF NOT FOUND THEN RETURN; END IF;

  FOR v_badge IN
    SELECT b.* FROM badges b
    WHERE NOT EXISTS (
      SELECT 1 FROM user_badges ub WHERE ub.user_id = p_user_id AND ub.badge_id = b.id
    )
  LOOP
    CASE v_badge.condition_type
      WHEN 'total_xp' THEN
        IF v_stats.total_xp >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      WHEN 'level' THEN
        IF v_stats.level >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      WHEN 'total_pomodoros' THEN
        IF v_stats.total_pomodoros >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      WHEN 'longest_streak' THEN
        IF v_stats.longest_streak >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      WHEN 'total_cards_reviewed' THEN
        IF v_stats.total_cards_reviewed >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      WHEN 'total_habits_completed' THEN
        IF v_stats.total_habits_completed >= v_badge.condition_value THEN
          INSERT INTO user_badges (user_id, badge_id) VALUES (p_user_id, v_badge.id) ON CONFLICT DO NOTHING;
        END IF;
      ELSE
        NULL;
    END CASE;
  END LOOP;
END;
$$;

-- ensure_daily_quests (00014)
CREATE OR REPLACE FUNCTION public.ensure_daily_quests(p_user_id uuid)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM user_quests
    WHERE user_id = p_user_id AND assigned_date = current_date
  ) THEN
    RETURN;
  END IF;

  INSERT INTO user_quests (user_id, quest_id, assigned_date)
  SELECT p_user_id, q.id, current_date
  FROM quests q
  WHERE q.quest_type = 'daily' AND q.is_active = true
  ORDER BY q.created_at
  LIMIT 3;
END;
$$;

-- complete_quest (00014)
CREATE OR REPLACE FUNCTION public.complete_quest(p_user_quest_id uuid)
RETURNS void LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid;
  v_quest_id uuid;
  v_name text;
  v_xp integer;
BEGIN
  SELECT uq.user_id, uq.quest_id, q.name, q.xp_reward
  INTO v_user_id, v_quest_id, v_name, v_xp
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.id = p_user_quest_id AND uq.is_completed = false;

  IF NOT FOUND THEN RETURN; END IF;

  UPDATE user_quests
  SET is_completed = true, completed_at = now()
  WHERE id = p_user_quest_id;

  PERFORM award_xp(v_user_id, v_xp, 'quest', v_quest_id, 'Quest complete: ' || v_name);
END;
$$;

-- update_quest_on_pomodoro (00014)
CREATE OR REPLACE FUNCTION public.update_quest_on_pomodoro()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_uq record;
  v_delta integer;
BEGIN
  PERFORM ensure_daily_quests(NEW.user_id);

  FOR v_uq IN
    SELECT uq.id, uq.current_value, q.slug, q.target_value
    FROM user_quests uq
    JOIN quests q ON q.id = uq.quest_id
    WHERE uq.user_id = NEW.user_id
      AND uq.assigned_date = current_date
      AND uq.is_completed = false
      AND q.tool = 'pomodoro'
  LOOP
    v_delta := CASE v_uq.slug
      WHEN 'daily_focus_60' THEN NEW.duration_minutes
      ELSE 1
    END;

    UPDATE user_quests
    SET current_value = current_value + v_delta
    WHERE id = v_uq.id;

    IF v_uq.current_value + v_delta >= v_uq.target_value THEN
      PERFORM complete_quest(v_uq.id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- update_quest_on_habit (00014)
CREATE OR REPLACE FUNCTION public.update_quest_on_habit()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_uq record;
  v_total_habits integer;
  v_completed_today integer;
BEGIN
  PERFORM ensure_daily_quests(NEW.user_id);

  FOR v_uq IN
    SELECT uq.id, uq.current_value, q.slug, q.target_value
    FROM user_quests uq
    JOIN quests q ON q.id = uq.quest_id
    WHERE uq.user_id = NEW.user_id
      AND uq.assigned_date = current_date
      AND uq.is_completed = false
      AND q.tool = 'habit'
  LOOP
    IF v_uq.slug = 'daily_habit_all' THEN
      SELECT count(*) INTO v_total_habits
      FROM habits
      WHERE user_id = NEW.user_id AND is_archived = false;

      SELECT count(DISTINCT habit_id) INTO v_completed_today
      FROM habit_completions
      WHERE user_id = NEW.user_id AND completed_date = current_date;

      IF v_total_habits > 0 AND v_completed_today >= v_total_habits THEN
        UPDATE user_quests SET current_value = 1 WHERE id = v_uq.id;
        PERFORM complete_quest(v_uq.id);
      END IF;
    ELSE
      UPDATE user_quests
      SET current_value = current_value + 1
      WHERE id = v_uq.id;

      IF v_uq.current_value + 1 >= v_uq.target_value THEN
        PERFORM complete_quest(v_uq.id);
      END IF;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- update_quest_on_flashcard (00014)
CREATE OR REPLACE FUNCTION public.update_quest_on_flashcard()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_uq record;
BEGIN
  IF NEW.rating = 0 THEN RETURN NEW; END IF;

  PERFORM ensure_daily_quests(NEW.user_id);

  FOR v_uq IN
    SELECT uq.id, uq.current_value, q.target_value
    FROM user_quests uq
    JOIN quests q ON q.id = uq.quest_id
    WHERE uq.user_id = NEW.user_id
      AND uq.assigned_date = current_date
      AND uq.is_completed = false
      AND q.tool = 'flashcard'
  LOOP
    UPDATE user_quests
    SET current_value = current_value + 1
    WHERE id = v_uq.id;

    IF v_uq.current_value + 1 >= v_uq.target_value THEN
      PERFORM complete_quest(v_uq.id);
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- sync_character_stats_from_pomodoro_session (00020) — already has SECURITY DEFINER;
-- add SET search_path
CREATE OR REPLACE FUNCTION public.sync_character_stats_from_pomodoro_session()
RETURNS trigger LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_delta_minutes integer;
BEGIN
  IF (tg_op = 'INSERT') THEN
    UPDATE character_stats
       SET total_pomodoros     = total_pomodoros + 1,
           total_focus_minutes = total_focus_minutes + coalesce(NEW.duration_minutes, 0)
     WHERE user_id = NEW.user_id;
    RETURN NEW;

  ELSIF (tg_op = 'DELETE') THEN
    UPDATE character_stats
       SET total_pomodoros     = greatest(total_pomodoros - 1, 0),
           total_focus_minutes = greatest(total_focus_minutes - coalesce(OLD.duration_minutes, 0), 0)
     WHERE user_id = OLD.user_id;
    RETURN OLD;

  ELSIF (tg_op = 'UPDATE') THEN
    IF coalesce(NEW.duration_minutes, 0) <> coalesce(OLD.duration_minutes, 0) THEN
      v_delta_minutes := coalesce(NEW.duration_minutes, 0) - coalesce(OLD.duration_minutes, 0);
      UPDATE character_stats
         SET total_focus_minutes = greatest(total_focus_minutes + v_delta_minutes, 0)
       WHERE user_id = NEW.user_id;
    END IF;
    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;
