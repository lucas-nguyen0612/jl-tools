import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createPomodoroTask,
  deletePomodoroTask,
  listPomodoroTasks,
  reorderPomodoroTasks,
  updatePomodoroTask,
  getPomodoroSettings,
  upsertPomodoroSettings,
} from '@/features/pomodoro/actions'
import { emitAppEvent } from '@/lib/events'
import type { PomodoroCompleteCalendarPayload } from '@/lib/events'
import { playAlertTone } from '@/features/pomodoro/playAlertTone'

export type Phase = 'work' | 'short' | 'long'

export interface PomodoroTask {
  id: string
  title: string
  completed: boolean
  pomodorosDone: number
  pomodorosEstimated: number
}

export interface PomodoroSettings {
  workDuration: number
  shortDuration: number
  longDuration: number
  sessionsUntilLong: number
  soundscape: string
  volume: number
  blockedSites: string[]
  focusBlockerEnabled: boolean
}

export interface CompletedFocusSession {
  xpAwarded: number
  sessionCount: number
  calendarPayload: PomodoroCompleteCalendarPayload | null
}

interface PomodoroStore {
  phase: Phase
  timeLeft: number
  isRunning: boolean
  sessionCount: number
  tasks: PomodoroTask[]
  activeTaskId: string | null
  settings: PomodoroSettings
  startedAt: number | null
  pausedAt: number | null
  interruptions: number
  hydrated: boolean
  sessionJustCompleted: boolean
  lastCompletedFocusSession: CompletedFocusSession | null

  hydrate: (data: { tasks: PomodoroTask[]; settings: PomodoroSettings | null }) => void

  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  skipPhase: () => void
  addTask: (title: string, estimated?: number) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  reorderTasks: (activeId: string, overId: string) => void
  updateSettings: (s: Partial<PomodoroSettings>) => void
  tick: () => void
  onSessionComplete: () => Promise<void>
  dismissSessionCompletion: () => void
}

function durationForPhase(phase: Phase, settings: PomodoroSettings): number {
  if (phase === 'work') return settings.workDuration
  if (phase === 'short') return settings.shortDuration
  return settings.longDuration
}

function nextPhase(
  current: Phase,
  sessionCount: number,
  sessionsUntilLong: number
): Phase {
  if (current === 'work') {
    // After completing a work session, pick break type
    const nextSession = sessionCount + 1
    return nextSession % sessionsUntilLong === 0 ? 'long' : 'short'
  }
  return 'work'
}

const defaultSettings: PomodoroSettings = {
  workDuration: 1500,
  shortDuration: 300,
  longDuration: 900,
  sessionsUntilLong: 4,
  soundscape: 'silent',
  volume: 0.5,
  blockedSites: [],
  focusBlockerEnabled: false,
}

// Debounce settings writes so slider drags don't hammer the DB.
let settingsSaveTimer: ReturnType<typeof setTimeout> | null = null
let pendingSettingsPatch: Partial<PomodoroSettings> = {}

function scheduleSettingsSave(patch: Partial<PomodoroSettings>) {
  pendingSettingsPatch = { ...pendingSettingsPatch, ...patch }
  if (settingsSaveTimer) clearTimeout(settingsSaveTimer)
  settingsSaveTimer = setTimeout(() => {
    const toSave = pendingSettingsPatch
    pendingSettingsPatch = {}
    settingsSaveTimer = null
    void upsertPomodoroSettings(toSave).catch(err =>
      console.error('[pomodoro] failed to save settings', err)
    )
  }, 400)
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      phase: 'work',
      timeLeft: defaultSettings.workDuration,
      isRunning: false,
      sessionCount: 0,
      tasks: [],
      activeTaskId: null,
      settings: defaultSettings,
      startedAt: null,
      pausedAt: null,
      interruptions: 0,
      hydrated: false,
      sessionJustCompleted: false,
      lastCompletedFocusSession: null,

      hydrate: ({ tasks, settings }) => {
        set(state => {
          const nextSettings = settings ?? state.settings
          const phaseDuration = durationForPhase(state.phase, nextSettings)
          // Only reset timeLeft if the timer is idle at a stale duration — don't
          // stomp on a running or mid-session timer.
          const shouldResetTimeLeft =
            !state.isRunning && state.timeLeft === durationForPhase(state.phase, state.settings)
          return {
            tasks,
            settings: nextSettings,
            hydrated: true,
            timeLeft: shouldResetTimeLeft ? phaseDuration : state.timeLeft,
          }
        })
      },

      startTimer: () => {
        set({
          isRunning: true,
          startedAt: Date.now(),
          pausedAt: null,
          sessionJustCompleted: false,
          lastCompletedFocusSession: null,
        })
      },

      pauseTimer: () => {
        set(s => ({
          isRunning: false,
          pausedAt: Date.now(),
          interruptions: s.interruptions + 1,
        }))
      },

      resetTimer: () => {
        const { phase, settings } = get()
        set({
          timeLeft: durationForPhase(phase, settings),
          isRunning: false,
          startedAt: null,
          pausedAt: null,
          sessionJustCompleted: false,
          lastCompletedFocusSession: null,
        })
      },

      skipPhase: () => {
        const { phase, sessionCount, settings } = get()
        const wasWork = phase === 'work'
        const newSessionCount = wasWork ? sessionCount + 1 : sessionCount
        const newPhase = nextPhase(phase, sessionCount, settings.sessionsUntilLong)
        set({
          phase: newPhase,
          timeLeft: durationForPhase(newPhase, settings),
          isRunning: false,
          sessionCount: newSessionCount,
          startedAt: null,
          pausedAt: null,
          interruptions: 0,
          sessionJustCompleted: false,
          lastCompletedFocusSession: null,
        })
      },

      addTask: (title, estimated = 1) => {
        const id = crypto.randomUUID()
        set(s => ({
          tasks: [
            ...s.tasks,
            {
              id,
              title,
              completed: false,
              pomodorosDone: 0,
              pomodorosEstimated: estimated,
            },
          ],
        }))
        void createPomodoroTask({ id, title, estimatedPomodoros: estimated }).then(res => {
          if (res?.error) {
            console.error('[pomodoro] createTask failed:', res.error)
            set(s => ({
              tasks: s.tasks.filter(t => t.id !== id),
              activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
            }))
          }
        })
      },

      removeTask: (id) => {
        const prev = get().tasks.find(t => t.id === id)
        set(s => ({
          tasks: s.tasks.filter(t => t.id !== id),
          activeTaskId: s.activeTaskId === id ? null : s.activeTaskId,
        }))
        void deletePomodoroTask(id).then(res => {
          if (res?.error) {
            console.error('[pomodoro] deleteTask failed:', res.error)
            if (prev) set(s => ({ tasks: [...s.tasks, prev] }))
          }
        })
      },

      toggleTask: (id) => {
        const current = get().tasks.find(t => t.id === id)
        if (!current) return
        const nextCompleted = !current.completed
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id ? { ...t, completed: nextCompleted } : t
          ),
        }))
        void updatePomodoroTask(id, { isCompleted: nextCompleted }).then(res => {
          if (res?.error) console.error('[pomodoro] toggleTask failed:', res.error)
        })
      },

      setActiveTask: (id) => {
        set({ activeTaskId: id })
      },

      reorderTasks: (activeId, overId) => {
        let newOrder: string[] | null = null
        set(s => {
          const tasks = [...s.tasks]
          const activeIdx = tasks.findIndex(t => t.id === activeId)
          const overIdx = tasks.findIndex(t => t.id === overId)
          if (activeIdx === -1 || overIdx === -1) return {}
          const [removed] = tasks.splice(activeIdx, 1)
          tasks.splice(overIdx, 0, removed)
          newOrder = tasks.map(t => t.id)
          return { tasks }
        })
        if (newOrder) {
          void reorderPomodoroTasks(newOrder).then(res => {
            if (res?.error) console.error('[pomodoro] reorderTasks failed:', res.error)
          })
        }
      },

      updateSettings: (s) => {
        set(state => ({
          settings: { ...state.settings, ...s },
        }))
        scheduleSettingsSave(s)
      },

      tick: () => {
        const { timeLeft, phase, sessionJustCompleted } = get()
        if (sessionJustCompleted) return
        if (timeLeft <= 1) {
          // Time's up
          if (phase === 'work') {
            get().onSessionComplete()
          } else {
            get().skipPhase()
          }
        } else {
          set({ timeLeft: timeLeft - 1 })
        }
      },

      onSessionComplete: async () => {
        const state = get()
        const nextSessionCount = state.sessionCount + 1
        const nextBreakPhase = nextPhase('work', state.sessionCount, state.settings.sessionsUntilLong)
        const completedAt = new Date()
        const durationMinutes = Math.round(state.settings.workDuration / 60)
        const durationMs = durationMinutes * 60 * 1000

        // Stop the timer immediately so tick() doesn't re-fire while async work runs
        set({
          isRunning: false,
          phase: nextBreakPhase,
          timeLeft: durationForPhase(nextBreakPhase, state.settings),
          sessionCount: nextSessionCount,
          startedAt: null,
          pausedAt: null,
          interruptions: 0,
        })

        // Play timer-end alert tone (reads notification_settings at firing time)
        void playAlertTone().catch(err =>
          console.error('[pomodoro] playAlertTone failed:', err)
        )

        // Bump the active task's pomodoro count locally — the /api/pomodoro/sessions
        // endpoint mirrors this increment to the DB so reloads stay accurate.
        if (state.activeTaskId) {
          set(s => ({
            tasks: s.tasks.map(t =>
              t.id === s.activeTaskId
                ? { ...t, pomodorosDone: t.pomodorosDone + 1 }
                : t
            ),
          }))
        }

        // Server is the source of truth for XP — do not pre-compute or fall back
        // to a guess on failure (would lie to the user about XP they didn't get).
        let xpAwarded = 0
        let calendarPayload: PomodoroCompleteCalendarPayload | null = null

        try {
          const res = await fetch('/api/pomodoro/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              taskId: state.activeTaskId,
              durationMinutes,
              interruptions: state.interruptions,
            }),
          })
          const data = (await res.json()) as {
            success?: boolean
            xpAwarded?: number
            leveledUp?: boolean
            xpError?: string
          }
          if (res.ok && data.success) {
            if (typeof data.xpAwarded === 'number' && data.xpAwarded > 0) {
              xpAwarded = data.xpAwarded
              emitAppEvent('jl:xp-gain', { amount: data.xpAwarded })
            }
            if (data.leveledUp) emitAppEvent('jl:levelup', undefined)
            if (data.xpError) {
              console.error('[pomodoro] session recorded but XP not awarded:', data.xpError)
            }
            calendarPayload = {
              startedAt: new Date(completedAt.getTime() - durationMs).toISOString(),
              completedAt: completedAt.toISOString(),
              durationMinutes,
              taskName: state.tasks.find(t => t.id === state.activeTaskId)?.title,
            }
          } else {
            console.error('[pomodoro] failed to record session', res.status, data)
          }
        } catch (err) {
          console.error('[pomodoro] network error recording session', err)
        }

        // Signal UI to let user decide when to start the break
        set({
          sessionJustCompleted: true,
          lastCompletedFocusSession: {
            xpAwarded,
            sessionCount: nextSessionCount,
            calendarPayload,
          },
        })
      },

      dismissSessionCompletion: () => {
        set({
          sessionJustCompleted: false,
          lastCompletedFocusSession: null,
        })
      },
    }),
    {
      name: 'jl-pomodoro',
      // Only persist timer runtime state to localStorage — tasks & settings live in the DB.
      partialize: (state) => ({
        phase: state.phase,
        timeLeft: state.timeLeft,
        sessionCount: state.sessionCount,
        activeTaskId: state.activeTaskId,
        interruptions: state.interruptions,
        // isRunning, startedAt, pausedAt are intentionally excluded
      }),
    }
  )
)

export async function hydratePomodoroFromDb() {
  const [tasks, settings] = await Promise.all([
    listPomodoroTasks(),
    getPomodoroSettings(),
  ])
  usePomodoroStore.getState().hydrate({ tasks, settings })
}
