import { landing } from "@/config/landing";

// Animated line drawing of a conveyor drive unit (pure SVG + CSS, no extra download).
// Draws itself in, then loops: explode → highlight 3 changes with callouts → reassemble.
// The animation timings live in globals.css under "Hero drawing".

type Shift = { dx: number; dy: number };
const g = ({ dx, dy }: Shift) => ({ style: { "--dx": `${dx}px`, "--dy": `${dy}px` } as React.CSSProperties });

function Bolt({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3.2} pathLength={1} className="hd-line" />;
}

export function HeroDrawing() {
  const [a, b, c] = landing.heroDrawing.callouts;
  return (
    <figure className="hero-drawing relative">
      <svg
        viewBox="0 0 640 480"
        role="img"
        aria-label={`Line drawing of a conveyor drive unit separating into its parts, with suggested changes: ${landing.heroDrawing.callouts.join("; ")}.`}
        className="h-auto w-full"
      >
        {/* Drawing grid */}
        <g className="hd-grid" aria-hidden>
          {Array.from({ length: 17 }, (_, i) => (
            <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={480} />
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 40} x2={640} y2={i * 40} />
          ))}
        </g>

        {/* Frame (stays put) */}
        <g className="hd-part">
          <rect x={40} y={340} width={560} height={30} pathLength={1} className="hd-line" />
          <rect x={64} y={370} width={18} height={70} pathLength={1} className="hd-line" />
          <rect x={558} y={370} width={18} height={70} pathLength={1} className="hd-line" />
          <line x1={40} y1={355} x2={600} y2={355} pathLength={1} className="hd-line hd-thin" />
        </g>

        {/* Bearing bracket LH: highlight B */}
        <g className="hd-part hd-explode" {...g({ dx: -46, dy: 26 })}>
          <g className="hd-hl hd-hl-b">
            <rect x={104} y={222} width={18} height={118} pathLength={1} className="hd-line" />
            <rect x={92} y={330} width={42} height={10} pathLength={1} className="hd-line" />
            <Bolt x={100} y={335} />
            <Bolt x={126} y={335} />
          </g>
        </g>

        {/* Bearing bracket RH */}
        <g className="hd-part hd-explode" {...g({ dx: 30, dy: 26 })}>
          <rect x={430} y={222} width={18} height={118} pathLength={1} className="hd-line" />
          <rect x={418} y={330} width={42} height={10} pathLength={1} className="hd-line" />
          <Bolt x={426} y={335} />
          <Bolt x={452} y={335} />
        </g>

        {/* Bearings */}
        <g className="hd-part hd-explode" {...g({ dx: -70, dy: -6 })}>
          <rect x={88} y={178} width={50} height={46} pathLength={1} className="hd-line" />
          <circle cx={113} cy={201} r={14} pathLength={1} className="hd-line" />
          <g className="hd-hl hd-hl-c">
            <Bolt x={95} y={185} />
            <Bolt x={131} y={185} />
            <Bolt x={95} y={217} />
            <Bolt x={131} y={217} />
          </g>
        </g>
        <g className="hd-part hd-explode" {...g({ dx: 56, dy: -6 })}>
          <rect x={414} y={178} width={50} height={46} pathLength={1} className="hd-line" />
          <circle cx={439} cy={201} r={14} pathLength={1} className="hd-line" />
          <g className="hd-hl hd-hl-c">
            <Bolt x={421} y={185} />
            <Bolt x={457} y={185} />
            <Bolt x={421} y={217} />
            <Bolt x={457} y={217} />
          </g>
        </g>

        {/* Shaft */}
        <g className="hd-part hd-explode" {...g({ dx: 0, dy: -4 })}>
          <rect x={70} y={195} width={420} height={12} pathLength={1} className="hd-line" />
          <line x1={60} y1={201} x2={500} y2={201} className="hd-center" />
        </g>

        {/* Drum */}
        <g className="hd-part hd-explode" {...g({ dx: 0, dy: -44 })}>
          <circle cx={276} cy={201} r={88} pathLength={1} className="hd-line" />
          <circle cx={276} cy={201} r={78} pathLength={1} className="hd-line hd-thin hd-dash" />
          <circle cx={276} cy={201} r={22} pathLength={1} className="hd-line" />
          <line x1={338} y1={139} x2={362} y2={124} className="hd-thin hd-line" />
          <text x={366} y={122} className="hd-label">Ø220</text>
        </g>

        {/* Coupling */}
        <g className="hd-part hd-explode" {...g({ dx: 8, dy: -40 })}>
          <rect x={490} y={186} width={26} height={30} pathLength={1} className="hd-line" />
          <line x1={503} y1={186} x2={503} y2={216} className="hd-line hd-thin" />
        </g>

        {/* Gearmotor */}
        <g className="hd-part hd-explode" {...g({ dx: 18, dy: -86 })}>
          <rect x={516} y={160} width={92} height={80} pathLength={1} className="hd-line" />
          {[176, 192, 208, 224].map((y) => (
            <line key={y} x1={540} y1={y} x2={600} y2={y} className="hd-line hd-thin" />
          ))}
          <rect x={516} y={180} width={14} height={40} pathLength={1} className="hd-line" />
        </g>

        {/* Motor plate (welded): highlight A */}
        <g className="hd-part hd-explode" {...g({ dx: 18, dy: -24 })}>
          <g className="hd-hl hd-hl-a">
            <rect x={510} y={240} width={104} height={12} pathLength={1} className="hd-line" />
            <rect x={546} y={252} width={32} height={88} pathLength={1} className="hd-line" />
            <path d="M546 340 l-8 -8 M578 340 l8 -8" pathLength={1} className="hd-line" />
          </g>
        </g>

        {/* Dimension line under the frame */}
        <g className="hd-dim" aria-hidden>
          <line x1={40} y1={458} x2={600} y2={458} />
          <line x1={40} y1={450} x2={40} y2={466} />
          <line x1={600} y1={450} x2={600} y2={466} />
          <text x={320} y={452} textAnchor="middle" className="hd-label">
            CD-400 · 31 parts
          </text>
        </g>

        {/* Callouts with leader lines */}
        <g className="hd-callout hd-callout-a">
          <polyline points="628,226 634,226 634,40 360,40" className="hd-leader" />
          <circle cx={628} cy={226} r={3} className="hd-dot" />
          <text x={364} y={32} className="hd-callout-text">{a}</text>
        </g>
        <g className="hd-callout hd-callout-b">
          <polyline points="66,300 20,300 20,40 40,40" className="hd-leader" />
          <circle cx={66} cy={300} r={3} className="hd-dot" />
          <text x={44} y={32} className="hd-callout-text">{b}</text>
        </g>
        <g className="hd-callout hd-callout-c">
          <polyline points="43,180 20,180 20,40 40,40" className="hd-leader" />
          <circle cx={43} cy={180} r={3} className="hd-dot" />
          <text x={44} y={32} className="hd-callout-text">{c}</text>
        </g>
      </svg>
      <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-jet">{landing.heroDrawing.caption}</figcaption>
      {/* On small screens the labels inside the drawing are too small, so list them here too. */}
      <ul className="mt-4 space-y-2 font-mono text-[13px] text-jet-tint sm:hidden" aria-hidden>
        {landing.heroDrawing.callouts.map((t) => (
          <li key={t} className="flex gap-3">
            <span className="text-slate">→</span>
            {t}
          </li>
        ))}
      </ul>
    </figure>
  );
}
