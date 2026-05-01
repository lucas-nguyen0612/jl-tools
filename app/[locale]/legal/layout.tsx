import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal — JL Tools',
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 24px',
        background: 'var(--jl-bg, #fff)',
        color: 'var(--jl-text, #111)',
      }}
    >
      <main style={{ maxWidth: 640, width: '100%' }}>
        {children}
      </main>
    </div>
  )
}
