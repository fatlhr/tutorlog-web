import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Named "middleware" (not "proxy") deliberately: @opennextjs/cloudflare does not
// yet support Next.js 16's proxy.ts, which always compiles to the Node.js runtime
// with no way to opt back into Edge (see opennextjs/opennextjs-cloudflare#1277,
// still open as of 2026-08). This file has zero Node-only APIs — just
// @supabase/ssr + NextResponse — so it is genuinely Edge-eligible; the old
// middleware.ts convention still defaults to Edge and Next 16 keeps supporting
// it (with a deprecation warning) for exactly this kind of case. Switch back to
// proxy.ts once the Cloudflare adapter ships Node middleware support.
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: no logic between createServerClient and getUser() —
  // getUser() revalidates the token and refreshes the session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    const returnPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", returnPath);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/app/:path*", "/checkout", "/pembayaran/:path*"],
};
