'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DISLIKED_FOODS_OPTIONS } from '@/lib/validation/profile';
import type { OnboardingFormData } from '@/lib/validation/profile';

interface Step7Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

export function Step7DislikedFoods({ formData, updateFormData }: Step7Props) {
  const toggleFood = (foodId: string) => {
    const newFoods = formData.dislikedFoods.includes(foodId)
      ? formData.dislikedFoods.filter((f) => f !== foodId)
      : [...formData.dislikedFoods, foodId];
    updateFormData({ dislikedFoods: newFoods });
  };

  const clearAll = () => {
    updateFormData({ dislikedFoods: [], customDislikedFoods: '' });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Food preferences</h2>
        <p className="text-muted-foreground">
          Select any foods you want to avoid (allergies, dislikes, dietary restrictions)
        </p>
      </div>

      {/* Clear button */}
      {(formData.dislikedFoods.length > 0 || formData.customDislikedFoods) && (
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-primary hover:underline"
        >
          Clear all selections
        </button>
      )}

      {/* Food options grid */}
      <div className="grid grid-cols-2 gap-3">
        {DISLIKED_FOODS_OPTIONS.map((food) => {
          const isSelected = formData.dislikedFoods.includes(food.id);
          return (
            <button
              key={food.id}
              type="button"
              onClick={() => toggleFood(food.id)}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left min-h-[56px]',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Checkbox
                checked={isSelected}
                className="h-5 w-5 pointer-events-none"
              />
              <span className="font-medium text-sm">{food.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom foods input */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Other foods to avoid</Label>
        <Input
          type="text"
          placeholder="e.g., mushrooms, olives, cilantro"
          value={formData.customDislikedFoods}
          onChange={(e) => updateFormData({ customDislikedFoods: e.target.value })}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple items with commas
        </p>
      </div>

      {/* Selection summary */}
      <p className="text-center text-sm text-muted-foreground">
        {formData.dislikedFoods.length === 0 && !formData.customDislikedFoods
          ? "No restrictions? That's great - more options for you!"
          : `${formData.dislikedFoods.length} restriction${formData.dislikedFoods.length !== 1 ? 's' : ''} selected`}
      </p>
    </div>
  );
}
