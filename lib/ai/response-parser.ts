import type { GeneratedPlans, WorkoutPlan, MealPlan, Exercise, WorkoutDay, Meal, Food, Macros } from '@/types/plans';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function isValidExercise(exercise: unknown): exercise is Exercise {
  if (typeof exercise !== 'object' || exercise === null) return false;
  const e = exercise as Record<string, unknown>;
  return (
    typeof e.name === 'string' &&
    e.name.length > 0 &&
    typeof e.sets === 'number' &&
    e.sets > 0 &&
    typeof e.reps === 'string' &&
    e.reps.length > 0 &&
    typeof e.rest === 'number' &&
    e.rest >= 0
  );
}

function isValidWorkoutDay(day: unknown): day is WorkoutDay {
  if (typeof day !== 'object' || day === null) return false;
  const d = day as Record<string, unknown>;
  return (
    typeof d.day === 'number' &&
    d.day > 0 &&
    typeof d.name === 'string' &&
    d.name.length > 0 &&
    Array.isArray(d.exercises) &&
    d.exercises.length > 0 &&
    d.exercises.every(isValidExercise)
  );
}

function isValidWorkoutPlan(plan: unknown): plan is WorkoutPlan {
  if (typeof plan !== 'object' || plan === null) return false;
  const p = plan as Record<string, unknown>;
  return (
    typeof p.weeks === 'number' &&
    p.weeks > 0 &&
    Array.isArray(p.days) &&
    p.days.length > 0 &&
    p.days.every(isValidWorkoutDay)
  );
}

function isValidFood(food: unknown): food is Food {
  if (typeof food !== 'object' || food === null) return false;
  const f = food as Record<string, unknown>;
  return (
    typeof f.item === 'string' &&
    f.item.length > 0 &&
    typeof f.quantity === 'string' &&
    f.quantity.length > 0 &&
    typeof f.calories === 'number' &&
    f.calories >= 0
  );
}

function isValidMeal(meal: unknown): meal is Meal {
  if (typeof meal !== 'object' || meal === null) return false;
  const m = meal as Record<string, unknown>;
  return (
    typeof m.name === 'string' &&
    m.name.length > 0 &&
    Array.isArray(m.foods) &&
    m.foods.length > 0 &&
    m.foods.every(isValidFood)
  );
}

function isValidMacros(macros: unknown): macros is Macros {
  if (typeof macros !== 'object' || macros === null) return false;
  const m = macros as Record<string, unknown>;
  return (
    typeof m.protein === 'number' &&
    m.protein >= 0 &&
    typeof m.carbs === 'number' &&
    m.carbs >= 0 &&
    typeof m.fat === 'number' &&
    m.fat >= 0
  );
}

function isValidMealPlan(plan: unknown): plan is MealPlan {
  if (typeof plan !== 'object' || plan === null) return false;
  const p = plan as Record<string, unknown>;
  return (
    typeof p.daily_calories === 'number' &&
    p.daily_calories > 0 &&
    isValidMacros(p.macros) &&
    Array.isArray(p.meals) &&
    p.meals.length > 0 &&
    p.meals.every(isValidMeal)
  );
}

function extractJSON(text: string): string {
  // Try to find JSON object in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  throw new ValidationError('No JSON object found in response');
}

export function parseGeneratedPlans(response: string): GeneratedPlans {
  let parsed: unknown;

  try {
    // Clean up response and extract JSON
    const jsonString = extractJSON(response.trim());
    parsed = JSON.parse(jsonString);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new ValidationError('Response is not an object');
  }

  const data = parsed as Record<string, unknown>;

  // Validate workout plan
  if (!data.workout_plan) {
    throw new ValidationError('Missing workout_plan in response');
  }

  if (!isValidWorkoutPlan(data.workout_plan)) {
    throw new ValidationError('Invalid workout_plan structure');
  }

  // Validate meal plan
  if (!data.meal_plan) {
    throw new ValidationError('Missing meal_plan in response');
  }

  if (!isValidMealPlan(data.meal_plan)) {
    throw new ValidationError('Invalid meal_plan structure');
  }

  return {
    workout_plan: data.workout_plan,
    meal_plan: data.meal_plan,
  };
}

export function parseWorkoutPlan(response: string): WorkoutPlan {
  const plans = parseGeneratedPlans(response);
  return plans.workout_plan;
}

export function parseMealPlan(response: string): MealPlan {
  const plans = parseGeneratedPlans(response);
  return plans.meal_plan;
}
