import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Configured to initialize a single instance of the client in the browser
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
