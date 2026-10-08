"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button, Label, Notice } from "@/components/ui";
import { JOINING_METHODS } from "@/lib/bom/fields";
import { parseNumber } from "@/lib/bom/mapping";
import type { Part, PartInput } from "@/lib/parts/schema";
import { saveParts } from "./actions";

type YesNo = "" | "yes" | "no";

// While editing, every value is kept as text so half-typed numbers like "12." are allowed.
type Row = {
  id: string;
  part_number: string;
  description: string;
  quantity: string;
  material: string;
  unit_cost: string;
  annual_volume: string;
  supplier: string;
  make_or_buy: "" | "make" | "buy";
  function: string;
  connects_to: string;
  joining_method: "" | (typeof JOINING_METHODS)[number];
  wears_out: YesNo;
  used_standalone: YesNo;
};

export type DrawingLink = { id: string; fileName: string; url: string | null; partId: string | null };

const toText = (v: string | number | null) => (v === null || v === undefined ? "" : String(v));
const toYesNo = (v: boolean | null): YesNo => (v === null ? "" : v ? "yes" : "no");
const fromYesNo = (v: YesNo) => (v === "" ? null : v === "yes");

function toRow(p: Part): Row {
  return {
    id: p.id,
    part_number: p.part_number,
    description: toText(p.description),
    quantity: toText(p.quantity),
    material: toText(p.material),
    unit_cost: toText(p.unit_cost),
    annual_volume: toText(p.annual_volume),
    supplier: toText(p.supplier),
    make_or_buy: p.make_or_buy ?? "",
    function: toText(p.function),
    connects_to: toText(p.connects_to),
    joining_method: p.joining_method ?? "",
    wears_out: toYesNo(p.wears_out),
    used_standalone: toYesNo(p.used_standalone),
  };
}

function toInput(r: Row, index: number): PartInput {
  const volume = parseNumber(r.annual_volume);
  return {
    id: r.id,
    sort_order: index,
    part_number: r.part_number,
    description: r.description,
    quantity: parseNumber(r.quantity) ?? NaN,
    material: r.material,
    unit_cost: r.unit_cost.trim() === "" ? null : (parseNumber(r.unit_cost) ?? NaN),
    annual_volume: r.annual_volume.trim() === "" ? null : volume === null ? NaN : Math.round(volume),
    supplier: r.supplier,
    make_or_buy: r.make_or_buy || null,
    function: r.function,
    connects_to: r.connects_to,
    joining_method: r.joining_method || null,
    wears_out: fromYesNo(r.wears_out),
    used_standalone: fromYesNo(r.used_standalone),
  };
}

function detailsFilled(r: Row) {
  return [r.function, r.connects_to, r.joining_method, r.wears_out, r.used_standalone].filter((v) => v !== "").length;
}

const cellInput =
  "w-full min-w-0 border border-transparent bg-transparent px-2 py-1.5 text-sm text-jungle hover:border-jet focus:border-jungle focus:bg-jet-tint";

export function PartsEditor({
  assemblyId,
  initialParts,
  drawings,
}: {
  assemblyId: string;
  initialParts: Part[];
  drawings: DrawingLink[];
}) {
  const [rows, setRows] = useState<Row[]>(() => initialParts.map(toRow));
  const [deleted, setDeleted] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const partNumbers = useMemo(() => rows.map((r) => r.part_number).filter(Boolean), [rows]);

  function update(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDirty(true);
    setMessage(null);
  }

  function addRow() {
    const id = crypto.randomUUID();
    setRows((rs) => [
      ...rs,
      { ...toRow({ id } as Part), part_number: "", quantity: "1", description: "" },
    ]);
    setSelectedId(id);
    setDirty(true);
  }

  function removeRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row || !window.confirm(`Delete part ${row.part_number || "(no number)"}?`)) return;
    setRows((rs) => rs.filter((r) => r.id !== id));
    if (initialParts.some((p) => p.id === id)) setDeleted((d) => [...d, id]);
    if (selectedId === id) setSelectedId(null);
    setDirty(true);
  }

  function save() {
    const inputs = rows.map(toInput);
    const bad = inputs.findIndex((p) => Number.isNaN(p.quantity) || Number.isNaN(p.unit_cost) || Number.isNaN(p.annual_volume));
    if (bad !== -1) {
      setMessage({ tone: "error", text: `Row ${bad + 1} (${rows[bad].part_number || "no number"}): quantity, unit cost and annual volume must be numbers.` });
      return;
    }
    startSaving(async () => {
      const result = await saveParts(assemblyId, inputs, deleted);
      if (result.error) {
        setMessage({ tone: "error", text: result.error });
      } else {
        setDeleted([]);
        setDirty(false);
        setMessage({ tone: "info", text: "All changes saved." });
      }
    });
  }

  const totalCost = rows.reduce((sum, r) => sum + (parseNumber(r.quantity) ?? 0) * (parseNumber(r.unit_cost) ?? 0), 0);
  const tagged = rows.filter((r) => detailsFilled(r) === 5).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-granite">
          <span className="num text-jungle">{rows.length}</span> parts ·{" "}
          <span className="num text-jungle">{tagged}</span> with full details · material cost per assembly{" "}
          <span className="num text-jungle">{totalCost.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={addRow} type="button">
            Add part
          </Button>
          <Button onClick={save} disabled={!dirty || saving} type="button">
            {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </div>

      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      {rows.length === 0 ? (
        <p className="border-y border-jet py-6 text-sm text-granite">
          No parts yet. Use the <strong className="text-jungle">Import BOM</strong> tab, or click Add part.
        </p>
      ) : (
        <div className="overflow-x-auto border-y border-jet">
          <table className="w-full min-w-[1400px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-granite">
              <tr className="border-b border-jet">
                <th className="w-10 px-2 py-2 font-medium">#</th>
                <th className="w-36 px-2 py-2 font-medium">Part number</th>
                <th className="w-80 px-2 py-2 font-medium">Description</th>
                <th className="w-20 px-2 py-2 text-right font-medium">Qty</th>
                <th className="w-48 px-2 py-2 font-medium">Material</th>
                <th className="w-24 px-2 py-2 text-right font-medium">Unit cost</th>
                <th className="w-24 px-2 py-2 text-right font-medium">Annual vol.</th>
                <th className="w-48 px-2 py-2 font-medium">Supplier</th>
                <th className="w-28 px-2 py-2 font-medium">Made / bought</th>
                <th className="w-32 px-2 py-2 font-medium">Details</th>
                <th className="w-10 px-2 py-2">
                  <span className="sr-only">Delete</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jet">
              {rows.map((r, i) => {
                const label = r.part_number || `row ${i + 1}`;
                const isSelected = r.id === selectedId;
                return (
                  <tr key={r.id} className={isSelected ? "bg-jet" : undefined}>
                    <td className="num px-2 text-granite">{i + 1}</td>
                    <td>
                      <input aria-label={`Part number, ${label}`} className={`${cellInput} num`} value={r.part_number} onChange={(e) => update(r.id, { part_number: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Description, ${label}`} className={cellInput} value={r.description} onChange={(e) => update(r.id, { description: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Quantity, ${label}`} inputMode="decimal" className={`${cellInput} num text-right`} value={r.quantity} onChange={(e) => update(r.id, { quantity: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Material, ${label}`} className={cellInput} value={r.material} onChange={(e) => update(r.id, { material: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Unit cost, ${label}`} inputMode="decimal" className={`${cellInput} num text-right`} value={r.unit_cost} onChange={(e) => update(r.id, { unit_cost: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Annual volume, ${label}`} inputMode="numeric" className={`${cellInput} num text-right`} value={r.annual_volume} onChange={(e) => update(r.id, { annual_volume: e.target.value })} />
                    </td>
                    <td>
                      <input aria-label={`Supplier, ${label}`} className={cellInput} value={r.supplier} onChange={(e) => update(r.id, { supplier: e.target.value })} />
                    </td>
                    <td>
                      <select aria-label={`Made or bought, ${label}`} className={cellInput} value={r.make_or_buy} onChange={(e) => update(r.id, { make_or_buy: e.target.value as Row["make_or_buy"] })}>
                        <option value="">—</option>
                        <option value="make">Made</option>
                        <option value="buy">Bought</option>
                      </select>
                    </td>
                    <td className="px-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(isSelected ? null : r.id)}
                        aria-expanded={isSelected}
                        className="text-sm text-jungle underline underline-offset-4"
                      >
                        {isSelected ? "Close" : "Edit"} <span className="num text-granite">{detailsFilled(r)}/5</span>
                      </button>
                    </td>
                    <td className="px-2 text-right">
                      <button type="button" onClick={() => removeRow(r.id)} className="text-granite hover:text-jungle" aria-label={`Delete ${label}`}>
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <PartDetails
          key={selected.id}
          row={selected}
          partNumbers={partNumbers}
          drawings={drawings.filter((d) => d.partId === selected.id)}
          onChange={(patch) => update(selected.id, patch)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

function PartDetails({
  row,
  partNumbers,
  drawings,
  onChange,
  onClose,
}: {
  row: Row;
  partNumbers: string[];
  drawings: DrawingLink[];
  onChange: (patch: Partial<Row>) => void;
  onClose: () => void;
}) {
  const field = "mt-1 block w-full rounded-sm border border-granite bg-jet-tint px-3 py-2 text-sm text-jungle";
  return (
    <section aria-labelledby="details-heading" className="border border-jungle p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="details-heading" className="text-lg font-medium">
            Part details: <span className="num">{row.part_number || "new part"}</span>
          </h2>
          <p className="mt-1 text-sm text-granite">What CAD can&apos;t show. Changes are kept until you click Save changes above.</p>
        </div>
        <button type="button" onClick={onClose} className="text-sm underline underline-offset-4">
          Close
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="d-function">Function</Label>
          <textarea id="d-function" rows={3} className={field} value={row.function} onChange={(e) => onChange({ function: e.target.value })} placeholder="What does this part do?" />
        </div>
        <div>
          <Label htmlFor="d-connects">Connects to</Label>
          <input id="d-connects" list="part-number-list" className={field} value={row.connects_to} onChange={(e) => onChange({ connects_to: e.target.value })} placeholder="Part numbers, separated by commas" />
          <datalist id="part-number-list">
            {partNumbers.map((pn) => (
              <option key={pn} value={pn} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="d-joining">Joining method</Label>
          <select id="d-joining" className={field} value={row.joining_method} onChange={(e) => onChange({ joining_method: e.target.value as Row["joining_method"] })}>
            <option value="">Not set</option>
            {JOINING_METHODS.map((m) => (
              <option key={m} value={m}>
                {m[0].toUpperCase() + m.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <ChoiceGroup legend="Does it wear out?" name="wears" value={row.wears_out} options={[["yes", "Yes, it wears"], ["no", "No"]]} onChange={(v) => onChange({ wears_out: v })} />
        <ChoiceGroup
          legend="How is it used?"
          name="standalone"
          value={row.used_standalone}
          options={[["yes", "Also on its own (spare, other products)"], ["no", "Only inside this assembly"]]}
          onChange={(v) => onChange({ used_standalone: v })}
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-granite">Drawings for this part</p>
          {drawings.length === 0 ? (
            <p className="mt-2 text-sm text-granite">None. Attach one in the Drawings tab.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm">
              {drawings.map((d) => (
                <li key={d.id}>
                  {d.url ? (
                    <a href={d.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      {d.fileName}
                    </a>
                  ) : (
                    d.fileName
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ChoiceGroup({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: YesNo;
  options: [YesNo, string][];
  onChange: (v: YesNo) => void;
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium uppercase tracking-wider text-granite">{legend}</legend>
      <div className="mt-2 space-y-1.5 text-sm">
        {[...options, ["", "Not sure"] as [YesNo, string]].map(([v, text]) => (
          <label key={v || "unset"} className="flex items-center gap-2">
            <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} className="accent-jungle" />
            {text}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
