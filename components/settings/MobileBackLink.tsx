'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronLeft } from 'lucide-react'

export function MobileBackLink() {
  const t = useTranslations('nav.settings')
  const tCommon = useTranslations('common')
  const label = t('back')
  return (
    <Link
      href="/settings"
      aria-label={`${tCommon('back')} – ${label}`}
      className="md:hidden"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '12px 20px 0',
        color: 'var(--jl-accent-strong)',
        fontSize: 13,
        fontWeight: 500,
        textDecoration: 'none',
      }}
    >
      <ChevronLeft size={16} />
      <span>{label}</span>
    </Link>
  )
}
