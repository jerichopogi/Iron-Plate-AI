/**
 * Workout Page
 *
 * Main active workout dashboard showing today's workout,
 * exercise cards with set tracking, and offline support.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkout } from '@/hooks/useWorkout';
import {
  TodayWorkoutCard,
  RestDayCard,
  NoWorkoutPlanCard,
} from '@/components/workout/TodayWorkoutCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, WifiOff, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WorkoutPage() {
  const router = useRouter();
  const {
    workout,
    completions,
    swapCount,
    isLoading,
    error,
    isOffline,
    toggleSetCompletion,
    finishWorkout,
    refetch,
  } = useWorkout();

  const [showSuccess, setShowSuccess] = useState(false);

  // Handle finish workout with success state
  const handleFinishWorkout = async (): Promise<boolean> => {
    const success = await finishWorkout();
    if (success) {
      setShowSuccess(true);
      // Redirect to dashboard after showing success
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
    return success;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your workout...</p>
        </div>
      </div>
    );
  }

  // Show success state
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Workout Complete!</h1>
          <p className="text-muted-foreground mb-4">
            Great job! Your workout has been saved.
          </p>
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
          <div className="container max-w-2xl mx-auto flex items-center justify-center gap-2 text-sm text-amber-600">
            <WifiOff className="h-4 w-4" />
            <span>You&apos;re offline. Changes will sync when connected.</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>

          <h1 className="font-semibold">Workout</h1>

          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            disabled={isLoading}
            aria-label="Refresh workout"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-2xl mx-auto px-4 py-6">
        {/* Rest day */}
        {error === 'rest_day' && <RestDayCard />}

        {/* No workout plan */}
        {error && error !== 'rest_day' && !workout && (
          <NoWorkoutPlanCard
            onGeneratePlan={() => router.push('/onboarding')}
          />
        )}

        {/* Today's workout */}
        {workout && (
          <TodayWorkoutCard
            workout={workout}
            completions={completions}
            swapCount={swapCount}
            maxSwaps={3}
            isOffline={isOffline}
            onToggleSet={toggleSetCompletion}
            onFinishWorkout={handleFinishWorkout}
          />
        )}
      </main>
    </div>
  );
}
