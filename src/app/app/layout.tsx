import Link from "next/link";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { getCurrentUser } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

// Frame around every screen of the tool: top bar + content.
export default async function ToolLayout({ children }: LayoutProps<"/app">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="on-dark border-b border-olive bg-jungle text-jet">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/app" className="text-sm font-semibold uppercase tracking-[0.2em] text-jet-tint">
            {site.name}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline">{user.is_anonymous ? "Demo visitor" : user.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-jet-tint underline underline-offset-4 hover:text-slate">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
    </div>
  );
}
