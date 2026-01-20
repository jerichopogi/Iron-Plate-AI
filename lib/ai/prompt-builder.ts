import type { ProfileData } from '@/lib/validation/profile';

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: 'Barbell',
  dumbbells: 'Dumbbells',
  bench: 'Flat/Incline Bench',
  squat_rack: 'Squat Rack',
  pull_up_bar: 'Pull-up Bar',
  cable_machine: 'Cable Machine',
  resistance_bands: 'Resistance Bands',
  kettlebells: 'Kettlebells',
  bodyweight: 'Bodyweight exercises only',
};

const GOAL_DESCRIPTIONS: Record<string, string> = {
  cut: 'Fat loss while preserving muscle mass (caloric deficit)',
  bulk: 'Muscle building and strength gains (caloric surplus)',
  recomp: 'Body recomposition - lose fat and build muscle (maintenance calories with high protein)',
};

const BUDGET_DESCRIPTIONS: Record<string, string> = {
  low: 'Budget-friendly - focus on affordable protein sources (eggs, chicken thighs, beans, rice, oats)',
  medium: 'Moderate budget - include variety with some premium options',
  high: 'Premium budget - high-quality proteins, diverse ingredients, specialty items',
};

function getExperienceLevel(schedule: number): string {
  if (schedule <= 2) return 'beginner';
  if (schedule <= 4) return 'intermediate';
  return 'advanced';
}

function calculateTargetCalories(profile: ProfileData): number {
  // Mifflin-St Jeor Equation
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
  } else {
    bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  }

  // Activity multiplier based on schedule
  const activityMultipliers: Record<number, number> = {
    1: 1.2,
    2: 1.3,
    3: 1.4,
    4: 1.5,
    5: 1.6,
    6: 1.7,
    7: 1.8,
  };

  const tdee = bmr * (activityMultipliers[profile.schedule] || 1.4);

  // Adjust based on goal
  switch (profile.goal) {
    case 'cut':
      return Math.round(tdee - 500); // 500 cal deficit
    case 'bulk':
      return Math.round(tdee + 300); // 300 cal surplus
    case 'recomp':
    default:
      return Math.round(tdee);
  }
}

function calculateMacros(calories: number, goal: string, weight: number): { protein: number; carbs: number; fat: number } {
  // Protein: 1.6-2.2g per kg bodyweight
  const proteinMultiplier = goal === 'cut' ? 2.2 : goal === 'bulk' ? 1.8 : 2.0;
  const protein = Math.round(weight * proteinMultiplier);

  // Fat: 25-35% of calories
  const fatPercent = goal === 'cut' ? 0.25 : goal === 'bulk' ? 0.3 : 0.28;
  const fat = Math.round((calories * fatPercent) / 9);

  // Carbs: remaining calories
  const remainingCalories = calories - protein * 4 - fat * 9;
  const carbs = Math.round(remainingCalories / 4);

  return { protein, carbs, fat };
}

export function buildPlanPrompt(profile: ProfileData): string {
  const targetCalories = calculateTargetCalories(profile);
  const targetMacros = calculateMacros(targetCalories, profile.goal, profile.weight);
  const experienceLevel = getExperienceLevel(profile.schedule);
  const equipmentList = profile.equipment.map((e) => EQUIPMENT_LABELS[e] || e).join(', ');
  const dislikedFoodsList = profile.dislikedFoods.length > 0 ? profile.dislikedFoods.join(', ') : 'None';

  return `You are a certified personal trainer and registered dietitian. Generate a comprehensive workout and meal plan based on the following user profile:

## User Profile
- **Height:** ${profile.height} cm (${Math.round(profile.height / 2.54)} inches)
- **Weight:** ${profile.weight} kg (${Math.round(profile.weight * 2.205)} lbs)
- **Age:** ${profile.age} years
- **Gender:** ${profile.gender}
- **Experience Level:** ${experienceLevel}

## Fitness Goals
- **Primary Goal:** ${profile.goal.toUpperCase()} - ${GOAL_DESCRIPTIONS[profile.goal]}
- **Training Schedule:** ${profile.schedule} days per week
- **Available Equipment:** ${equipmentList}

## Nutrition Preferences
- **Budget:** ${BUDGET_DESCRIPTIONS[profile.budget]}
- **Foods to Avoid:** ${dislikedFoodsList}
- **Target Daily Calories:** ~${targetCalories} kcal
- **Target Macros:** Protein: ${targetMacros.protein}g, Carbs: ${targetMacros.carbs}g, Fat: ${targetMacros.fat}g

## Requirements

### Workout Plan Requirements:
1. Create a ${profile.schedule}-day training split optimized for ${profile.goal}
2. Each workout should have 4-6 exercises
3. Include compound movements as primary exercises
4. Adjust volume for ${experienceLevel} level
5. Only use equipment from the available list
6. Include rest periods between sets (60-120 seconds)
7. Provide helpful notes for exercise execution

### Meal Plan Requirements:
1. Create a daily meal plan with 4-5 meals
2. Hit the target calories and macros (within 10%)
3. Exclude all disliked foods completely
4. Stay within the ${profile.budget} budget constraints
5. Include practical, easy-to-prepare meals
6. Provide specific quantities for each food item

Return ONLY valid JSON with this exact structure (no markdown, no explanation, just JSON):

{
  "workout_plan": {
    "weeks": 4,
    "days": [
      {
        "day": 1,
        "name": "Day Name (e.g., Push, Pull, Legs, Upper, Lower)",
        "exercises": [
          {
            "name": "Exercise Name",
            "sets": 3,
            "reps": "8-12",
            "rest": 90,
            "notes": "Form cues or tips"
          }
        ]
      }
    ]
  },
  "meal_plan": {
    "daily_calories": ${targetCalories},
    "macros": {
      "protein": ${targetMacros.protein},
      "carbs": ${targetMacros.carbs},
      "fat": ${targetMacros.fat}
    },
    "meals": [
      {
        "name": "Meal Name (e.g., Breakfast, Lunch)",
        "foods": [
          {
            "item": "Food item name",
            "quantity": "Amount with unit",
            "calories": 300
          }
        ]
      }
    ]
  }
}

Important: Return ONLY the JSON object. Do not include any text before or after the JSON.`;
}
