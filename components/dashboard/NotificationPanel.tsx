'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Layers,
  Sparkles,
  Sword,
  Trophy,
} from 'lucide-react'
import type { Notification } from '@/features/gamification/notifications'
import {
  markBadgesSeen,
  markLevelSeen,
} from '@/features/gamification/notification-actions'

interface RowContent {
  icon: React.ReactNode
  label: string
  sub?: string
}

type TFunc = ReturnType<typeof useTranslations<'dashboard.notificationPanel'>>

function rowContent(n: Notification, t: TFunc): RowContent {
  switch (n.kind) {
    case 'leveled_up':
      return {
        icon: <Sparkles size={14} />,
        label: t('leveledUp', { level: n.level }),
        sub: t('leveledUpSub'),
      }
    case 'new_badges':
      return {
        icon: <Trophy size={14} />,
        label: t('newBadges', { count: n.count }),
        sub: t('newBadgesSub'),
      }
    case 'streak_warning': {
      return {
        icon: <Flame size={14} />,
        label: t('streakWarning', { streak: n.streak }),
        sub: t('streakWarningSub'),
      }
    }
    case 'quests_reset_soon': {
      const h = Math.floor(n.minutesUntil / 60)
      const m = n.minutesUntil % 60
      const timeLabel = h > 0 ? `${h}h ${m}m` : `${m}m`
      return {
        icon: <Sword size={14} />,
        label: t('questsResetSoon', { count: n.count, time: timeLabel }),
        sub: t('questsResetSoonSub'),
      }
    }
    case 'overdue_cards':
      return {
        icon: <Layers size={14} />,
        label: t('overdueCards', { count: n.count }),
      }
    case 'habits_left':
      return {
        icon: <CheckCircle2 size={14} />,
        label: t('habitsLeft', { count: n.remaining }),
      }
  }
}

export function NotificationPanel({
  notifications,
}: {
  notifications: Notification[]
}) {
  const t = useTranslations('dashboard.notificationPanel')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [, startTransition] = useTransition()

  const hasAny = notifications.length > 0

  // ESC closes
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  // Click-outside closes
  useEffect(() => {
    if (!open) return
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  function handleRowClick(n: Notification) {
    if (n.kind === 'new_badges') {
      startTransition(() => {
        void markBadgesSeen()
      })
    } else if (n.kind === 'leveled_up') {
      startTransition(() => {
        void markLevelSeen()
      })
    }
    setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="jl-btn"
        title={t('title')}
        aria-label={
          hasAny
            ? `${t('title')}, ${notifications.length} active`
            : t('title')
        }
        onClick={() => setOpen(prev => !prev)}
        style={{ padding: '0 10px', position: 'relative' }}
      >
        <Bell size={14} />
        {hasAny && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--jl-accent, #ef4444)',
              boxShadow: '0 0 0 2px var(--jl-bg-raised)',
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="jl-card"
          role="dialog"
          aria-label={t('title')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 340,
            maxHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            zIndex: 50,
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderBottom: '1px solid var(--jl-line)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Bell size={14} color="var(--jl-text-faint)" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('title')}</span>
            {hasAny && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  color: 'var(--jl-text-faint)',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {!hasAny ? (
              <div
                style={{
                  padding: '24px 14px',
                  textAlign: 'center',
                  color: 'var(--jl-text-faint)',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Clock size={18} />
                {t('empty')}
              </div>
            ) : (
              <ul
                style={{
                  margin: 0,
                  padding: '4px 0',
                  listStyle: 'none',
                }}
              >
                {notifications.map(n => {
                  const c = rowContent(n, t)
                  return (
                    <li key={n.kind}>
                      <Link
                        href={n.href}
                        onClick={() => handleRowClick(n)}
                        className="jl-notification-row"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 14px',
                          color: 'var(--jl-text)',
                          textDecoration: 'none',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            background: 'var(--jl-bg-sunken)',
                            color: 'var(--jl-text)',
                            flexShrink: 0,
                          }}
                        >
                          {c.icon}
                        </span>
                        <span
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {c.label}
                          </span>
                          {c.sub && (
                            <span
                              style={{
                                fontSize: 11,
                                color: 'var(--jl-text-faint)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {c.sub}
                            </span>
                          )}
                        </span>
                        <ChevronRight
                          size={14}
                          color="var(--jl-text-faint)"
                          style={{ flexShrink: 0 }}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          <style>{`
            .jl-notification-row:hover {
              background: var(--jl-bg-raised);
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
