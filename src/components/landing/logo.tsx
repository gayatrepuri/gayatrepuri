import { site } from "@/config/site";

// Wordmark: four modules, one pulled out, as if being swapped.
export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <rect x="2" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="2" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="13" width="9" height="9" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="15" width="7" height="7" fill="currentColor" className="text-slate" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-[0.08em] ${className}`}>
      <LogoMark />
      {site.name.toUpperCase()}
    </span>
  );
}
