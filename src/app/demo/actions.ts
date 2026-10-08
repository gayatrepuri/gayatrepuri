"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEMO_ASSEMBLY, DEMO_COST_SETTINGS, DEMO_PARTS } from "@/lib/demo/conveyor-drive";

/**
 * "Try the demo": signs the visitor in as a guest if needed (no email asked),
 * then creates a fresh copy of the sample assembly for them and opens it.
 */
export async function startDemo() {
  const supabase = await createClient();

  let { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      const message = encodeURIComponent(
        "The demo needs guest sign-in switched on in Supabase (Authentication → Sign In / Providers → Allow anonymous sign-ins).",
      );
      redirect(`/login?error=${message}`);
    }
    auth = { user: data.user };
  }

  const { data: assembly, error } = await supabase
    .from("assemblies")
    .insert({ ...DEMO_ASSEMBLY, ...DEMO_COST_SETTINGS, is_demo: true })
    .select("id")
    .single();
  if (error || !assembly) {
    redirect(`/app?error=${encodeURIComponent(`Could not create the demo: ${error?.message ?? "unknown error"}`)}`);
  }

  const { error: partsError } = await supabase
    .from("parts")
    .insert(DEMO_PARTS.map((p) => ({ ...p, assembly_id: assembly.id })));
  if (partsError) {
    redirect(`/app?error=${encodeURIComponent(`Could not load demo parts: ${partsError.message}`)}`);
  }

  redirect(`/app/assemblies/${assembly.id}`);
}
