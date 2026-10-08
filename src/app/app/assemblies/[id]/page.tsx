import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PART_COLUMNS, type CostSettings, type Part } from "@/lib/parts/schema";
import { AssemblyHeader } from "./assembly-header";
import { BomImport } from "./bom-import";
import { CostSettingsForm } from "./cost-settings-form";
import { DrawingsPanel } from "./drawings-panel";
import { PartsEditor } from "./parts-editor";

const TABS = [
  { key: "parts", label: "Parts" },
  { key: "import", label: "Import BOM" },
  { key: "drawings", label: "Drawings" },
  { key: "costs", label: "Cost settings" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));

export default async function AssemblyPage({ params, searchParams }: PageProps<"/app/assemblies/[id]">) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: auth }, { data: assembly }, { data: partRows }, { data: fileRows }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("assemblies").select("*").eq("id", id).maybeSingle(),
    supabase.from("parts").select(PART_COLUMNS).eq("assembly_id", id).order("sort_order"),
    supabase.from("assembly_files").select("id, file_name, part_id, size_bytes, storage_path").eq("assembly_id", id).eq("kind", "drawing").order("created_at"),
  ]);
  if (!assembly || !auth.user) notFound();

  // Database "numeric" columns arrive as text; turn them into numbers.
  const parts: Part[] = (partRows ?? []).map((p) => ({
    ...p,
    quantity: Number(p.quantity),
    unit_cost: num(p.unit_cost),
    annual_volume: num(p.annual_volume),
  })) as Part[];

  // Short-lived private links for viewing drawings.
  const files = fileRows ?? [];
  const signed = files.length
    ? (await supabase.storage.from("drawings").createSignedUrls(files.map((f) => f.storage_path), 60 * 60)).data ?? []
    : [];
  const drawings = files.map((f, i) => ({
    id: f.id,
    fileName: f.file_name,
    partId: f.part_id,
    sizeBytes: f.size_bytes,
    url: signed[i]?.signedUrl ?? null,
  }));

  const costSettings: CostSettings = {
    currency: assembly.currency,
    labour_rate_per_hour: num(assembly.labour_rate_per_hour),
    new_part_number_cost: num(assembly.new_part_number_cost),
    tooling_cost_per_changed_part: num(assembly.tooling_cost_per_changed_part),
    holding_cost_pct: num(assembly.holding_cost_pct),
  };

  const tab: TabKey = TABS.some((t) => t.key === tabParam) ? (tabParam as TabKey) : "parts";

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app" className="text-sm text-granite underline underline-offset-4">
          ← All assemblies
        </Link>
        <div className="mt-4">
          <AssemblyHeader id={assembly.id} name={assembly.name} isDemo={assembly.is_demo} />
        </div>
        {assembly.description && <p className="mt-2 max-w-3xl text-sm text-granite">{assembly.description}</p>}
      </div>

      <nav aria-label="Assembly sections" className="border-b border-jet">
        <ul className="-mb-px flex flex-wrap gap-6 text-sm">
          {TABS.map((t) => (
            <li key={t.key}>
              <Link
                href={`/app/assemblies/${id}?tab=${t.key}`}
                aria-current={tab === t.key ? "page" : undefined}
                className={`inline-block border-b-2 py-3 ${tab === t.key ? "border-jungle font-medium text-jungle" : "border-transparent text-granite hover:text-jungle"}`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === "parts" && <PartsEditor key={parts.map((p) => p.id).join()} assemblyId={id} initialParts={parts} drawings={drawings} />}
      {tab === "import" && <BomImport assemblyId={id} existingCount={parts.length} />}
      {tab === "drawings" && (
        <DrawingsPanel
          assemblyId={id}
          userId={auth.user.id}
          drawings={drawings}
          parts={parts.map((p) => ({ id: p.id, part_number: p.part_number, description: p.description }))}
        />
      )}
      {tab === "costs" && <CostSettingsForm assemblyId={id} initial={costSettings} />}
    </div>
  );
}
