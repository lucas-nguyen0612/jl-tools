-- ============================================================
-- 00003_create_habit_definitions.sql
-- Creates the habit definitions table
-- Depends on: 00001_create_profiles.sql
-- ============================================================

-- Frequency enum
DO $$ BEGIN
  CREATE TYPE habit_frequency AS ENUM ('daily', 'weekly', 'custom');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Habit definitions table (the habit templates)
CREATE TABLE IF NOT EXISTS public.habit_definitions (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT           NOT NULL,
  icon            TEXT           NOT NULL DEFAULT 'star',   -- FIX #18: stored as key string, rendered as emoji in UI
  color           TEXT           NOT NULL DEFAULT '#00ff88',
  frequency       habit_frequency NOT NULL DEFAULT 'daily',
  custom_days     SMALLINT[]     DEFAULT NULL,
  is_archived     BOOLEAN        NOT NULL DEFAULT FALSE,
  current_streak  INTEGER        NOT NULL DEFAULT 0,
  longest_streak  INTEGER        NOT NULL DEFAULT 0,
  position        INTEGER        NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CONSTRAINT habit_name_not_empty    CHECK (char_length(trim(name)) > 0),
  -- FIX #6: custom_days values must be 0-6 (Sunday=0 through Saturday=6)
  CONSTRAINT custom_days_valid       CHECK (
    custom_days IS NULL OR
    (array_length(custom_days, 1) > 0 AND
     custom_days <@ ARRAY[0,1,2,3,4,5,6]::smallint[])
  )
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_habit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER habit_definitions_updated_at
  BEFORE UPDATE ON public.habit_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_habit_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_habit_definitions_user_id
  ON public.habit_definitions (user_id);
-- FIX #10: Drop redundant partial index — queries use (user_id) index with WHERE is_archived=false
-- The base index (user_id) covers all lookups; partial index is redundant for B-tree

COMMENT ON TABLE public.habit_definitions IS 'Habit templates created by users';
COMMENT ON COLUMN public.habit_definitions.custom_days IS 'For custom frequency: array of weekdays (0=Sun, 1=Mon, ..., 6=Sat)';
COMMENT ON COLUMN public.habit_definitions.icon IS 'Icon key string (e.g., star, check, fire) — rendered as emoji in UI';
COMMENT ON COLUMN public.habit_definitions.current_streak IS 'Current consecutive days habit was completed (application-maintained)';
COMMENT ON COLUMN public.habit_definitions.longest_streak IS 'All-time longest streak (application-maintained)';
