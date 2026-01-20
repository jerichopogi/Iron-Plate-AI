'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { OnboardingFormData, Gender } from '@/lib/validation/profile';

interface Step2Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

const genderOptions: { value: Gender; label: string; icon: string }[] = [
  { value: 'male', label: 'Male', icon: '♂' },
  { value: 'female', label: 'Female', icon: '♀' },
  { value: 'other', label: 'Other', icon: '⚧' },
];

export function Step2AgeGender({ formData, updateFormData }: Step2Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">About you</h2>
        <p className="text-muted-foreground">
          This helps us calculate your nutritional needs
        </p>
      </div>

      {/* Age Input */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Age</Label>
        <div className="relative">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="25"
            value={formData.age}
            onChange={(e) => updateFormData({ age: e.target.value })}
            className="h-14 text-lg pr-16"
            min={13}
            max={100}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            years
          </span>
        </div>
      </div>

      {/* Gender Selection */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Gender</Label>
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ gender: option.value })}
              className={cn(
                'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all min-h-[100px]',
                formData.gender === option.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-3xl">{option.icon}</span>
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
