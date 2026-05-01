import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { HeroVisual } from './HeroVisual'

export function HeroSection() {
  const t = useTranslations('landing.hero')
  const stats = [
    { value: '24k+', label: t('stats.adventurers') },
    { value: '1.3M', label: t('stats.focusMinutes') },
    { value: '89%', label: t('stats.streakRate') },
  ]
  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1.05fr 1fr',
        gap: 56,
        padding: '72px 48px 56px',
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 999,
            background: 'var(--jl-accent-soft)',
            color: 'var(--jl-accent-ink)',
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 20,
          }}
        >
          <Sparkles size={12} />
          <span>{t('badge')}</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 'clamp(48px, 5vw, 72px)',
            lineHeight: 0.98,
            margin: 0,
            letterSpacing: '-0.035em',
            fontWeight: 400,
            color: 'var(--jl-text)',
          }}
        >
          {t('title')}
        </h1>

        <p
          style={{
            fontSize: 17,
            color: 'var(--jl-text-soft)',
            marginTop: 22,
            maxWidth: 480,
            lineHeight: 1.55,
          }}
        >
          {t('subtitle')}
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
          <Link
            href="/sign-up"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 44,
              padding: '0 20px',
              borderRadius: 'var(--jl-r)',
              background: 'var(--jl-accent-strong)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {t('primaryCta')} <ArrowRight size={16} />
          </Link>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 44,
              padding: '0 18px',
              borderRadius: 'var(--jl-r)',
              border: '1px solid var(--jl-line)',
              background: 'var(--jl-bg-raised)',
              color: 'var(--jl-text)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'default',
              boxShadow: 'var(--jl-shadow-sm)',
            }}
          >
            <Play size={14} /> {t('secondaryCta')}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 28,
            marginTop: 36,
            fontSize: 12,
            color: 'var(--jl-text-faint)',
          }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <strong
                style={{
                  display: 'block',
                  color: 'var(--jl-text)',
                  fontSize: 16,
                  fontFamily: 'var(--jl-font-display)',
                }}
              >
                {stat.value}
              </strong>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <HeroVisual />
    </section>
  )
}
