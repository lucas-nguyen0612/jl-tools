import type { CharacterStats } from '@/types/rpg'

/**
 * Discriminated union of notifications surfaced in the dashboard bell.
 * Each variant carries only the data needed to render its row.
 */
export type Notification =
  | { kind: 'overdue_cards'; count: number; href: string }
  | { kind: 'streak_warning'; streak: number; href: string }
  | { kind: 'habits_left'; remaining: number; href: string }
  | {
      kind: 'quests_reset_soon'
      count: number
      minutesUntil: number
      href: string
    }
  | { kind: 'new_badges'; count: number; href: string }
  | { kind: 'leveled_up'; level: number; href: string }

/** Stable ordering used wherever notifications are rendered. */
const NOTIFICATION_ORDER: Notification['kind'][] = [
  'leveled_up',
  'new_badges',
  'streak_warning',
  'quests_reset_soon',
  'overdue_cards',
  'habits_left',
]

function sortNotifications(items: Notification[]): Notification[] {
  return items.slice().sort((a, b) => {
    const ai = NOTIFICATION_ORDER.indexOf(a.kind)
    const bi = NOTIFICATION_ORDER.indexOf(b.kind)
    return ai - bi
  })
}

/**
 * Inputs for `computeNotifications`. The dashboard query layer already
 * fetches most of these as part of `fetchDashboardData`; we only need
 * a couple of fresh comparisons (badges + level seen state).
 */
export interface ComputeNotificationsInput {
  characterStats: CharacterStats | null
  /** Number of flashcards whose due_at <= now (data.flashcardsDue) */
  flashcardsDue: number
  /** Active habit count (data.totalHabitsToday) */
  totalHabitsToday: number
  /** Habit completions today (data.habitsDoneToday) */
  habitsDoneToday: number
  /** Pomodoro sessions today */
  pomodoroCountToday: number
  /** user_quests rows for today (data.quests) */
  incompleteQuestCountToday: number
  /** Count of user_badges with unlocked_at > last_badges_seen_at (or seen_at NULL) */
  unseenBadgeCount: number
  /** Whether the user's current level is greater than last_level_seen */
  hasUnseenLevelUp: boolean
}

/**
 * Minutes until the next daily-quest reset.
 *
 * `update_quest_on_*` triggers and `ensure_daily_quests` use Postgres'
 * `current_date` which is server-local. We use UTC here because the rest
 * of the dashboard date math (todayStart in `dashboard-queries.ts`) is also
 * UTC-based. Returns 0 to 1440.
 */
export function minutesUntilDailyReset(now: Date = new Date()): number {
  const utcNextMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0,
    0,
    0,
    0
  )
  const diffMs = utcNextMidnight - now.getTime()
  return Math.max(0, Math.floor(diffMs / 60000))
}

/**
 * Pure function: assemble the active notifications list from inputs the
 * dashboard already has. Returns only "active" notifications, sorted in
 * the canonical order.
 */
export function computeNotifications(
  input: ComputeNotificationsInput,
  now: Date = new Date()
): Notification[] {
  const out: Notification[] = []

  // 1. Level up (persistent — needs server-action to dismiss)
  if (input.hasUnseenLevelUp && input.characterStats) {
    out.push({
      kind: 'leveled_up',
      level: input.characterStats.level,
      href: '/character',
    })
  }

  // 2. New badges (persistent)
  if (input.unseenBadgeCount > 0) {
    out.push({
      kind: 'new_badges',
      count: input.unseenBadgeCount,
      href: '/character',
    })
  }

  // 3. Streak ≥ 8 with no activity today
  const streak = input.characterStats?.current_streak ?? 0
  const noActivityToday =
    input.habitsDoneToday === 0 && input.pomodoroCountToday === 0
  if (streak >= 8 && noActivityToday) {
    out.push({ kind: 'streak_warning', streak, href: '/habits' })
  }

  // 4. Quests reset soon
  const minutesUntil = minutesUntilDailyReset(now)
  if (input.incompleteQuestCountToday > 0 && minutesUntil < 120) {
    out.push({
      kind: 'quests_reset_soon',
      count: input.incompleteQuestCountToday,
      minutesUntil,
      href: '/dashboard',
    })
  }

  // 5. Flashcards overdue today
  if (input.flashcardsDue > 0) {
    out.push({
      kind: 'overdue_cards',
      count: input.flashcardsDue,
      href: '/flashcards',
    })
  }

  // 6. Habits left today
  const remaining = Math.max(
    0,
    input.totalHabitsToday - input.habitsDoneToday
  )
  if (remaining > 0) {
    out.push({ kind: 'habits_left', remaining, href: '/habits' })
  }

  return sortNotifications(out)
}
