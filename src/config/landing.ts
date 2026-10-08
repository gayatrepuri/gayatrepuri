// ─────────────────────────────────────────────────────────────
// ALL WORDING ON THE PUBLIC LANDING PAGE.
// Edit text here; the page layout and animation code don't need to change.
// ─────────────────────────────────────────────────────────────

export const landing = {
  nav: [
    { label: "Problem", href: "#problem" },
    { label: "What it does", href: "#what-it-does" },
    { label: "How it works", href: "#how-it-works" },
  ],

  hero: {
    eyebrow: "For design engineers at configurable-machinery makers",
    headline: "Design assemblies that come apart as cleanly as they go together.",
    subhead:
      "Upload one assembly's BOM and drawings. Get function-preserving design changes (merged parts, standard interfaces, modules, reversible joints) with what each one touches and what it saves. You approve every change.",
    primaryCta: "Try the demo",
    secondaryCta: "Join the waitlist",
    proofPoints: ["Nothing changes without your approval", "Savings from a visible formula, never from the AI"],
  },

  // Labels on the animated drawing in the hero.
  heroDrawing: {
    callouts: [
      "Swap welded joint for 4 × M8 bolts",
      "Use RH bearing bracket on both sides",
      "Standardise M5 / M6 / M10 to M8",
    ],
    caption: "Illustrative: conveyor drive unit",
  },

  inputs: [
    { label: "BOM", detail: "CSV or Excel" },
    { label: "Drawings", detail: "PDF or image" },
    { label: "Part tags", detail: "Function, joints, wear" },
    { label: "Cost settings", detail: "Labour, tooling, holding" },
  ],

  problem: {
    eyebrow: "The problem",
    headline: "Variant sprawl hides in the BOM.",
    intro:
      "Configurable machines grow one order at a time. Every special adds a part that is almost like an existing one, a fastener size nobody needed, a joint that only goes one way. Each is cheap on its own. Together they set your inventory, assembly time and what happens at end of life.",
    points: [
      { title: "Near-duplicate parts", body: "Two brackets, 2 mm apart. Two part numbers, two drawings, two stock locations, forever." },
      { title: "Every fastener size", body: "M5, M6, M8, M10 and M12 on one unit. More tools at the line, more SKUs in stores." },
      { title: "Joints that only go one way", body: "Welds and adhesives turn service into a cutting job and end of life into a shredder." },
    ],
  },

  whatItDoes: {
    eyebrow: "What it does",
    headline: "Three outcomes. Same function.",
    items: [
      {
        icon: "modular",
        title: "More modular",
        body: "Finds near-duplicate parts to merge and parts that always travel together, and proposes standard interfaces so modules swap across variants.",
        example: "Group drum, shaft and bearings into one drive module",
      },
      {
        icon: "disassembly",
        title: "Easier to take apart",
        body: "Flags welded, glued and pressed joints that block service, and suggests reversible joints and fewer, standard fasteners.",
        example: "Swap welded motor plate for 4 × M8 on a standard pattern",
      },
      {
        icon: "reman",
        title: "Remanufacturable",
        body: "Rates every part reusable, remanufacturable, recyclable or none, before and after your approved changes, with a one-line reason.",
        example: "Separate bonded steel inserts from the ABS guard",
      },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    headline: "Four steps. You stay in charge.",
    steps: [
      { icon: "upload", title: "Upload", body: "BOM from CSV or Excel, drawings as PDF or image, and a two-minute form per part for what CAD can't show." },
      { icon: "analyse", title: "Analyse", body: "AI reviews structure, tags and drawings and proposes changes, each with reasoning, knock-on effects, risks and confidence." },
      { icon: "calculate", title: "Calculate", body: "A fixed calculator (not the AI) turns parts, fasteners and minutes into annual saving, one-off cost and payback. Formula shown." },
      { icon: "decide", title: "Decide", body: "Approve, reject or comment on every suggestion and export the approved set as a PDF report. Nothing changes automatically." },
    ],
  },

  exampleCard: {
    label: "Illustrative example",
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
    { icon: "private", title: "Your data stays yours", body: "Each account sees only its own assemblies. Keys and analysis run server-side." },
  ],

  waitlist: {
    eyebrow: "Early access",
    headline: "Join the waitlist",
    body: "We're onboarding a small group of machinery makers. Tell us who you are and we'll be in touch.",
    success: "Thanks, you're on the list. We'll be in touch.",
    duplicate: "You're already on the list. We'll be in touch.",
  },

  footer: "Prototype. All example data on this site is invented.",
} as const;
