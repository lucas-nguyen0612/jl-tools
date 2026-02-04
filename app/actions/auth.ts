"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type NoticeKey = "error" | "warning" | "success" | "info";

function buildNoticeRedirect(path: string, key: NoticeKey, message: string) {
  const safePath = path || "/";
  const [base, query = ""] = safePath.split("?");
  const params = new URLSearchParams(query);
  params.set(key, message);
  const nextQuery = params.toString();
  return nextQuery ? `${base}?${nextQuery}` : base;
}

function getAuthFields(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  return { email, password };
}

export async function signIn(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { email, password } = getAuthFields(formData);

  if (!email || !password) {
    redirect(
      buildNoticeRedirect("/auth/login", "error", "Email and password are required.")
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(buildNoticeRedirect("/auth/login", "error", error.message));
  }

  redirect(buildNoticeRedirect("/", "success", "Welcome back."));
}

export async function signUp(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { email, password } = getAuthFields(formData);

  if (!email || !password) {
    redirect(
      buildNoticeRedirect("/auth/signup", "error", "Email and password are required.")
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    redirect(buildNoticeRedirect("/auth/signup", "error", error.message));
  }

  redirect(buildNoticeRedirect("/", "success", "Account created."));
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(buildNoticeRedirect("/auth/login", "info", "Signed out."));
}
