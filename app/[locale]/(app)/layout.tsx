import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import { SideNav } from '@/components/layout/SideNav'
import { BottomNav } from '@/components/layout/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) redirect('/sign-in')

  const supabase = await createClient()

  const [statsRes, profileRes] = await Promise.all([
    supabase.from('character_stats').select('level, total_xp, xp_in_current_level').eq('user_id', user.id).single(),
    supabase.from('profiles').select('character_name, avatar_url').eq('user_id', user.id).single(),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = statsRes.data as any as { level: number; total_xp: number; xp_in_current_level: number } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profile = profileRes.data as any as { character_name: string; avatar_url: string | null } | null

  const level = stats?.level ?? 1
  const totalXP = stats?.total_xp ?? 0
  const xpInLevel = stats?.xp_in_current_level ?? 0

  const thresholdRes = await supabase.from('level_thresholds').select('xp_required').eq('level', level + 1).single()
  const nextThreshold = thresholdRes.data as { xp_required: number } | null

  const maxXP = nextThreshold?.xp_required
    ? nextThreshold.xp_required - (totalXP - xpInLevel)
    : 1000

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:flex">
        <SideNav
          level={level}
          currentXP={xpInLevel}
          maxXP={maxXP}
          characterName={profile?.character_name ?? 'Adventurer'}
          avatarUrl={profile?.avatar_url}
        />
      </div>
      <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
