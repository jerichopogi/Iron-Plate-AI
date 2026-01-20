'use client';

import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, RefreshCw } from 'lucide-react';
import type { OnboardingFormData, Goal } from '@/lib/validation/profile';

interface Step3Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

const goalOptions: { value: Goal; label: string; description: string; icon: typeof TrendingDown }[] = [
  {
    value: 'cut',
    label: 'Cut',
    description: 'Lose fat while preserving muscle mass',
    icon: TrendingDown,
  },
  {
    value: 'bulk',
    label: 'Bulk',
    description: 'Build muscle and gain strength',
    icon: TrendingUp,
  },
  {
    value: 'recomp',
    label: 'Recomp',
    description: 'Lose fat and build muscle simultaneously',
    icon: RefreshCw,
  },
];

export function Step3Goal({ formData, updateFormData }: Step3Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What&apos;s your goal?</h2>
        <p className="text-muted-foreground">
          Choose your primary fitness objective
        </p>
      </div>

      <div className="space-y-3">
        {goalOptions.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ goal: option.value })}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                formData.goal === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full',
                  formData.goal === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{option.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
