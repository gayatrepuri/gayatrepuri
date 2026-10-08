"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Label, Notice } from "@/components/ui";
import { BOM_FIELDS } from "@/lib/bom/fields";
import { applyMapping, cellToText, detectHeaderRow, guessMapping, type ColumnMapping, type Table } from "@/lib/bom/mapping";
import { ACCEPTED_EXTENSIONS, readerFor, type ReadResult } from "@/lib/importers";
import { importParts } from "./actions";

const columnLetter = (i: number) => {
  let s = "";
  for (let n = i + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

export function BomImport({ assemblyId, existingCount }: { assemblyId: string; existingCount: number }) {
  const router = useRouter();
  const [fileName, setFileName] = useState<string | null>(null);
  const [sheets, setSheets] = useState<ReadResult["sheets"]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);
  const [headerRow, setHeaderRow] = useState(0);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [mode, setMode] = useState<"replace" | "append">(existingCount > 0 ? "append" : "replace");
  const [error, setError] = useState<string | null>(null);
  const [importing, startImport] = useTransition();

  const table: Table = useMemo(() => sheets[sheetIndex]?.table ?? [], [sheets, sheetIndex]);
  const headers = table[headerRow] ?? [];
  const width = Math.max(0, ...table.slice(0, 50).map((r) => r.length));

  const result = useMemo(
    () => (mapping ? applyMapping(table, headerRow, mapping) : null),
    [table, headerRow, mapping],
  );

  function chooseSheet(table: Table) {
    const h = detectHeaderRow(table);
    setHeaderRow(h);
    setMapping(guessMapping(table[h] ?? []));
  }

  async function onFile(file: File | undefined) {
    setError(null);
    setSheets([]);
    setMapping(null);
    if (!file) return;
    const reader = readerFor(file.name);
    if (!reader) {
      setError("Please choose a .csv or .xlsx file. Older .xls files: open in Excel and use File → Save As → Excel Workbook (.xlsx).");
      return;
    }
    try {
      const read = await reader.read(file);
      const usable = read.sheets.filter((s) => s.table.length > 0);
      if (usable.length === 0) {
        setError("That file looks empty.");
        return;
      }
      setFileName(file.name);
      setSheets(usable);
      setSheetIndex(0);
      chooseSheet(usable[0].table);
    } catch {
      setError("Sorry, that file couldn't be read. Check it opens in Excel, then try again.");
    }
  }

  function runImport() {
    if (!result || result.parts.length === 0) return;
    if (mode === "replace" && existingCount > 0 && !window.confirm(`This removes the ${existingCount} existing parts and their details. Continue?`)) {
      return;
    }
    setError(null);
    startImport(async () => {
      const r = await importParts(assemblyId, result.parts, mode);
      if (r.error) {
        setError(r.error);
      } else {
        router.push(`/app/assemblies/${assemblyId}?tab=parts`);
        router.refresh();
      }
    });
  }

  const select = "mt-1 block w-full rounded-sm border border-granite bg-jet-tint px-2 py-2 text-sm text-jungle";

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">1. Choose a file</h2>
        <p className="text-sm text-granite">
          CSV or Excel (.xlsx). The file is read in your browser; nothing is saved until you click Import.{" "}
          <a href="/samples/conveyor-drive-bom.csv" className="text-jungle underline underline-offset-4">
            Download a sample BOM
          </a>{" "}
          to try it.
        </p>
        <input
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={(e) => onFile(e.target.files?.[0])}
          className="block text-sm file:mr-4 file:rounded-sm file:border file:border-jungle file:bg-jungle file:px-4 file:py-2 file:text-sm file:font-medium file:text-jet-tint"
        />
        {error && <Notice tone="error">{error}</Notice>}
      </section>

      {mapping && (
        <>
          <section className="space-y-4">
            <h2 className="text-lg font-medium">2. Tell us which column is which</h2>
            <p className="text-sm text-granite">
              We guessed from your column names in <span className="text-jungle">{fileName}</span>. Change any that are wrong. Only Part number is required.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {sheets.length > 1 && (
                <div>
                  <Label htmlFor="sheet">Sheet</Label>
                  <select
                    id="sheet"
                    className={select}
                    value={sheetIndex}
                    onChange={(e) => {
                      const i = Number(e.target.value);
                      setSheetIndex(i);
                      chooseSheet(sheets[i].table);
                    }}
                  >
                    {sheets.map((s, i) => (
                      <option key={s.name} value={i}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <Label htmlFor="header-row">Column names are in row</Label>
                <input
                  id="header-row"
                  type="number"
                  min={1}
                  max={Math.max(1, table.length)}
                  className={`${select} num`}
                  value={headerRow + 1}
                  onChange={(e) => {
                    const h = Math.min(Math.max(1, Number(e.target.value) || 1), table.length) - 1;
                    setHeaderRow(h);
                    setMapping(guessMapping(table[h] ?? []));
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BOM_FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={`map-${f.key}`}>
                    {f.label}
                    {f.required && " *"}
                  </Label>
                  <select
                    id={`map-${f.key}`}
                    className={select}
                    value={mapping[f.key] ?? ""}
                    onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value === "" ? null : Number(e.target.value) })}
                  >
                    <option value="">— not in file —</option>
                    {Array.from({ length: width }, (_, i) => (
                      <option key={i} value={i}>
                        {columnLetter(i)}: {cellToText(headers[i]) ?? "(no name)"}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {result && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium">3. Check and import</h2>
              <p className="text-sm text-granite">
                <span className="num text-jungle">{result.parts.length}</span> parts ready to import. First rows:
              </p>
              <div className="overflow-x-auto border-y border-jet">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-granite">
                    <tr className="border-b border-jet">
                      {BOM_FIELDS.map((f) => (
                        <th key={f.key} className="px-2 py-2 font-medium">
                          {f.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-jet">
                    {result.parts.slice(0, 8).map((p, i) => (
                      <tr key={i}>
                        <td className="num whitespace-nowrap px-2 py-1.5">{p.part_number}</td>
                        <td className="px-2 py-1.5">{p.description}</td>
                        <td className="num px-2 py-1.5 text-right">{p.quantity}</td>
                        <td className="px-2 py-1.5">{p.material}</td>
                        <td className="num px-2 py-1.5 text-right">{p.unit_cost ?? ""}</td>
                        <td className="num px-2 py-1.5 text-right">{p.annual_volume ?? ""}</td>
                        <td className="px-2 py-1.5">{p.supplier}</td>
                        <td className="px-2 py-1.5">{p.make_or_buy === "make" ? "Made" : p.make_or_buy === "buy" ? "Bought" : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.warnings.length > 0 && (
                <details className="border-l-2 border-jungle bg-jet px-3 py-2 text-sm">
                  <summary className="cursor-pointer font-medium">
                    {result.warnings.length} thing{result.warnings.length === 1 ? "" : "s"} to check
                  </summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {result.warnings.slice(0, 50).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </details>
              )}

              {existingCount > 0 && (
                <fieldset className="space-y-1.5 text-sm">
                  <legend className="text-xs font-medium uppercase tracking-wider text-granite">
                    This assembly already has {existingCount} parts
                  </legend>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="mode" checked={mode === "append"} onChange={() => setMode("append")} className="accent-jungle" />
                    Add these parts to the existing ones
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="mode" checked={mode === "replace"} onChange={() => setMode("replace")} className="accent-jungle" />
                    Replace the existing parts
                  </label>
                </fieldset>
              )}

              <Button type="button" onClick={runImport} disabled={importing || result.parts.length === 0}>
                {importing ? "Importing…" : `Import ${result.parts.length} parts`}
              </Button>
            </section>
          )}
        </>
      )}
    </div>
  );
}
