'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Timer, CheckSquare, User, Settings, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
  { href: '/pomodoro', icon: Timer, labelKey: 'nav.pomodoro' },
  { href: '/habits', icon: CheckSquare, labelKey: 'nav.habits' },
  { href: '/profile', icon: User, labelKey: 'nav.profile' },
]

// TODO: Replace with real data from Supabase
const MOCK_USER = {
  display_name: 'User',
  xp: 350,
  level: 3,
  xpProgress: 67,
}

export function Sidebar() {
  const pathname = usePathname()

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
              {MOCK_USER.display_name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{MOCK_USER.display_name}</p>
            <p className="text-muted-foreground text-xs">Level {MOCK_USER.level}</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">XP</span>
            <span className="font-tabular font-semibold">{MOCK_USER.xp} XP</span>
          </div>
          <Progress value={MOCK_USER.xpProgress} className="h-2" />
          <p className="text-muted-foreground text-right text-xs">
            {100 - MOCK_USER.xpProgress}% to Level {MOCK_USER.level + 1}
          </p>
        </div>
      </div>

      <Separator className="mx-4" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-3">
        {navItems.map((item) => {
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
              <span className="truncate">{item.labelKey.replace('nav.', '')}</span>
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
