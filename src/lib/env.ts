// Reads settings ("environment variables") and gives a clear message if one is missing.

// Supabase's dashboard sometimes shows the URL with an extra ending such as "/rest/v1/".
// Only the "https://xxxx.supabase.co" part is wanted, so anything after it is removed.
export function cleanSupabaseUrl(raw: string | undefined) {
  const value = (raw ?? "").trim();
  if (!value) return "";
  try {
    return new URL(value).origin;
  } catch {
    return value;
  }
}

export function supabaseEnv() {
  const url = cleanSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !key) {
    throw new Error(
      "Supabase settings are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local (see .env.example).",
    );
  }
  return { url, key };
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

// Server-only: never prefix these with NEXT_PUBLIC_, so they are never sent to the browser.
export function anthropicEnv() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    model: process.env.ANTHROPIC_MODEL || "claude-opus-5-5",
  };
}
