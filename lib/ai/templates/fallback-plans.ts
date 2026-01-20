import type { GeneratedPlans } from '@/types/plans';
import type { ProfileData } from '@/lib/validation/profile';

// 3-day full body beginner template
const TEMPLATE_3_DAY_WORKOUT = {
  weeks: 4,
  days: [
    {
      day: 1,
      name: 'Full Body A',
      exercises: [
        { name: 'Goblet Squat', sets: 3, reps: '10-12', rest: 90, notes: 'Keep chest up, push knees out' },
        { name: 'Dumbbell Bench Press', sets: 3, reps: '8-12', rest: 90, notes: 'Control the weight down' },
        { name: 'Dumbbell Row', sets: 3, reps: '10-12', rest: 60, notes: 'Pull to hip, squeeze shoulder blade' },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: '10-12', rest: 60, notes: 'Keep core tight' },
        { name: 'Plank', sets: 3, reps: '30-45 sec', rest: 45, notes: 'Keep body in straight line' },
      ],
    },
    {
      day: 2,
      name: 'Full Body B',
      exercises: [
        { name: 'Romanian Deadlift', sets: 3, reps: '10-12', rest: 90, notes: 'Hinge at hips, slight knee bend' },
        { name: 'Push-ups', sets: 3, reps: '8-15', rest: 60, notes: 'Full range of motion' },
        { name: 'Lat Pulldown or Pull-ups', sets: 3, reps: '8-12', rest: 90, notes: 'Pull to upper chest' },
        { name: 'Dumbbell Lunges', sets: 3, reps: '10 each leg', rest: 60, notes: 'Step out, not forward' },
        { name: 'Bicep Curls', sets: 2, reps: '12-15', rest: 45, notes: 'Control the negative' },
      ],
    },
    {
      day: 3,
      name: 'Full Body C',
      exercises: [
        { name: 'Leg Press or Squat', sets: 3, reps: '10-12', rest: 90, notes: 'Full depth if possible' },
        { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: 90, notes: '30-45 degree incline' },
        { name: 'Seated Cable Row', sets: 3, reps: '10-12', rest: 60, notes: 'Pull to belly button' },
        { name: 'Leg Curl', sets: 3, reps: '12-15', rest: 60, notes: 'Squeeze at the top' },
        { name: 'Tricep Pushdown', sets: 2, reps: '12-15', rest: 45, notes: 'Keep elbows pinned' },
      ],
    },
  ],
};

// Standard 2000 calorie meal template
const TEMPLATE_MEAL_PLAN = {
  daily_calories: 2000,
  macros: {
    protein: 150,
    carbs: 200,
    fat: 67,
  },
  meals: [
    {
      name: 'Breakfast',
      foods: [
        { item: 'Oatmeal', quantity: '1 cup dry', calories: 300 },
        { item: 'Banana', quantity: '1 medium', calories: 105 },
        { item: 'Protein Powder', quantity: '1 scoop', calories: 120 },
        { item: 'Almond Butter', quantity: '1 tbsp', calories: 100 },
      ],
    },
    {
      name: 'Lunch',
      foods: [
        { item: 'Grilled Chicken Breast', quantity: '6 oz', calories: 280 },
        { item: 'Brown Rice', quantity: '1 cup cooked', calories: 215 },
        { item: 'Mixed Vegetables', quantity: '1.5 cups', calories: 75 },
        { item: 'Olive Oil', quantity: '1 tsp', calories: 40 },
      ],
    },
    {
      name: 'Snack',
      foods: [
        { item: 'Greek Yogurt', quantity: '1 cup', calories: 150 },
        { item: 'Mixed Berries', quantity: '0.5 cup', calories: 40 },
        { item: 'Almonds', quantity: '1 oz', calories: 165 },
      ],
    },
    {
      name: 'Dinner',
      foods: [
        { item: 'Salmon Fillet', quantity: '5 oz', calories: 290 },
        { item: 'Sweet Potato', quantity: '1 medium', calories: 115 },
        { item: 'Broccoli', quantity: '1.5 cups', calories: 50 },
      ],
    },
  ],
};

function adjustCaloriesForGoal(baseCalories: number, goal: string): number {
  switch (goal) {
    case 'cut':
      return Math.round(baseCalories * 0.85);
    case 'bulk':
      return Math.round(baseCalories * 1.15);
    default:
      return baseCalories;
  }
}

function adjustMacrosForGoal(
  baseMacros: { protein: number; carbs: number; fat: number },
  goal: string,
  weight: number
): { protein: number; carbs: number; fat: number } {
  // Adjust protein based on weight (2g per kg for cut, 1.8g for bulk, 2g for recomp)
  const proteinPerKg = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 2.0;
  const protein = Math.round(weight * proteinPerKg);

  // Calculate remaining calories after protein
  const proteinCalories = protein * 4;
  const totalCalories = adjustCaloriesForGoal(2000, goal);
  const remainingCalories = totalCalories - proteinCalories;

  // Split remaining between carbs and fat based on goal
  const fatPercent = goal === 'cut' ? 0.3 : goal === 'bulk' ? 0.35 : 0.32;
  const fat = Math.round((remainingCalories * fatPercent) / 9);
  const carbs = Math.round((remainingCalories - fat * 9) / 4);

  return { protein, carbs, fat };
}

export function getFallbackPlan(profile?: ProfileData): GeneratedPlans {
  // If no profile provided, return base template
  if (!profile) {
    return {
      workout_plan: TEMPLATE_3_DAY_WORKOUT,
      meal_plan: TEMPLATE_MEAL_PLAN,
    };
  }

  // Adjust meal plan based on profile
  const adjustedCalories = adjustCaloriesForGoal(2000, profile.goal);
  const adjustedMacros = adjustMacrosForGoal(TEMPLATE_MEAL_PLAN.macros, profile.goal, profile.weight);

  // Scale meal portions based on calorie adjustment
  const calorieRatio = adjustedCalories / 2000;
  const adjustedMeals = TEMPLATE_MEAL_PLAN.meals.map((meal) => ({
    ...meal,
    foods: meal.foods.map((food) => ({
      ...food,
      calories: Math.round(food.calories * calorieRatio),
    })),
  }));

  // Adjust workout days based on schedule
  let workoutDays = TEMPLATE_3_DAY_WORKOUT.days;
  if (profile.schedule < 3) {
    // For 1-2 days, use first 2 workouts
    workoutDays = TEMPLATE_3_DAY_WORKOUT.days.slice(0, Math.max(1, profile.schedule));
  } else if (profile.schedule > 3) {
    // For 4+ days, repeat workouts
    const additionalDays = profile.schedule - 3;
    const extraDays = TEMPLATE_3_DAY_WORKOUT.days.slice(0, additionalDays).map((day, index) => ({
      ...day,
      day: 4 + index,
      name: `${day.name} (Repeat)`,
    }));
    workoutDays = [...TEMPLATE_3_DAY_WORKOUT.days, ...extraDays];
  }

  return {
    workout_plan: {
      weeks: 4,
      days: workoutDays.map((day, index) => ({ ...day, day: index + 1 })),
    },
    meal_plan: {
      daily_calories: adjustedCalories,
      macros: adjustedMacros,
      meals: adjustedMeals,
    },
  };
}
