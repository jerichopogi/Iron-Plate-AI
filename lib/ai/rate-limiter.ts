import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const MAX_REQUESTS_PER_DAY = 10;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  // Get today's date at midnight UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Calculate tomorrow for reset time
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  // Count today's plan generations for this user
  const { count, error } = await supabase
    .from('workout_plans')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('generated_at', today.toISOString())
    .lt('generated_at', tomorrow.toISOString());

  if (error) {
    console.error('Error checking rate limit:', error);
    // On error, allow the request but log it
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_DAY,
      resetAt: tomorrow,
    };
  }

  const usageCount = count || 0;
  const remaining = Math.max(0, MAX_REQUESTS_PER_DAY - usageCount);

  return {
    allowed: usageCount < MAX_REQUESTS_PER_DAY,
    remaining,
    resetAt: tomorrow,
  };
}

export function formatTimeUntilReset(resetAt: Date): string {
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
