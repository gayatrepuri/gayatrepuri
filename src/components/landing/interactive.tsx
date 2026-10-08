"use client";

// Small interactive pieces of the landing page.

import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  Calculator,
  CircleCheck,
  MessageSquare,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  Upload,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { landing } from "@/config/landing";
import { useReducedMotion } from "./use-reduced-motion";

const ICONS: Record<string, LucideIcon> = {
  modular: Boxes,
  disassembly: Wrench,
  reman: RefreshCcw,
  upload: Upload,
  analyse: ScanLine,
  calculate: Calculator,
  decide: CircleCheck,
};

const pad = (n: number) => String(n).padStart(2, "0");

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

// ── Thin progress line under the menu ──────────────────────
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current?.style.setProperty("--progress", String(max > 0 ? window.scrollY / max : 0));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div ref={ref} aria-hidden className="scroll-progress absolute inset-x-0 bottom-0 h-px bg-slate" />;
}

// ── Number that counts up when it scrolls into view ────────
export function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.6);
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value);
  const started = useRef(false);
  const raf = useRef(0);

  // Start once when first seen; keep running even if the visitor scrolls past quickly.
  useEffect(() => {
    if (!inView || started.current || reduced) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [inView, reduced, value, duration]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <span ref={ref} className="num">
      {shown}
    </span>
  );
}

// ── "What it does": tabs with a small animated diagram each ─
function MiniDiagram({ kind }: { kind: string }) {
  if (kind === "modular") {
    return (
      <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden>
        {[0, 1, 2].map((c) =>
          [0, 1].map((r) => <rect key={`${c}${r}`} x={20 + c * 44} y={14 + r * 46} width={36} height={36} className="md-line" />),
        )}
        <rect x={152} y={14} width={36} height={36} className="md-accent md-merge-a" />
        <rect x={152} y={60} width={36} height={36} className="md-line md-merge-b" style={{ strokeDasharray: "3 3" }} />
        <text x={100} y={116} textAnchor="middle" className="hd-label">
          2 near-duplicates → 1 part
        </text>
      </svg>
    );
  }
  if (kind === "disassembly") {
    return (
      <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden>
        <rect x={30} y={20} width={140} height={22} className="md-line" />
        <rect x={84} y={42} width={32} height={56} className="md-line" />
        <path d="M84 42 l-6 6 l6 0 l-6 6 M116 42 l6 6 l-6 0 l6 6" className="md-accent md-weld" />
        {[0, 1, 2, 3].map((i) => (
          <circle
            key={i}
            cx={92 + (i % 2) * 16}
            cy={27 + Math.floor(i / 2) * 8}
            r={2.6}
            className="md-fill md-bolt"
            style={{ "--i": i, transformBox: "fill-box", transformOrigin: "center" } as React.CSSProperties}
          />
        ))}
        <text x={100} y={116} textAnchor="middle" className="hd-label">
          weld → 4 × M8
        </text>
      </svg>
    );
  }
  const nodes: [string, number, number, "start" | "middle" | "end", number, number][] = [
    ["Use", 100, 18, "middle", 0, -8],
    ["Return", 140, 58, "start", 10, 4],
    ["Reman", 100, 98, "middle", 0, 16],
    ["Reuse", 60, 58, "end", -10, 4],
  ];
  return (
    <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden>
      <circle cx={100} cy={58} r={40} className="md-line" style={{ strokeDasharray: "2 4" }} />
      {nodes.map(([label, x, y, anchor, dx, dy]) => (
        <g key={label}>
          <rect x={x - 4} y={y - 4} width={8} height={8} className="md-line" style={{ fill: "var(--color-jungle)" }} />
          <text x={x + dx} y={y + dy} textAnchor={anchor} className="hd-label">
            {label}
          </text>
        </g>
      ))}
      <rect x={-4} y={-4} width={8} height={8} className="md-fill md-orbit" />
    </svg>
  );
}

export function OutcomeTabs() {
  const { items } = landing.whatItDoes;
  const [active, setActive] = useState(0);
  const item = items[active];
  const Icon = ICONS[item.icon];

  return (
    <div className="grid border border-olive/70 lg:grid-cols-[0.9fr_1.6fr]">
      <div role="tablist" aria-label="What it does" aria-orientation="vertical" className="flex flex-col border-b border-olive/70 lg:border-b-0 lg:border-r">
        {items.map((it, i) => {
          const TabIcon = ICONS[it.icon];
          const selected = i === active;
          return (
            <button
              key={it.title}
              role="tab"
              id={`outcome-tab-${i}`}
              aria-selected={selected}
              aria-controls="outcome-panel"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              className={`group relative flex items-center gap-5 border-b border-olive/70 px-6 py-6 text-left transition-colors last:border-b-0 ${selected ? "bg-olive/30" : "hover:bg-olive/15"}`}
            >
              <span aria-hidden className={`absolute inset-y-0 left-0 w-0.5 bg-slate transition-transform duration-500 ${selected ? "scale-y-100" : "scale-y-0"}`} />
              <span className="font-mono text-xs text-jet">{pad(i + 1)}</span>
              <TabIcon size={20} strokeWidth={1.4} aria-hidden className={`transition-colors ${selected ? "text-slate" : "text-jet"}`} />
              <span className={`font-display text-xl ${selected ? "text-jet-tint" : "text-jet"}`}>{it.title}</span>
            </button>
          );
        })}
      </div>
      <div id="outcome-panel" role="tabpanel" aria-labelledby={`outcome-tab-${active}`} className="grid gap-8 p-8 md:grid-cols-[1.3fr_1fr] md:p-10">
        <div key={active} className="hx-readout">
          <div className="flex items-center gap-3 text-slate">
            <Icon size={18} strokeWidth={1.4} aria-hidden />
            <span className="font-mono text-xs uppercase tracking-[0.18em]">Outcome {pad(active + 1)}</span>
          </div>
          <h3 className="mt-4 font-display text-3xl font-light text-jet-tint">{item.title}</h3>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-jet">{item.body}</p>
          <ul className="mt-6 space-y-2.5">
            {item.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3 text-jet-tint">
                <span aria-hidden className="h-px w-4 bg-slate" />
                {b}
              </li>
            ))}
          </ul>
          <p className="mt-8 border-t border-olive/70 pt-4 font-mono text-[13px] text-jet-tint">
            <span className="mr-2 text-slate">e.g.</span>
            {item.example}
          </p>
        </div>
        <div key={`d${active}`} className="hx-readout flex items-center border border-olive/70 p-4">
          <MiniDiagram kind={item.icon} />
        </div>
      </div>
    </div>
  );
}

// ── "How it works": stepper that advances on its own while visible ─
export function StepsWalkthrough() {
  const { steps } = landing.howItWorks;
  const [active, setActive] = useState(0);
  const [touched, setTouched] = useState(false);
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || touched || reduced) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % steps.length), 3800);
    return () => clearTimeout(t);
  }, [inView, touched, reduced, active, steps.length]);

  const step = steps[active];
  const Icon = ICONS[step.icon];

  return (
    <div ref={ref}>
      <div className="relative">
        <div aria-hidden className="absolute left-0 right-0 top-[22px] hidden h-px bg-olive/70 md:block" />
        <div
          aria-hidden
          className="absolute left-0 top-[22px] hidden h-px bg-slate transition-[width] duration-700 ease-out md:block"
          style={{ width: `${(active / (steps.length - 1)) * 100}%` }}
        />
        <ol role="tablist" aria-label="How it works" className="relative grid grid-cols-4 gap-2">
          {steps.map((s, i) => {
            const StepIcon = ICONS[s.icon];
            const done = i <= active;
            return (
              <li key={s.title} className="flex">
                <button
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="step-panel"
                  onClick={() => {
                    setActive(i);
                    setTouched(true);
                  }}
                  className="group flex w-full flex-col items-start gap-3 text-left"
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center border transition-colors duration-500 ${
                      i === active ? "border-slate bg-slate text-jungle" : done ? "border-slate bg-jungle text-jet-tint" : "border-olive bg-jungle text-jet group-hover:border-jet"
                    }`}
                  >
                    <StepIcon size={19} strokeWidth={1.4} aria-hidden />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet">Step {i + 1}</span>
                  <span className={`hidden font-display text-lg transition-colors sm:block ${i === active ? "text-jet-tint" : "text-jet group-hover:text-jet-tint"}`}>{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div id="step-panel" role="tabpanel" className="mt-12 grid gap-8 border-t border-olive/70 pt-10 md:grid-cols-[auto_1fr_1fr]">
        <div key={`i${active}`} className="hx-readout hidden h-20 w-20 items-center justify-center border border-olive/70 text-slate md:flex">
          <Icon size={30} strokeWidth={1.2} aria-hidden />
        </div>
        <div key={`a${active}`} className="hx-readout">
          <h3 className="font-display text-2xl font-light text-jet-tint sm:text-3xl">
            <span className="mr-3 font-mono text-sm text-slate">{pad(active + 1)}</span>
            {step.title}
          </h3>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-jet">{step.body}</p>
        </div>
        <p key={`b${active}`} className="hx-readout self-end border-l border-slate pl-5 leading-relaxed text-jet-tint">
          {step.detail}
        </p>
      </div>
    </div>
  );
}

// ── The maths: sliders driving a visible formula ───────────
const fmt = (n: number, digits = 0) => n.toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export function MathsPlayground() {
  const m = landing.maths;
  const [v, setV] = useState({
    volume: m.sliders.volume.value as number,
    minutes: m.sliders.minutes.value as number,
    rate: m.sliders.rate.value as number,
    retooled: m.sliders.retooled.value as number,
  });

  const annual = (v.volume * v.minutes * v.rate) / 60;
  const oneOff = v.retooled * m.toolingCostPerPart;
  const paybackMonths = annual > 0 ? (oneOff / annual) * 12 : null;
  const c = m.currency;

  const keys = ["volume", "minutes", "rate", "retooled"] as const;

  return (
    <div className="grid border border-jungle lg:grid-cols-2">
      <div className="space-y-8 border-b border-jungle p-8 lg:border-b-0 lg:border-r md:p-10">
        {keys.map((k) => {
          const s = m.sliders[k];
          const fill = ((v[k] - s.min) / (s.max - s.min)) * 100;
          return (
            <div key={k}>
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor={`m-${k}`} className="text-sm text-jungle">
                  {s.label}
                </label>
                <span className="num text-lg text-jungle">
                  {fmt(v[k], k === "minutes" ? 1 : 0)} <span className="text-xs text-granite">{s.unit}</span>
                </span>
              </div>
              <input
                id={`m-${k}`}
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={v[k]}
                onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })}
                className="slider mt-2"
                style={{ "--fill": `${fill}%` } as React.CSSProperties}
              />
            </div>
          );
        })}
        <p className="text-xs text-granite">
          Assumed tooling cost per changed part: {c}
          <span className="num">{fmt(m.toolingCostPerPart)}</span>.
        </p>
      </div>

      <div className="flex flex-col justify-between gap-8 p-8 md:p-10">
        <dl className="space-y-7">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-granite">Annual saving (estimate)</dt>
            <dd className="num mt-1 text-4xl font-light text-jungle sm:text-5xl">
              {c}
              {fmt(annual)}
            </dd>
            <dd className="num mt-2 text-[13px] text-granite">
              = {fmt(v.volume)} units × {fmt(v.minutes, 1)} min ÷ 60 × {c}
              {fmt(v.rate)}/h
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-jet pt-6">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-granite">One-off cost</dt>
              <dd className="num mt-1 text-2xl text-jungle">
                {c}
                {fmt(oneOff)}
              </dd>
              <dd className="num mt-1 text-[13px] text-granite">
                = {v.retooled} × {c}
                {fmt(m.toolingCostPerPart)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-granite">Payback</dt>
              <dd className="num mt-1 text-2xl text-jungle">{paybackMonths === null ? "n/a" : paybackMonths < 0.05 ? "immediate" : `${fmt(paybackMonths, 1)} months`}</dd>
              <dd className="num mt-1 text-[13px] text-granite">= one-off ÷ annual × 12</dd>
            </div>
          </div>
        </dl>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-granite">{m.label}</p>
      </div>
    </div>
  );
}

// ── Example suggestion with working buttons ────────────────
export function ExampleCard() {
  const e = landing.exampleCard;
  const [decision, setDecision] = useState<null | "approved" | "rejected">(null);
  const [commenting, setCommenting] = useState(false);

  return (
    <article className="relative overflow-hidden border border-jungle bg-jet-tint">
      <header className="flex items-center justify-between border-b border-jet px-6 py-3">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-granite">{e.type}</span>
        <span className="font-mono text-xs text-granite">
          Confidence <span className="text-jungle">{e.confidence}</span>
        </span>
      </header>
      <div className="space-y-6 px-6 py-6">
        <h3 className="font-display text-xl leading-snug text-jungle">{e.title}</h3>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-granite">Affects</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {e.affects.map((a) => (
              <li key={a} className="border border-jet px-2.5 py-1 font-mono text-xs text-jungle transition-colors hover:border-jungle">
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-granite">Risk</p>
          <p className="mt-1 text-sm leading-relaxed text-jungle">{e.risks}</p>
        </div>
        <dl className="grid grid-cols-2 border-t border-jet sm:grid-cols-4">
          {e.inputs.map((x, i) => (
            <div key={x.label} className={`pt-4 ${i > 0 ? "sm:border-l sm:border-jet sm:pl-4" : ""}`}>
              <dt className="text-xs text-granite">{x.label}</dt>
              <dd className="num mt-1 text-lg text-jungle">{x.value}</dd>
            </div>
          ))}
        </dl>
        {commenting && (
          <div className="hx-readout">
            <label htmlFor="example-comment" className="font-mono text-[11px] uppercase tracking-[0.16em] text-granite">
              Comment
            </label>
            <textarea id="example-comment" rows={2} placeholder="e.g. Check dowel tolerance with supplier" className="mt-1 block w-full border border-granite bg-jet-tint px-3 py-2 text-sm text-jungle placeholder:text-granite" />
          </div>
        )}
      </div>
      <footer className="flex flex-wrap items-center gap-3 border-t border-jet px-6 py-4">
        {decision ? (
          <div className="hx-readout flex w-full items-center justify-between gap-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.16em] ${decision === "approved" ? "bg-jungle text-jet-tint" : "border border-jungle text-jungle"}`}>
              {decision === "approved" ? <CircleCheck size={14} strokeWidth={1.5} aria-hidden /> : <X size={14} strokeWidth={1.5} aria-hidden />}
              {decision === "approved" ? "Approved · reason recorded" : "Rejected · reason recorded"}
            </span>
            <button type="button" onClick={() => setDecision(null)} className="inline-flex items-center gap-1.5 text-sm text-jungle underline underline-offset-4">
              <RotateCcw size={14} strokeWidth={1.5} aria-hidden /> Undo
            </button>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setDecision("approved")} className="inline-flex items-center gap-2 border border-jungle bg-jungle px-4 py-2 text-sm font-medium text-jet-tint transition-colors hover:border-olive hover:bg-olive">
              <CircleCheck size={15} strokeWidth={1.5} aria-hidden /> Approve
            </button>
            <button type="button" onClick={() => setDecision("rejected")} className="inline-flex items-center gap-2 border border-jungle px-4 py-2 text-sm font-medium text-jungle transition-colors hover:bg-jet">
              <X size={15} strokeWidth={1.5} aria-hidden /> Reject
            </button>
            <button type="button" onClick={() => setCommenting((c) => !c)} aria-expanded={commenting} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-jungle underline underline-offset-4">
              <MessageSquare size={15} strokeWidth={1.5} aria-hidden /> Comment
            </button>
          </>
        )}
      </footer>
    </article>
  );
}
