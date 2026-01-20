'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EQUIPMENT_OPTIONS, GYM_PRESET, HOME_PRESET } from '@/lib/validation/profile';
import type { OnboardingFormData } from '@/lib/validation/profile';

interface Step5Props {
  formData: OnboardingFormData;
  updateFormData: (updates: Partial<OnboardingFormData>) => void;
}

export function Step5Equipment({ formData, updateFormData }: Step5Props) {
  const toggleEquipment = (equipmentId: string) => {
    const newEquipment = formData.equipment.includes(equipmentId)
      ? formData.equipment.filter((e) => e !== equipmentId)
      : [...formData.equipment, equipmentId];
    updateFormData({ equipment: newEquipment });
  };

  const applyPreset = (preset: string[]) => {
    updateFormData({ equipment: preset });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Available equipment</h2>
        <p className="text-muted-foreground">
          Select all the equipment you have access to
        </p>
      </div>

      {/* Quick select presets */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => applyPreset(GYM_PRESET)}
        >
          Gym Access
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12"
          onClick={() => applyPreset(HOME_PRESET)}
        >
          Home Gym
        </Button>
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT_OPTIONS.map((equipment) => {
          const isSelected = formData.equipment.includes(equipment.id);
          return (
            <button
              key={equipment.id}
              type="button"
              onClick={() => toggleEquipment(equipment.id)}
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
              <span className="font-medium text-sm">{equipment.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selection count */}
      <p className="text-center text-sm text-muted-foreground">
        {formData.equipment.length === 0
          ? 'Select at least one option'
          : `${formData.equipment.length} selected`}
      </p>
    </div>
  );
}
