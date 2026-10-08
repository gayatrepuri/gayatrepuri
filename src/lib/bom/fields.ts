// The BOM fields the app understands, and the column names it recognises for each.
// Add more synonyms here if your company's exports use other column names.

export const BOM_FIELDS = [
  {
    key: "part_number",
    label: "Part number",
    required: true,
    synonyms: ["part number", "part no", "part no.", "part #", "pn", "p/n", "item number", "item no", "article", "article number", "material number", "sku", "teilenummer", "sachnummer"],
  },
  {
    key: "description",
    label: "Description",
    required: false,
    synonyms: ["description", "desc", "part description", "name", "part name", "title", "benennung", "bezeichnung"],
  },
  {
    key: "quantity",
    label: "Quantity",
    required: false,
    synonyms: ["quantity", "qty", "qty.", "count", "amount", "qty per assembly", "quantity per", "menge", "anzahl"],
  },
  {
    key: "material",
    label: "Material",
    required: false,
    synonyms: ["material", "mat", "mat.", "material spec", "werkstoff"],
  },
  {
    key: "unit_cost",
    label: "Unit cost",
    required: false,
    synonyms: ["unit cost", "cost", "price", "unit price", "cost each", "std cost", "standard cost", "preis", "kosten"],
  },
  {
    key: "annual_volume",
    label: "Annual volume",
    required: false,
    synonyms: ["annual volume", "annual qty", "annual quantity", "volume", "yearly volume", "eau", "annual usage", "usage per year", "jahresmenge"],
  },
  {
    key: "supplier",
    label: "Supplier",
    required: false,
    synonyms: ["supplier", "vendor", "manufacturer", "source", "lieferant"],
  },
  {
    key: "make_or_buy",
    label: "Made or bought",
    required: false,
    synonyms: ["make or buy", "make/buy", "make buy", "m/b", "made or bought", "procurement type", "source type", "eigen/fremd"],
  },
] as const;

export type BomFieldKey = (typeof BOM_FIELDS)[number]["key"];

export const JOINING_METHODS = ["bolted", "welded", "glued", "press-fit", "snap-fit", "other"] as const;
export type JoiningMethod = (typeof JOINING_METHODS)[number];
