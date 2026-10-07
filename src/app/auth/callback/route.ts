import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The confirmation link in Supabase's sign-up email lands here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/app`);
  }

  const message = encodeURIComponent("That confirmation link didn't work. Please sign in, or create the account again.");
  return NextResponse.redirect(`${origin}/login?error=${message}`);
}
