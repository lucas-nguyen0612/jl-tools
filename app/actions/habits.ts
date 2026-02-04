"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getTodayInTZ } from "@/lib/date";
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

function getHabitFields(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const goalDays = Number(formData.get("goal_days") || 0);
  const startDate = String(formData.get("start_date") || "");
  return { name, goalDays, startDate };
}

async function requireUserId() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/auth/login");
  }
  return { supabase, userId: data.user.id };
}

export async function createHabit(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const { name, goalDays, startDate } = getHabitFields(formData);

  if (!name || !startDate || !Number.isFinite(goalDays) || goalDays < 1) {
    redirect(buildNoticeRedirect("/habits/new", "error", "All fields are required."));
  }

  const { error } = await supabase.from("habits").insert({
    user_id: userId,
    name,
    goal_days: goalDays,
    start_date: startDate
  });

  if (error) {
    redirect(buildNoticeRedirect("/habits/new", "error", error.message));
  }

  revalidatePath("/");
  redirect(buildNoticeRedirect("/", "success", "Habit created."));
}

export async function updateHabit(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const { name, goalDays, startDate } = getHabitFields(formData);
  const habitId = String(formData.get("habit_id") || "");

  if (!habitId || !name || !startDate || !Number.isFinite(goalDays) || goalDays < 1) {
    redirect(
      buildNoticeRedirect(
        `/habits/${habitId}/edit`,
        "error",
        "All fields are required."
      )
    );
  }

  const { error } = await supabase
    .from("habits")
    .update({
      name,
      goal_days: goalDays,
      start_date: startDate
    })
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) {
    redirect(buildNoticeRedirect(`/habits/${habitId}/edit`, "error", error.message));
  }

  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  revalidatePath(`/habits/${habitId}/edit`);
  redirect(buildNoticeRedirect(`/habits/${habitId}`, "success", "Habit updated."));
}

export async function archiveHabit(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const habitId = String(formData.get("habit_id") || "");

  if (!habitId) {
    redirect("/");
  }

  const { error } = await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) {
    redirect(buildNoticeRedirect(`/habits/${habitId}`, "error", error.message));
  }

  revalidatePath("/");
  redirect(buildNoticeRedirect("/", "info", "Habit archived."));
}

export async function markDoneToday(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const habitId = String(formData.get("habit_id") || "");
  const redirectTo = String(formData.get("redirect_to") || "").trim();
  const logDate = getTodayInTZ();

  if (!habitId) {
    redirect("/");
  }

  const { error } = await supabase.from("habit_logs").upsert(
    {
      habit_id: habitId,
      user_id: userId,
      log_date: logDate,
      done: true
    },
    {
      onConflict: "habit_id,user_id,log_date"
    }
  );

  if (error) {
    redirect(buildNoticeRedirect(`/habits/${habitId}`, "error", error.message));
  }

  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  const nextPath = redirectTo || `/habits/${habitId}`;
  redirect(buildNoticeRedirect(nextPath, "success", "Marked as done today."));
}

export async function undoDoneToday(formData: FormData) {
  const { supabase, userId } = await requireUserId();
  const habitId = String(formData.get("habit_id") || "");
  const redirectTo = String(formData.get("redirect_to") || "").trim();
  const logDate = getTodayInTZ();

  if (!habitId) {
    redirect("/");
  }

  const { error } = await supabase
    .from("habit_logs")
    .delete()
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("log_date", logDate);

  if (error) {
    redirect(buildNoticeRedirect(`/habits/${habitId}`, "error", error.message));
  }

  revalidatePath("/");
  revalidatePath(`/habits/${habitId}`);
  const nextPath = redirectTo || `/habits/${habitId}`;
  redirect(buildNoticeRedirect(nextPath, "info", "Marked as not done today."));
}
