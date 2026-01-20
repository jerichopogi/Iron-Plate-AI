'use client';

import { cn } from '@/lib/utils';
import type { OnboardingFormData, Budget } from '@/lib/validation/profile';

interface Step6Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

const budgetOptions: { value: Budget; label: string; price: string; description: string }[] = [
  {
    value: 'low',
    label: 'Budget-Friendly',
    price: '$',
    description: 'Simple, affordable meals with basic ingredients',
  },
  {
    value: 'medium',
    label: 'Moderate',
    price: '$$',
    description: 'Balanced variety with some premium options',
  },
  {
    value: 'high',
    label: 'Premium',
    price: '$$$',
    description: 'High-quality ingredients with more variety',
  },
];

export function Step6Budget({ formData, updateFormData }: Step6Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Food budget</h2>
        <p className="text-muted-foreground">
          This helps us recommend meals that fit your budget
        </p>
      </div>

      <div className="space-y-3">
        {budgetOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => updateFormData({ budget: option.value })}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
              formData.budget === option.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <div
              className={cn(
                'flex items-center justify-center w-14 h-14 rounded-full text-xl font-bold',
                formData.budget === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {option.price}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{option.label}</h3>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
