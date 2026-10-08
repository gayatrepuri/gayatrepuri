import Link from "next/link";
import { Button, Card, Notice } from "@/components/ui";
import { startDemo } from "@/app/demo/actions";
import { anthropicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { NewAssemblyForm } from "./new-assembly-form";

export default async function DashboardPage({ searchParams }: PageProps<"/app">) {
  const { error: errorParam } = await searchParams;
  const supabase = await createClient();
  const { data: assemblies, error } = await supabase
    .from("assemblies")
    .select("id, name, is_demo, created_at")
    .order("created_at", { ascending: false });

  const { apiKey, model } = anthropicEnv();

  const checks = [
    { label: "Signed in", ok: true, detail: "Supabase login works." },
    {
      label: "Database tables",
      ok: !error,
      detail: error ? `Not found: run the setup script (${error.message})` : "Found and readable.",
    },
    {
      label: "Anthropic API key",
      ok: Boolean(apiKey),
      detail: apiKey ? `Set. Model: ${model}` : "Not set yet. Needed from Phase 3.",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-medium">Your assemblies</h1>
        <p className="mt-2 text-sm text-granite">
          Each assembly holds one bill of materials, its drawings and part details.
        </p>
      </div>

      {typeof errorParam === "string" && <Notice tone="error">{errorParam}</Notice>}

      <Card>
        <NewAssemblyForm />
        <form action={startDemo} className="mt-6 flex flex-wrap items-center gap-4 border-t border-jet pt-6">
          <Button type="submit" variant="secondary">
            Load the demo assembly
          </Button>
          <p className="text-sm text-granite">A 31-part conveyor drive unit with invented data, ready to explore.</p>
        </form>
      </Card>

      <section aria-labelledby="list-heading">
        <h2 id="list-heading" className="sr-only">
          Assembly list
        </h2>
        {assemblies && assemblies.length > 0 ? (
          <ul className="divide-y divide-jet border-y border-jet">
            {assemblies.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  <Link href={`/app/assemblies/${a.id}`} className="font-medium underline underline-offset-4">
                    {a.name}
                  </Link>
                  {a.is_demo && <span className="ml-2 text-xs uppercase tracking-wider text-granite">Demo</span>}
                </span>
                <span className="num text-granite">{new Date(a.created_at).toISOString().slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-y border-jet py-6 text-sm text-granite">No assemblies yet.</p>
        )}
      </section>

      <section aria-labelledby="setup-heading">
        <h2 id="setup-heading" className="text-xs font-medium uppercase tracking-wider text-granite">
          Setup check
        </h2>
        <table className="mt-3 w-full border-y border-jet text-left text-sm">
          <tbody className="divide-y divide-jet">
            {checks.map((c) => (
              <tr key={c.label}>
                <th scope="row" className="w-48 py-2 font-medium">
                  {c.label}
                </th>
                <td className="num w-16 py-2">{c.ok ? "OK" : "—"}</td>
                <td className="py-2 text-granite">{c.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
