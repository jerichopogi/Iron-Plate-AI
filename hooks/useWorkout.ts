/**
 * useWorkout Hook
 *
 * Manages workout state including fetching today's workout,
 * tracking set completions, and handling offline caching.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  cacheWorkout,
  getCachedWorkout,
  saveSetCompletion,
  getSetCompletions,
  saveWorkoutCompletion,
  clearDateCompletions,
  type TodayWorkout,
} from '@/lib/offline/workout-cache';
import { syncManager } from '@/lib/offline/sync-manager';
import type { WorkoutPlanData, WorkoutPlan } from '@/lib/supabase/database.types';

interface UseWorkoutReturn {
  workout: TodayWorkout | null;
  completions: Map<string, boolean>;
  swapCount: number;
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  toggleSetCompletion: (exerciseId: string, setIndex: number) => Promise<void>;
  finishWorkout: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate which day of the workout plan to show today
 * Based on 4-week rotation starting from when the plan was generated
 */
function calculateTodayWorkoutDay(
  planData: WorkoutPlanData,
  planGeneratedAt: string
): number {
  const generatedDate = new Date(planGeneratedAt);
  const today = new Date();

  // Reset to start of day for accurate comparison
  generatedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Calculate days since plan was generated
  const daysSinceGenerated = Math.floor(
    (today.getTime() - generatedDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Total days in the plan cycle
  const totalDays = planData.weeks * 7;

  // Calculate current day in cycle (1-indexed)
  const currentDayInCycle = (daysSinceGenerated % totalDays) + 1;

  // Find the workout day that matches
  // Workout days are scheduled as day 1, 2, 3, etc. within a week
  const dayOfWeek = ((currentDayInCycle - 1) % 7) + 1;

  // Check if this day of the week has a workout
  const workoutForDay = planData.days.find((d) => d.day === dayOfWeek);

  if (workoutForDay) {
    return workoutForDay.day;
  }

  // If no workout today (rest day), return -1
  return -1;
}

/**
 * Generate unique IDs for exercises
 */
function generateExerciseId(dayNumber: number, exerciseIndex: number, exerciseName: string): string {
  return `day${dayNumber}-ex${exerciseIndex}-${exerciseName.toLowerCase().replace(/\s+/g, '-')}`;
}

export function useWorkout(): UseWorkoutReturn {
  const [workout, setWorkout] = useState<TodayWorkout | null>(null);
  const [completions, setCompletions] = useState<Map<string, boolean>>(new Map());
  const [swapCount, setSwapCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const todayDate = getTodayDate();

  // Initialize sync manager and listen to connection changes
  useEffect(() => {
    syncManager.initialize();

    const unsubscribe = syncManager.onConnectionChange((status) => {
      setIsOffline(status === 'offline');
    });

    setIsOffline(syncManager.getConnectionStatus() === 'offline');

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch today's workout
  const fetchWorkout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to get cached workout first (for offline support)
      const cachedWorkout = await getCachedWorkout(todayDate);
      if (cachedWorkout) {
        setWorkout(cachedWorkout);
        const cachedCompletions = await getSetCompletions(todayDate);
        setCompletions(cachedCompletions);
      }

      // If offline and we have cache, use it
      if (!navigator.onLine && cachedWorkout) {
        setIsLoading(false);
        return;
      }

      // Fetch from Supabase
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('Please sign in to view your workout');
        setIsLoading(false);
        return;
      }

      // Get active workout plan
      const { data: planData, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .single<WorkoutPlan>();

      if (planError || !planData) {
        setError('No active workout plan found. Please complete onboarding to generate your plan.');
        setIsLoading(false);
        return;
      }

      const workoutPlan = planData.plan_data as unknown as WorkoutPlanData;

      // Calculate today's workout day
      const todayDayNumber = calculateTodayWorkoutDay(workoutPlan, planData.generated_at);

      if (todayDayNumber === -1) {
        // Rest day
        setWorkout(null);
        setError('rest_day');
        setIsLoading(false);
        return;
      }

      // Find today's workout
      const todayWorkoutData = workoutPlan.days.find((d) => d.day === todayDayNumber);

      if (!todayWorkoutData) {
        setError('Could not find workout for today');
        setIsLoading(false);
        return;
      }

      // Transform to TodayWorkout format
      const todayWorkout: TodayWorkout = {
        dayNumber: todayDayNumber,
        name: todayWorkoutData.name,
        exercises: todayWorkoutData.exercises.map((exercise, index) => ({
          id: generateExerciseId(todayDayNumber, index, exercise.name),
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          notes: exercise.notes,
        })),
        planId: planData.id,
        planGeneratedAt: planData.generated_at,
      };

      setWorkout(todayWorkout);

      // Cache for offline use
      await cacheWorkout(todayDate, todayWorkout);

      // Load completions from cache
      const savedCompletions = await getSetCompletions(todayDate);
      setCompletions(savedCompletions);

      // Get swap count for today
      const { count } = await supabase
        .from('exercise_swaps')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('workout_date', todayDate);

      setSwapCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch workout:', err);
      setError('Failed to load workout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [todayDate]);

  // Initial fetch
  useEffect(() => {
    fetchWorkout();
  }, [fetchWorkout]);

  // Toggle set completion
  const toggleSetCompletion = useCallback(
    async (exerciseId: string, setIndex: number) => {
      const key = `${exerciseId}-${setIndex}`;
      const newValue = !completions.get(key);

      // Update local state immediately
      setCompletions((prev) => {
        const updated = new Map(prev);
        updated.set(key, newValue);
        return updated;
      });

      // Save to IndexedDB
      await saveSetCompletion(todayDate, exerciseId, setIndex, newValue);
    },
    [completions, todayDate]
  );

  // Finish workout and save to database
  const finishWorkout = useCallback(async (): Promise<boolean> => {
    if (!workout) return false;

    try {
      // Build workout log data
      const exercises = workout.exercises.map((exercise) => {
        const sets: Array<{ reps: number; weight: number; completed: boolean }> = [];

        for (let i = 0; i < exercise.sets; i++) {
          const key = `${exercise.id}-${i}`;
          const completed = completions.get(key) || false;

          sets.push({
            reps: parseInt(exercise.reps.split('-')[0]) || 0,
            weight: 0, // Weight tracking is a future enhancement
            completed,
          });
        }

        return {
          name: exercise.name,
          sets,
        };
      });

      const completionData = {
        date: todayDate,
        exercises,
        completedAt: Date.now(),
        synced: false,
      };

      // Save to IndexedDB for syncing
      await saveWorkoutCompletion(completionData);

      // Try to sync immediately if online
      if (navigator.onLine) {
        await syncManager.forceSync();
      }

      // Clear set completions for today
      await clearDateCompletions(todayDate);
      setCompletions(new Map());

      return true;
    } catch (err) {
      console.error('Failed to finish workout:', err);
      return false;
    }
  }, [workout, completions, todayDate]);

  return {
    workout,
    completions,
    swapCount,
    isLoading,
    error,
    isOffline,
    toggleSetCompletion,
    finishWorkout,
    refetch: fetchWorkout,
  };
}
