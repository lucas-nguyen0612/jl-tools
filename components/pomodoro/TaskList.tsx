'use client'
import { useState, KeyboardEvent } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical, Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePomodoroStore, PomodoroTask } from '@/store/pomodoroStore'

function SortableTask({
  task,
  isActive,
}: {
  task: PomodoroTask
  isActive: boolean
}) {
  const t = useTranslations('pomodoro.taskList')
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
  })
  const toggleTask = usePomodoroStore(s => s.toggleTask)
  const removeTask = usePomodoroStore(s => s.removeTask)
  const setActiveTask = usePomodoroStore(s => s.setActiveTask)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 10px',
        borderRadius: 'var(--jl-r)',
        background: isActive ? 'var(--jl-accent-soft)' : 'transparent',
        border: `1px solid ${isActive ? 'var(--jl-accent)' : 'transparent'}`,
        cursor: 'pointer',
        opacity: task.completed ? 0.5 : 1,
      }}
      onClick={() => setActiveTask(isActive ? null : task.id)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'grab',
          color: 'var(--jl-text-faint)',
          padding: 0,
          display: 'flex',
          flexShrink: 0,
        }}
        aria-label={t('dragAria')}
      >
        <GripVertical size={14} />
      </button>

      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); toggleTask(task.id) }}
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          border: `1.5px solid ${task.completed ? 'var(--jl-accent)' : 'var(--jl-line)'}`,
          background: task.completed ? 'var(--jl-accent)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'white',
        }}
        aria-label={task.completed ? t('markIncomplete') : t('markComplete')}
      >
        {task.completed && <Check size={10} strokeWidth={3} />}
      </button>

      {/* Title */}
      <span
        style={{
          flex: 1,
          fontSize: 14,
          color: 'var(--jl-text)',
          textDecoration: task.completed ? 'line-through' : 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {task.title}
      </span>

      {/* Pomodoro count */}
      <span style={{ fontSize: 11, color: 'var(--jl-text-faint)', flexShrink: 0 }}>
        {task.pomodorosDone}/{task.pomodorosEstimated}
      </span>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); removeTask(task.id) }}
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
        className="task-delete"
        aria-label={t('removeAria')}
      >
        <Trash2 size={13} />
      </button>

      <style>{`
        div:hover > button.task-delete { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

export function TaskList() {
  const t = useTranslations('pomodoro.taskList')
  const tasks = usePomodoroStore(s => s.tasks)
  const activeTaskId = usePomodoroStore(s => s.activeTaskId)
  const addTask = usePomodoroStore(s => s.addTask)
  const reorderTasks = usePomodoroStore(s => s.reorderTasks)

  const [input, setInput] = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  function handleAdd() {
    const title = input.trim()
    if (!title) return
    addTask(title, 1)
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTasks(String(active.id), String(over.id))
    }
  }

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--jl-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}
      >
        {t('title')}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('addPlaceholder')}
          style={{
            flex: 1,
            height: 36,
            padding: '0 12px',
            background: 'var(--jl-bg-sunken)',
            border: '1px solid var(--jl-line-soft)',
            borderRadius: 'var(--jl-r)',
            fontSize: 14,
            color: 'var(--jl-text)',
            outline: 'none',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            height: 36,
            width: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--jl-accent-strong)',
            border: 'none',
            borderRadius: 'var(--jl-r)',
            cursor: 'pointer',
            color: 'white',
            flexShrink: 0,
          }}
          aria-label={t('addAria')}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} isActive={task.id === activeTaskId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {tasks.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '24px 0',
            fontSize: 13,
            color: 'var(--jl-text-faint)',
          }}
        >
          {t('empty')}
        </div>
      )}
    </div>
  )
}
