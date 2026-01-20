/**
 * SetCheckbox Component
 *
 * Large touch-friendly checkbox for marking sets as complete.
 * Minimum 44px touch target for mobile accessibility.
 */

'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SetCheckboxProps {
  setNumber: number;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export function SetCheckbox({
  setNumber,
  checked,
  onChange,
  disabled = false,
}: SetCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={`Set ${setNumber} ${checked ? 'completed' : 'not completed'}`}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        // Base styles - 48px touch target for mobile
        'relative flex items-center justify-center',
        'min-w-[48px] min-h-[48px] w-12 h-12',
        'rounded-full border-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'active:scale-95',
        // Unchecked state
        !checked && !disabled && [
          'border-muted-foreground/30 bg-background',
          'hover:border-primary/50 hover:bg-primary/5',
        ],
        // Checked state
        checked && !disabled && [
          'border-primary bg-primary text-primary-foreground',
          'hover:bg-primary/90',
        ],
        // Disabled state
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Set number or check mark */}
      {checked ? (
        <Check className="h-6 w-6" strokeWidth={3} />
      ) : (
        <span className="text-sm font-semibold text-muted-foreground">
          {setNumber}
        </span>
      )}
    </button>
  );
}

/**
 * SetRow Component
 *
 * A row of set checkboxes for an exercise
 */
interface SetRowProps {
  totalSets: number;
  completedSets: Map<string, boolean>;
  exerciseId: string;
  onToggle: (setIndex: number) => void;
  disabled?: boolean;
}

export function SetRow({
  totalSets,
  completedSets,
  exerciseId,
  onToggle,
  disabled = false,
}: SetRowProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {Array.from({ length: totalSets }, (_, index) => {
        const key = `${exerciseId}-${index}`;
        const isChecked = completedSets.get(key) || false;

        return (
          <SetCheckbox
            key={index}
            setNumber={index + 1}
            checked={isChecked}
            onChange={() => onToggle(index)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
}
