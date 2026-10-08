// The rules every saved part must follow. Checked on the server before anything is written.

import { z } from "zod";
import { JOINING_METHODS } from "@/lib/bom/fields";

const optionalText = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((v) => (v ? v : null));

const optionalNumber = z.number().finite().min(0).nullish().transform((v) => v ?? null);

export const bomFieldsSchema = z.object({
  part_number: z.string().trim().min(1, "Every part needs a part number.").max(200),
  description: optionalText,
  quantity: z.number().finite().positive("Quantity must be more than 0."),
  material: optionalText,
  unit_cost: optionalNumber,
  annual_volume: z.number().int().min(0).nullish().transform((v) => v ?? null),
  supplier: optionalText,
  make_or_buy: z.enum(["make", "buy"]).nullish().transform((v) => v ?? null),
});

export const partDetailsSchema = z.object({
  function: optionalText,
  connects_to: optionalText,
  joining_method: z.enum(JOINING_METHODS).nullish().transform((v) => v ?? null),
  wears_out: z.boolean().nullish().transform((v) => v ?? null),
  used_standalone: z.boolean().nullish().transform((v) => v ?? null),
});

export const partSchema = bomFieldsSchema.extend(partDetailsSchema.shape).extend({
  id: z.uuid(),
  sort_order: z.number().int(),
});

export type PartInput = z.input<typeof partSchema>;
export type Part = z.output<typeof partSchema>;

export const PART_COLUMNS =
  "id, sort_order, part_number, description, quantity, material, unit_cost, annual_volume, supplier, make_or_buy, function, connects_to, joining_method, wears_out, used_standalone";

export const costSettingsSchema = z.object({
  currency: z.enum(["EUR", "GBP", "USD", "CHF", "SEK"]),
  labour_rate_per_hour: z.number().finite().min(0).nullable(),
  new_part_number_cost: z.number().finite().min(0).nullable(),
  tooling_cost_per_changed_part: z.number().finite().min(0).nullable(),
  holding_cost_pct: z.number().finite().min(0).max(100).nullable(),
});
export type CostSettings = z.infer<typeof costSettingsSchema>;
