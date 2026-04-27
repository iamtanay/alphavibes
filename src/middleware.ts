// middleware.ts — no auth checking here.
//
// Why: The browser Supabase client uses implicit OAuth flow (access_token in
// URL fragment). Fragments never reach the server, so server-side session
// checks always see "no session" and create an infinite redirect loop.
// Auth is enforced client-side in each protected page instead.

export function middleware() {
  // Nothing — pass every request straight through.
}

export const config = {
  matcher: [], // match nothing — middleware is effectively disabled
};
