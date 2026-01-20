/**
 * ExerciseCard Component
 *
 * Displays an individual exercise with sets, reps, rest time,
 * and interactive set completion checkboxes.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SetRow } from './SetCheckbox';
import { SwapExerciseButton } from './SwapExerciseButton';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Clock, Repeat, Timer } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: number;
  notes?: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  exerciseNumber: number;
  completions: Map<string, boolean>;
  onToggleSet: (exerciseId: string, setIndex: number) => void;
  onStartTimer: (seconds: number) => void;
  swapCount: number;
  maxSwaps: number;
  isOffline: boolean;
}

export function ExerciseCard({
  exercise,
  exerciseNumber,
  completions,
  onToggleSet,
  onStartTimer,
  swapCount,
  maxSwaps,
  isOffline,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Count completed sets for this exercise
  const completedSetCount = Array.from({ length: exercise.sets }, (_, i) => {
    const key = `${exercise.id}-${i}`;
    return completions.get(key) ? 1 : 0;
  }).reduce<number>((a, b) => a + b, 0);

  const allSetsComplete = completedSetCount === exercise.sets;

  // Format rest time
  const formatRestTime = (seconds: number): string => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  // Handle set toggle and auto-start timer
  const handleToggleSet = (setIndex: number) => {
    const key = `${exercise.id}-${setIndex}`;
    const wasChecked = completions.get(key) || false;

    onToggleSet(exercise.id, setIndex);

    // Auto-start rest timer when checking a set (not unchecking)
    if (!wasChecked) {
      onStartTimer(exercise.rest);
    }
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        allSetsComplete && 'border-primary/50 bg-primary/5'
      )}
    >
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-4 flex items-center justify-between gap-4"
        aria-expanded={isExpanded}
        aria-label={`${exercise.name}. ${completedSetCount} of ${exercise.sets} sets complete. ${isExpanded ? 'Collapse' : 'Expand'} details.`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Exercise number badge */}
          <div
            className={cn(
              'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
              allSetsComplete
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {exerciseNumber}
          </div>

          {/* Exercise name */}
          <div className="min-w-0">
            <h3
              className={cn(
                'font-semibold text-base truncate',
                allSetsComplete && 'text-primary'
              )}
            >
              {exercise.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedSetCount}/{exercise.sets} sets
            </p>
          </div>
        </div>

        {/* Expand/collapse icon */}
        <div className="flex-shrink-0 text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4">
          {/* Exercise details */}
          <div className="flex flex-wrap gap-4 mb-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Repeat className="h-4 w-4" />
              <span>
                <strong className="text-foreground">{exercise.sets}</strong> x{' '}
                <strong className="text-foreground">{exercise.reps}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>
                Rest: <strong className="text-foreground">{formatRestTime(exercise.rest)}</strong>
              </span>
            </div>
          </div>

          {/* Notes if present */}
          {exercise.notes && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p>{exercise.notes}</p>
            </div>
          )}

          {/* Set checkboxes */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Tap to mark sets complete:
            </p>
            <SetRow
              totalSets={exercise.sets}
              completedSets={completions}
              exerciseId={exercise.id}
              onToggle={(setIndex) => handleToggleSet(setIndex)}
            />
          </div>

          {/* Manual timer button */}
          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onStartTimer(exercise.rest)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Clock className="h-4 w-4" />
              Start {formatRestTime(exercise.rest)} timer
            </button>

            {/* Swap exercise button */}
            <SwapExerciseButton
              exerciseId={exercise.id}
              exerciseName={exercise.name}
              swapCount={swapCount}
              maxSwaps={maxSwaps}
              disabled={isOffline}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
