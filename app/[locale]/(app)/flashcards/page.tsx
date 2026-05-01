import { redirect } from '@/i18n/navigation'
import { getLocale } from 'next-intl/server'
import { getUser } from '@/lib/supabase/server'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'
import { FlashcardsClient } from './FlashcardsClient'

export default async function FlashcardsPage() {
  const user = await getUser()
  if (!user) {
    const locale = await getLocale()
    redirect({ href: '/login', locale })
  }

  return (
    <ToolErrorBoundary toolName="Flashcards">
      <FlashcardsClient />
    </ToolErrorBoundary>
  )
}
