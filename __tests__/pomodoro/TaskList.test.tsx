import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock server actions before importing anything that pulls them in.
vi.mock('@/features/pomodoro/actions', () => ({
  createPomodoroTask: vi.fn(async () => ({})),
  deletePomodoroTask: vi.fn(async () => ({})),
  listPomodoroTasks: vi.fn(async () => []),
  reorderPomodoroTasks: vi.fn(async () => ({})),
  updatePomodoroTask: vi.fn(async () => ({})),
  getPomodoroSettings: vi.fn(async () => null),
  upsertPomodoroSettings: vi.fn(async () => ({})),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    rpc: vi.fn(async () => ({ data: null, error: null })),
    auth: { getUser: vi.fn(async () => ({ data: { user: null } })) },
  }),
}))

import { TaskList } from '@/components/pomodoro/TaskList'
import { usePomodoroStore } from '@/store/pomodoroStore'

function resetStore() {
  usePomodoroStore.setState({
    phase: 'work',
    timeLeft: 1500,
    isRunning: false,
    sessionCount: 0,
    tasks: [],
    activeTaskId: null,
    settings: {
      workDuration: 1500,
      shortDuration: 300,
      longDuration: 900,
      sessionsUntilLong: 4,
      soundscape: 'silent',
      volume: 0.5,
      blockedSites: [],
      focusBlockerEnabled: false,
    },
    startedAt: null,
    pausedAt: null,
    interruptions: 0,
    hydrated: false,
  })
}

beforeEach(() => {
  resetStore()
  // jsdom doesn't ship crypto.randomUUID by default in some envs.
  if (!globalThis.crypto || typeof globalThis.crypto.randomUUID !== 'function') {
    let n = 0
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: { randomUUID: () => `uuid-${++n}` },
    })
  }
})

describe('TaskList', () => {
  it('shows the empty state when no tasks exist', () => {
    render(<TaskList />)
    expect(
      screen.getByText(/No tasks yet/i)
    ).toBeInTheDocument()
  })

  it('adds a task when the user types and presses Enter', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const input = screen.getByPlaceholderText('Add a task…')
    await user.type(input, 'Write tests{Enter}')

    expect(screen.getByText('Write tests')).toBeInTheDocument()
    // Empty state should be gone now.
    expect(screen.queryByText(/No tasks yet/i)).toBeNull()
    // Input clears after add.
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('does not add an empty/whitespace-only task on Enter', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const input = screen.getByPlaceholderText('Add a task…')
    await user.type(input, '   {Enter}')

    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument()
  })

  it('toggles task completion via the checkbox button', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const input = screen.getByPlaceholderText('Add a task…')
    await user.type(input, 'Buy milk{Enter}')

    // The checkbox button has aria-label "Mark complete" when not done.
    const checkbox = screen.getByLabelText('Mark complete')
    await user.click(checkbox)

    // After toggling, aria-label flips to "Mark incomplete".
    expect(screen.getByLabelText('Mark incomplete')).toBeInTheDocument()

    // Verify store side-effect.
    const tasks = usePomodoroStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0].completed).toBe(true)
  })

  it('removes a task via the trash button', async () => {
    const user = userEvent.setup()
    render(<TaskList />)

    const input = screen.getByPlaceholderText('Add a task…')
    await user.type(input, 'Throwaway task{Enter}')

    expect(screen.getByText('Throwaway task')).toBeInTheDocument()

    // The remove button uses aria-label "Remove task".
    // Use fireEvent.click so we don't have to fight the inline opacity:0
    // hover-only styling that user-event may treat as not-interactable.
    const removeBtn = screen.getByLabelText('Remove task')
    fireEvent.click(removeBtn)

    expect(screen.queryByText('Throwaway task')).toBeNull()
    expect(usePomodoroStore.getState().tasks).toHaveLength(0)
  })

  // TODO: drag-and-drop reordering via dnd-kit. dnd-kit's PointerSensor
  // requires a real pointer event sequence (pointerdown → pointermove past
  // the activation distance → pointerup) and proper getBoundingClientRect
  // measurements that jsdom does not provide. A meaningful test needs
  // either a Cypress/Playwright integration harness or dnd-kit's
  // KeyboardSensor with bespoke coordinate getters. Skipping here.
  it.skip('reorders tasks via drag-and-drop', () => {})
})
