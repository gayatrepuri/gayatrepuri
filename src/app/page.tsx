import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Calculator,
  CircleCheck,
  Lock,
  MessageSquare,
  RefreshCcw,
  Scale,
  ScanLine,
  ShieldCheck,
  Upload,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { landing } from "@/config/landing";
import { site } from "@/config/site";
import { startDemo } from "@/app/demo/actions";
import { HeroDrawing } from "@/components/landing/hero-drawing";
import { Logo } from "@/components/landing/logo";
import { Reveal } from "@/components/landing/reveal";
import { WaitlistForm } from "@/components/landing/waitlist-form";

const ICONS: Record<string, LucideIcon> = {
  modular: Boxes,
  disassembly: Wrench,
  reman: RefreshCcw,
  upload: Upload,
  analyse: ScanLine,
  calculate: Calculator,
  decide: CircleCheck,
  approve: ShieldCheck,
  formula: Scale,
  private: Lock,
};

function IconBox({ name, tone = "dark" }: { name: string; tone?: "dark" | "light" }) {
  const Icon = ICONS[name];
  return (
    <span
      className={`flex h-11 w-11 shrink-0 items-center justify-center border transition-colors duration-300 ${
        tone === "dark" ? "border-olive text-jet-tint group-hover:border-slate" : "border-jungle text-jungle"
      }`}
    >
      <Icon size={20} strokeWidth={1.4} aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5" />
    </span>
  );
}

function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] ${tone === "dark" ? "text-jet" : "text-granite"}`}>
      <span className={`h-px w-8 ${tone === "dark" ? "bg-slate" : "bg-jungle"}`} aria-hidden />
      {children}
    </p>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Home() {
  const { hero, problem, whatItDoes, howItWorks, exampleCard, principles, waitlist } = landing;
  const tickerItems = [...landing.heroDrawing.callouts, ...whatItDoes.items.map((i) => i.example), "Merge sensor brackets CD400-111 and -112", "Replace glued wear strip with 2 × M6 clip-in rail"];

  return (
    <div className="on-dark flex flex-1 flex-col bg-jungle text-jet">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-30 border-b border-olive/60 bg-jungle">
        <nav aria-label="Main" className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="text-jet-tint">
            <Logo />
          </Link>
          <ul className="hidden items-center gap-8 text-sm md:flex">
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
            <a href="#waitlist" className="border border-jet px-4 py-2 font-medium text-jet-tint transition-colors hover:bg-jet-tint hover:text-jungle">
              Join waitlist
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-olive/60">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1fr_1.05fr] lg:pb-28 lg:pt-24">
            <div>
              <div className="hero-in" style={{ "--delay": "0ms" } as React.CSSProperties}>
                <Eyebrow>{hero.eyebrow}</Eyebrow>
              </div>
              <h1 className="hero-in mt-8 font-display text-4xl font-medium leading-[1.05] tracking-tight text-jet-tint sm:text-5xl lg:text-[3.6rem]" style={{ "--delay": "120ms" } as React.CSSProperties}>
                {hero.headline}
              </h1>
              <p className="hero-in mt-8 max-w-xl text-lg leading-relaxed text-jet" style={{ "--delay": "240ms" } as React.CSSProperties}>
                {hero.subhead}
              </p>
              <div className="hero-in mt-10 flex flex-wrap gap-4" style={{ "--delay": "360ms" } as React.CSSProperties}>
                <form action={startDemo}>
                  <button type="submit" className="group inline-flex items-center gap-3 border border-jet-tint bg-jet-tint px-6 py-3 text-sm font-medium text-jungle transition-colors hover:bg-jet">
                    {hero.primaryCta}
                    <ArrowRight size={16} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </form>
                <a href="#waitlist" className="inline-flex items-center border border-jet px-6 py-3 text-sm font-medium text-jet-tint transition-colors hover:border-jet-tint">
                  {hero.secondaryCta}
                </a>
              </div>
              <ul className="hero-in mt-10 space-y-2.5 text-sm text-jet" style={{ "--delay": "480ms" } as React.CSSProperties}>
                {hero.proofPoints.map((p) => (
                  <li key={p} className="flex items-center gap-3">
                    <CircleCheck size={16} strokeWidth={1.5} aria-hidden className="text-slate" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="hero-in" style={{ "--delay": "200ms" } as React.CSSProperties}>
              <HeroDrawing />
            </div>
          </div>

          {/* What it reads */}
          <div className="border-t border-olive/60">
            <dl className="mx-auto grid max-w-7xl grid-cols-2 px-6 md:grid-cols-4">
              {landing.inputs.map((i, idx) => (
                <div key={i.label} className={`py-6 ${idx > 0 ? "md:border-l md:border-olive/60 md:pl-6" : ""} ${idx % 2 === 1 ? "border-l border-olive/60 pl-6 md:pl-6" : ""}`}>
                  <dt className="font-mono text-xs uppercase tracking-[0.18em] text-jet">
                    {pad(idx + 1)} · {i.label}
                  </dt>
                  <dd className="mt-2 text-jet-tint">{i.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Ticker of example changes ── */}
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
                  <span key={t} className="flex items-center gap-4 whitespace-nowrap px-6 font-mono text-sm text-jet">
                    <span className="h-1.5 w-1.5 bg-slate" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Problem (light) ── */}
        <section id="problem" className="scroll-mt-20 bg-jet-tint text-jungle">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[1fr_1.4fr] lg:py-32">
            <Reveal>
              <Eyebrow tone="light">{problem.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{problem.headline}</h2>
              <p className="mt-6 max-w-md leading-relaxed text-granite">{problem.intro}</p>
            </Reveal>
            <ol className="border-t border-jungle">
              {problem.points.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 120} className="grid grid-cols-[3.5rem_1fr] gap-4 border-b border-jet py-8">
                  <span className="font-mono text-sm text-granite">{pad(i + 1)}</span>
                  <div>
                    <h3 className="font-display text-xl font-medium">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-granite">{p.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── What it does ── */}
        <section id="what-it-does" className="scroll-mt-20 border-b border-olive/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <Reveal>
              <Eyebrow>{whatItDoes.eyebrow}</Eyebrow>
              <h2 className="mt-6 max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight text-jet-tint sm:text-4xl">{whatItDoes.headline}</h2>
            </Reveal>
            <div className="mt-16 grid border-l border-t border-olive/60 md:grid-cols-3">
              {whatItDoes.items.map((item, i) => (
                <Reveal key={item.title} delay={i * 140} className="group flex flex-col border-b border-r border-olive/60 p-8">
                  <div className="flex items-start justify-between">
                    <IconBox name={item.icon} />
                    <span className="font-mono text-xs text-jet">{pad(i + 1)}</span>
                  </div>
                  <h3 className="mt-10 font-display text-2xl font-medium text-jet-tint">{item.title}</h3>
                  <p className="mt-4 flex-1 leading-relaxed text-jet">{item.body}</p>
                  <p className="mt-8 border-t border-olive/60 pt-4 font-mono text-[13px] leading-relaxed text-jet-tint">
                    <span className="mr-2 text-slate">→</span>
                    {item.example}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="scroll-mt-20 border-b border-olive/60">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <Reveal>
              <Eyebrow>{howItWorks.eyebrow}</Eyebrow>
              <h2 className="mt-6 max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight text-jet-tint sm:text-4xl">{howItWorks.headline}</h2>
            </Reveal>
            <Reveal className="relative mt-16">
              <div className="grow-x absolute left-0 right-0 top-[22px] hidden h-px bg-slate lg:block" aria-hidden />
              <ol className="grid gap-12 lg:grid-cols-4 lg:gap-8">
                {howItWorks.steps.map((s, i) => (
                  <li key={s.title} className="group relative">
                    <div className="flex items-center gap-4">
                      <span className="relative z-10 bg-jungle pr-3">
                        <IconBox name={s.icon} />
                      </span>
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-jet lg:hidden">Step {i + 1}</span>
                    </div>
                    <p className="mt-6 hidden font-mono text-xs uppercase tracking-[0.18em] text-jet lg:block">Step {i + 1}</p>
                    <h3 className="mt-2 font-display text-xl font-medium text-jet-tint">{s.title}</h3>
                    <p className="mt-3 leading-relaxed text-jet">{s.body}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ── Example suggestion + principles (light) ── */}
        <section className="bg-jet-tint text-jungle">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[1.2fr_1fr] lg:py-32">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-granite">{exampleCard.label}</p>
              <article className="mt-4 border border-jungle bg-jet-tint">
                <header className="flex items-center justify-between border-b border-jet px-6 py-3">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-granite">{exampleCard.type}</span>
                  <span className="font-mono text-xs text-granite">
                    Confidence <span className="text-jungle">{exampleCard.confidence}</span>
                  </span>
                </header>
                <div className="space-y-6 px-6 py-6">
                  <h3 className="font-display text-xl font-medium leading-snug">{exampleCard.title}</h3>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-granite">Affects</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {exampleCard.affects.map((a) => (
                        <li key={a} className="border border-jet px-2.5 py-1 font-mono text-xs">
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-granite">Risk</p>
                    <p className="mt-1 text-sm leading-relaxed">{exampleCard.risks}</p>
                  </div>
                  <dl className="grid grid-cols-2 border-t border-jet sm:grid-cols-4">
                    {exampleCard.inputs.map((x, i) => (
                      <div key={x.label} className={`pt-4 ${i > 0 ? "sm:border-l sm:border-jet sm:pl-4" : ""}`}>
                        <dt className="text-xs text-granite">{x.label}</dt>
                        <dd className="num mt-1 text-lg">{x.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <footer className="flex flex-wrap gap-3 border-t border-jet px-6 py-4" aria-hidden>
                  <span className="inline-flex items-center gap-2 bg-jungle px-4 py-2 text-sm font-medium text-jet-tint">
                    <CircleCheck size={15} strokeWidth={1.5} /> Approve
                  </span>
                  <span className="inline-flex items-center gap-2 border border-jungle px-4 py-2 text-sm font-medium">
                    <X size={15} strokeWidth={1.5} /> Reject
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium underline underline-offset-4">
                    <MessageSquare size={15} strokeWidth={1.5} /> Comment
                  </span>
                </footer>
              </article>
            </Reveal>

            <div className="flex flex-col justify-center">
              <ul className="border-t border-jungle">
                {principles.map((p, i) => (
                  <Reveal as="li" key={p.title} delay={i * 120} className="flex gap-5 border-b border-jet py-8">
                    <IconBox name={p.icon} tone="light" />
                    <div>
                      <h3 className="font-display text-xl font-medium">{p.title}</h3>
                      <p className="mt-2 leading-relaxed text-granite">{p.body}</p>
                    </div>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Waitlist ── */}
        <section id="waitlist" className="scroll-mt-20">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:py-32">
            <Reveal>
              <Eyebrow>{waitlist.eyebrow}</Eyebrow>
              <h2 className="mt-6 font-display text-3xl font-medium leading-tight tracking-tight text-jet-tint sm:text-5xl">{waitlist.headline}</h2>
              <p className="mt-6 max-w-md leading-relaxed text-jet">{waitlist.body}</p>
              <form action={startDemo} className="mt-10">
                <button type="submit" className="group inline-flex items-center gap-2 text-sm font-medium text-jet-tint underline underline-offset-4 transition-colors hover:text-jet">
                  Or explore the demo first
                  <ArrowRight size={15} strokeWidth={1.5} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </form>
            </Reveal>
            <Reveal delay={150}>
              <WaitlistForm />
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="border-t border-olive/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-jet">
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
