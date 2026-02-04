import Link from "next/link";
import { redirect } from "next/navigation";

import { markDoneToday, undoDoneToday } from "@/app/actions/habits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HabitEditDialog } from "@/components/habits/habit-dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { getDateRange, getMonthInfo, getMonthInfoFor, getTodayInTZ } from "@/lib/date";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  calculateBestStreak,
  calculateCompletionRate,
  calculateCurrentStreak,
  getConsecutiveMissedDays,
} from "@/lib/streaks";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

type CalendarCell = {
  day: number;
  dateStr: string;
  isDone: boolean;
  isMissed: boolean;
  isActive: boolean;
};

function buildMonthCells(
  year: number,
  month: number,
  today: string,
  startDate: string,
  logSet: Set<string>
): CalendarCell[] {
  const { daysInMonth } = getMonthInfoFor(year, month);
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateStr = `${year}-${pad(month)}-${pad(day)}`;
    const isDone = logSet.has(dateStr);
    const isPast = dateStr < today;
    const isActive = dateStr >= startDate && dateStr <= today;
    const isMissed = isActive && isPast && !isDone;
    return { day, dateStr, isDone, isMissed, isActive };
  });
}

export default async function HabitDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; view?: string };
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

  const today = getTodayInTZ();

  const { data: logs = [] } = await supabase
    .from("habit_logs")
    .select("log_date")
    .eq("habit_id", habit.id)
    .eq("user_id", userData.user.id)
    .gte("log_date", habit.start_date);

  const logSet = new Set((logs || []).map((log) => log.log_date));

  const currentStreak = calculateCurrentStreak(logSet, today, habit.start_date);
  const bestStreak = calculateBestStreak(logSet);
  const weekRate = calculateCompletionRate(logSet, today, 7, habit.start_date);
  const monthRate = calculateCompletionRate(logSet, today, 30, habit.start_date);
  const missedDays = getConsecutiveMissedDays(logSet, today, habit.start_date);
  const doneToday = logSet.has(today);

  const view = searchParams?.view ?? "month";
  const { year, month, firstWeekday } = getMonthInfo(today);
  const calendarCells = buildMonthCells(
    year,
    month,
    today,
    habit.start_date,
    logSet
  );
  const weeklyDates = getDateRange(today, 7);

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost">
          <Link href="/" className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </span>
            Back to habits
          </Link>
        </Button>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{habit.name}</h2>
          <p className="text-sm text-black/60">Tracking since {habit.start_date}</p>
        </div>
        <HabitEditDialog
          habitId={habit.id}
          name={habit.name}
          goalDays={habit.goal_days}
          startDate={habit.start_date}
          triggerLabel="Edit habit"
          showArchive
        />
      </div>

      {missedDays >= 2 ? (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium text-red-700">
                Warning: {missedDays} consecutive missed days.
              </p>
              <p className="text-xs text-red-700/70">
                Consider lowering the goal or setting reminders.
              </p>
            </div>
            <Badge variant="danger">Needs attention</Badge>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Streaks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/70">Current streak</span>
              <span className="font-semibold">{currentStreak} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/70">Best streak</span>
              <span className="font-semibold">{bestStreak} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/70">Goal</span>
              <span className="font-semibold">{habit.goal_days} days</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completion rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/70">Last 7 days</span>
              <span className="font-semibold">
                {weekRate.completed}/{weekRate.total} ({weekRate.percent}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-black/70">Last 30 days</span>
              <span className="font-semibold">
                {monthRate.completed}/{monthRate.total} ({monthRate.percent}%)
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-black/70">Status</span>
              {doneToday ? (
                <Badge variant="success">Done</Badge>
              ) : (
                <Badge variant="warning">Not yet</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <form action={markDoneToday}>
                <input type="hidden" name="habit_id" value={habit.id} />
                <input
                  type="hidden"
                  name="redirect_to"
                  value={`/habits/${habit.id}?view=${view}`}
                />
                <LoadingButton
                  type="submit"
                  variant="outline"
                  disabled={doneToday}
                  loadingText="Marking..."
                >
                  Mark done today
                </LoadingButton>
              </form>
              {doneToday ? (
                <form action={undoDoneToday}>
                  <input type="hidden" name="habit_id" value={habit.id} />
                  <input
                    type="hidden"
                    name="redirect_to"
                    value={`/habits/${habit.id}?view=${view}`}
                  />
                  <LoadingButton type="submit" variant="ghost" loadingText="Undoing...">
                    Undo today
                  </LoadingButton>
                </form>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Habit calendar</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm">
            <Button asChild variant={view === "week" ? "default" : "outline"} size="sm">
              <Link href={`/habits/${habit.id}?view=week`}>Weekly</Link>
            </Button>
            <Button asChild variant={view === "month" ? "default" : "outline"} size="sm">
              <Link href={`/habits/${habit.id}?view=month`}>Monthly</Link>
            </Button>
            <Button asChild variant={view === "year" ? "default" : "outline"} size="sm">
              <Link href={`/habits/${habit.id}?view=year`}>Yearly</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {view === "week" ? (
            <div className="grid grid-cols-7 gap-2 text-xs text-black/60">
              {weeklyDates.map((dateStr) => {
                const isDone = logSet.has(dateStr);
                const isActive = dateStr >= habit.start_date && dateStr <= today;
                const isPast = dateStr < today;
                const isMissed = isActive && isPast && !isDone;
                const label = new Date(dateStr).toLocaleDateString("en-US", {
                  weekday: "short",
                });
                return (
                  <div
                    key={dateStr}
                    className={`rounded-md border px-2 py-3 text-center text-sm ${isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : isMissed
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-black/10 bg-white text-black/60"
                      } ${isActive ? "" : "opacity-40"}`}
                  >
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-base font-semibold">{dateStr.slice(-2)}</div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {view === "month" ? (
            <div className="grid grid-cols-7 gap-2 text-xs text-black/60">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstWeekday }).map((_, index) => (
                <div key={`empty-${index}`} />
              ))}
              {calendarCells.map((cell) => (
                <div
                  key={cell.dateStr}
                  className={`rounded-md border px-2 py-1 text-center text-sm ${cell.isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : cell.isMissed
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-black/10 bg-white text-black/60"
                    } ${cell.isActive ? "" : "opacity-40"}`}
                >
                  {cell.day}
                </div>
              ))}
            </div>
          ) : null}

          {view === "year" ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {Array.from({ length: 12 }, (_, index) => {
                const monthIndex = index + 1;
                const { firstWeekday: monthFirstWeekday } = getMonthInfoFor(
                  year,
                  monthIndex
                );
                const monthCells = buildMonthCells(
                  year,
                  monthIndex,
                  today,
                  habit.start_date,
                  logSet
                );
                const monthLabel = new Date(
                  Date.UTC(year, monthIndex - 1, 1)
                ).toLocaleDateString("en-US", { month: "long" });
                return (
                  <div key={`month-${monthIndex}`} className="space-y-2">
                    <div className="text-sm font-semibold text-black">{monthLabel}</div>
                    <div className="grid grid-cols-7 gap-1 text-[10px] text-black/60">
                      {[
                        "S",
                        "M",
                        "T",
                        "W",
                        "T",
                        "F",
                        "S",
                      ].map((day) => (
                        <div key={`${monthIndex}-${day}`} className="text-center font-medium">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: monthFirstWeekday }).map((_, emptyIndex) => (
                        <div key={`empty-${monthIndex}-${emptyIndex}`} />
                      ))}
                      {monthCells.map((cell) => (
                        <div
                          key={cell.dateStr}
                          className={`rounded border px-1 py-0.5 text-center ${cell.isDone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : cell.isMissed
                                ? "border-red-200 bg-red-50 text-red-700"
                                : "border-black/10 bg-white text-black/60"
                            } ${cell.isActive ? "" : "opacity-40"}`}
                        >
                          {cell.day}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          <p className="mt-3 text-xs text-black/60">
            Green = done, Red = missed, Gray = inactive or future.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
