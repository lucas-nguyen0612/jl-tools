import { getTranslations } from 'next-intl/server'
import { getUser, createClient } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'
import { CharacterSheet } from '@/components/character/CharacterSheet'
import { StatChart } from '@/components/character/StatChart'
import { BadgeGrid } from '@/components/character/BadgeGrid'
import { ActivityTimeline } from '@/components/character/ActivityTimeline'
import {
  fetchCharacterStats,
  fetchAllBadges,
  fetchXPTimeline,
} from '@/features/gamification/queries'
import type { CharacterStats, XPTransaction } from '@/types/rpg'
import type { BadgeWithStatus } from '@/features/gamification/queries'

export default async function CharacterPage() {
  const user = await getUser()
  const t = await getTranslations('character')

  if (!user) {
    return (
      <ToolErrorBoundary toolName={t('title')}>
        <div className="flex flex-col h-full">
          <TopBar title={t('title')} subtitle={t('subtitle')} />
          <div
            className="flex-1 flex items-center justify-center"
            style={{ color: 'var(--jl-text-faint)' }}
          >
            <p>{t('guestPrompt')}</p>
          </div>
        </div>
      </ToolErrorBoundary>
    )
  }

  const supabase = await createClient()

  const [stats, allBadges, timeline, profileRes] = await Promise.all([
    fetchCharacterStats(user.id),
    fetchAllBadges(user.id),
    fetchXPTimeline(user.id, 20),
    supabase
      .from('profiles')
      .select('character_name, character_class, avatar_url')
      .eq('user_id', user.id)
      .single(),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRes.data as any as { character_name: string; character_class: string; avatar_url: string | null } | null
  const characterName = profile?.character_name ?? 'Adventurer'
  const characterClass = profile?.character_class ?? 'Scholar'

  const fallbackStats: CharacterStats = stats ?? {
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

  return (
    <ToolErrorBoundary toolName={t('title')}>
      <div className="flex flex-col h-full">
        <TopBar title={t('title')} subtitle={t('subtitle')} />
        <div
          className="flex-1 overflow-y-auto"
          style={{
            padding: '22px 28px 40px',
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            gap: 22,
            alignContent: 'start',
          }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <CharacterSheet
              stats={fallbackStats}
              characterName={characterName}
              characterClass={characterClass}
              avatarUrl={profile?.avatar_url}
              avatarHref="/settings/profile"
            />
            <StatChart
              stats={{
                focus: fallbackStats.focus_stat,
                discipline: fallbackStats.discipline_stat,
                knowledge: fallbackStats.knowledge_stat,
                endurance: fallbackStats.endurance_stat,
              }}
            />
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <BadgeGrid badges={allBadges as BadgeWithStatus[]} />
            <ActivityTimeline transactions={timeline as XPTransaction[]} />
          </div>
        </div>
      </div>
    </ToolErrorBoundary>
  )
}
