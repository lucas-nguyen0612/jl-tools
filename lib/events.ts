/**
 * Typed app event bus over `window` + `CustomEvent`.
 *
 * Adds compile-time safety to a small set of cross-cutting events that are
 * dispatched from stores/hooks and consumed by overlay/animation components
 * (XP gain ticker, level-up modal, desktop notifications).
 *
 * Usage:
 *   emitAppEvent('jl:xp-gain', { amount: 10 })
 *
 *   useEffect(() => {
 *     return onAppEvent('jl:xp-gain', ({ amount }) => { ... })
 *   }, [])
 */

export type AppEvents = {
  'jl:xp-gain': { amount: number; source?: string }
  'jl:levelup': { newLevel: number; oldLevel: number } | undefined
}

export function emitAppEvent<K extends keyof AppEvents>(
  name: K,
  detail: AppEvents[K]
): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(name, { detail }))
}

export function onAppEvent<K extends keyof AppEvents>(
  name: K,
  handler: (detail: AppEvents[K]) => void
): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (e: Event) => {
    const ce = e as CustomEvent<AppEvents[K]>
    handler(ce.detail)
  }
  window.addEventListener(name, listener)
  return () => window.removeEventListener(name, listener)
}
