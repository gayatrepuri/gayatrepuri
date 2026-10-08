// Turns a spreadsheet (rows of cells) into clean BOM parts, using the user's column choices.
// Pure functions only: no screen or database code, so they are easy to test.

import { BOM_FIELDS, type BomFieldKey } from "./fields";

export type Cell = string | number | boolean | Date | null | undefined;
export type Table = Cell[][];

/** Which spreadsheet column (by index) feeds each field. null = not mapped. */
export type ColumnMapping = Record<BomFieldKey, number | null>;

export type ImportedPart = {
  part_number: string;
  description: string | null;
  quantity: number;
  material: string | null;
  unit_cost: number | null;
  annual_volume: number | null;
  supplier: string | null;
  make_or_buy: "make" | "buy" | null;
};

export type ImportResult = { parts: ImportedPart[]; warnings: string[] };

const normalise = (s: string) => s.toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim();

/** Picks the most likely header row: the first row in the top 20 with at least 3 filled cells. */
export function detectHeaderRow(table: Table): number {
  const limit = Math.min(table.length, 20);
  for (let i = 0; i < limit; i++) {
    const filled = (table[i] ?? []).filter((c) => cellToText(c) !== null).length;
    if (filled >= 3) return i;
  }
  return 0;
}

/** Guesses which column is which field, from the header names. */
export function guessMapping(headers: Cell[]): ColumnMapping {
  const names = headers.map((h) => normalise(cellToText(h) ?? ""));
  const used = new Set<number>();
  const mapping = {} as ColumnMapping;

  for (const field of BOM_FIELDS) {
    const synonyms = field.synonyms.map(normalise);
    // Exact match first, then "header contains synonym".
    let index = names.findIndex((n, i) => !used.has(i) && synonyms.includes(n));
    if (index === -1) {
      index = names.findIndex((n, i) => !used.has(i) && n !== "" && synonyms.some((s) => s.length > 2 && n.includes(s)));
    }
    mapping[field.key] = index === -1 ? null : index;
    if (index !== -1) used.add(index);
  }
  return mapping;
}

export function cellToText(value: Cell): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  return text === "" ? null : text;
}

/**
 * Reads a number written in common spreadsheet styles:
 * 1234.5 · 1,234.50 · 1.234,50 · 12,5 · "€ 4.20" · "8 pcs". Returns null if it isn't a number.
 */
export function parseNumber(value: Cell): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = cellToText(value);
  if (text === null) return null;

  let s = text.replace(/[^\d.,\-]/g, "");
  if (s === "" || s === "-") return null;

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  if (lastDot !== -1 && lastComma !== -1) {
    // Both present: whichever comes last is the decimal separator.
    s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (lastComma !== -1) {
    // Only commas: "1,234" / "1,234,567" are thousands; otherwise a decimal comma.
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  } else if ((s.match(/\./g) ?? []).length > 1) {
    // "1.234.567" = thousands separators.
    s = s.replace(/\./g, "");
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function parseMakeOrBuy(value: Cell): "make" | "buy" | null {
  const text = cellToText(value);
  if (text === null) return null;
  const t = normalise(text);
  if (["make", "m", "made", "manufactured", "in house", "inhouse", "internal", "eigen", "e", "fertigung"].includes(t)) return "make";
  if (["buy", "b", "bought", "purchased", "purchase", "bought out", "external", "fremd", "f", "zukauf", "kaufteil"].includes(t)) return "buy";
  return null;
}

/** Applies the mapping to every row below the header row. */
export function applyMapping(table: Table, headerRow: number, mapping: ColumnMapping): ImportResult {
  const warnings: string[] = [];
  const parts: ImportedPart[] = [];
  const seen = new Map<string, number>();

  if (mapping.part_number === null) {
    return { parts, warnings: ["Choose which column holds the part number."] };
  }

  const get = (row: Cell[], key: BomFieldKey) => {
    const index = mapping[key];
    return index === null ? null : row[index];
  };

  for (let r = headerRow + 1; r < table.length; r++) {
    const row = table[r] ?? [];
    const sheetRow = r + 1; // as shown in Excel
    if (row.every((c) => cellToText(c) === null)) continue;

    const partNumber = cellToText(get(row, "part_number"));
    if (!partNumber) {
      warnings.push(`Row ${sheetRow}: skipped, no part number.`);
      continue;
    }

    const rawQty = get(row, "quantity");
    let quantity = parseNumber(rawQty);
    if (quantity === null) {
      if (mapping.quantity !== null && cellToText(rawQty) !== null) {
        warnings.push(`Row ${sheetRow} (${partNumber}): quantity "${cellToText(rawQty)}" isn't a number, set to 1.`);
      }
      quantity = 1;
    }

    const rawCost = get(row, "unit_cost");
    const unitCost = parseNumber(rawCost);
    if (unitCost === null && cellToText(rawCost) !== null) {
      warnings.push(`Row ${sheetRow} (${partNumber}): unit cost "${cellToText(rawCost)}" isn't a number, left empty.`);
    }

    const rawVolume = get(row, "annual_volume");
    const volume = parseNumber(rawVolume);
    if (volume === null && cellToText(rawVolume) !== null) {
      warnings.push(`Row ${sheetRow} (${partNumber}): annual volume "${cellToText(rawVolume)}" isn't a number, left empty.`);
    }

    const rawMakeBuy = get(row, "make_or_buy");
    const makeOrBuy = parseMakeOrBuy(rawMakeBuy);
    if (makeOrBuy === null && cellToText(rawMakeBuy) !== null) {
      warnings.push(`Row ${sheetRow} (${partNumber}): "${cellToText(rawMakeBuy)}" isn't recognised as made or bought, left empty.`);
    }

    seen.set(partNumber, (seen.get(partNumber) ?? 0) + 1);

    parts.push({
      part_number: partNumber,
      description: cellToText(get(row, "description")),
      quantity,
      material: cellToText(get(row, "material")),
      unit_cost: unitCost,
      annual_volume: volume === null ? null : Math.round(volume),
      supplier: cellToText(get(row, "supplier")),
      make_or_buy: makeOrBuy,
    });
  }

  for (const [pn, count] of seen) {
    if (count > 1) warnings.push(`Part number ${pn} appears ${count} times. Check that this is intended.`);
  }

  return { parts, warnings };
}
