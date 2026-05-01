import { getTranslations, getLocale } from 'next-intl/server'
import { redirect, Link } from '@/i18n/navigation'
import { getUser } from '@/lib/supabase/server'
import { TopBar } from '@/components/layout/TopBar'
import { ToolErrorBoundary } from '@/components/errors/ToolErrorBoundary'
import { DeckDetailClient } from './DeckDetailClient'

interface DeckPageProps {
  params: Promise<{ deckId: string }>
}

export default async function DeckPage({ params }: DeckPageProps) {
  const user = await getUser()
  if (!user) {
    const locale = await getLocale()
    redirect({ href: '/login', locale })
  }

  const { deckId } = await params
  const t = await getTranslations('flashcards')

  return (
    <ToolErrorBoundary toolName="Flashcards">
      <div className="flex flex-col h-full">
        <TopBar
          title={t('title')}
          subtitle={t('stats.forecast.title')}
          rightSlot={
            <Link
              href={`/flashcards/${deckId}/study`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                background: 'var(--jl-accent-strong)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {t('topBar.studyAll')}
            </Link>
          }
        />
        <div className="flex-1 overflow-y-auto p-4">
          <DeckDetailClient deckId={deckId} />
        </div>
      </div>
    </ToolErrorBoundary>
  )
}
