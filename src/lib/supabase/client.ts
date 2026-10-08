import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnv } from "@/lib/env";

// Supabase connection for code running in the browser (e.g. file uploads).
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient(url, key);
}
