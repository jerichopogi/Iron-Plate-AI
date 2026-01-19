-- IronPlate AI Row Level Security Policies
-- Migration 002: RLS Policies for User Data Isolation
-- Created: 2026-01-20

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- =====================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_swaps ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. USERS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON public.users
  FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- 2. WORKOUT PLANS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own workout plans
CREATE POLICY "Users can view own workout plans"
  ON public.workout_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workout plans
CREATE POLICY "Users can insert own workout plans"
  ON public.workout_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout plans
CREATE POLICY "Users can update own workout plans"
  ON public.workout_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own workout plans
CREATE POLICY "Users can delete own workout plans"
  ON public.workout_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. MEAL PLANS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own meal plans
CREATE POLICY "Users can view own meal plans"
  ON public.meal_plans
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own meal plans
CREATE POLICY "Users can insert own meal plans"
  ON public.meal_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own meal plans
CREATE POLICY "Users can update own meal plans"
  ON public.meal_plans
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own meal plans
CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. WORKOUT LOGS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own workout logs
CREATE POLICY "Users can view own workout logs"
  ON public.workout_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own workout logs
CREATE POLICY "Users can insert own workout logs"
  ON public.workout_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout logs
CREATE POLICY "Users can update own workout logs"
  ON public.workout_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own workout logs
CREATE POLICY "Users can delete own workout logs"
  ON public.workout_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. PROGRESS LOGS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own progress logs
CREATE POLICY "Users can view own progress logs"
  ON public.progress_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress logs
CREATE POLICY "Users can insert own progress logs"
  ON public.progress_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress logs
CREATE POLICY "Users can update own progress logs"
  ON public.progress_logs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own progress logs
CREATE POLICY "Users can delete own progress logs"
  ON public.progress_logs
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. GROCERY LISTS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own grocery lists
CREATE POLICY "Users can view own grocery lists"
  ON public.grocery_lists
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own grocery lists
CREATE POLICY "Users can insert own grocery lists"
  ON public.grocery_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own grocery lists
CREATE POLICY "Users can update own grocery lists"
  ON public.grocery_lists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own grocery lists
CREATE POLICY "Users can delete own grocery lists"
  ON public.grocery_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. EXERCISE SWAPS TABLE RLS POLICIES
-- =====================================================
-- Users can view their own exercise swaps
CREATE POLICY "Users can view own exercise swaps"
  ON public.exercise_swaps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own exercise swaps
CREATE POLICY "Users can insert own exercise swaps"
  ON public.exercise_swaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own exercise swaps
CREATE POLICY "Users can update own exercise swaps"
  ON public.exercise_swaps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own exercise swaps
CREATE POLICY "Users can delete own exercise swaps"
  ON public.exercise_swaps
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- RLS VALIDATION
-- =====================================================
-- Verify RLS is enabled on all tables
DO $$
DECLARE
  rls_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Check RLS is enabled on all 7 tables
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('users', 'workout_plans', 'meal_plans', 'workout_logs', 'progress_logs', 'grocery_lists', 'exercise_swaps')
  AND rowsecurity = true;

  IF rls_count <> 7 THEN
    RAISE EXCEPTION 'RLS migration failed: Expected RLS on 7 tables, found %', rls_count;
  END IF;

  -- Check policies exist (4 policies per table = 28 total)
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('users', 'workout_plans', 'meal_plans', 'workout_logs', 'progress_logs', 'grocery_lists', 'exercise_swaps');

  IF policy_count < 28 THEN
    RAISE WARNING 'Expected at least 28 RLS policies, found %', policy_count;
  END IF;

  RAISE NOTICE 'RLS migration completed successfully: RLS enabled on % tables with % policies', rls_count, policy_count;
END $$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.progress_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grocery_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercise_swaps TO authenticated;

-- Grant usage on sequences (for auto-incrementing IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Revoke all permissions from anon users (except what they need for signup)
REVOKE ALL ON public.users FROM anon;
REVOKE ALL ON public.workout_plans FROM anon;
REVOKE ALL ON public.meal_plans FROM anon;
REVOKE ALL ON public.workout_logs FROM anon;
REVOKE ALL ON public.progress_logs FROM anon;
REVOKE ALL ON public.grocery_lists FROM anon;
REVOKE ALL ON public.exercise_swaps FROM anon;

RAISE NOTICE 'Permissions granted: authenticated users have full access via RLS, anon users restricted';
