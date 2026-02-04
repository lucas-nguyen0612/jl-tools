import Link from "next/link";

import { markDoneToday } from "@/app/actions/habits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTodayInTZ } from "@/lib/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateCurrentStreak, getConsecutiveMissedDays } from "@/lib/streaks";
import { HabitCreateDialog } from "@/components/habits/habit-dialog";

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return null;
  }

  const { data: habits = [] } = await supabase
    .from("habits")
    .select("id,user_id,name,goal_days,start_date,archived_at")
    .eq("user_id", data.user.id)
    .is("archived_at", null)
    .order("name", { ascending: true });

  const today = getTodayInTZ();
  const earliestStart = habits.reduce(
    (min, habit) => (habit.start_date < min ? habit.start_date : min),
    habits[0]?.start_date ?? today
  );

  const { data: logs = [] } = await supabase
    .from("habit_logs")
    .select("habit_id,log_date")
    .eq("user_id", data.user.id)
    .gte("log_date", earliestStart);

  const logsByHabit = new Map<string, Set<string>>();
  logs.forEach((log) => {
    const set = logsByHabit.get(log.habit_id) ?? new Set<string>();
    set.add(log.log_date);
    logsByHabit.set(log.habit_id, set);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your habits</h2>
          <p className="text-sm text-black/60">Daily check-ins and streak tracking.</p>
        </div>
        <HabitCreateDialog defaultStartDate={today} />
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-black/60">
            No habits yet. Create one to start tracking.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {habits.map((habit) => {
            const logSet = logsByHabit.get(habit.id) ?? new Set<string>();
            const currentStreak = calculateCurrentStreak(
              logSet,
              today,
              habit.start_date
            );
            const missedDays = getConsecutiveMissedDays(
              logSet,
              today,
              habit.start_date
            );
            const doneToday = logSet.has(today);
            const progressPercent = Math.min(
              100,
              Math.round((currentStreak / habit.goal_days) * 100)
            );

            return (
              <Card key={habit.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{habit.name}</span>
                    <div className="flex items-center gap-2">
                      {doneToday ? (
                        <Badge variant="success">Done today</Badge>
                      ) : (
                        <Badge variant="warning">Not yet</Badge>
                      )}
                      {missedDays >= 2 ? (
                        <Badge variant="danger">Missed {missedDays} days</Badge>
                      ) : null}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-2 text-sm text-black/70 sm:grid-cols-3">
                    <div>
                      <span className="font-medium text-black">Streak</span>
                      <div>{currentStreak} days</div>
                    </div>
                    <div>
                      <span className="font-medium text-black">Goal progress</span>
                      <div>
                        {currentStreak} / {habit.goal_days} ({progressPercent}%)
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-black">Start date</span>
                      <div>{habit.start_date}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={markDoneToday}>
                      <input type="hidden" name="habit_id" value={habit.id} />
                      <Button type="submit" variant="outline" disabled={doneToday}>
                        Mark done today
                      </Button>
                    </form>
                    <Button asChild variant="ghost">
                      <Link href={`/habits/${habit.id}`}>View details</Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href={`/habits/${habit.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
