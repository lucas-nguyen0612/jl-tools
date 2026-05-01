import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

const SUPPORT_EMAIL = 'dat.t.nguyen.works@gmail.com'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal.privacy')
  return { title: t('metadataTitle') }
}

export default async function PrivacyPage() {
  const t = await getTranslations('legal.privacy')
  const body = t('body', { email: SUPPORT_EMAIL })
  const [before, after] = body.split(SUPPORT_EMAIL)

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{t('title')}</h1>
      <p style={{ fontSize: 15, lineHeight: 1.6, margin: 0, opacity: 0.7 }}>
        {t('comingSoon')}
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0, opacity: 0.6 }}>
        {before}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          style={{ color: 'var(--jl-accent, #6366f1)' }}
        >
          {SUPPORT_EMAIL}
        </a>
        {after}
      </p>
    </article>
  )
}
