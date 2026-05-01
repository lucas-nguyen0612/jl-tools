'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface Task {
  id: string
  title: string
  completed: boolean
  pomodorosDone: number
  pomodorosEstimated: number
}

interface TaskItemProps {
  task: Task
  isActive: boolean
  onToggle: () => void
  onSetActive: () => void
  onRemove: () => void
}

export function TaskItem({ task, isActive, onToggle, onSetActive, onRemove }: TaskItemProps) {
  const t = useTranslations('pomodoro.taskList')
  const [hovered, setHovered] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'grid',
        gridTemplateColumns: '16px 20px 1fr auto auto',
        gap: 10,
        alignItems: 'center',
        padding: '10px 10px',
        borderRadius: 8,
        cursor: 'pointer',
        background: isActive ? 'var(--jl-accent-soft)' : 'transparent',
        border: isActive
          ? '1px solid color-mix(in oklch, var(--jl-accent) 35%, transparent)'
          : '1px solid transparent',
      }}
      {...attributes}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSetActive}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        style={{
          cursor: 'grab',
          color: 'var(--jl-text-faint)',
          display: 'flex',
          alignItems: 'center',
          touchAction: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>

      {/* Circular toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '1.5px solid var(--jl-line)',
          background: task.completed ? 'var(--jl-success)' : 'transparent',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }}
      />

      {/* Task title */}
      <span
        style={{
          fontSize: 13.5,
          fontWeight: isActive ? 600 : 500,
          textDecoration: task.completed ? 'line-through' : 'none',
          color: task.completed ? 'var(--jl-text-faint)' : 'var(--jl-text)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.title}
      </span>

      {/* Pomodoro dots */}
      <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {Array.from({ length: task.pomodorosEstimated }).map((_, k) => (
          <div
            key={k}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background:
                k < task.pomodorosDone ? 'var(--jl-accent)' : 'var(--jl-bg-sunken)',
              border: '1px solid var(--jl-line-soft)',
            }}
          />
        ))}
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: 4,
          border: 'none',
          background: 'transparent',
          color: 'var(--jl-text-faint)',
          cursor: 'pointer',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          padding: 0,
        }}
        tabIndex={hovered ? 0 : -1}
        aria-label={t('removeAria')}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}
