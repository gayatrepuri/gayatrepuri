import Link from "next/link";
import { site } from "@/config/site";
import { Notice } from "@/components/ui";
import { hasSupabaseEnv } from "@/lib/env";
import { LoginForm } from "./login-form";

export const metadata = { title: `Sign in · ${site.name}` };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/app";
  const error = typeof params.error === "string" ? params.error : undefined;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-jungle">
          {site.name}
        </Link>
        <h1 className="mt-8 text-2xl font-medium">Sign in to the tool</h1>
        <p className="mt-2 text-sm text-granite">Use the email and password for your account.</p>
        <div className="mt-8 border-t border-jet pt-8">
          {!hasSupabaseEnv() ? (
            <Notice tone="error">
              Supabase is not connected yet. Add the Supabase settings to .env.local and restart.
            </Notice>
          ) : (
            <>
              {error && (
                <div className="mb-5">
                  <Notice tone="error">{error}</Notice>
                </div>
              )}
              <LoginForm next={next} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
