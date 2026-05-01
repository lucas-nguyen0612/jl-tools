import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";
import { routing } from "@/i18n/routing";

const LOCALE_PATTERN = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

function stripLocale(pathname: string): string {
  return pathname.replace(LOCALE_PATTERN, "") || "/";
}

function detectLocale(pathname: string): string {
  return pathname.match(LOCALE_PATTERN)?.[1] ?? routing.defaultLocale;
}

export async function updateSession(
  request: NextRequest,
  response?: NextResponse,
) {
  let supabaseResponse = response ?? NextResponse.next({ request });

  // If env vars not set, skip auth check (legacy guard from template).
  if (!hasEnvVars) {
    return supabaseResponse;
  }

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
            request.cookies.set(name, value),
          );
          // When chaining onto an existing response (e.g. intl response),
          // mutate it in place — do NOT create a new NextResponse, or we'd
          // drop intl rewrite/redirect headers.
          if (!response) {
            supabaseResponse = NextResponse.next({ request });
          }
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and supabase.auth.getClaims().
  // A simple mistake could make it very hard to debug issues with users
  // being randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const localelessPath = stripLocale(pathname);
  const isPublic =
    localelessPath === "/" ||
    localelessPath.startsWith("/sign-in") ||
    localelessPath.startsWith("/sign-up") ||
    localelessPath.startsWith("/auth");

  if (!user && !isPublic) {
    const locale = detectLocale(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make
  // sure to pass the request, copy cookies, and avoid changing them. Failing
  // to do so can desync browser/server cookies and prematurely terminate the
  // user's session.
  return supabaseResponse;
}
