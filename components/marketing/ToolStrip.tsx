import { Timer, Flame, BookOpen, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type ReactNode } from 'react'

export function ToolStrip() {
  const t = useTranslations('landing.toolStrip')
  const tools: { icon: ReactNode; title: string; desc: string }[] = [
    {
      icon: <Timer size={22} />,
      title: t('pomodoroTitle'),
      desc: t('pomodoroDescription'),
    },
    {
      icon: <Flame size={22} />,
      title: t('habitsTitle'),
      desc: t('habitsDescription'),
    },
    {
      icon: <BookOpen size={22} />,
      title: t('flashcardsTitle'),
      desc: t('flashcardsDescription'),
    },
  ]
  return (
    <section style={{ padding: '8px 48px 64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {tools.map((tool) => (
          <div
            key={tool.title}
            style={{
              padding: 16,
              borderRadius: 'var(--jl-r-lg)',
              background: 'var(--jl-bg-raised)',
              border: '1px solid var(--jl-line-soft)',
              boxShadow: 'var(--jl-shadow-sm)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'var(--jl-accent-soft)',
                color: 'var(--jl-accent-ink)',
                display: 'grid',
                placeItems: 'center',
                marginBottom: 18,
              }}
            >
              {tool.icon}
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--jl-text)' }}>{tool.title}</h3>
            <p
              style={{
                fontSize: 13.5,
                color: 'var(--jl-text-soft)',
                marginTop: 8,
                lineHeight: 1.55,
              }}
            >
              {tool.desc}
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                marginTop: 14,
                color: 'var(--jl-accent-ink)',
                fontWeight: 500,
              }}
            >
              {t('openTool')} <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
