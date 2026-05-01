// SERVER-ONLY — never import this from any 'use client' module or
// browser-side code. The service role key bypasses RLS and must
// never appear in a client bundle.
// (install the 'server-only' npm package to enforce this at build time
//  once the package is added to package.json)

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client authenticated with the service role key.
 * Throws if the required environment variable is missing so misconfiguration
 * is caught at request time rather than silently failing.
 *
 * Use only for privileged operations that RLS cannot perform
 * (e.g. admin.deleteUser). All normal data operations should use
 * the cookie-based server client from lib/supabase/server.ts.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceRoleKey) {
    throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY — set this in Vercel Environment Variables, never commit the real value')
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
