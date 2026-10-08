// ─────────────────────────────────────────────────────────────
// DEMO ASSEMBLY: invented data, no real company or supplier.
// "CD-400 conveyor drive unit": the drive end of a belt conveyor, built ~1,200 times a year.
//
// Deliberate problems for the AI to find:
//  • Near-duplicate brackets: CD400-107/108 bearing brackets, CD400-111/112 sensor brackets
//  • Mixed fastener sizes: M5, M6, M8, M10 and M12 where fewer would do
//  • Welded joints blocking disassembly: motor plate CD400-102 and weld nuts CD400-126 on the frame
//  • Mixed materials: ABS guard with bonded steel inserts, PA6 coupling guard with brass inserts,
//    aluminium bracket bolted to steel, UHMW wear strip glued to the frame
// ─────────────────────────────────────────────────────────────

import type { CostSettings } from "@/lib/parts/schema";
import type { JoiningMethod } from "@/lib/bom/fields";

export const DEMO_ASSEMBLY = {
  name: "CD-400 conveyor drive unit (demo)",
  description:
    "Drive end of a 400 mm belt conveyor: welded frame, 1.1 kW gearmotor, lagged drive drum on two flange bearings, guards and sensing. Invented sample data.",
};

const UNITS_PER_YEAR = 1200;

export const DEMO_COST_SETTINGS: CostSettings = {
  currency: "EUR",
  labour_rate_per_hour: 52,
  new_part_number_cost: 450,
  tooling_cost_per_changed_part: 1200,
  holding_cost_pct: 22,
};

type DemoPart = {
  part_number: string;
  description: string;
  quantity: number;
  material: string;
  unit_cost: number;
  supplier: string;
  make_or_buy: "make" | "buy";
  function: string;
  connects_to: string;
  joining_method: JoiningMethod;
  wears_out: boolean;
  used_standalone: boolean;
};

const parts: DemoPart[] = [
  { part_number: "CD400-101", description: "Drive frame weldment, 80x40 RHS", quantity: 1, material: "S235JR steel, powder coated", unit_cost: 312, supplier: "In-house fabrication", make_or_buy: "make", function: "Main structure carrying motor, drum and guards", connects_to: "Conveyor side frames, CD400-102, CD400-107, CD400-108, CD400-126", joining_method: "welded", wears_out: false, used_standalone: false },
  { part_number: "CD400-102", description: "Motor mounting plate, 10 mm", quantity: 1, material: "S235JR steel", unit_cost: 48, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Carries the gearmotor; welded to frame so motor alignment is fixed", connects_to: "CD400-101 (welded), CD400-103", joining_method: "welded", wears_out: false, used_standalone: false },
  { part_number: "CD400-103", description: "Helical-bevel gearmotor 1.1 kW, i=28", quantity: 1, material: "Cast iron housing / steel / copper", unit_cost: 640, supplier: "Northfield Drives (invented)", make_or_buy: "buy", function: "Drives the conveyor drum", connects_to: "CD400-102, CD400-113", joining_method: "bolted", wears_out: true, used_standalone: true },
  { part_number: "CD400-104", description: "Drive shaft Ø40 x 620", quantity: 1, material: "C45 steel", unit_cost: 86, supplier: "In-house machining", make_or_buy: "make", function: "Transmits torque from coupling to drum", connects_to: "CD400-105, CD400-106, CD400-113, CD400-128", joining_method: "press-fit", wears_out: true, used_standalone: false },
  { part_number: "CD400-105", description: "Drive drum Ø220 x 450, rubber lagged", quantity: 1, material: "S235 steel tube + NR rubber lagging (vulcanised)", unit_cost: 214, supplier: "Rollform Drums (invented)", make_or_buy: "buy", function: "Drives the belt by friction", connects_to: "CD400-104", joining_method: "press-fit", wears_out: true, used_standalone: false },
  { part_number: "CD400-106", description: "Flange bearing unit UCF208, 4-bolt", quantity: 2, material: "Grey cast iron / bearing steel", unit_cost: 38, supplier: "Brightline Bearings (invented)", make_or_buy: "buy", function: "Supports drive shaft", connects_to: "CD400-104, CD400-107, CD400-108", joining_method: "bolted", wears_out: true, used_standalone: true },
  { part_number: "CD400-107", description: "Bearing bracket LH, 6 mm, 4 x Ø14 holes", quantity: 1, material: "S235JR steel, zinc plated", unit_cost: 21.4, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Holds left bearing to frame", connects_to: "CD400-101, CD400-106", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-108", description: "Bearing bracket RH, 6 mm, 4 x Ø14 holes, flange 2 mm longer", quantity: 1, material: "S235JR steel, zinc plated", unit_cost: 22.1, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Holds right bearing to frame (near mirror of CD400-107)", connects_to: "CD400-101, CD400-106", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-109", description: "Take-up plate, 8 mm, slotted", quantity: 2, material: "S235JR steel", unit_cost: 14.6, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Allows belt tension adjustment", connects_to: "CD400-101, CD400-126", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-110", description: "Terminal box bracket", quantity: 1, material: "Aluminium 6082-T6", unit_cost: 9.5, supplier: "Alucut Components (invented)", make_or_buy: "buy", function: "Holds terminal box; aluminium bolted to steel frame", connects_to: "CD400-101", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-111", description: "Sensor bracket, 3 mm, slot 20 mm", quantity: 1, material: "S235JR steel, zinc plated", unit_cost: 6.8, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Holds drum speed sensor", connects_to: "CD400-101, CD400-116", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-112", description: "Sensor bracket, 3 mm, slot 22 mm", quantity: 1, material: "S235JR steel, zinc plated", unit_cost: 7.1, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Holds belt-misalignment sensor (near duplicate of CD400-111)", connects_to: "CD400-101, CD400-116", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-113", description: "Jaw coupling, Ø40/Ø30 bores, 92 Shore A spider", quantity: 1, material: "Aluminium hubs / PU spider", unit_cost: 44, supplier: "Northfield Drives (invented)", make_or_buy: "buy", function: "Connects gearmotor to drive shaft", connects_to: "CD400-103, CD400-104", joining_method: "press-fit", wears_out: true, used_standalone: true },
  { part_number: "CD400-114", description: "Coupling guard, moulded", quantity: 1, material: "PA6-GF30 with moulded-in brass inserts", unit_cost: 12.4, supplier: "Polymould Components (invented)", make_or_buy: "buy", function: "Covers rotating coupling", connects_to: "CD400-101, CD400-121", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-115", description: "Drive guard cover", quantity: 1, material: "ABS with bonded steel insert plates", unit_cost: 36.5, supplier: "Polymould Components (invented)", make_or_buy: "buy", function: "Covers drum ends and nip point", connects_to: "CD400-101, CD400-118", joining_method: "glued", wears_out: false, used_standalone: false },
  { part_number: "CD400-116", description: "Inductive proximity sensor M18, PNP", quantity: 2, material: "Brass housing / electronics", unit_cost: 32, supplier: "Sensa Controls (invented)", make_or_buy: "buy", function: "Speed and misalignment sensing", connects_to: "CD400-111, CD400-112", joining_method: "other", wears_out: false, used_standalone: true },
  { part_number: "CD400-117", description: "Cable gland M20", quantity: 2, material: "PA6", unit_cost: 1.1, supplier: "Sensa Controls (invented)", make_or_buy: "buy", function: "Cable entry to terminal box", connects_to: "CD400-110", joining_method: "other", wears_out: false, used_standalone: true },
  { part_number: "CD400-118", description: "Guard support bracket, 2 mm", quantity: 2, material: "Galvanised steel DX51D", unit_cost: 4.9, supplier: "Laserline Profiles (invented)", make_or_buy: "make", function: "Supports drive guard cover", connects_to: "CD400-101, CD400-115", joining_method: "bolted", wears_out: false, used_standalone: false },
  { part_number: "CD400-119", description: "Wear strip 20 x 10 x 450", quantity: 2, material: "UHMW-PE", unit_cost: 5.6, supplier: "Polymould Components (invented)", make_or_buy: "buy", function: "Belt edge wear protection; glued to frame, replaced yearly", connects_to: "CD400-101", joining_method: "glued", wears_out: true, used_standalone: false },
  { part_number: "CD400-120", description: "Rating plate, riveted", quantity: 1, material: "Anodised aluminium + steel rivets", unit_cost: 2.4, supplier: "Markwell Labels (invented)", make_or_buy: "buy", function: "Identification and CE marking", connects_to: "CD400-101", joining_method: "other", wears_out: false, used_standalone: false },
  { part_number: "CD400-121", description: "Hex bolt ISO 4017 M8x25, 8.8, zinc", quantity: 12, material: "Steel 8.8, zinc plated", unit_cost: 0.12, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Fastens guards, take-up and bearing brackets", connects_to: "CD400-107, CD400-108, CD400-109, CD400-114", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-122", description: "Hex bolt ISO 4017 M10x30, 8.8, zinc", quantity: 8, material: "Steel 8.8, zinc plated", unit_cost: 0.18, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Fastens flange bearings", connects_to: "CD400-106, CD400-107, CD400-108", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-123", description: "Hex bolt ISO 4017 M12x35, 8.8, zinc", quantity: 4, material: "Steel 8.8, zinc plated", unit_cost: 0.26, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Fastens gearmotor to motor plate", connects_to: "CD400-102, CD400-103", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-124", description: "Socket cap screw ISO 4762 M6x16, 8.8", quantity: 6, material: "Steel 8.8, black oxide", unit_cost: 0.09, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Fastens terminal box bracket and guard supports", connects_to: "CD400-110, CD400-118", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-125", description: "Socket cap screw ISO 4762 M5x12, 8.8", quantity: 4, material: "Steel 8.8, black oxide", unit_cost: 0.07, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Fastens sensor brackets", connects_to: "CD400-111, CD400-112", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-126", description: "Weld nut M16, DIN 929", quantity: 2, material: "Steel", unit_cost: 0.45, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Thread for take-up bolts; welded to frame, cannot be replaced if stripped", connects_to: "CD400-101 (welded), CD400-127", joining_method: "welded", wears_out: false, used_standalone: false },
  { part_number: "CD400-127", description: "Take-up bolt M16x120, full thread", quantity: 2, material: "Steel 8.8, zinc plated", unit_cost: 0.95, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Adjusts belt tension", connects_to: "CD400-109, CD400-126", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-128", description: "Parallel key DIN 6885 A 12x8x50", quantity: 1, material: "C45 steel", unit_cost: 0.6, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Transmits torque shaft to coupling", connects_to: "CD400-104, CD400-113", joining_method: "press-fit", wears_out: false, used_standalone: true },
  { part_number: "CD400-129", description: "Flange nut M8, serrated", quantity: 12, material: "Steel 8, zinc plated", unit_cost: 0.08, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Nuts for M8 bolts", connects_to: "CD400-121", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-130", description: "Nyloc nut M10, DIN 985", quantity: 8, material: "Steel 8 / PA insert", unit_cost: 0.1, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Nuts for bearing bolts", connects_to: "CD400-122", joining_method: "bolted", wears_out: false, used_standalone: true },
  { part_number: "CD400-131", description: "Plain washer ISO 7089 M12", quantity: 8, material: "Steel, zinc plated", unit_cost: 0.04, supplier: "Fastenco Industrial (invented)", make_or_buy: "buy", function: "Washers for motor bolts", connects_to: "CD400-123", joining_method: "bolted", wears_out: false, used_standalone: true },
];

export const DEMO_PARTS = parts.map((p, i) => ({
  ...p,
  sort_order: i,
  annual_volume: p.quantity * UNITS_PER_YEAR,
}));
