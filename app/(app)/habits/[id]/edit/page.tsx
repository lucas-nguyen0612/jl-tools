import { redirect } from "next/navigation";

import { HabitEditDialog } from "@/components/habits/habit-dialog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditHabitPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/auth/login");
  }

  const { data: habit } = await supabase
    .from("habits")
    .select("id,name,goal_days,start_date,archived_at")
    .eq("id", params.id)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (!habit || habit.archived_at) {
    redirect("/");
  }

  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <HabitEditDialog
        habitId={habit.id}
        name={habit.name}
        goalDays={habit.goal_days}
        startDate={habit.start_date}
        defaultOpen
        closeHref={`/habits/${habit.id}`}
        triggerLabel=""
        showArchive
      />
    </div>
  );
}
