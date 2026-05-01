-- ============================================================
-- 00008_apply_review_fixes.sql
-- Applies review fixes to existing tables (incremental ALTERs)
-- All tables already exist from 00001-00007
-- ============================================================

-- ============================================================
-- 00001 profiles fixes:
-- - Add CHECK for total_xp >= 0
-- - Add CHECK for current_level 1-20
-- - Add CHECK for avatar_url length
-- - Search_path already fixed in 00001 trigger
-- ============================================================

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_total_xp_positive,
  ADD CONSTRAINT profiles_total_xp_positive CHECK (total_xp >= 0);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_level_range,
  ADD CONSTRAINT profiles_current_level_range CHECK (current_level BETWEEN 1 AND 20);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_avatar_url_length,
  ADD CONSTRAINT profiles_avatar_url_length
    CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 2048);

-- ============================================================
-- 00002 pomo_sessions fixes:
-- - Add CHECK planned_duration > 0
-- - Add CHECK actual_duration >= 0
-- - Add CHECK no_completed_at_when_active
-- ============================================================

ALTER TABLE public.pomo_sessions
  DROP CONSTRAINT IF EXISTS planned_duration_positive,
  ADD CONSTRAINT planned_duration_positive CHECK (planned_duration > 0);

ALTER TABLE public.pomo_sessions
  DROP CONSTRAINT IF EXISTS actual_duration_nonnegative,
  ADD CONSTRAINT actual_duration_nonnegative CHECK (actual_duration >= 0);

ALTER TABLE public.pomo_sessions
  DROP CONSTRAINT IF EXISTS no_completed_at_when_active,
  ADD CONSTRAINT no_completed_at_when_active CHECK (
    (status IN ('active', 'paused') AND completed_at IS NULL) OR
    (status IN ('completed', 'cancelled') AND completed_at IS NOT NULL)
  );

-- ============================================================
-- 00003 habit_definitions fixes:
-- - Change icon DEFAULT from emoji to key string
-- - Add custom_days valid CHECK
-- - Drop redundant partial index (idx_habit_definitions_user_active)
-- ============================================================

ALTER TABLE public.habit_definitions
  ALTER COLUMN icon SET DEFAULT 'star';

ALTER TABLE public.habit_definitions
  DROP CONSTRAINT IF EXISTS custom_days_valid,
  ADD CONSTRAINT custom_days_valid CHECK (
    custom_days IS NULL OR
    (array_length(custom_days, 1) > 0 AND
     custom_days <@ ARRAY[0,1,2,3,4,5,6]::smallint[])
  );

DROP INDEX IF EXISTS idx_habit_definitions_user_active;

-- ============================================================
-- 00004 habit_entries fixes:
-- - Add no_future_checkin CHECK
-- ============================================================

ALTER TABLE public.habit_entries
  DROP CONSTRAINT IF EXISTS no_future_checkin,
  ADD CONSTRAINT no_future_checkin CHECK (checked_at <= CURRENT_DATE);

-- ============================================================
-- 00005 gam_xp_transactions fixes:
-- (Obsolete: 00005 was rewritten to land on the split-FK schema directly,
--  so the old polymorphic→split data migration is no longer needed.)
-- Sync trigger already created in 00005
-- Re-create to ensure it references correct column names
DROP TRIGGER IF EXISTS gam_xp_transactions_sync_profile ON public.gam_xp_transactions;
DROP FUNCTION IF EXISTS public.sync_profile_xp_on_insert();

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

COMMENT ON FUNCTION public.sync_profile_xp_on_insert() IS
  'After XP insert, atomically updates profiles.total_xp and recomputes current_level';
