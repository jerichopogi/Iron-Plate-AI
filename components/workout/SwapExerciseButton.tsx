/**
 * SwapExerciseButton Component
 *
 * Button to trigger exercise swapping with usage counter.
 * Shows remaining swaps and disables when limit reached.
 *
 * Note: The actual swap AI logic is implemented in a separate task.
 * This component only handles the UI trigger.
 */

'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwapExerciseButtonProps {
  exerciseId: string;
  exerciseName: string;
  swapCount: number;
  maxSwaps: number;
  disabled?: boolean;
  onSwapRequest?: () => void;
}

export function SwapExerciseButton({
  exerciseName,
  swapCount,
  maxSwaps,
  disabled = false,
  onSwapRequest,
}: SwapExerciseButtonProps) {
  const remainingSwaps = maxSwaps - swapCount;
  const canSwap = remainingSwaps > 0 && !disabled;

  const handleClick = () => {
    if (!canSwap) return;

    // For now, show a placeholder message
    // The actual swap modal/logic will be implemented in a separate task
    if (onSwapRequest) {
      onSwapRequest();
    } else {
      // Placeholder behavior until swap feature is implemented
      alert(
        `Exercise swap feature coming soon!\n\nYou have ${remainingSwaps} swap${remainingSwaps !== 1 ? 's' : ''} remaining today.`
      );
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={!canSwap}
        className={cn(
          'text-xs h-8 px-2',
          !canSwap && 'opacity-50'
        )}
        aria-label={
          canSwap
            ? `Swap ${exerciseName}. ${remainingSwaps} swaps remaining.`
            : disabled
            ? 'Exercise swapping unavailable offline'
            : 'No swaps remaining today'
        }
      >
        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
        Swap
      </Button>

      {/* Swap counter */}
      <span
        className={cn(
          'text-xs',
          remainingSwaps === 0 ? 'text-destructive' : 'text-muted-foreground'
        )}
      >
        {remainingSwaps}/{maxSwaps} swaps left
      </span>
    </div>
  );
}
