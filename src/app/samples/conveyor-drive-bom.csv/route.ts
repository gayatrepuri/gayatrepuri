import Papa from "papaparse";
import { DEMO_PARTS } from "@/lib/demo/conveyor-drive";

// A sample BOM file to try the import with. Column names deliberately differ from ours
// ("Item No.", "Price EUR", "Vendor"…) so the column-matching step has something to do.
export function GET() {
  const csv = Papa.unparse({
    fields: ["Item No.", "Description", "Qty", "Material", "Price EUR", "EAU", "Vendor", "M/B"],
    data: DEMO_PARTS.map((p) => [
      p.part_number,
      p.description,
      p.quantity,
      p.material,
      p.unit_cost.toFixed(2),
      p.annual_volume,
      p.supplier,
      p.make_or_buy === "make" ? "M" : "B",
    ]),
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="conveyor-drive-bom.csv"',
    },
  });
}
