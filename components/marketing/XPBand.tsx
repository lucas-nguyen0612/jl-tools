import { Timer, Flame, BookOpen, Plus, ArrowRight, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function XPBand() {
  const t = useTranslations('landing.xpBand')
  const tToolStrip = useTranslations('landing.toolStrip')
  const items = [
    { icon: <Timer size={18} />, xp: '+10 XP', label: tToolStrip('pomodoroTitle') },
    { icon: <Flame size={18} />, xp: '+5 XP', label: tToolStrip('habitsTitle') },
    { icon: <BookOpen size={18} />, xp: '+2 XP / card', label: tToolStrip('flashcardsTitle') },
  ]
  return (
    <section
      style={{
        margin: '0 48px 72px',
        padding: '40px 40px 36px',
        borderRadius: 'var(--jl-r-xl)',
        background: 'var(--jl-bg-sunken)',
        border: '1px solid var(--jl-line-soft)',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: 40,
        alignItems: 'center',
      }}
    >
      <div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 999,
            background: 'var(--jl-accent-soft)',
            color: 'var(--jl-accent-ink)',
            fontSize: 12,
            fontWeight: 500,
            marginBottom: 14,
          }}
        >
          {t('badge')}
        </div>
        <h2
          style={{
            fontFamily: 'var(--jl-font-display)',
            fontSize: 40,
            lineHeight: 1.05,
            margin: 0,
            letterSpacing: '-0.02em',
            fontWeight: 400,
            color: 'var(--jl-text)',
          }}
        >
          {t('title')}
        </h2>
        <p style={{ fontSize: 14, color: 'var(--jl-text-soft)', marginTop: 14, lineHeight: 1.6 }}>
          {t('description')}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 14,
                background: 'var(--jl-bg-raised)',
                border: '1px solid var(--jl-line-soft)',
                minWidth: 110,
                textAlign: 'center',
              }}
            >
              <div style={{ color: 'var(--jl-text-soft)', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 11, color: 'var(--jl-text-faint)', marginTop: 4 }}>{item.xp}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--jl-text)', marginTop: 2 }}>
                {item.label}
              </div>
            </div>
            {i < 2 && <Plus size={14} style={{ color: 'var(--jl-text-faint)', flexShrink: 0 }} />}
          </div>
        ))}

        <ArrowRight size={16} style={{ color: 'var(--jl-text-faint)', flexShrink: 0, marginLeft: 4 }} />

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: 'var(--jl-accent-strong)',
            color: 'white',
            minWidth: 110,
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Star size={18} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4 }}>{t('shared')}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{t('characterXp')}</div>
        </div>
      </div>
    </section>
  )
}
