// Workout Plan Types
export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  notes?: string;
}

export interface WorkoutDay {
  day: number;
  name: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  weeks: number;
  days: WorkoutDay[];
}

// Meal Plan Types
export interface Food {
  item: string;
  quantity: string;
  calories: number;
}

export interface Meal {
  name: string;
  foods: Food[];
}

export interface Macros {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface MealPlan {
  daily_calories: number;
  macros: Macros;
  meals: Meal[];
}

// Combined AI Response
export interface GeneratedPlans {
  workout_plan: WorkoutPlan;
  meal_plan: MealPlan;
}

// API Response Types
export interface GeneratePlanResponse {
  success: boolean;
  data?: GeneratedPlans;
  message?: string;
  isFallback?: boolean;
}

export interface GeneratePlanError {
  success: false;
  error: string;
  code: 'RATE_LIMIT' | 'INCOMPLETE_PROFILE' | 'AI_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR';
}
