import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n cho Supabase OAuth callback, Google Calendar callback, và API routes
  if (pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/calendar/callback") || pathname.startsWith("/api")) {
    return await updateSession(request);
  }

  // Intl trước → mutate response → Supabase session refresh trên cùng response
  const intlResponse = intlMiddleware(request);
  return await updateSession(request, intlResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
