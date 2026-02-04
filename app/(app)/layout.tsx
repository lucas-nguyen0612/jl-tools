import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoadingButton } from "@/components/ui/loading-button";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Habit Tracker</h1>
          <p className="text-sm text-black/60">Stay consistent, one day at a time.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-black/60">{data.user.email}</span>
          <form action={signOut}>
            <LoadingButton
              type="submit"
              variant="outline"
              size="sm"
              loadingText="Signing out..."
            >
              Sign out
            </LoadingButton>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
