import { redirect } from "next/navigation";

import { HabitEditDialog } from "@/components/habits/habit-dialog";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function EditHabitPage({
  params,
}: {
  params: { id: string };
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

  return (
    <div className="space-y-3">
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
