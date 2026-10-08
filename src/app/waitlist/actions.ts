"use server";

import { z } from "zod";
import { landing } from "@/config/landing";
import { createClient } from "@/lib/supabase/server";

export type WaitlistState = { ok?: boolean; message?: string; error?: string };

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(200),
  email: z.email("Please enter a valid email address.").max(320),
  company: z.string().trim().max(200).optional(),
  role: z.string().trim().max(200).optional(),
});

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  // Hidden field that people can't see; bots tend to fill it in.
  if (String(formData.get("website") ?? "") !== "") return { ok: true, message: landing.waitlist.success };

  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: String(formData.get("email") ?? "").trim(),
    company: formData.get("company") || undefined,
    role: formData.get("role") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("waitlist").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    company: parsed.data.company || null,
    role: parsed.data.role || null,
  });

  if (error) {
    if (error.code === "23505") return { ok: true, message: landing.waitlist.duplicate };
    return { error: "Sorry, that didn't work. Please try again in a moment." };
  }
  return { ok: true, message: landing.waitlist.success };
}
