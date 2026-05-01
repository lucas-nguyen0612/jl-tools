'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Loader2, Search } from 'lucide-react'
import {
  useSearchContent,
  type SearchResult,
  type SearchResultType,
} from '@/hooks/useSearchContent'

const SECTION_ORDER: SearchResultType[] = ['flashcard_deck', 'habit', 'pomodoro_task']

function isMac() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

function hrefFor(result: SearchResult): string {
  switch (result.type) {
    case 'flashcard_deck':
      return `/flashcards/${result.id}`
    case 'habit':
      return '/habits'
    case 'pomodoro_task':
      return '/pomodoro'
  }
}

export function SearchDropdown({ userId }: { userId: string }) {
  const t = useTranslations('dashboard.searchDropdown')
  const sectionLabels: Record<SearchResultType, string> = {
    flashcard_deck: t('sectionDecks'),
    habit: t('sectionHabits'),
    pomodoro_task: t('sectionTasks'),
  }
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const { results, isLoading, debouncedQuery } = useSearchContent(query, userId)

  // Group results by type, preserving server-side ordering inside each group.
  const grouped = useMemo(() => {
    const map: Record<SearchResultType, SearchResult[]> = {
      flashcard_deck: [],
      habit: [],
      pomodoro_task: [],
    }
    for (const r of results) {
      map[r.type].push(r)
    }
    return map
  }, [results])

  // Global ⌘K / Ctrl+K toggle, ESC to close.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isToggle =
        (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')
      if (isToggle) {
        e.preventDefault()
        setOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Click-outside closes.
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

  // Focus input on open; clear input on close.
  useEffect(() => {
    if (open) {
      // microtask so the input is mounted
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    } else {
      setQuery('')
    }
  }, [open])

  const shortcutLabel = isMac() ? '⌘K' : 'Ctrl+K'

  // Enter on first result navigates.
  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault()
      const first = results[0]
      window.location.href = hrefFor(first)
      setOpen(false)
    }
  }

  const showEmpty =
    !isLoading && debouncedQuery.length >= 1 && results.length === 0

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="jl-btn"
        title={`${t('label')} (${shortcutLabel})`}
        aria-label={`${t('label')} (${shortcutLabel})`}
        onClick={() => setOpen(prev => !prev)}
        style={{ padding: '0 10px' }}
      >
        <Search size={14} />
      </button>

      {open && (
        <div
          className="jl-card"
          role="dialog"
          aria-label={t('label')}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 360,
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
            <Search size={14} color="var(--jl-text-faint)" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={t('placeholder')}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--jl-text)',
                fontSize: 14,
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: 'var(--jl-text-faint)',
                padding: '2px 6px',
                border: '1px solid var(--jl-line)',
                borderRadius: 4,
              }}
            >
              {shortcutLabel}
            </span>
          </div>

          <div style={{ overflowY: 'auto', flex: 1, padding: '6px 0' }}>
            {isLoading && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '14px',
                  color: 'var(--jl-text-faint)',
                  fontSize: 12,
                }}
              >
                <Loader2 size={14} className="animate-spin" />
                {t('loading')}
              </div>
            )}

            {showEmpty && (
              <div
                style={{
                  padding: '14px',
                  textAlign: 'center',
                  color: 'var(--jl-text-faint)',
                  fontSize: 13,
                }}
              >
                {t('empty')}
              </div>
            )}

            {!isLoading &&
              !showEmpty &&
              debouncedQuery.length === 0 && (
                <div
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    color: 'var(--jl-text-faint)',
                    fontSize: 12,
                  }}
                >
                  {t('hint')}
                </div>
              )}

            {!isLoading &&
              results.length > 0 &&
              SECTION_ORDER.map(type => {
                const section = grouped[type]
                if (section.length === 0) return null
                return (
                  <div key={type} style={{ padding: '6px 0' }}>
                    <div
                      style={{
                        padding: '6px 14px',
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 0.4,
                        color: 'var(--jl-text-faint)',
                      }}
                    >
                      {sectionLabels[type]} ({section.length})
                    </div>
                    {section.map(result => (
                      <Link
                        key={`${result.type}-${result.id}`}
                        href={hrefFor(result)}
                        onClick={() => setOpen(false)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: '8px 14px',
                          gap: 2,
                          color: 'var(--jl-text)',
                          textDecoration: 'none',
                        }}
                        className="jl-search-row"
                      >
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                          {result.label}
                        </span>
                        {result.sublabel && (
                          <span
                            style={{
                              fontSize: 11,
                              color: 'var(--jl-text-faint)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {result.sublabel}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )
              })}
          </div>
          <style>{`
            .jl-search-row:hover {
              background: var(--jl-bg-raised);
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
