-- IronPlate AI Database Schema
-- Migration 001: Initial Schema Setup
-- Created: 2026-01-20

-- =====================================================
-- 1. USERS TABLE (Extended from Supabase Auth)
-- =====================================================
-- Extends auth.users with profile data
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  profile_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_unique UNIQUE (email)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_id ON public.users(id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE public.users IS 'User profiles with extended data from auth.users';
COMMENT ON COLUMN public.users.profile_data IS 'JSONB containing: height, weight, age, gender, goal, schedule, equipment, budget, disliked_foods';

-- =====================================================
-- 2. WORKOUT PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_active ON public.workout_plans(user_id, active) WHERE active = true;

-- Unique constraint: only one active plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_plans_user_active
  ON public.workout_plans(user_id)
  WHERE active = true;

-- Comment on table
COMMENT ON TABLE public.workout_plans IS 'AI-generated workout plans for users';
COMMENT ON COLUMN public.workout_plans.plan_data IS 'JSONB containing: weeks, days array with exercises (name, sets, reps, rest, notes)';
COMMENT ON COLUMN public.workout_plans.active IS 'Only one active plan allowed per user';

-- =====================================================
-- 3. MEAL PLANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_active ON public.meal_plans(user_id, active) WHERE active = true;

-- Unique constraint: only one active plan per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_plans_user_active
  ON public.meal_plans(user_id)
  WHERE active = true;

-- Comment on table
COMMENT ON TABLE public.meal_plans IS 'AI-generated meal plans for users';
COMMENT ON COLUMN public.meal_plans.plan_data IS 'JSONB containing: daily_calories, macros (protein, carbs, fat), meals array with foods';
COMMENT ON COLUMN public.meal_plans.active IS 'Only one active plan allowed per user';

-- =====================================================
-- 4. WORKOUT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT workout_logs_user_date_unique UNIQUE (user_id, workout_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_completed_at ON public.workout_logs(user_id, completed_at DESC);

-- Comment on table
COMMENT ON TABLE public.workout_logs IS 'Completed workout tracking with sets, reps, and weights';
COMMENT ON COLUMN public.workout_logs.exercises IS 'JSONB array containing: name, sets array with (reps, weight, completed)';
COMMENT ON COLUMN public.workout_logs.workout_date IS 'Date of workout (unique per user per day)';

-- =====================================================
-- 5. PROGRESS LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  log_type TEXT NOT NULL CHECK (log_type IN ('weight', 'pr')),
  exercise TEXT,
  value NUMERIC NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT progress_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT progress_logs_pr_exercise_check CHECK (
    (log_type = 'pr' AND exercise IS NOT NULL AND exercise IN ('bench_press', 'squat', 'deadlift'))
    OR log_type = 'weight'
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_progress_logs_user_id ON public.progress_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_type ON public.progress_logs(user_id, log_type);
CREATE INDEX IF NOT EXISTS idx_progress_logs_date ON public.progress_logs(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_progress_logs_exercise ON public.progress_logs(user_id, exercise) WHERE exercise IS NOT NULL;

-- Comment on table
COMMENT ON TABLE public.progress_logs IS 'Weight tracking and personal records (PRs) for bench, squat, deadlift';
COMMENT ON COLUMN public.progress_logs.log_type IS 'Type: "weight" for body weight logs, "pr" for personal records';
COMMENT ON COLUMN public.progress_logs.exercise IS 'For PRs: "bench_press", "squat", or "deadlift". NULL for weight logs';
COMMENT ON COLUMN public.progress_logs.value IS 'Weight value in kg';

-- =====================================================
-- 6. GROCERY LISTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.grocery_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  week_start_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT grocery_lists_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT grocery_lists_user_week_unique UNIQUE (user_id, week_start_date)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_grocery_lists_user_id ON public.grocery_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_week ON public.grocery_lists(user_id, week_start_date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE public.grocery_lists IS 'Weekly grocery lists generated from meal plans';
COMMENT ON COLUMN public.grocery_lists.items IS 'JSONB array containing: category, name, quantity, checked';
COMMENT ON COLUMN public.grocery_lists.week_start_date IS 'Monday of the week (unique per user)';

-- =====================================================
-- 7. EXERCISE SWAPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exercise_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  original_exercise TEXT NOT NULL,
  swapped_exercise TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exercise_swaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Index for performance and swap count queries
CREATE INDEX IF NOT EXISTS idx_exercise_swaps_user_id ON public.exercise_swaps(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_swaps_date ON public.exercise_swaps(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_exercise_swaps_created_at ON public.exercise_swaps(created_at DESC);

-- Comment on table
COMMENT ON TABLE public.exercise_swaps IS 'Tracking of exercise swaps for analytics and swap limits';
COMMENT ON COLUMN public.exercise_swaps.workout_date IS 'Date of workout where swap occurred';
COMMENT ON COLUMN public.exercise_swaps.original_exercise IS 'Exercise that was replaced';
COMMENT ON COLUMN public.exercise_swaps.swapped_exercise IS 'AI-suggested replacement exercise';

-- =====================================================
-- HELPER FUNCTION: Get swap count for a workout
-- =====================================================
CREATE OR REPLACE FUNCTION get_swap_count(p_user_id UUID, p_workout_date DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.exercise_swaps
    WHERE user_id = p_user_id AND workout_date = p_workout_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_swap_count IS 'Returns number of swaps for a user on a specific workout date (max 3)';

-- =====================================================
-- HELPER FUNCTION: Deactivate old plans
-- =====================================================
CREATE OR REPLACE FUNCTION deactivate_old_plans(p_user_id UUID, p_plan_type TEXT)
RETURNS VOID AS $$
BEGIN
  IF p_plan_type = 'workout' THEN
    UPDATE public.workout_plans
    SET active = false
    WHERE user_id = p_user_id AND active = true;
  ELSIF p_plan_type = 'meal' THEN
    UPDATE public.meal_plans
    SET active = false
    WHERE user_id = p_user_id AND active = true;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION deactivate_old_plans IS 'Deactivates all active plans before creating a new one';

-- =====================================================
-- SCHEMA VALIDATION
-- =====================================================
-- Verify all tables were created
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('users', 'workout_plans', 'meal_plans', 'workout_logs', 'progress_logs', 'grocery_lists', 'exercise_swaps');

  IF table_count <> 7 THEN
    RAISE EXCEPTION 'Schema migration failed: Expected 7 tables, found %', table_count;
  END IF;

  RAISE NOTICE 'Schema migration completed successfully: % tables created', table_count;
END $$;
