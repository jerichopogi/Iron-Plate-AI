export type Gender = 'male' | 'female' | 'other';
export type Goal = 'cut' | 'bulk' | 'recomp';
export type Budget = 'low' | 'medium' | 'high';
export type HeightUnit = 'cm' | 'ft';
export type WeightUnit = 'kg' | 'lbs';

export interface ProfileData {
  height: number; // always stored in cm
  weight: number; // always stored in kg
  age: number;
  gender: Gender;
  goal: Goal;
  schedule: number; // days per week
  equipment: string[];
  budget: Budget;
  dislikedFoods: string[];
}

export interface OnboardingFormData {
  // Step 1
  height: string;
  heightUnit: HeightUnit;
  heightFeet?: string;
  heightInches?: string;
  weight: string;
  weightUnit: WeightUnit;
  // Step 2
  age: string;
  gender: Gender | '';
  // Step 3
  goal: Goal | '';
  // Step 4
  schedule: number;
  // Step 5
  equipment: string[];
  // Step 6
  budget: Budget | '';
  // Step 7
  dislikedFoods: string[];
  customDislikedFoods: string;
}

export const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'bench', label: 'Bench' },
  { id: 'squat_rack', label: 'Squat Rack' },
  { id: 'pull_up_bar', label: 'Pull-up Bar' },
  { id: 'cable_machine', label: 'Cable Machine' },
  { id: 'resistance_bands', label: 'Resistance Bands' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'bodyweight', label: 'Bodyweight Only' },
] as const;

export const DISLIKED_FOODS_OPTIONS = [
  { id: 'dairy', label: 'Dairy' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'nuts', label: 'Nuts' },
  { id: 'shellfish', label: 'Shellfish' },
  { id: 'fish', label: 'Fish' },
  { id: 'soy', label: 'Soy' },
  { id: 'red_meat', label: 'Red Meat' },
  { id: 'pork', label: 'Pork' },
  { id: 'chicken', label: 'Chicken' },
  { id: 'spicy', label: 'Spicy Foods' },
  { id: 'vegetables', label: 'Most Vegetables' },
] as const;

export const GYM_PRESET = ['barbell', 'dumbbells', 'bench', 'squat_rack', 'pull_up_bar', 'cable_machine'];
export const HOME_PRESET = ['dumbbells', 'resistance_bands', 'bodyweight'];

// Validation functions
export function validateStep1(data: OnboardingFormData): string | null {
  // Height validation
  if (data.heightUnit === 'cm') {
    const height = parseFloat(data.height);
    if (isNaN(height) || height < 100 || height > 250) {
      return 'Please enter a valid height (100-250 cm)';
    }
  } else {
    const feet = parseInt(data.heightFeet || '0');
    const inches = parseInt(data.heightInches || '0');
    if (isNaN(feet) || feet < 3 || feet > 8) {
      return 'Please enter a valid height (3-8 feet)';
    }
    if (isNaN(inches) || inches < 0 || inches > 11) {
      return 'Please enter valid inches (0-11)';
    }
    const totalInches = feet * 12 + inches;
    if (totalInches < 39 || totalInches > 98) {
      return "Please enter a valid height (3'3\" - 8'2\")";
    }
  }

  // Weight validation
  const weight = parseFloat(data.weight);
  if (data.weightUnit === 'kg') {
    if (isNaN(weight) || weight < 30 || weight > 300) {
      return 'Please enter a valid weight (30-300 kg)';
    }
  } else {
    if (isNaN(weight) || weight < 66 || weight > 660) {
      return 'Please enter a valid weight (66-660 lbs)';
    }
  }

  return null;
}

export function validateStep2(data: OnboardingFormData): string | null {
  const age = parseInt(data.age);
  if (isNaN(age) || age < 13 || age > 100) {
    return 'Please enter a valid age (13-100)';
  }

  if (!data.gender) {
    return 'Please select your gender';
  }

  return null;
}

export function validateStep3(data: OnboardingFormData): string | null {
  if (!data.goal) {
    return 'Please select your fitness goal';
  }
  return null;
}

export function validateStep4(data: OnboardingFormData): string | null {
  if (data.schedule < 1 || data.schedule > 7) {
    return 'Please select between 1-7 days per week';
  }
  return null;
}

export function validateStep5(data: OnboardingFormData): string | null {
  if (data.equipment.length === 0) {
    return 'Please select at least one equipment option';
  }
  return null;
}

export function validateStep6(data: OnboardingFormData): string | null {
  if (!data.budget) {
    return 'Please select your budget';
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function validateStep7(data: OnboardingFormData): string | null {
  // Step 7 is optional - user can have no disliked foods
  return null;
}

export const stepValidators = [
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
];

// Convert form data to profile data for storage
export function convertToProfileData(data: OnboardingFormData): ProfileData {
  // Convert height to cm
  let heightCm: number;
  if (data.heightUnit === 'cm') {
    heightCm = parseFloat(data.height);
  } else {
    const feet = parseInt(data.heightFeet || '0');
    const inches = parseInt(data.heightInches || '0');
    heightCm = Math.round((feet * 12 + inches) * 2.54);
  }

  // Convert weight to kg
  let weightKg: number;
  if (data.weightUnit === 'kg') {
    weightKg = parseFloat(data.weight);
  } else {
    weightKg = Math.round(parseFloat(data.weight) * 0.453592 * 10) / 10;
  }

  // Combine disliked foods
  const dislikedFoods = [...data.dislikedFoods];
  if (data.customDislikedFoods.trim()) {
    const customFoods = data.customDislikedFoods
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    dislikedFoods.push(...customFoods);
  }

  return {
    height: heightCm,
    weight: weightKg,
    age: parseInt(data.age),
    gender: data.gender as Gender,
    goal: data.goal as Goal,
    schedule: data.schedule,
    equipment: data.equipment,
    budget: data.budget as Budget,
    dislikedFoods,
  };
}

// Initial form data
export const initialFormData: OnboardingFormData = {
  height: '',
  heightUnit: 'cm',
  heightFeet: '',
  heightInches: '',
  weight: '',
  weightUnit: 'kg',
  age: '',
  gender: '',
  goal: '',
  schedule: 3,
  equipment: [],
  budget: '',
  dislikedFoods: [],
  customDislikedFoods: '',
};
