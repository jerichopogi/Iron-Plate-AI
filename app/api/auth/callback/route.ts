import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard';
  const origin = requestUrl.origin;

  if (code) {
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
              // Ignore errors in Server Components
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error.message);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}`
      );
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Check if user profile exists and has profile_data
      const { data: profile } = await supabase
        .from('users')
        .select('profile_data')
        .eq('id', user.id)
        .single();

      // If no profile or empty profile_data, redirect to onboarding
      const profileData = (profile as { profile_data: unknown } | null)?.profile_data;
      if (!profile || !profileData) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Check if profile_data is an empty object
      if (typeof profileData === 'object' && profileData !== null && !Array.isArray(profileData) && Object.keys(profileData).length === 0) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
    }
  }

  // Redirect to the intended destination
  return NextResponse.redirect(`${origin}${redirectTo}`);
}
