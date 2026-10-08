"use client";

import { useState, useTransition } from "react";
import { Button, Input, Label, Notice } from "@/components/ui";
import { parseNumber } from "@/lib/bom/mapping";
import type { CostSettings } from "@/lib/parts/schema";
import { saveCostSettings } from "./actions";

const CURRENCIES = ["EUR", "GBP", "USD", "CHF", "SEK"] as const;

const FIELDS = [
  { key: "labour_rate_per_hour", label: "Labour rate", unit: "per hour", help: "Fully loaded cost of one hour of assembly or service labour." },
  { key: "new_part_number_cost", label: "Cost of creating a new part number", unit: "one-off", help: "Engineering, documentation, ERP set-up and approval for one new part number." },
  { key: "tooling_cost_per_changed_part", label: "Tooling cost per changed part", unit: "one-off", help: "Average cost of new or modified tooling, fixtures or programs for one changed part." },
  { key: "holding_cost_pct", label: "Holding cost", unit: "% of stock value per year", help: "Cost of keeping stock: capital, space, handling, obsolescence. Often 15–25%." },
] as const;

type Key = (typeof FIELDS)[number]["key"];

export function CostSettingsForm({ assemblyId, initial }: { assemblyId: string; initial: CostSettings }) {
  const [currency, setCurrency] = useState<CostSettings["currency"]>(initial.currency);
  const [values, setValues] = useState<Record<Key, string>>(() => ({
    labour_rate_per_hour: initial.labour_rate_per_hour?.toString() ?? "",
    new_part_number_cost: initial.new_part_number_cost?.toString() ?? "",
    tooling_cost_per_changed_part: initial.tooling_cost_per_changed_part?.toString() ?? "",
    holding_cost_pct: initial.holding_cost_pct?.toString() ?? "",
  }));
  const [status, setStatus] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = {} as Record<Key, number | null>;
    for (const f of FIELDS) {
      const raw = values[f.key].trim();
      const n = raw === "" ? null : parseNumber(raw);
      if (raw !== "" && n === null) {
        setStatus({ tone: "error", text: `${f.label}: "${raw}" isn't a number.` });
        return;
      }
      parsed[f.key] = n;
    }
    startSaving(async () => {
      const r = await saveCostSettings(assemblyId, { currency, ...parsed });
      setStatus(r.error ? { tone: "error", text: r.error } : { tone: "info", text: "Cost settings saved." });
    });
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-6">
      <p className="text-sm text-granite">
        These numbers are used by the savings calculator (Phase 4). The AI never sees them and never produces money figures.
      </p>
      <div className="max-w-40">
        <Label htmlFor="currency">Currency</Label>
        <select
          id="currency"
          className="mt-1 block w-full rounded-sm border border-granite bg-jet-tint px-2 py-2 text-sm text-jungle"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CostSettings["currency"])}
        >
          {CURRENCIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label htmlFor={f.key}>
            {f.label} <span className="normal-case tracking-normal">({f.key === "holding_cost_pct" ? f.unit : `${currency} ${f.unit}`})</span>
          </Label>
          <Input
            id={f.key}
            inputMode="decimal"
            className="num max-w-48"
            value={values[f.key]}
            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
            aria-describedby={`${f.key}-help`}
          />
          <p id={`${f.key}-help`} className="mt-1 text-xs text-granite">
            {f.help}
          </p>
        </div>
      ))}
      {status && <Notice tone={status.tone}>{status.text}</Notice>}
      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save cost settings"}
      </Button>
    </form>
  );
}
