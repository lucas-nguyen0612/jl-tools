-- ============================================================
-- 00022_user_preferences.sql
-- Per-user appearance + notification preferences (jsonb).
-- Extends handle_new_user to seed a default row alongside profiles.
-- Depends on: 00001_create_profiles.sql (handle_updated_at, handle_new_user)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  appearance_settings   JSONB       NOT NULL DEFAULT '{"theme":"system","accent_hue":38}'::jsonb,
  notification_settings JSONB       NOT NULL DEFAULT '{"pomodoro_sound":true,"pomodoro_volume":70,"habit_reminders_enabled":true}'::jsonb,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at via the existing helper function from 00001.
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS: owner-only on every verb. The handle_new_user trigger uses
-- SECURITY DEFINER so it bypasses RLS for the seed row; the INSERT policy
-- here only matters for the action-side upsert fallback (e.g. legacy users
-- whose row was never seeded, or anyone whose row was manually deleted).
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_preferences_select_own
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert_own
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update_own
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Extend handle_new_user to also seed user_preferences. Re-declares the
-- function (CREATE OR REPLACE) preserving the existing profile insert and
-- adding the preferences insert. ON CONFLICT DO NOTHING keeps it idempotent
-- if the trigger ever runs twice for the same auth user.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.email, '')
    )
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Backfill: pre-existing auth.users won't trigger handle_new_user. Without
-- this, legacy users would hit a missing-row state and the action's update
-- path would no-op for them.
INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

COMMENT ON TABLE public.user_preferences IS 'Per-user appearance + notification preferences (jsonb).';
COMMENT ON COLUMN public.user_preferences.appearance_settings IS '{ theme: "light"|"dark"|"system", accent_hue: 0..360 }';
COMMENT ON COLUMN public.user_preferences.notification_settings IS '{ pomodoro_sound: bool, pomodoro_volume: 0..100, habit_reminders_enabled: bool }';
