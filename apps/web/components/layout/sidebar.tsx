'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Timer, CheckSquare, User, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/components/providers/auth-provider'
import { XpBar } from '@/components/gamification/xp-bar'

export function Sidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const { profile } = useAuth()

  const displayName = profile?.display_name || 'User'
  const level = profile?.current_level ?? 1

  return (
    <aside className="bg-surface-1 border-border sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r lg:flex">
      {/* Logo */}
      <div className="border-border flex items-center gap-2.5 border-b px-5 py-5">
        <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold tracking-tight">JL-Tools</span>
      </div>

      {/* User info + XP bar */}
      <div className="px-4 py-4">
        <div className="mb-3 flex items-center gap-3">
          <Avatar className="border-primary/20 h-10 w-10 border-2">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-muted-foreground text-xs">
              {t('level')} {level}
            </p>
          </div>
        </div>

        {/* Animated XP Bar */}
        <XpBar />
      </div>

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {[
          { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
          { href: '/pomodoro', icon: Timer, label: t('pomodoro') },
          { href: '/habits', icon: CheckSquare, label: t('habits') },
          { href: '/profile', icon: User, label: t('profile') },
        ].map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0', isActive ? '' : 'opacity-70')} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-4" />

      {/* Settings */}
      <div className="px-3 py-3">
        <button className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150">
          <Settings className="h-5 w-5 shrink-0 opacity-70" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  )
}
