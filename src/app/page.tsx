import Link from "next/link";
import { site } from "@/config/site";
import { buttonClass } from "@/components/ui";

// Temporary home page. The full marketing landing page is built in Phase 6.
export default function Home() {
  return (
    <main className="on-dark flex flex-1 flex-col justify-center bg-jungle px-6 py-24 text-jet">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-jet-tint">{site.name}</p>
        <h1 className="mt-6 text-4xl font-medium leading-tight text-jet-tint">{site.shortDescription}</h1>
        <div className="mt-10 flex gap-4">
          <Link href="/app" className={buttonClass("secondary")}>
            Open the tool
          </Link>
        </div>
        <p className="mt-16 border-t border-olive pt-4 text-xs text-jet">Prototype. Landing page coming in Phase 6.</p>
      </div>
    </main>
  );
}
