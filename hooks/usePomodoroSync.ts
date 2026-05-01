'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePomodoroStore, type Phase } from '@/store/pomodoroStore'

interface SyncState {
  timeLeft: number
  isRunning: boolean
  phase: Phase
}

type BcMessage =
  | { type: 'STATE_UPDATE'; leaderId: string; state: SyncState }
  | { type: 'CLAIM_LEADERSHIP'; newLeaderId: string }

const LEADER_KEY = 'jl-pomo-leader'
const LEADER_TTL = 4000
const REFRESH_MS = 1500

function readCurrentLeader(): string | null {
  try {
    const raw = localStorage.getItem(LEADER_KEY)
    if (!raw) return null
    const { tabId, ts } = JSON.parse(raw) as { tabId: string; ts: number }
    return Date.now() - ts < LEADER_TTL ? tabId : null
  } catch {
    return null
  }
}

function writeLeader(tabId: string): void {
  try {
    localStorage.setItem(LEADER_KEY, JSON.stringify({ tabId, ts: Date.now() }))
  } catch { /* storage unavailable */ }
}

function clearLeader(tabId: string): void {
  try {
    if (readCurrentLeader() === tabId) localStorage.removeItem(LEADER_KEY)
  } catch { /* storage unavailable */ }
}

/**
 * Coordinates Pomodoro timer execution across browser tabs via leader election.
 * Only the leader tab runs the RAF tick loop — followers mirror state via BroadcastChannel.
 *
 * claimLeadership() lets any tab take over on explicit user interaction (start/pause/reset/skip),
 * broadcasting CLAIM_LEADERSHIP so the existing leader yields unconditionally.
 */
export function usePomodoroSync(): { isLeader: boolean; claimLeadership: () => void } {
  const tabId = useRef(crypto.randomUUID()).current
  const [isLeader, setIsLeader] = useState(false)
  const isLeaderRef = useRef(false)
  // Stable ref so claimLeadership useCallback can invoke internal closure logic
  const claimRef = useRef<() => void>(() => {})

  useEffect(() => {
    const bc = new BroadcastChannel('jl-pomodoro')
    let refreshTimer: ReturnType<typeof setInterval> | null = null
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let unsubStore: (() => void) | null = null

    function getSyncState(): SyncState {
      const { timeLeft, isRunning, phase } = usePomodoroStore.getState()
      return { timeLeft, isRunning, phase }
    }

    function emit(state: SyncState): void {
      bc.postMessage({ type: 'STATE_UPDATE', leaderId: tabId, state } satisfies BcMessage)
    }

    function stopLeaderActivity(): void {
      if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null }
      if (unsubStore) { unsubStore(); unsubStore = null }
    }

    function stopFollowerActivity(): void {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
    }

    function promoteToLeader(): void {
      if (isLeaderRef.current) return
      stopFollowerActivity()
      isLeaderRef.current = true
      setIsLeader(true)
      writeLeader(tabId)

      // Keep-alive: refresh token + send state for late-joining followers
      refreshTimer = setInterval(() => {
        writeLeader(tabId)
        emit(getSyncState())
      }, REFRESH_MS)

      // Broadcast timer-relevant state changes (not tasks/settings)
      let prev = getSyncState()
      unsubStore = usePomodoroStore.subscribe(s => {
        if (!isLeaderRef.current) return
        const next: SyncState = { timeLeft: s.timeLeft, isRunning: s.isRunning, phase: s.phase }
        if (
          next.timeLeft !== prev.timeLeft ||
          next.isRunning !== prev.isRunning ||
          next.phase !== prev.phase
        ) {
          prev = next
          emit(next)
        }
      })
    }

    function demoteToFollower(): void {
      stopLeaderActivity()
      if (isLeaderRef.current) {
        isLeaderRef.current = false
        setIsLeader(false)
        clearLeader(tabId)
      }

      // Avoid stacking poll timers
      if (pollTimer) return
      pollTimer = setInterval(() => {
        if (!readCurrentLeader()) {
          clearInterval(pollTimer!)
          pollTimer = null
          promoteToLeader()
        }
      }, REFRESH_MS)
    }

    // Forcibly take leadership regardless of who currently holds it
    function forceClaim(): void {
      stopFollowerActivity()
      try { localStorage.removeItem(LEADER_KEY) } catch { /* ignore */ }
      // Tell existing leader to yield
      bc.postMessage({ type: 'CLAIM_LEADERSHIP', newLeaderId: tabId } satisfies BcMessage)
      isLeaderRef.current = false // reset so promoteToLeader guard passes
      promoteToLeader()
    }

    claimRef.current = forceClaim

    bc.onmessage = (e: MessageEvent<BcMessage>) => {
      const msg = e.data
      if (msg.type === 'CLAIM_LEADERSHIP') {
        if (msg.newLeaderId !== tabId) demoteToFollower()
      } else if (msg.type === 'STATE_UPDATE') {
        if (isLeaderRef.current) {
          // Accidental dual-leader (simultaneous open): lower tabId wins
          if (msg.leaderId < tabId) demoteToFollower()
        } else {
          usePomodoroStore.setState(msg.state)
        }
      }
    }

    if (!readCurrentLeader()) {
      promoteToLeader()
    } else {
      demoteToFollower()
    }

    return () => {
      stopLeaderActivity()
      stopFollowerActivity()
      isLeaderRef.current = false
      clearLeader(tabId)
      bc.close()
    }
  }, [tabId])

  const claimLeadership = useCallback(() => {
    claimRef.current()
  }, [])

  return { isLeader, claimLeadership }
}
