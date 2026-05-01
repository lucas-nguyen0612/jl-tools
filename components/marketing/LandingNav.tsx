import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher'

export function LandingNav() {
  const t = useTranslations('landing.nav')
  const tApp = useTranslations('app')
  const navLabels = [
    t('tools'),
    t('progression'),
    t('guild'),
    t('pricing'),
    t('changelog'),
  ]
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '18px 48px',
        borderBottom: '1px solid var(--jl-line-soft)',
        position: 'sticky',
        top: 0,
        background: 'color-mix(in oklch, var(--jl-bg) 85%, transparent)',
        backdropFilter: 'blur(10px)',
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            overflow: 'hidden',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt={tApp('name')}
            fill
            sizes="28px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>
        <span style={{ fontWeight: 600, fontSize: 15 }}>{tApp('name')}</span>
      </Link>

      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 22,
          justifyContent: 'center',
          fontSize: 13,
          color: 'var(--jl-text-soft)',
        }}
      >
        {navLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <LocaleSwitcher variant="nav" />

      <Link
        href="/sign-in"
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--jl-r)',
          border: '1px solid var(--jl-line)',
          background: 'var(--jl-bg-raised)',
          color: 'var(--jl-text)',
          fontSize: 13,
          fontWeight: 500,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--jl-shadow-sm)',
        }}
      >
        {t('signIn')}
      </Link>

      <Link
        href="/sign-up"
        style={{
          padding: '8px 16px',
          borderRadius: 'var(--jl-r)',
          background: 'var(--jl-accent-strong)',
          color: 'white',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {t('startFree')}
      </Link>
    </nav>
  )
}
