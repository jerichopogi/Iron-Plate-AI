/**
 * Supabase Client Configuration (Client-Side)
 *
 * This client is used in browser/client components.
 * It uses the anonymous key and respects RLS policies.
 *
 * Usage:
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabase/client';
 *
 * export default function MyComponent() {
 *   const supabase = createClient();
 *   // Use supabase client...
 * }
 * ```
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
