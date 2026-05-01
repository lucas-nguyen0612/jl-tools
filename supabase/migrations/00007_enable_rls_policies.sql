-- ============================================================
-- 00007_enable_rls_policies.sql
-- Enables RLS and creates owner policies on ALL tables
-- Depends on: 00001-00006 (all tables must exist first)
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner_all" ON public.profiles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- pomo_sessions
-- ============================================================
ALTER TABLE public.pomo_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pomo_sessions_owner_all" ON public.pomo_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- habit_definitions
-- ============================================================
ALTER TABLE public.habit_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_definitions_owner_all" ON public.habit_definitions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- habit_entries
-- ============================================================
ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_entries_owner_all" ON public.habit_entries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- gam_xp_transactions
-- ============================================================
ALTER TABLE public.gam_xp_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gam_xp_transactions_owner_all" ON public.gam_xp_transactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- gam_levels
-- ============================================================
-- gam_levels is a shared lookup table — read-only for all authenticated users
ALTER TABLE public.gam_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gam_levels_read_all_authenticated" ON public.gam_levels
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify levels
CREATE POLICY "gam_levels_admin_all" ON public.gam_levels
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "gam_levels_read_all_authenticated" ON public.gam_levels
  IS 'All authenticated users can read levels (needed for client-side level display)';
