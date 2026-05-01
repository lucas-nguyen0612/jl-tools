import { useTranslations } from 'next-intl'

export function LandingFooter() {
  const t = useTranslations('landing.footer')
  return (
    <footer
      style={{
        padding: '28px 48px 40px',
        borderTop: '1px solid var(--jl-line-soft)',
        display: 'flex',
        gap: 24,
        fontSize: 12,
        color: 'var(--jl-text-faint)',
        alignItems: 'center',
      }}
    >
      <span>{t('copyright')}</span>
      <span>{t('privacy')}</span>
      <span>{t('terms')}</span>
      <span>{t('changelog')}</span>
      <span style={{ marginLeft: 'auto', fontFamily: 'var(--jl-font-mono)' }}>v0.4.2 · mvp</span>
    </footer>
  )
}
