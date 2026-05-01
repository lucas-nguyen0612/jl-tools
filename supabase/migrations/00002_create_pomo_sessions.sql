-- ============================================================
-- 00002_create_pomo_sessions.sql
-- Creates the Pomodoro sessions table
-- Depends on: 00001_create_profiles.sql
-- ============================================================

-- Status enum
DO $$ BEGIN
  CREATE TYPE pomo_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Pomodoro sessions table
CREATE TABLE IF NOT EXISTS public.pomo_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label            TEXT,
  status           pomo_status NOT NULL DEFAULT 'active',
  planned_duration INTEGER     NOT NULL DEFAULT 1500
                       CHECK (planned_duration > 0),  -- FIX #7: must be positive
  actual_duration  INTEGER     NOT NULL DEFAULT 0
                       CHECK (actual_duration >= 0),   -- FIX #7: cannot be negative
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- FIX #8: active/paused sessions must not have completed_at
  CONSTRAINT no_completed_at_when_active
    CHECK (
      (status IN ('active', 'paused') AND completed_at IS NULL) OR
      (status IN ('completed', 'cancelled') AND completed_at IS NOT NULL)
    )
);

-- Index for user's session queries
CREATE INDEX IF NOT EXISTS idx_pomo_sessions_user_id
  ON public.pomo_sessions (user_id);
-- Index for today's sessions
CREATE INDEX IF NOT EXISTS idx_pomo_sessions_user_started
  ON public.pomo_sessions (user_id, started_at);

COMMENT ON TABLE public.pomo_sessions IS 'Individual Pomodoro focus sessions';
COMMENT ON COLUMN public.pomo_sessions.label IS 'Optional label for the session (e.g., "Study React")';
COMMENT ON COLUMN public.pomo_sessions.planned_duration IS 'Planned duration in seconds (default 1500 = 25 min)';
COMMENT ON COLUMN public.pomo_sessions.actual_duration IS 'Actual focused time in seconds (excludes paused time)';
