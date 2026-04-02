'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Timer, CheckSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/pomodoro', icon: Timer, label: t('pomodoro') },
    { href: '/habits', icon: CheckSquare, label: t('habits') },
    { href: '/profile', icon: User, label: t('profile') },
  ]

  return (
    <nav
      className="border-border bg-surface-1/95 safe-bottom fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md lg:hidden"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-0.5 transition-all duration-150',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-transform duration-150',
                  isActive ? 'scale-110' : '',
                )}
                aria-hidden="true"
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
