'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { OnboardingFormData, HeightUnit, WeightUnit } from '@/lib/validation/profile';

interface Step1Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

export function Step1HeightWeight({ formData, updateFormData }: Step1Props) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Let&apos;s get started</h2>
        <p className="text-muted-foreground">
          Enter your height and weight to help us personalize your plan
        </p>
      </div>

      {/* Height Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Height</Label>
          <ToggleGroup
            type="single"
            value={formData.heightUnit}
            onValueChange={(value) => {
              if (value) {
                updateFormData({ heightUnit: value as HeightUnit });
              }
            }}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem
              value="cm"
              className="h-9 px-4 data-[state=on]:bg-background"
            >
              cm
            </ToggleGroupItem>
            <ToggleGroupItem
              value="ft"
              className="h-9 px-4 data-[state=on]:bg-background"
            >
              ft/in
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {formData.heightUnit === 'cm' ? (
          <div className="relative">
            <Input
              type="number"
              inputMode="decimal"
              placeholder="170"
              value={formData.height}
              onChange={(e) => updateFormData({ height: e.target.value })}
              className="h-14 text-lg pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              cm
            </span>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="5"
                value={formData.heightFeet}
                onChange={(e) => updateFormData({ heightFeet: e.target.value })}
                className="h-14 text-lg pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                ft
              </span>
            </div>
            <div className="relative flex-1">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="10"
                value={formData.heightInches}
                onChange={(e) => updateFormData({ heightInches: e.target.value })}
                className="h-14 text-lg pr-10"
                min={0}
                max={11}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                in
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Weight Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Weight</Label>
          <ToggleGroup
            type="single"
            value={formData.weightUnit}
            onValueChange={(value) => {
              if (value) {
                updateFormData({ weightUnit: value as WeightUnit });
              }
            }}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem
              value="kg"
              className="h-9 px-4 data-[state=on]:bg-background"
            >
              kg
            </ToggleGroupItem>
            <ToggleGroupItem
              value="lbs"
              className="h-9 px-4 data-[state=on]:bg-background"
            >
              lbs
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="relative">
          <Input
            type="number"
            inputMode="decimal"
            placeholder={formData.weightUnit === 'kg' ? '70' : '154'}
            value={formData.weight}
            onChange={(e) => updateFormData({ weight: e.target.value })}
            className="h-14 text-lg pr-12"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            {formData.weightUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
