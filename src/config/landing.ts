// ─────────────────────────────────────────────────────────────
// ALL WORDING ON THE PUBLIC LANDING PAGE.
// Edit text here; the page layout and animation code don't need to change.
// ─────────────────────────────────────────────────────────────

export const landing = {
  nav: [
    { label: "Problem", href: "#problem" },
    { label: "What it does", href: "#what-it-does" },
    { label: "How it works", href: "#how-it-works" },
    { label: "The maths", href: "#maths" },
  ],

  hero: {
    eyebrow: "For design engineers at configurable-machinery makers",
    // The headline is split so the middle words can be set in the italic accent font.
    headlineBefore: "Design assemblies that",
    headlineAccent: "come apart",
    headlineAfter: "as cleanly as they go together.",
    subhead:
      "Upload one assembly's BOM and drawings. Get design changes that keep its function: merged parts, standard interfaces, modules and reversible joints, each with what it touches and what it saves. You approve every one.",
    primaryCta: "Try the demo",
    secondaryCta: "Join the waitlist",
  },

  // The interactive drawing in the hero. One entry per highlighted change.
  explorer: {
    title: "DWG CD-400-000 · Conveyor drive unit · Illustrative",
    idleHint: "Click a numbered part, or let the walkthrough play.",
    changes: [
      {
        part: "Motor plate · CD400-102",
        change: "Swap welded joint for 4 × M8 bolts",
        affects: "Frame weldment, motor plate, weld fixture",
        effect: "Motor removable without cutting",
      },
      {
        part: "Bearing bracket LH · CD400-107",
        change: "Use the RH bracket on both sides",
        affects: "2 brackets, 1 drawing, 1 stock location",
        effect: "One part number fewer",
      },
      {
        part: "Bearing fasteners",
        change: "Standardise M5 / M6 / M10 to M8",
        affects: "30 fasteners, 3 assembly tools",
        effect: "Three fastener sizes fewer",
      },
    ],
  },

  inputs: [
    { label: "BOM", detail: "CSV or Excel" },
    { label: "Drawings", detail: "PDF or image" },
    { label: "Part tags", detail: "Function, joints, wear" },
    { label: "Cost settings", detail: "Labour, tooling, holding" },
  ],

  // Counters in the coloured band. All true for the demo assembly.
  stats: {
    caption: "Found in the demo assembly",
    items: [
      { value: 31, label: "parts reviewed" },
      { value: 6, label: "fastener sizes in use" },
      { value: 4, label: "joints that block disassembly" },
      { value: 2, label: "near-duplicate bracket pairs" },
    ],
  },

  problem: {
    eyebrow: "The problem",
    headline: "Variant sprawl hides in the BOM.",
    intro:
      "Configurable machines grow one order at a time. Every special adds a part that is almost like an existing one, a fastener size nobody needed, a joint that only goes one way. Each is cheap on its own. Together they set your inventory, your assembly time and what happens at end of life.",
    points: [
      { title: "Near-duplicate parts", body: "Two brackets, 2 mm apart. Two part numbers, two drawings, two stock locations, forever." },
      { title: "Every fastener size", body: "M5, M6, M8, M10 and M12 on one unit. More tools at the line, more SKUs in stores." },
      { title: "Joints that only go one way", body: "Welds and adhesives turn service into a cutting job and end of life into a shredder." },
    ],
  },

  whatItDoes: {
    eyebrow: "What it does",
    headline: "Three outcomes.",
    headlineAccent: "Same function.",
    items: [
      {
        icon: "modular",
        title: "More modular",
        body: "Finds near-duplicate parts to merge and parts that always travel together, then proposes standard interfaces so modules swap across variants.",
        bullets: ["Merge near-duplicate parts", "Standardise mounting patterns", "Group parts into swappable modules"],
        example: "Group drum, shaft and bearings into one drive module",
      },
      {
        icon: "disassembly",
        title: "Easier to take apart",
        body: "Flags welded, glued and pressed joints that block service, and suggests reversible joints with fewer, standard fasteners.",
        bullets: ["Replace welds with bolted joints", "Reduce fastener sizes", "Shorten service and teardown time"],
        example: "Swap welded motor plate for 4 × M8 on a standard pattern",
      },
      {
        icon: "reman",
        title: "Remanufacturable",
        body: "Rates every part reusable, remanufacturable, recyclable or none, before and after your approved changes, with a one-line reason.",
        bullets: ["End-of-life rating per part", "Separate mixed materials", "Before / after scorecard"],
        example: "Separate bonded steel inserts from the ABS guard",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    headline: "Four steps.",
    headlineAccent: "You stay in charge.",
    steps: [
      { icon: "upload", title: "Upload", body: "Bring the BOM from CSV or Excel, drawings as PDF or image, and a two-minute form per part for what CAD can't show.", detail: "Your column names are matched automatically. Anything odd is listed in plain words before you import." },
      { icon: "analyse", title: "Analyse", body: "AI reviews structure, tags and drawings and proposes changes, each with reasoning, knock-on effects, risks and confidence.", detail: "Answers come back as strict, validated data: counts and minutes only, never money." },
      { icon: "calculate", title: "Calculate", body: "A fixed calculator, not the AI, turns parts, fasteners and minutes into annual saving, one-off cost and payback.", detail: "Every figure shows its formula and inputs, and is labelled as an estimate." },
      { icon: "decide", title: "Decide", body: "Approve, reject or comment on every suggestion, then export the approved set as a PDF report.", detail: "Nothing in your data changes automatically. Every decision is kept with its reason." },
    ],
  },

  // The interactive "do the maths" section. Purely illustrative arithmetic.
  maths: {
    eyebrow: "The maths, in the open",
    headline: "Move the inputs.",
    headlineAccent: "Watch the formula.",
    body: "This is the kind of calculation the tool shows next to every figure. Fixed arithmetic you can check, not a number from the AI.",
    label: "Illustrative example · not a quote",
    currency: "€",
    sliders: {
      volume: { label: "Annual volume", unit: "units / year", min: 100, max: 5000, step: 100, value: 1200 },
      minutes: { label: "Assembly time saved", unit: "min / unit", min: 0, max: 30, step: 0.5, value: 6 },
      rate: { label: "Labour rate", unit: "€ / hour", min: 25, max: 95, step: 1, value: 52 },
      retooled: { label: "Parts needing new tooling", unit: "parts", min: 0, max: 6, step: 1, value: 2 },
    },
    toolingCostPerPart: 1200,
  },

  exampleCard: {
    label: "Illustrative example · try the buttons",
    type: "Change joining method",
    title: "Replace welded motor plate with a bolted plate on the standard 4 × M8 pattern",
    affects: ["CD400-101 frame weldment", "CD400-102 motor plate", "Welding fixture WF-12", "Assembly step 3"],
    risks: "Bolted joint needs thread locking and two dowels to hold motor alignment.",
    confidence: "High",
    inputs: [
      { label: "Parts removed", value: "0" },
      { label: "Fasteners added", value: "+4" },
      { label: "Disassembly time", value: "−25 min" },
      { label: "Parts retooled", value: "2" },
    ],
  },

  principles: [
    { icon: "approve", title: "The engineer decides", body: "Every suggestion is approved or rejected by a person, with the reason recorded." },
    { icon: "formula", title: "No black-box money", body: "The AI outputs counts and minutes only. Every figure shows its formula and inputs." },
    { icon: "private", title: "Your data stays yours", body: "Each account sees only its own assemblies. Keys and analysis run on the server." },
  ],

  waitlist: {
    eyebrow: "Early access",
    headline: "Join the",
    headlineAccent: "waitlist.",
    body: "We're onboarding a small group of machinery makers. Tell us who you are and we'll be in touch.",
    success: "Thanks, you're on the list. We'll be in touch.",
    duplicate: "You're already on the list. We'll be in touch.",
  },

  footer: "Prototype. All example data on this site is invented.",
} as const;
