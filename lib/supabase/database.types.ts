/**
 * Supabase Database Types
 *
 * Auto-generated types for type-safe database queries.
 * To regenerate: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
 *
 * Or manually update this file when schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          profile_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          profile_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          profile_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workout_plans: {
        Row: {
          id: string
          user_id: string
          plan_data: Json
          generated_at: string
          active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          plan_data?: Json
          generated_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          plan_data?: Json
          generated_at?: string
          active?: boolean
        }
      }
      meal_plans: {
        Row: {
          id: string
          user_id: string
          plan_data: Json
          generated_at: string
          active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          plan_data?: Json
          generated_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          plan_data?: Json
          generated_at?: string
          active?: boolean
        }
      }
      workout_logs: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          exercises: Json
          notes: string | null
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_date: string
          exercises?: Json
          notes?: string | null
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          exercises?: Json
          notes?: string | null
          completed_at?: string
        }
      }
      progress_logs: {
        Row: {
          id: string
          user_id: string
          log_type: 'weight' | 'pr'
          exercise: string | null
          value: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          log_type: 'weight' | 'pr'
          exercise?: string | null
          value: number
          date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          log_type?: 'weight' | 'pr'
          exercise?: string | null
          value?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      grocery_lists: {
        Row: {
          id: string
          user_id: string
          items: Json
          week_start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items?: Json
          week_start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: Json
          week_start_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      exercise_swaps: {
        Row: {
          id: string
          user_id: string
          workout_date: string
          original_exercise: string
          swapped_exercise: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workout_date: string
          original_exercise: string
          swapped_exercise: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workout_date?: string
          original_exercise?: string
          swapped_exercise?: string
          reason?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_swap_count: {
        Args: {
          p_user_id: string
          p_workout_date: string
        }
        Returns: number
      }
      deactivate_old_plans: {
        Args: {
          p_user_id: string
          p_plan_type: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for common queries
export type UserProfile = Database['public']['Tables']['users']['Row']
export type WorkoutPlan = Database['public']['Tables']['workout_plans']['Row']
export type MealPlan = Database['public']['Tables']['meal_plans']['Row']
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']
export type ProgressLog = Database['public']['Tables']['progress_logs']['Row']
export type GroceryList = Database['public']['Tables']['grocery_lists']['Row']
export type ExerciseSwap = Database['public']['Tables']['exercise_swaps']['Row']

// Profile data interface (JSONB structure)
export interface ProfileData {
  height: number // cm
  weight: number // kg
  age: number
  gender: 'male' | 'female' | 'other'
  goal: 'cut' | 'bulk' | 'recomp'
  schedule: number // days per week
  equipment: string[]
  budget: 'low' | 'medium' | 'high'
  disliked_foods: string[]
}

// Workout plan data interface (JSONB structure)
export interface WorkoutPlanData {
  weeks: number
  days: Array<{
    day: number
    name: string
    exercises: Array<{
      name: string
      sets: number
      reps: string
      rest: number // seconds
      notes?: string
    }>
  }>
}

// Meal plan data interface (JSONB structure)
export interface MealPlanData {
  daily_calories: number
  macros: {
    protein: number // grams
    carbs: number // grams
    fat: number // grams
  }
  meals: Array<{
    name: string
    foods: Array<{
      item: string
      quantity: string
      calories: number
    }>
  }>
}

// Workout exercises interface (JSONB structure)
export interface WorkoutExercises {
  name: string
  sets: Array<{
    reps: number
    weight: number // kg
    completed: boolean
  }>
}

// Grocery list items interface (JSONB structure)
export interface GroceryItem {
  category: 'Produce' | 'Meat' | 'Dairy' | 'Pantry' | 'Frozen'
  name: string
  quantity: string
  checked: boolean
}
