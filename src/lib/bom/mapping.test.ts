import { describe, expect, it } from "vitest";
import { applyMapping, detectHeaderRow, guessMapping, parseMakeOrBuy, parseNumber, type Table } from "./mapping";

describe("parseNumber", () => {
  it.each([
    [12, 12],
    ["12", 12],
    ["1,234.50", 1234.5],
    ["1.234,50", 1234.5],
    ["12,5", 12.5],
    ["1,234", 1234],
    ["1.234.567", 1234567],
    ["€ 4.20", 4.2],
    ["8 pcs", 8],
    ["-3", -3],
  ])("reads %s as %s", (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each([[""], ["n/a"], [null], [undefined]])("returns null for %s", (input) => {
    expect(parseNumber(input)).toBeNull();
  });
});

describe("parseMakeOrBuy", () => {
  it("recognises common words", () => {
    expect(parseMakeOrBuy("Make")).toBe("make");
    expect(parseMakeOrBuy("B")).toBe("buy");
    expect(parseMakeOrBuy("Purchased")).toBe("buy");
    expect(parseMakeOrBuy("in-house")).toBe("make");
    expect(parseMakeOrBuy("maybe")).toBeNull();
  });
});

describe("guessMapping", () => {
  it("matches typical header names", () => {
    const m = guessMapping(["Part No.", "Description", "Qty", "Material", "Unit Price", "EAU", "Vendor", "Make/Buy"]);
    expect(m).toEqual({
      part_number: 0,
      description: 1,
      quantity: 2,
      material: 3,
      unit_cost: 4,
      annual_volume: 5,
      supplier: 6,
      make_or_buy: 7,
    });
  });

  it("leaves unknown columns unmapped", () => {
    const m = guessMapping(["Item number", "Colour"]);
    expect(m.part_number).toBe(0);
    expect(m.material).toBeNull();
  });
});

describe("detectHeaderRow", () => {
  it("skips title rows above the headers", () => {
    const table: Table = [["Conveyor BOM export"], [], ["PN", "Desc", "Qty"], ["A-1", "Bracket", 2]];
    expect(detectHeaderRow(table)).toBe(2);
  });
});

describe("applyMapping", () => {
  const table: Table = [
    ["PN", "Desc", "Qty", "Cost", "M/B"],
    ["A-1", "Bracket", "2", "4,50", "Make"],
    ["", "No number", 1, 1, "B"],
    ["A-2", "Bolt M8", "x", "abc", "?"],
    ["A-1", "Bracket again", 1, 4.5, "M"],
    [null, null, null, null, null],
  ];
  const mapping = guessMapping(table[0]);
  const result = applyMapping(table, 0, mapping);

  it("imports rows that have a part number", () => {
    expect(result.parts.map((p) => p.part_number)).toEqual(["A-1", "A-2", "A-1"]);
    expect(result.parts[0]).toMatchObject({ quantity: 2, unit_cost: 4.5, make_or_buy: "make" });
  });

  it("explains every problem in plain words", () => {
    expect(result.warnings).toContain("Row 3: skipped, no part number.");
    expect(result.warnings.some((w) => w.includes('quantity "x"'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('unit cost "abc"'))).toBe(true);
    expect(result.warnings.some((w) => w.includes("A-1 appears 2 times"))).toBe(true);
  });

  it("defaults bad quantities to 1", () => {
    expect(result.parts[1].quantity).toBe(1);
    expect(result.parts[1].unit_cost).toBeNull();
  });

  it("requires a part number column", () => {
    const r = applyMapping(table, 0, { ...mapping, part_number: null });
    expect(r.parts).toHaveLength(0);
    expect(r.warnings[0]).toMatch(/part number/);
  });
});
