-- ============================================================
-- JL-Tools — Onboarding Completion Field
-- ============================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering users by onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed
  ON public.profiles(onboarding_completed)
  WHERE onboarding_completed = false;
