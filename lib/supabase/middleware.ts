import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      get(name) {
        return request.cookies.get(name)?.value;
      },
      set(name, value, options) {
        supabaseResponse.cookies.set({
          name,
          value,
          ...options
        });
      },
      remove(name, options) {
        supabaseResponse.cookies.set({
          name,
          value: "",
          ...options,
          maxAge: 0
        });
      }
    }
  });

  await supabase.auth.getUser();

  return supabaseResponse;
}
