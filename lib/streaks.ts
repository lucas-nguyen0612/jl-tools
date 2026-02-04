import { addDays, diffInDays, getDateRange } from "@/lib/date";

export function calculateCurrentStreak(
  logDates: Set<string>,
  today: string,
  startDate?: string
) {
  let streak = 0;
  let cursor = today;

  while (true) {
    if (startDate && diffInDays(startDate, cursor) < 0) {
      break;
    }
    if (!logDates.has(cursor)) {
      break;
    }
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function calculateBestStreak(logDates: Set<string>) {
  const sorted = Array.from(logDates).sort();
  if (sorted.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;

  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    if (diffInDays(prev, next) === 1) {
      current += 1;
    } else {
      best = Math.max(best, current);
      current = 1;
    }
  }

  return Math.max(best, current);
}

export function calculateCompletionRate(
  logDates: Set<string>,
  endDate: string,
  days: number,
  startDate?: string
) {
  const range = getDateRange(endDate, days).filter((date) =>
    startDate ? date >= startDate : true
  );
  const completed = range.filter((date) => logDates.has(date)).length;
  return {
    completed,
    total: range.length,
    percent: range.length === 0 ? 0 : Math.round((completed / range.length) * 100)
  };
}

export function getConsecutiveMissedDays(
  logDates: Set<string>,
  today: string,
  startDate?: string
) {
  if (logDates.has(today)) {
    return 0;
  }

  let cursor = today;
  let missed = 0;

  while (true) {
    if (startDate && diffInDays(startDate, cursor) < 0) {
      break;
    }
    if (logDates.has(cursor)) {
      break;
    }
    missed += 1;
    cursor = addDays(cursor, -1);
  }

  return missed;
}
