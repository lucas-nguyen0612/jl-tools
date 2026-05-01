-- ============================================================
-- 00001_create_profiles.sql
-- Creates the profiles table and auto-creation trigger
-- Depends on: nothing (runs first)
-- ============================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT        CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 2048),
  total_xp      INTEGER     NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER     NOT NULL DEFAULT 1 CHECK (current_level BETWEEN 1 AND 20),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile when user signs up
-- SECURITY DEFINER requires SET search_path to prevent search_path hijacking
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
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public;

-- Trigger fires AFTER insert on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles linked to Supabase auth users';
COMMENT ON COLUMN public.profiles.total_xp IS 'Cumulative XP from all sources';
COMMENT ON COLUMN public.profiles.current_level IS 'Current level (1-20), derived from total_xp';
