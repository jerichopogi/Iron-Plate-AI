/**
 * TodayWorkoutCard Component
 *
 * Main workout display showing today's workout name,
 * all exercises, and the finish workout button.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { useRestTimer } from '@/hooks/useRestTimer';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Dumbbell,
  Loader2,
  Timer,
  WifiOff,
} from 'lucide-react';
import type { TodayWorkout } from '@/lib/offline/workout-cache';

interface TodayWorkoutCardProps {
  workout: TodayWorkout;
  completions: Map<string, boolean>;
  swapCount: number;
  maxSwaps?: number;
  isOffline: boolean;
  onToggleSet: (exerciseId: string, setIndex: number) => void;
  onFinishWorkout: () => Promise<boolean>;
}

export function TodayWorkoutCard({
  workout,
  completions,
  swapCount,
  maxSwaps = 3,
  isOffline,
  onToggleSet,
  onFinishWorkout,
}: TodayWorkoutCardProps) {
  const [isFinishing, setIsFinishing] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const restTimer = useRestTimer({
    onComplete: () => setShowTimer(false),
  });

  // Calculate total completed sets
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets, 0);
  const completedSets = Array.from(completions.values()).filter(Boolean).length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const allComplete = completedSets === totalSets;

  // Estimate total workout time (assuming ~2 min per set including rest)
  const estimatedMinutes = totalSets * 2;

  // Handle starting the rest timer
  const handleStartTimer = (seconds: number) => {
    restTimer.start(seconds);
    setShowTimer(true);
  };

  // Handle finishing workout
  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    try {
      const success = await onFinishWorkout();
      if (success) {
        // Success state is handled by parent component
      }
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <>
      {/* Main workout card */}
      <Card className="overflow-hidden">
        {/* Workout header */}
        <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Today&apos;s Workout
              </p>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                {workout.name}
              </CardTitle>
            </div>

            {/* Offline indicator */}
            {isOffline && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                <WifiOff className="h-3.5 w-3.5" />
                Offline
              </div>
            )}
          </div>

          {/* Workout stats */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Dumbbell className="h-4 w-4" />
              <span>
                <strong className="text-foreground">{workout.exercises.length}</strong> exercises
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>
                ~<strong className="text-foreground">{estimatedMinutes}</strong> min
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completedSets}/{totalSets} sets
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300 ease-out rounded-full',
                  allComplete ? 'bg-green-500' : 'bg-primary'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Exercise list */}
          {workout.exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseNumber={index + 1}
              completions={completions}
              onToggleSet={onToggleSet}
              onStartTimer={handleStartTimer}
              swapCount={swapCount}
              maxSwaps={maxSwaps}
              isOffline={isOffline}
            />
          ))}

          {/* Finish workout button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleFinishWorkout}
              disabled={isFinishing || completedSets === 0}
              className={cn(
                'w-full h-14 text-lg font-semibold',
                allComplete && 'bg-green-600 hover:bg-green-700'
              )}
            >
              {isFinishing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : allComplete ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Complete Workout
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Finish Workout ({completedSets}/{totalSets})
                </>
              )}
            </Button>

            {completedSets === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Complete at least one set to finish your workout
              </p>
            )}

            {isOffline && (
              <p className="text-center text-sm text-amber-600 mt-2">
                Your workout will sync when you&apos;re back online
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rest timer overlay */}
      {showTimer && restTimer.isRunning && (
        <RestTimer
          timeRemaining={restTimer.timeRemaining}
          totalTime={restTimer.totalTime}
          progress={restTimer.progress}
          isRunning={restTimer.isRunning}
          isPaused={restTimer.isPaused}
          onPause={restTimer.pause}
          onResume={restTimer.resume}
          onSkip={restTimer.skip}
          onClose={() => {
            restTimer.reset();
            setShowTimer(false);
          }}
        />
      )}
    </>
  );
}

/**
 * RestDayCard Component
 *
 * Displayed when today is a rest day
 */
export function RestDayCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-center py-12">
        <div className="mx-auto mb-4">
          <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-4xl">😴</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Rest Day</CardTitle>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          No workout scheduled for today. Take this time to recover and prepare for your next session.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 text-sm text-muted-foreground">
          <h4 className="font-semibold text-foreground">Rest Day Tips:</h4>
          <ul className="space-y-2 list-disc list-inside">
            <li>Stay hydrated - drink plenty of water</li>
            <li>Get quality sleep (7-9 hours)</li>
            <li>Light stretching or yoga can help recovery</li>
            <li>Eat adequate protein to support muscle repair</li>
            <li>Take a short walk for active recovery</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * NoWorkoutPlanCard Component
 *
 * Displayed when user doesn't have an active workout plan
 */
interface NoWorkoutPlanCardProps {
  onGeneratePlan?: () => void;
}

export function NoWorkoutPlanCard({ onGeneratePlan }: NoWorkoutPlanCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 text-center py-12">
        <div className="mx-auto mb-4">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Dumbbell className="h-10 w-10 text-amber-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">No Active Workout Plan</CardTitle>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Complete your profile setup to generate a personalized workout plan.
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {onGeneratePlan && (
          <Button onClick={onGeneratePlan} className="w-full h-12 text-base">
            Complete Setup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
