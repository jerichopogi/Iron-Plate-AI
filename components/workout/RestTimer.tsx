/**
 * RestTimer Component
 *
 * Circular countdown display with pause/resume/skip controls.
 * Shows time remaining in MM:SS format with visual progress ring.
 */

'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pause, Play, SkipForward, X } from 'lucide-react';
import { formatTime } from '@/hooks/useRestTimer';

interface RestTimerProps {
  timeRemaining: number;
  totalTime: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onClose?: () => void;
}

export function RestTimer({
  timeRemaining,
  totalTime,
  progress,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onSkip,
  onClose,
}: RestTimerProps) {
  // Don't render if timer is not running
  if (!isRunning && timeRemaining === 0) {
    return null;
  }

  // SVG circle calculations
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-6 p-8">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close timer"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        {/* Timer label */}
        <p className="text-lg font-medium text-muted-foreground">Rest Time</p>

        {/* Circular progress timer */}
        <div className="relative">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                'transition-all duration-1000 ease-linear',
                timeRemaining <= 10 ? 'text-destructive' : 'text-primary'
              )}
            />
          </svg>

          {/* Time display in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn(
                'text-4xl font-bold tabular-nums',
                timeRemaining <= 10 && 'text-destructive animate-pulse'
              )}
            >
              {formatTime(timeRemaining)}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              of {formatTime(totalTime)}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          {/* Pause/Resume button */}
          <Button
            variant="outline"
            size="lg"
            className="h-14 w-14 rounded-full"
            onClick={isPaused ? onResume : onPause}
            aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
          >
            {isPaused ? (
              <Play className="h-6 w-6" />
            ) : (
              <Pause className="h-6 w-6" />
            )}
          </Button>

          {/* Skip button */}
          <Button
            variant="secondary"
            size="lg"
            className="h-14 px-6 rounded-full"
            onClick={onSkip}
            aria-label="Skip rest timer"
          >
            <SkipForward className="h-5 w-5 mr-2" />
            Skip
          </Button>
        </div>

        {/* Status text */}
        <p className="text-sm text-muted-foreground">
          {isPaused ? 'Timer paused' : 'Next set coming up...'}
        </p>
      </div>
    </div>
  );
}

/**
 * MiniRestTimer Component
 *
 * Compact inline timer for display within exercise cards
 */
interface MiniRestTimerProps {
  timeRemaining: number;
  isRunning: boolean;
  onClick?: () => void;
}

export function MiniRestTimer({
  timeRemaining,
  isRunning,
  onClick,
}: MiniRestTimerProps) {
  if (!isRunning) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
        'text-sm font-medium tabular-nums',
        'transition-colors cursor-pointer',
        timeRemaining <= 10
          ? 'bg-destructive/10 text-destructive animate-pulse'
          : 'bg-primary/10 text-primary'
      )}
      aria-label={`Rest timer: ${formatTime(timeRemaining)} remaining. Click to view full timer.`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {formatTime(timeRemaining)}
    </button>
  );
}
