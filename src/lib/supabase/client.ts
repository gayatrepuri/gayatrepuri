import { createBrowserClient } from "@supabase/ssr";

// Supabase connection for code running in the browser (e.g. file uploads).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
