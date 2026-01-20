import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getGeminiClient } from '@/lib/ai/gemini-client';
import { buildPlanPrompt } from '@/lib/ai/prompt-builder';
import { parseGeneratedPlans, ValidationError } from '@/lib/ai/response-parser';
import { checkRateLimit, formatTimeUntilReset } from '@/lib/ai/rate-limiter';
import { getFallbackPlan } from '@/lib/ai/templates/fallback-plans';
import type { ProfileData } from '@/lib/validation/profile';
import type { GeneratePlanResponse, GeneratePlanError } from '@/types/plans';

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore in Server Components
          }
        },
      },
    }
  );
}

function isValidProfile(profile: unknown): profile is ProfileData {
  if (typeof profile !== 'object' || profile === null) return false;
  const p = profile as Record<string, unknown>;
  return (
    typeof p.height === 'number' &&
    typeof p.weight === 'number' &&
    typeof p.age === 'number' &&
    typeof p.gender === 'string' &&
    typeof p.goal === 'string' &&
    typeof p.schedule === 'number' &&
    Array.isArray(p.equipment) &&
    p.equipment.length > 0 &&
    typeof p.budget === 'string'
  );
}

export async function POST(): Promise<NextResponse<GeneratePlanResponse | GeneratePlanError>> {
  try {
    const supabase = await getSupabaseClient();

    // 1. Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', code: 'AUTH_ERROR' },
        { status: 401 }
      );
    }

    // 2. Check rate limit
    const rateLimitResult = await checkRateLimit(user.id);

    if (!rateLimitResult.allowed) {
      const resetTime = formatTimeUntilReset(rateLimitResult.resetAt);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit exceeded. You can generate ${rateLimitResult.remaining} more plans today. Try again in ${resetTime}.`,
          code: 'RATE_LIMIT',
        },
        { status: 429 }
      );
    }

    // 3. Fetch user profile
    const { data: userRecord, error: profileError } = await supabase
      .from('users')
      .select('profile_data')
      .eq('id', user.id)
      .single();

    if (profileError || !userRecord) {
      return NextResponse.json(
        { success: false, error: 'User profile not found', code: 'INCOMPLETE_PROFILE' },
        { status: 404 }
      );
    }

    const profile = userRecord.profile_data as unknown;

    if (!isValidProfile(profile)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Incomplete profile. Please complete onboarding first.',
          code: 'INCOMPLETE_PROFILE',
        },
        { status: 400 }
      );
    }

    // 4. Try to generate plans with AI
    let generatedPlans;
    let isFallback = false;
    let message: string | undefined;

    try {
      // Check if Gemini API key is configured
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const geminiClient = getGeminiClient();
      const prompt = buildPlanPrompt(profile);
      const response = await geminiClient.generateContent(prompt);
      generatedPlans = parseGeneratedPlans(response);
    } catch (error) {
      console.error('AI generation failed:', error);

      // Use fallback plan
      generatedPlans = getFallbackPlan(profile);
      isFallback = true;

      if (error instanceof ValidationError) {
        message = 'AI returned invalid response. Using a template plan instead.';
      } else {
        message = 'AI is temporarily unavailable. Using a template plan.';
      }
    }

    // 5. Deactivate old plans
    await supabase
      .from('workout_plans')
      .update({ active: false })
      .eq('user_id', user.id)
      .eq('active', true);

    await supabase
      .from('meal_plans')
      .update({ active: false })
      .eq('user_id', user.id)
      .eq('active', true);

    // 6. Save new plans to database
    const now = new Date().toISOString();

    const { error: workoutError } = await supabase.from('workout_plans').insert({
      user_id: user.id,
      plan_data: generatedPlans.workout_plan as unknown as Record<string, unknown>,
      generated_at: now,
      active: true,
    });

    if (workoutError) {
      console.error('Failed to save workout plan:', workoutError);
      return NextResponse.json(
        { success: false, error: 'Failed to save workout plan', code: 'AI_ERROR' },
        { status: 500 }
      );
    }

    const { error: mealError } = await supabase.from('meal_plans').insert({
      user_id: user.id,
      plan_data: generatedPlans.meal_plan as unknown as Record<string, unknown>,
      generated_at: now,
      active: true,
    });

    if (mealError) {
      console.error('Failed to save meal plan:', mealError);
      return NextResponse.json(
        { success: false, error: 'Failed to save meal plan', code: 'AI_ERROR' },
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      data: generatedPlans,
      message,
      isFallback,
    });
  } catch (error) {
    console.error('Unexpected error in generate-plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred',
        code: 'AI_ERROR',
      },
      { status: 500 }
    );
  }
}
