"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { archiveHabit, createHabit, updateHabit } from "@/app/actions/habits";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";

type HabitFormValues = {
  id?: string;
  name: string;
  goalDays: number;
  startDate: string;
};

type HabitDialogProps = {
  title: string;
  submitLabel: string;
  defaultValues: HabitFormValues;
  defaultOpen?: boolean;
  showArchive?: boolean;
  closeHref?: string;
  triggerLabel?: string;
};

export function HabitCreateDialog({
  defaultStartDate,
  triggerLabel = "New habit",
  defaultOpen,
  closeHref,
}: {
  defaultStartDate: string;
  triggerLabel?: string;
  defaultOpen?: boolean;
  closeHref?: string;
}) {
  return (
    <HabitDialog
      title="New habit"
      submitLabel="Create habit"
      defaultValues={{
        name: "",
        goalDays: 21,
        startDate: defaultStartDate,
      }}
      defaultOpen={defaultOpen}
      closeHref={closeHref}
      triggerLabel={triggerLabel}
    />
  );
}

export function HabitEditDialog({
  habitId,
  name,
  goalDays,
  startDate,
  triggerLabel = "Edit habit",
  defaultOpen,
  closeHref,
  showArchive,
}: {
  habitId: string;
  name: string;
  goalDays: number;
  startDate: string;
  triggerLabel?: string;
  defaultOpen?: boolean;
  closeHref?: string;
  showArchive?: boolean;
}) {
  return (
    <HabitDialog
      title="Edit habit"
      submitLabel="Save changes"
      defaultValues={{
        id: habitId,
        name,
        goalDays,
        startDate,
      }}
      defaultOpen={defaultOpen}
      closeHref={closeHref}
      triggerLabel={triggerLabel}
      showArchive={showArchive}
    />
  );
}

function HabitDialog({
  title,
  submitLabel,
  defaultValues,
  defaultOpen = false,
  showArchive,
  closeHref,
  triggerLabel,
}: HabitDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const action = useMemo(() => {
    if (defaultValues.id) {
      return updateHabit;
    }
    return createHabit;
  }, [defaultValues.id]);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {triggerLabel ? (
        <Button type="button" onClick={() => setOpen(true)}>
          {triggerLabel}
        </Button>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div
            className="w-full max-w-xl rounded-lg border border-black/10 bg-white shadow-lg"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-4">
              <h3 className="text-base font-semibold">{title}</h3>
              {closeHref ? (
                <Button asChild variant="ghost" size="sm">
                  <Link href={closeHref}>Close</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  Close
                </Button>
              )}
            </div>
            <div className="p-6">
              <form action={action} className="space-y-4">
                {defaultValues.id ? (
                  <input type="hidden" name="habit_id" value={defaultValues.id} />
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="name">Habit name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={defaultValues.name}
                    placeholder="Drink water"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal_days">Goal days</Label>
                  <Input
                    id="goal_days"
                    name="goal_days"
                    type="number"
                    min={1}
                    defaultValue={defaultValues.goalDays}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    defaultValue={defaultValues.startDate}
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <LoadingButton type="submit" loadingText="Saving...">
                    {submitLabel}
                  </LoadingButton>
                  {!closeHref ? (
                    <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>
            {showArchive && defaultValues.id ? (
              <div className="border-t border-black/10 px-6 py-4">
                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0">
                    <CardTitle>Archive habit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 px-0 text-sm text-black/70">
                    <p>
                      Archiving hides the habit from your active list. You can restore it
                      later in Supabase if needed.
                    </p>
                    <form action={archiveHabit}>
                      <input type="hidden" name="habit_id" value={defaultValues.id} />
                      <LoadingButton type="submit" variant="destructive" loadingText="Archiving...">
                        Archive habit
                      </LoadingButton>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
