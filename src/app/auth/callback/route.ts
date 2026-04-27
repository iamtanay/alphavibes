// auth/callback/route.ts
//
// With implicit OAuth flow the browser receives the access_token directly
// in the URL fragment (#access_token=...). Fragments are never sent to the
// server, so this route handler will never be called for auth purposes.
//
// We keep this file so Supabase's "Redirect URL" config doesn't 404,
// but it just bounces the user home. The actual session is handled
// by supabase.auth.onAuthStateChange() in SupabaseProvider.

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/`);
}
