import { HabitCreateDialog } from "@/components/habits/habit-dialog";
import { getTodayInTZ } from "@/lib/date";

export default function NewHabitPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const today = getTodayInTZ();
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <HabitCreateDialog defaultStartDate={today} defaultOpen closeHref="/" triggerLabel="" />
    </div>
  );
}
