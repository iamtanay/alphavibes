import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/`);
  }

  // Build the redirect response first so we have a mutable object
  // to write Set-Cookie headers onto.
  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  // Create a Supabase client that reads cookies from the REQUEST
  // and writes cookies directly onto the REDIRECT RESPONSE.
  // This is the only pattern that guarantees the browser receives
  // the session cookies — because NextResponse.redirect() and
  // Next.js cookies() (cookieStore) are separate: cookies set via
  // cookieStore are NOT automatically forwarded on redirect responses.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          // Write every cookie directly onto the redirect response.
          // This fires synchronously when exchangeCodeForSession completes.
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options ?? {});
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(`${origin}/?error=auth`);
  }

  return redirectResponse;
}
