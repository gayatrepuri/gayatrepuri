"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateAssemblyState = { error?: string };

export async function createAssembly(_prev: CreateAssemblyState, formData: FormData): Promise<CreateAssemblyState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Give the assembly a name." };

  const supabase = await createClient();
  const { error } = await supabase.from("assemblies").insert({ name });
  if (error) return { error: `Could not save: ${error.message}` };

  revalidatePath("/app");
  return {};
}
