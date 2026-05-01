-- ============================================================
-- 00005_create_gam_xp_transactions.sql
-- Creates the XP transaction log table with deduplication
-- Depends on: 00001_create_profiles.sql, 00002_create_pomo_sessions.sql, 00004_create_habit_entries.sql
-- ============================================================

-- Source type enum
DO $$ BEGIN
  CREATE TYPE xp_source_type AS ENUM ('pomodoro', 'habit');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- XP transactions table
-- FIX (finding #2, #4): Two separate FK columns instead of one polymorphic source_ref_id
-- FIX (finding #9): CHECK constraint caps amount at reasonable max
CREATE TABLE IF NOT EXISTS public.gam_xp_transactions (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type    xp_source_type NOT NULL,
  pomo_session_id UUID         REFERENCES public.pomo_sessions(id) ON DELETE SET NULL,
  habit_entry_id  UUID         REFERENCES public.habit_entries(id) ON DELETE SET NULL,
  amount         INTEGER       NOT NULL
                  CHECK (amount > 0 AND amount <= 1000),  -- caps XP per action
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Exactly one FK reference must be set
  CONSTRAINT exactly_one_source_ref
    CHECK (
      (pomo_session_id IS NOT NULL AND habit_entry_id IS NULL) OR
      (pomo_session_id IS NULL    AND habit_entry_id IS NOT NULL)
    )
);

-- CRITICAL: Unique constraint for XP deduplication
-- FIX (finding #4): unique on (source_type, pomo_session_id) and (source_type, habit_entry_id)
CREATE UNIQUE INDEX IF NOT EXISTS uq_gam_xp_transactions_pomo
  ON public.gam_xp_transactions (source_type, pomo_session_id)
  WHERE pomo_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_gam_xp_transactions_habit
  ON public.gam_xp_transactions (source_type, habit_entry_id)
  WHERE habit_entry_id IS NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gam_xp_transactions_user_id
  ON public.gam_xp_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_gam_xp_transactions_user_created
  ON public.gam_xp_transactions (user_id, created_at DESC);

COMMENT ON TABLE public.gam_xp_transactions IS 'XP earned from completing Pomodoro sessions or habit check-ins';
COMMENT ON COLUMN public.gam_xp_transactions.pomo_session_id IS 'FK to pomo_sessions.id (set NULL if session deleted)';
COMMENT ON COLUMN public.gam_xp_transactions.habit_entry_id IS 'FK to habit_entries.id (set NULL if entry deleted)';
COMMENT ON COLUMN public.gam_xp_transactions.amount IS 'XP granted (1-1000 per action; see XP_PER_POMODORO/XP_PER_HABIT constants in TypeScript)';

-- ============================================================
-- XP → Profile sync trigger (finding #3)
-- After INSERT on gam_xp_transactions, atomically update profiles.total_xp
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_profile_xp_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    total_xp = total_xp + NEW.amount,
    current_level = (
      SELECT COALESCE(MAX(level), 1)
      FROM public.gam_levels
      WHERE min_xp <= (
        SELECT total_xp + NEW.amount
        FROM public.profiles
        WHERE user_id = NEW.user_id
      )
    )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

CREATE TRIGGER gam_xp_transactions_sync_profile
  AFTER INSERT ON public.gam_xp_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_xp_on_insert();
