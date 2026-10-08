import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock, Scale, ShieldCheck, type LucideIcon } from "lucide-react";
import { landing } from "@/config/landing";
import { site } from "@/config/site";
import { startDemo } from "@/app/demo/actions";
import { HeroExplorer } from "@/components/landing/hero-explorer";
import { CountUp, ExampleCard, MathsPlayground, OutcomeTabs, ScrollProgress, StepsWalkthrough } from "@/components/landing/interactive";
import { Logo } from "@/components/landing/logo";
import { Reveal } from "@/components/landing/reveal";
import { WaitlistForm } from "@/components/landing/waitlist-form";

const PRINCIPLE_ICONS: Record<string, LucideIcon> = { approve: ShieldCheck, formula: Scale, private: Lock };
const pad = (n: number) => String(n).padStart(2, "0");
const delay = (ms: number) => ({ "--delay": `${ms}ms` }) as React.CSSProperties;

function Eyebrow({ children, tone = "dark", center = false }: { children: React.ReactNode; tone?: "dark" | "light"; center?: boolean }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] ${center ? "justify-center" : ""} ${tone === "dark" ? "text-jet" : "text-granite"}`}>
      <span className={`h-px w-8 ${tone === "dark" ? "bg-slate" : "bg-jungle"}`} aria-hidden />
      {children}
      {center && <span className={`h-px w-8 ${tone === "dark" ? "bg-slate" : "bg-jungle"}`} aria-hidden />}
    </p>
  );
}

/** Section heading: plain words, then words in the italic accent face. Rises out of a mask on scroll. */
function Heading({ plain, accent, tone = "dark", className = "" }: { plain: string; accent?: string; tone?: "dark" | "light"; className?: string }) {
  return (
    <h2 className={`mt-6 font-display text-[2.25rem] font-light leading-[1.05] tracking-[-0.02em] [font-stretch:110%] sm:text-5xl lg:text-[3.5rem] ${tone === "dark" ? "text-jet-tint" : "text-jungle"} ${className}`}>
      <span className="mask-line">
        <span style={{ "--line": 0 } as React.CSSProperties}>{plain}</span>
      </span>{" "}
      {accent && (
        <span className="mask-line">
          <span style={{ "--line": 1 } as React.CSSProperties} className="font-accent text-[1.12em] italic tracking-normal [font-stretch:100%]">
            {accent}
          </span>
        </span>
      )}
    </h2>
  );
}

export default function Home() {
  const { hero, stats, problem, whatItDoes, howItWorks, maths, exampleCard, principles, waitlist } = landing;
  const tickerItems = [
    ...landing.explorer.changes.map((c) => c.change),
    ...whatItDoes.items.map((i) => i.example),
    "Merge sensor brackets CD400-111 and -112",
    "Replace glued wear strip with a clip-in rail on 2 × M6",
  ];

  return (
    <div className="on-dark flex flex-1 flex-col bg-jungle text-jet">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-30 border-b border-olive/60 bg-jungle">
        <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="text-jet-tint">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-8 text-sm lg:flex">
            {landing.nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="relative text-jet transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-slate after:transition-transform after:duration-300 hover:text-jet-tint hover:after:scale-x-100">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="hidden text-jet transition-colors hover:text-jet-tint sm:inline">
              Sign in
            </Link>
            <a href="#waitlist" className="border border-jet px-4 py-2 font-medium text-jet-tint transition-colors hover:border-slate hover:bg-slate hover:text-jungle">
              Join waitlist
            </a>
          </div>
        </nav>
        <ScrollProgress />
      </header>

      <main>
        {/* ── Hero (centred) ── */}
        <section className="relative border-b border-olive/60">
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 text-center sm:pt-24">
            <div className="hero-in" style={delay(0)}>
              <Eyebrow center>{hero.eyebrow}</Eyebrow>
            </div>
            <h1 className="hero-in mx-auto mt-8 max-w-5xl font-display text-[2.6rem] font-light leading-[1.02] tracking-[-0.025em] text-jet-tint [font-stretch:110%] sm:text-6xl lg:text-[5rem]" style={delay(120)}>
              {hero.headlineBefore}{" "}
              <em className="font-accent text-[1.12em] font-normal italic tracking-normal text-slate [font-stretch:100%]">{hero.headlineAccent}</em>{" "}
              {hero.headlineAfter}
            </h1>
            <p className="hero-in mx-auto mt-8 max-w-[60ch] text-[1.0625rem] leading-[1.75] text-jet sm:text-lg" style={delay(240)}>
              {hero.subhead}
            </p>
            <div className="hero-in mt-10 flex flex-wrap justify-center gap-4" style={delay(360)}>
              <form action={startDemo}>
                <button type="submit" className="group inline-flex items-center gap-3 border border-jet-tint bg-jet-tint px-7 py-3.5 text-sm font-medium text-jungle transition-colors hover:border-slate hover:bg-slate">
                  {hero.primaryCta}
                  <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
              <a href="#waitlist" className="inline-flex items-center border border-jet px-7 py-3.5 text-sm font-medium text-jet-tint transition-colors hover:border-jet-tint">
                {hero.secondaryCta}
              </a>
            </div>
          </div>

          <div className="hero-in mx-auto max-w-5xl px-6 pb-20" style={delay(480)}>
            <HeroExplorer />
          </div>

          {/* What it reads */}
          <div className="border-t border-olive/60">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-6 md:grid-cols-4">
              {landing.inputs.map((i, idx) => (
                <div key={i.label} className={`py-7 ${idx % 2 === 1 ? "border-l border-olive/60 pl-6" : ""} ${idx === 2 ? "md:border-l md:border-olive/60 md:pl-6" : ""}`}>
                  <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-jet">
                    {pad(idx + 1)} · {i.label}
                  </dt>
                  <dd className="mt-2 text-jet-tint">{i.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Ticker of example changes (slow) ── */}
        <section aria-label="Example suggestions" className="ticker overflow-hidden border-b border-olive/60 py-4">
          <ul className="sr-only">
            {tickerItems.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <div className="ticker-track" aria-hidden>
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0">
                {tickerItems.map((t) => (
                  <span key={t} className="flex items-center gap-5 whitespace-nowrap px-8 font-mono text-[13px] text-jet">
                    <span className="h-1.5 w-1.5 bg-slate" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats band (Light Slate Gray) ── */}
        <section aria-label={stats.caption} className="bg-slate text-jungle">
          <div className="mx-auto max-w-7xl px-6 py-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em]">{stats.caption}</p>
            <dl className="mt-8 grid grid-cols-2 gap-y-10 md:grid-cols-4">
              {stats.items.map((s, i) => (
                <Reveal key={s.label} delay={i * 100} className={`flex flex-col-reverse ${i % 2 === 1 ? "border-l border-jungle/40 pl-6" : ""} ${i === 2 ? "md:border-l md:border-jungle/40 md:pl-6" : ""}`}>
                  <dt className="mt-2 text-[0.95rem]">{s.label}</dt>
                  <dd className="font-display text-6xl font-light tracking-tight [font-stretch:110%]">
                    <CountUp value={s.value} />
                  </dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Problem (light) ── */}
        <section id="problem" className="scroll-mt-20 bg-jet-tint text-jungle">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1fr_1.3fr] lg:py-36">
            <Reveal>
              <Eyebrow tone="light">{problem.eyebrow}</Eyebrow>
              <Heading plain={problem.headline} tone="light" />
              <p className="mt-8 max-w-[52ch] text-[1.0625rem] leading-[1.75] text-granite">{problem.intro}</p>
            </Reveal>
            <ol className="border-t border-jungle">
              {problem.points.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 120} className="group grid grid-cols-[4rem_1fr] gap-4 border-b border-jet py-9 transition-colors hover:border-jungle">
                  <span className="font-mono text-sm text-granite transition-colors group-hover:text-jungle">{pad(i + 1)}</span>
                  <div>
                    <h3 className="font-display text-2xl font-light [font-stretch:105%]">{p.title}</h3>
                    <p className="mt-3 text-[1.0625rem] leading-[1.7] text-granite">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── What it does (interactive tabs) ── */}
        <section id="what-it-does" className="scroll-mt-20 border-b border-olive/60">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
            <Reveal>
              <Eyebrow>{whatItDoes.eyebrow}</Eyebrow>
              <Heading plain={whatItDoes.headline} accent={whatItDoes.headlineAccent} />
            </Reveal>
            <Reveal delay={150} className="mt-16">
              <OutcomeTabs />
            </Reveal>
          </div>
        </section>

        {/* ── How it works (stepper) ── */}
        <section id="how-it-works" className="scroll-mt-20">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
            <Reveal>
              <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
              <Heading plain={howItWorks.headline} accent={howItWorks.headlineAccent} />
            </Reveal>
            <Reveal delay={150} className="mt-16">
              <StepsWalkthrough />
            </Reveal>
          </div>
        </section>

        {/* ── The maths (light, interactive) ── */}
        <section id="maths" className="scroll-mt-20 bg-jet-tint text-jungle">
          <div className="mx-auto max-w-7xl px-6 py-28 lg:py-36">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
              <Reveal>
                <Eyebrow tone="light">{maths.eyebrow}</Eyebrow>
                <Heading plain={maths.headline} accent={maths.headlineAccent} tone="light" />
              </Reveal>
              <Reveal delay={100}>
                <p className="max-w-[52ch] text-[1.0625rem] leading-[1.75] text-granite">{maths.body}</p>
              </Reveal>
            </div>
            <Reveal delay={150} className="mt-14">
              <MathsPlayground />
            </Reveal>
          </div>
        </section>

        {/* ── Example suggestion + principles ── */}
        <section className="border-b border-olive/60">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-[1.2fr_1fr] lg:py-36">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-jet">{exampleCard.label}</p>
              <div className="mt-4">
                <ExampleCard />
              </div>
            </Reveal>
            <ul className="flex flex-col justify-center border-t border-olive/60">
              {principles.map((p, i) => {
                const Icon = PRINCIPLE_ICONS[p.icon];
                return (
                  <Reveal as="li" key={p.title} delay={i * 120} className="group flex gap-5 border-b border-olive/60 py-8">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-olive text-jet-tint transition-colors duration-300 group-hover:border-slate group-hover:text-slate">
                      <Icon size={19} strokeWidth={1.4} aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-light text-jet-tint [font-stretch:105%]">{p.title}</h3>
                      <p className="mt-2 leading-[1.7] text-jet">{p.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </section>

        {/* ── Waitlist (Light Slate Gray) ── */}
        <section id="waitlist" className="scroll-mt-20 bg-slate text-jungle">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-28 lg:grid-cols-2 lg:py-36">
            <Reveal>
              <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
                <span className="h-px w-8 bg-jungle" aria-hidden />
                {waitlist.eyebrow}
              </p>
              <Heading plain={waitlist.headline} accent={waitlist.headlineAccent} tone="light" />
              <p className="mt-8 max-w-[44ch] text-[1.0625rem] leading-[1.75]">{waitlist.body}</p>
              <form action={startDemo} className="mt-10">
                <button type="submit" className="group inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
                  Or explore the demo first
                  <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </button>
              </form>
            </Reveal>
            <Reveal delay={150}>
              <WaitlistForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-10 text-sm text-jet">
          <Logo className="text-jet-tint" />
          <p>{landing.footer}</p>
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} {site.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
