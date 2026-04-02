'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Toaster } from '@/components/ui/sonner'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Animate page content on route change
  useEffect(() => {
    setMounted(false)
    const t = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(t)
  }, [pathname])

  return (
    <div className="bg-background flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        <div
          className={`mx-auto max-w-5xl px-4 py-6 transition-all duration-200 sm:px-6 lg:px-8 ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          }`}
        >
          {children}
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  )
}
