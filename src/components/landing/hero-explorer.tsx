"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Expand, Pause, Play, Shrink } from "lucide-react";
import { landing } from "@/config/landing";
import { useReducedMotion } from "./use-reduced-motion";

// Interactive line drawing of a conveyor drive unit.
// • Plays a walkthrough on its own: assembled → exploded → change 1 → 2 → 3 → repeat.
// • Visitors can click a numbered part or a tab, explode / assemble it, or pause.
// • With "reduce motion" on, nothing moves by itself; clicks still work.

type Shift = { dx: number; dy: number };
const shift = ({ dx, dy }: Shift) => ({ "--dx": `${dx}px`, "--dy": `${dy}px` }) as React.CSSProperties;

const STEPS: { exploded: boolean; active: number | null }[] = [
  { exploded: false, active: null },
  { exploded: true, active: null },
  { exploded: true, active: 0 },
  { exploded: true, active: 1 },
  { exploded: true, active: 2 },
];
const STEP_MS = 3400;
const RESUME_AFTER_MS = 12000;

function Bolt({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.2} pathLength={1} className="hd-line" />;
}

/** Numbered marker that travels with its part. */
function Marker({ n, x, y, side = "right" }: { n: number; x: number; y: number; side?: "left" | "right" }) {
  const tx = side === "right" ? x + 26 : x - 26;
  return (
    <g className="hx-marker" aria-hidden>
      <circle cx={x} cy={y} r={9} className="hx-ring" />
      <circle cx={x} cy={y} r={3} className="hx-dot" />
      <line x1={side === "right" ? x + 9 : x - 9} y1={y} x2={side === "right" ? tx - 11 : tx + 11} y2={y} className="hx-leader" />
      <rect x={tx - 11} y={y - 11} width={22} height={22} className="hx-tag" />
      <text x={tx} y={y + 4.5} textAnchor="middle" className="hx-tag-text">
        {String(n).padStart(2, "0")}
      </text>
    </g>
  );
}

export function HeroExplorer() {
  const { changes } = landing.explorer;
  const [step, setStep] = useState(0);
  const [manual, setManual] = useState<{ exploded: boolean; active: number | null }>({ exploded: false, active: null });
  const [playing, setPlaying] = useState(true);
  const reduced = useReducedMotion();
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const auto = playing && !reduced;
  const { exploded, active } = auto ? STEPS[step] : manual;

  // Walkthrough clock.
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), step === 0 ? 2600 : STEP_MS);
    return () => clearTimeout(t);
  }, [auto, step]);

  const takeOver = useCallback(() => {
    setPlaying(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      setStep(1);
      setPlaying(true);
    }, RESUME_AFTER_MS);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  function choose(i: number) {
    takeOver();
    setManual({ exploded: true, active: active === i ? null : i });
  }

  function toggleExplode() {
    takeOver();
    setManual({ exploded: !exploded, active: exploded ? null : active });
  }

  function togglePlay() {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    if (playing) {
      setManual({ exploded, active });
      setPlaying(false);
    } else {
      setStep(exploded ? 1 : 0);
      setPlaying(true);
    }
  }

  const hl = (i: number) => `hx-hl ${active === i ? "is-active" : ""}`;
  const partProps = (i: number) => ({
    onClick: () => choose(i),
    onMouseEnter: () => {
      if (active !== i) choose(i);
    },
    style: { cursor: "pointer" },
  });
  const current = active === null ? null : changes[active];

  return (
    <figure className={`hero-explorer ${exploded ? "is-exploded" : ""} ${active !== null ? "has-active" : ""}`}>
      <div className="relative border border-olive/70">
        {/* Registration ticks in the corners, like a drawing sheet */}
        {["left-0 top-0 border-l border-t", "right-0 top-0 border-r border-t", "left-0 bottom-0 border-l border-b", "right-0 bottom-0 border-r border-b"].map((c) => (
          <span key={c} aria-hidden className={`absolute h-3 w-3 border-slate ${c}`} />
        ))}
        <svg
          viewBox="0 0 640 470"
          role="img"
          aria-label={`Line drawing of a conveyor drive unit. Suggested changes: ${changes.map((c) => c.change).join("; ")}.`}
          className="block h-auto w-full"
        >
          <g className="hd-grid" aria-hidden>
            {Array.from({ length: 17 }, (_, i) => (
              <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={470} />
            ))}
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 40} x2={640} y2={i * 40} />
            ))}
          </g>

          {/* Frame */}
          <g className="hx-part">
            <rect x={40} y={340} width={560} height={30} pathLength={1} className="hd-line" />
            <rect x={64} y={370} width={18} height={62} pathLength={1} className="hd-line" />
            <rect x={558} y={370} width={18} height={62} pathLength={1} className="hd-line" />
            <line x1={40} y1={355} x2={600} y2={355} pathLength={1} className="hd-line hd-thin" />
          </g>

          {/* Bearing bracket LH: change 2 */}
          <g className="hx-part hx-explode" style={shift({ dx: -46, dy: 26 })}>
            <g className={hl(1)} {...partProps(1)}>
              <rect x={86} y={214} width={60} height={130} className="hx-hit" />
              <rect x={104} y={222} width={18} height={118} pathLength={1} className="hd-line" />
              <rect x={92} y={330} width={42} height={10} pathLength={1} className="hd-line" />
              <Bolt x={100} y={335} />
              <Bolt x={126} y={335} />
              <Marker n={2} x={122} y={270} />
            </g>
          </g>

          {/* Bearing bracket RH */}
          <g className="hx-part hx-explode" style={shift({ dx: 30, dy: 26 })}>
            <rect x={430} y={222} width={18} height={118} pathLength={1} className="hd-line" />
            <rect x={418} y={330} width={42} height={10} pathLength={1} className="hd-line" />
            <Bolt x={426} y={335} />
            <Bolt x={452} y={335} />
          </g>

          {/* Bearings, with fasteners: change 3 */}
          <g className="hx-part hx-explode" style={shift({ dx: -70, dy: -10 })}>
            <rect x={88} y={178} width={50} height={46} pathLength={1} className="hd-line" />
            <circle cx={113} cy={201} r={14} pathLength={1} className="hd-line" />
            <g className={hl(2)} {...partProps(2)}>
              <rect x={86} y={176} width={54} height={50} className="hx-hit" />
              <Bolt x={95} y={185} />
              <Bolt x={131} y={185} />
              <Bolt x={95} y={217} />
              <Bolt x={131} y={217} />
              <Marker n={3} x={113} y={176} side="left" />
            </g>
          </g>
          <g className="hx-part hx-explode" style={shift({ dx: 56, dy: -10 })}>
            <rect x={414} y={178} width={50} height={46} pathLength={1} className="hd-line" />
            <circle cx={439} cy={201} r={14} pathLength={1} className="hd-line" />
            <g className={hl(2)} {...partProps(2)}>
              <rect x={412} y={176} width={54} height={50} className="hx-hit" />
              <Bolt x={421} y={185} />
              <Bolt x={457} y={185} />
              <Bolt x={421} y={217} />
              <Bolt x={457} y={217} />
            </g>
          </g>

          {/* Shaft */}
          <g className="hx-part hx-explode" style={shift({ dx: 0, dy: -4 })}>
            <rect x={70} y={195} width={420} height={12} pathLength={1} className="hd-line" />
            <line x1={60} y1={201} x2={500} y2={201} className="hd-center" />
          </g>

          {/* Drum */}
          <g className="hx-part hx-explode" style={shift({ dx: 0, dy: -44 })}>
            <circle cx={276} cy={201} r={88} pathLength={1} className="hd-line" />
            <circle cx={276} cy={201} r={78} className="hd-line hd-thin hd-dash" />
            <circle cx={276} cy={201} r={22} pathLength={1} className="hd-line" />
            <line x1={338} y1={139} x2={362} y2={124} className="hd-line hd-thin" />
            <text x={366} y={122} className="hd-label">Ø220</text>
          </g>

          {/* Coupling */}
          <g className="hx-part hx-explode" style={shift({ dx: 8, dy: -40 })}>
            <rect x={490} y={186} width={26} height={30} pathLength={1} className="hd-line" />
            <line x1={503} y1={186} x2={503} y2={216} className="hd-line hd-thin" />
          </g>

          {/* Gearmotor */}
          <g className="hx-part hx-explode" style={shift({ dx: 14, dy: -86 })}>
            <rect x={516} y={160} width={92} height={80} pathLength={1} className="hd-line" />
            {[176, 192, 208, 224].map((y) => (
              <line key={y} x1={540} y1={y} x2={600} y2={y} className="hd-line hd-thin" />
            ))}
            <rect x={516} y={180} width={14} height={40} pathLength={1} className="hd-line" />
          </g>

          {/* Motor plate, welded: change 1 */}
          <g className="hx-part hx-explode" style={shift({ dx: 14, dy: -24 })}>
            <g className={hl(0)} {...partProps(0)}>
              <rect x={506} y={236} width={112} height={110} className="hx-hit" />
              <rect x={510} y={240} width={104} height={12} pathLength={1} className="hd-line" />
              <rect x={546} y={252} width={32} height={88} pathLength={1} className="hd-line" />
              <path d="M546 340 l-8 -8 M578 340 l8 -8" pathLength={1} className="hd-line" />
              <Marker n={1} x={546} y={296} side="left" />
            </g>
          </g>

          {/* Dimension line */}
          <g className="hd-dim" aria-hidden>
            <line x1={40} y1={452} x2={600} y2={452} />
            <line x1={40} y1={444} x2={40} y2={460} />
            <line x1={600} y1={444} x2={600} y2={460} />
            <text x={320} y={446} textAnchor="middle" className="hd-label">
              1 240
            </text>
          </g>
        </svg>
      </div>

      {/* Controls + readout */}
      <div className="grid border-x border-b border-olive/70 md:grid-cols-[auto_1fr]">
        <div className="flex items-stretch border-b border-olive/70 md:border-b-0 md:border-r">
          <div role="tablist" aria-label="Suggested changes" className="flex">
            {changes.map((c, i) => (
              <button
                key={c.change}
                role="tab"
                aria-selected={active === i}
                onClick={() => choose(i)}
                className={`relative min-w-14 border-r border-olive/70 px-4 py-4 font-mono text-sm transition-colors ${active === i ? "bg-slate text-jungle" : "text-jet-tint hover:bg-olive/40"}`}
              >
                {String(i + 1).padStart(2, "0")}
                <span className="sr-only">: {c.change}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={toggleExplode}
            className="flex items-center gap-2 border-r border-olive/70 px-4 text-sm text-jet-tint transition-colors hover:bg-olive/40"
          >
            {exploded ? <Shrink size={16} strokeWidth={1.5} aria-hidden /> : <Expand size={16} strokeWidth={1.5} aria-hidden />}
            <span className="hidden sm:inline">{exploded ? "Assemble" : "Explode"}</span>
            <span className="sr-only sm:hidden">{exploded ? "Assemble" : "Explode"}</span>
          </button>
          {!reduced && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
              className="flex items-center px-4 text-jet-tint transition-colors hover:bg-olive/40"
            >
              {playing ? <Pause size={16} strokeWidth={1.5} aria-hidden /> : <Play size={16} strokeWidth={1.5} aria-hidden />}
            </button>
          )}
        </div>

        <div aria-live="polite" className="min-h-[7.5rem] px-5 py-4 text-left">
          {current ? (
            <div key={active} className="hx-readout">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet">
                Change {String((active ?? 0) + 1).padStart(2, "0")} / {String(changes.length).padStart(2, "0")} · {current.part}
              </p>
              <p className="mt-1.5 font-display text-lg text-jet-tint sm:text-xl">{current.change}</p>
              <p className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-jet">
                <span>
                  <span className="text-slate">Affects</span> {current.affects}
                </span>
                <span>
                  <span className="text-slate">Effect</span> {current.effect}
                </span>
              </p>
            </div>
          ) : (
            <div className="hx-readout flex h-full flex-col justify-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-jet">{landing.explorer.title}</p>
              <p className="mt-1.5 text-jet-tint">{landing.explorer.idleHint}</p>
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
