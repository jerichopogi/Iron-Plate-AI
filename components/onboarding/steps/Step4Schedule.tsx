'use client';

import { cn } from '@/lib/utils';
import type { OnboardingFormData } from '@/lib/validation/profile';

interface Step4Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

const scheduleDescriptions: Record<number, string> = {
  1: 'Minimal - Good for beginners or busy schedules',
  2: 'Light - Allows for recovery between sessions',
  3: 'Moderate - Great balance of training and rest',
  4: 'Regular - Solid training frequency',
  5: 'Frequent - Good for intermediate lifters',
  6: 'Intense - High volume training split',
  7: 'Daily - Advanced athletes only',
};

export function Step4Schedule({ formData, updateFormData }: Step4Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Training schedule</h2>
        <p className="text-muted-foreground">
          How many days per week can you work out?
        </p>
      </div>

      <div className="space-y-6">
        {/* Day selector grid */}
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => updateFormData({ schedule: day })}
              className={cn(
                'aspect-square flex items-center justify-center rounded-xl border-2 text-lg font-semibold transition-all',
                formData.schedule === day
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Description */}
        <div className="text-center p-4 bg-muted/50 rounded-xl">
          <p className="text-lg font-semibold">
            {formData.schedule} day{formData.schedule !== 1 ? 's' : ''} per week
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {scheduleDescriptions[formData.schedule]}
          </p>
        </div>

        {/* Recommendation */}
        {formData.schedule >= 3 && formData.schedule <= 5 && (
          <p className="text-center text-sm text-green-600 dark:text-green-400">
            Recommended for most people
          </p>
        )}
      </div>
    </div>
  );
}
