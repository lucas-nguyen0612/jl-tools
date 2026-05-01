'use client'
import { useState, KeyboardEvent } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePomodoroStore } from '@/store/pomodoroStore'

export function FocusTaskList() {
  const t = useTranslations('pomodoro.taskList')
  const tasks = usePomodoroStore(s => s.tasks)
  const activeTaskId = usePomodoroStore(s => s.activeTaskId)
  const addTask = usePomodoroStore(s => s.addTask)
  const toggleTask = usePomodoroStore(s => s.toggleTask)
  const removeTask = usePomodoroStore(s => s.removeTask)
  const setActiveTask = usePomodoroStore(s => s.setActiveTask)

  const [input, setInput] = useState('')

  function handleAdd() {
    const title = input.trim()
    if (!title) return
    addTask(title, 1)
    setInput('')
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: 'var(--jl-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
          textAlign: 'center',
        }}
      >
        {t('title')}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t('addPlaceholder')}
          style={{
            flex: 1,
            height: 32,
            padding: '0 10px',
            background: 'var(--jl-bg-sunken)',
            border: '1px solid var(--jl-line-soft)',
            borderRadius: 'var(--jl-r)',
            fontSize: 13,
            color: 'var(--jl-text)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          aria-label={t('addAria')}
          style={{
            height: 32,
            width: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--jl-accent-strong)',
            border: 'none',
            borderRadius: 'var(--jl-r)',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <Plus size={14} />
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {tasks.map(task => {
          const isActive = task.id === activeTaskId
          return (
            <div
              key={task.id}
              onClick={() => setActiveTask(isActive ? null : task.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                borderRadius: 'var(--jl-r)',
                background: isActive ? 'var(--jl-accent-soft)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--jl-accent)' : 'transparent'}`,
                cursor: 'pointer',
                opacity: task.completed ? 0.5 : 1,
              }}
            >
              <button
                onClick={e => { e.stopPropagation(); toggleTask(task.id) }}
                aria-label={task.completed ? t('markIncomplete') : t('markComplete')}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  border: `1.5px solid ${task.completed ? 'var(--jl-accent)' : 'var(--jl-line)'}`,
                  background: task.completed ? 'var(--jl-accent)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'white',
                  padding: 0,
                }}
              >
                {task.completed && <Check size={9} strokeWidth={3} />}
              </button>

              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: 'var(--jl-text)',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {task.title}
              </span>

              <span style={{ fontSize: 10, color: 'var(--jl-text-faint)', flexShrink: 0 }}>
                {task.pomodorosDone}/{task.pomodorosEstimated}
              </span>

              <button
                onClick={e => { e.stopPropagation(); removeTask(task.id) }}
                aria-label={t('removeAria')}
                className="focus-task-delete"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--jl-text-faint)',
                  padding: 0,
                  display: 'flex',
                  flexShrink: 0,
                  opacity: 0,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )
        })}

        {tasks.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '12px 0',
              fontSize: 12,
              color: 'var(--jl-text-faint)',
            }}
          >
            {t('emptyShort')}
          </div>
        )}
      </div>

      <style>{`
        div:hover > button.focus-task-delete { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
