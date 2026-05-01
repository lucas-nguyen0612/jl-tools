-- ============================================================
-- 00004_create_habit_entries.sql
-- Creates the habit entries (check-ins) table
-- Depends on: 00003_create_habit_definitions.sql
-- ============================================================

-- Habit entries table (daily check-ins)
CREATE TABLE IF NOT EXISTS public.habit_entries (
  id                    UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID                NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_definition_id   UUID                NOT NULL REFERENCES public.habit_definitions(id) ON DELETE CASCADE,
  checked_at            DATE                NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  -- One check-in per habit per day
  CONSTRAINT one_checkin_per_habit_per_day
    UNIQUE (habit_definition_id, checked_at),
  -- FIX #13: cannot check-in for a future date
  CONSTRAINT no_future_checkin
    CHECK (checked_at <= CURRENT_DATE)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_id
  ON public.habit_entries (user_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_habit_id
  ON public.habit_entries (habit_definition_id);
CREATE INDEX IF NOT EXISTS idx_habit_entries_user_date
  ON public.habit_entries (user_id, checked_at);
CREATE INDEX IF NOT EXISTS idx_habit_entries_checked_at
  ON public.habit_entries (checked_at);

COMMENT ON TABLE public.habit_entries IS 'Daily habit check-in records';
COMMENT ON COLUMN public.habit_entries.checked_at IS 'Date of check-in (date only, no time)';
COMMENT ON CONSTRAINT no_future_checkin
  ON public.habit_entries
  IS 'Prevents future-dated check-ins that would distort streak/analytics';
