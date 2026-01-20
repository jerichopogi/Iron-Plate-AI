import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';

export interface SessionData {
  session: Session | null;
  user: User | null;
}

/**
 * Get current user session (Server-side)
 * Use in Server Components, Server Actions, and Route Handlers
 */
export async function getSession(): Promise<SessionData> {
  const supabase = await createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error.message);
    return { session: null, user: null };
  }

  return {
    session,
    user: session?.user ?? null,
  };
}

/**
 * Get current user (Server-side)
 * Returns null if not authenticated
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error.message);
    return null;
  }

  return user;
}

/**
 * Require authentication (Server-side)
 * Redirects to login if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * Sign out user (Server-side)
 * Clears session and redirects to login
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
