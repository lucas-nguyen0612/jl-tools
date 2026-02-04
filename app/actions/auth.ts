"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

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
      `/auth/login?error=${encodeURIComponent("Email and password are required.")}`
    );
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { email, password } = getAuthFields(formData);

  if (!email || !password) {
    redirect(
      `/auth/signup?error=${encodeURIComponent("Email and password are required.")}`
    );
  }

  const { error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/");
}

export async function signOut() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
