"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { bomFieldsSchema, costSettingsSchema, partSchema, type CostSettings, type PartInput } from "@/lib/parts/schema";
import type { ImportedPart } from "@/lib/bom/mapping";

export type ActionResult = { ok?: boolean; error?: string };

const idSchema = z.uuid();

function firstIssue(error: z.ZodError, rows?: { part_number?: string }[]) {
  const issue = error.issues[0];
  const rowIndex = typeof issue.path[0] === "number" ? issue.path[0] : null;
  const where = rowIndex !== null && rows ? ` (row ${rowIndex + 1}${rows[rowIndex]?.part_number ? `, ${rows[rowIndex].part_number}` : ""})` : "";
  return `${issue.message}${where}`;
}

function refresh(assemblyId: string) {
  revalidatePath(`/app/assemblies/${assemblyId}`);
}

/** Saves all edits from the parts table in one go. */
export async function saveParts(assemblyId: string, rows: PartInput[], deletedIds: string[]): Promise<ActionResult> {
  if (!idSchema.safeParse(assemblyId).success) return { error: "Unknown assembly." };
  const parsed = z.array(partSchema).safeParse(rows);
  if (!parsed.success) return { error: firstIssue(parsed.error, rows) };
  const ids = z.array(z.uuid()).safeParse(deletedIds);
  if (!ids.success) return { error: "Invalid delete request." };

  const supabase = await createClient();

  if (ids.data.length > 0) {
    const { error } = await supabase.from("parts").delete().eq("assembly_id", assemblyId).in("id", ids.data);
    if (error) return { error: `Could not delete parts: ${error.message}` };
  }
  if (parsed.data.length > 0) {
    const { error } = await supabase
      .from("parts")
      .upsert(parsed.data.map((p) => ({ ...p, assembly_id: assemblyId })), { onConflict: "id" });
    if (error) return { error: `Could not save parts: ${error.message}` };
  }

  refresh(assemblyId);
  return { ok: true };
}

/** Adds imported BOM rows, either replacing the current parts or adding to them. */
export async function importParts(
  assemblyId: string,
  rows: ImportedPart[],
  mode: "replace" | "append",
): Promise<ActionResult> {
  if (!idSchema.safeParse(assemblyId).success) return { error: "Unknown assembly." };
  if (rows.length === 0) return { error: "There are no rows to import." };
  if (rows.length > 2000) return { error: "That's more than 2,000 rows. Split the file into smaller assemblies." };
  const parsed = z.array(bomFieldsSchema).safeParse(rows);
  if (!parsed.success) return { error: firstIssue(parsed.error, rows) };

  const supabase = await createClient();
  let startOrder = 0;

  if (mode === "replace") {
    const { error } = await supabase.from("parts").delete().eq("assembly_id", assemblyId);
    if (error) return { error: `Could not clear old parts: ${error.message}` };
  } else {
    const { data } = await supabase
      .from("parts")
      .select("sort_order")
      .eq("assembly_id", assemblyId)
      .order("sort_order", { ascending: false })
      .limit(1);
    startOrder = (data?.[0]?.sort_order ?? -1) + 1;
  }

  const { error } = await supabase
    .from("parts")
    .insert(parsed.data.map((p, i) => ({ ...p, assembly_id: assemblyId, sort_order: startOrder + i })));
  if (error) return { error: `Could not import: ${error.message}` };

  refresh(assemblyId);
  return { ok: true };
}

export async function saveCostSettings(assemblyId: string, settings: CostSettings): Promise<ActionResult> {
  if (!idSchema.safeParse(assemblyId).success) return { error: "Unknown assembly." };
  const parsed = costSettingsSchema.safeParse(settings);
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("assemblies").update(parsed.data).eq("id", assemblyId);
  if (error) return { error: `Could not save: ${error.message}` };

  refresh(assemblyId);
  return { ok: true };
}

export async function renameAssembly(assemblyId: string, name: string): Promise<ActionResult> {
  const clean = name.trim();
  if (!idSchema.safeParse(assemblyId).success || !clean) return { error: "Give the assembly a name." };
  const supabase = await createClient();
  const { error } = await supabase.from("assemblies").update({ name: clean.slice(0, 200) }).eq("id", assemblyId);
  if (error) return { error: error.message };
  refresh(assemblyId);
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteAssembly(assemblyId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(assemblyId).success) return { error: "Unknown assembly." };
  const supabase = await createClient();

  // Remove stored drawings first, then the assembly (parts etc. are removed with it).
  const { data: files } = await supabase.from("assembly_files").select("storage_path").eq("assembly_id", assemblyId);
  if (files && files.length > 0) {
    await supabase.storage.from("drawings").remove(files.map((f) => f.storage_path));
  }
  const { error } = await supabase.from("assemblies").delete().eq("id", assemblyId);
  if (error) return { error: error.message };

  revalidatePath("/app");
  redirect("/app");
}

// ── Drawings ──────────────────────────────────────────────────

const drawingSchema = z.object({
  storagePath: z.string().min(1).max(1000),
  fileName: z.string().min(1).max(300),
  mimeType: z.string().max(100),
  sizeBytes: z.number().int().min(0),
  partId: z.uuid().nullable(),
});

/** Records a drawing that the browser has just uploaded to storage. */
export async function addDrawing(assemblyId: string, input: z.infer<typeof drawingSchema>): Promise<ActionResult> {
  if (!idSchema.safeParse(assemblyId).success) return { error: "Unknown assembly." };
  const parsed = drawingSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid file details." };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user || !parsed.data.storagePath.startsWith(`${auth.user.id}/${assemblyId}/`)) {
    return { error: "File was stored in the wrong place." };
  }

  const { error } = await supabase.from("assembly_files").insert({
    assembly_id: assemblyId,
    part_id: parsed.data.partId,
    kind: "drawing",
    storage_path: parsed.data.storagePath,
    file_name: parsed.data.fileName,
    mime_type: parsed.data.mimeType,
    size_bytes: parsed.data.sizeBytes,
  });
  if (error) return { error: error.message };

  refresh(assemblyId);
  return { ok: true };
}

export async function setDrawingPart(assemblyId: string, fileId: string, partId: string | null): Promise<ActionResult> {
  if (!idSchema.safeParse(fileId).success || (partId !== null && !idSchema.safeParse(partId).success)) {
    return { error: "Invalid request." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("assembly_files").update({ part_id: partId }).eq("id", fileId);
  if (error) return { error: error.message };
  refresh(assemblyId);
  return { ok: true };
}

export async function deleteDrawing(assemblyId: string, fileId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(fileId).success) return { error: "Invalid request." };
  const supabase = await createClient();
  const { data: file } = await supabase.from("assembly_files").select("storage_path").eq("id", fileId).single();
  if (!file) return { error: "File not found." };

  await supabase.storage.from("drawings").remove([file.storage_path]);
  const { error } = await supabase.from("assembly_files").delete().eq("id", fileId);
  if (error) return { error: error.message };

  refresh(assemblyId);
  return { ok: true };
}
