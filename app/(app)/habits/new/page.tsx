import { HabitCreateDialog } from "@/components/habits/habit-dialog";
import { getTodayInTZ } from "@/lib/date";

export default function NewHabitPage() {
  const today = getTodayInTZ();

  return (
    <div className="space-y-3">
      <HabitCreateDialog defaultStartDate={today} defaultOpen closeHref="/" triggerLabel="" />
    </div>
  );
}
