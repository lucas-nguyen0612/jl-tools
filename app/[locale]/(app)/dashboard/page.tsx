import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { QuestList } from '@/components/dashboard/QuestList'
import { ToolGrid } from '@/components/dashboard/ToolGrid'
import { WeeklyStats } from '@/components/dashboard/WeeklyStats'
import { RecentBadges } from '@/components/dashboard/RecentBadges'
import { StreakCard } from '@/components/dashboard/StreakCard'
import { fetchDashboardData } from '@/features/gamification/dashboard-queries'
import { DashboardTopBarActions } from '@/components/dashboard/DashboardTopBarActions'
import type { CharacterStats } from '@/types/rpg'

export const revalidate = 60

type GreetingPeriod = 'morning' | 'afternoon' | 'evening' | 'night'

function getTimeOfDayPeriod(hour: number): GreetingPeriod {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

export default async function DashboardPage() {
  const user = await getUser()
  const t = await getTranslations('dashboard')

  if (!user) {
    return (
      <ToolErrorBoundary toolName="Dashboard">
        <div className="flex flex-col h-full">
          <TopBar
            title={t('topBar.title')}
            subtitle={t('topBar.guestSubtitle')}
          />
          <div
            className="flex-1 flex items-center justify-center"
            style={{ color: 'var(--jl-text-faint)' }}
          >
            <p>{t('topBar.guestPrompt')}</p>
          </div>
        </div>
      </ToolErrorBoundary>
    )
  }

  const data = await fetchDashboardData(user.id)

  const fallbackStats: CharacterStats = data.characterStats ?? {
    id: '',
    user_id: user.id,
    level: 1,
    total_xp: 0,
    xp_in_current_level: 0,
    focus_stat: 0,
    discipline_stat: 0,
    knowledge_stat: 0,
    endurance_stat: 0,
    total_pomodoros: 0,
    total_focus_minutes: 0,
    total_habits_completed: 0,
    total_cards_reviewed: 0,
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: null,
    last_badges_seen_at: null,
    last_level_seen: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const dowMondayBased = (new Date().getDay() + 6) % 7
  const todayFocusMinutes = data.thisWeek.dailyFocusMinutes[dowMondayBased] ?? 0

  // Build dynamic TopBar greeting + status line
  const period = getTimeOfDayPeriod(new Date().getHours())
  const greeting = t(`greeting.${period}`)
  const trimmedName = data.characterName?.trim() ?? ''
  const greetingTitle = trimmedName
    ? t('greeting.withName', { greeting, name: trimmedName })
    : t('greeting.withoutName', { greeting })

  const xpToNext = Math.max(
    0,
    data.xpForNextLevel - fallbackStats.xp_in_current_level
  )
  const nextLevel = fallbackStats.level + 1
  const questsRemaining = data.quests.filter(q => !q.is_completed).length
  const greetingSubtitle = t('subtitle', {
    xp: xpToNext,
    level: nextLevel,
    quests: questsRemaining,
  })

  return (
    <ToolErrorBoundary toolName="Dashboard">
      <div className="flex flex-col h-full">
        <TopBar
          title={greetingTitle}
          subtitle={greetingSubtitle}
          rightSlot={
            <DashboardTopBarActions
              userId={user.id}
              notifications={data.notifications}
            />
          }
        />
        <div
          className="flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-[22px] content-start p-jl pb-10"
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, minWidth: 0 }}>
            <HeroCard
              stats={fallbackStats}
              xpForNextLevel={data.xpForNextLevel}
              characterName={data.characterName}
              characterClass={data.characterClass}
              avatarUrl={data.avatarUrl}
              nextUnlock={data.nextUnlock}
              todayFocusMinutes={todayFocusMinutes}
              habitsToday={data.habitsDoneToday}
              totalHabitsToday={data.totalHabitsToday}
              cardsReviewedToday={data.cardsReviewedToday}
              flashcardsDue={data.flashcardsDue}
            />
            <ToolGrid
              pomodoroCount={data.pomodoroCountToday}
              habitsDoneToday={data.habitsDoneToday}
              totalHabits={data.totalHabitsToday}
              flashcardsDue={data.flashcardsDue}
            />
            <QuestList quests={data.quests} />
            <WeeklyStats
              thisWeek={data.thisWeek}
              lastWeek={data.lastWeek}
              weeklyXP={data.weeklyXP}
            />
          </div>

          {/* Right rail */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <StreakCard
              currentStreak={fallbackStats.current_streak}
              longestStreak={fallbackStats.longest_streak}
              activity={data.dailyActivity}
            />
            <RecentBadges earned={data.recentBadges} locked={data.unearnedBadges} />
          </aside>
        </div>
      </div>
    </ToolErrorBoundary>
  )
}
