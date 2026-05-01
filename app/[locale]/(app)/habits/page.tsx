import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { HabitsClient } from './HabitsClient'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'

export default async function HabitsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const t = await getTranslations('habits')

  return (
    <ToolErrorBoundary toolName={t('title')}>
      <div className="flex flex-col h-full">
        <TopBar title={t('title')} subtitle={t('subtitle')} />
        <div className="flex-1 overflow-y-auto p-4">
          <HabitsClient userId={user.id} />
        </div>
      </div>
    </ToolErrorBoundary>
  )
}
