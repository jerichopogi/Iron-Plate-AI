'use client';

import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export interface SessionData {
  session: Session | null;
  user: User | null;
}

/**
 * Client-side session utilities
 * Use these functions in Client Components
 */
export const clientAuth = {
  /**
   * Get current session (Client-side)
   */
  async getSession(): Promise<SessionData> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error.message);
      return { session: null, user: null };
    }

    return {
      session,
      user: session?.user ?? null,
    };
  },

  /**
   * Refresh session token (Client-side)
   * Call this when token is about to expire
   */
  async refreshSession(): Promise<Session | null> {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error('Error refreshing session:', error.message);
      return null;
    }

    return session;
  },

  /**
   * Sign out user (Client-side)
   */
  async signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  },

  /**
   * Subscribe to auth state changes (Client-side)
   */
  onAuthStateChange(callback: (session: Session | null) => void) {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        callback(session);
      }
    );

    return subscription;
  },
};
