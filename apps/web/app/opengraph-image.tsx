import { ImageResponse } from 'next/og'
import { routing } from '@/i18n/routing'

export const runtime = 'edge'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const locales = routing.locales

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 50%, #4f46e5 100%)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Background grid pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexWrap: 'wrap',
          opacity: 0.05,
        }}
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: 60,
              height: 60,
              borderRight: '1px solid white',
              borderBottom: '1px solid white',
            }}
          />
        ))}
      </div>

      {/* App icon */}
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 24,
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            color: 'white',
          }}
        >
          ⚡
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}
      >
        JL-Tools
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 28,
          color: 'rgba(255,255,255,0.85)',
          marginBottom: 40,
          maxWidth: 600,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {locales
          .map((l) => (l === 'en' ? 'Gamified Productivity' : 'Năng suất theo cấp bậc'))
          .join(' · ')}
      </div>

      {/* Features row */}
      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { icon: '⏱', label: 'Pomodoro' },
          { icon: '✅', label: 'Habits' },
          { icon: '⚡', label: 'XP System' },
        ].map((feat) => (
          <div
            key={feat.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 100,
              padding: '10px 20px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ fontSize: 22 }}>{feat.icon}</span>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>{feat.label}</span>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  )
}
