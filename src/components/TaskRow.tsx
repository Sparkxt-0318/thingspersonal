import { useState } from 'react'
import type { Task } from '../types'
import { useStore } from '../store/store'
import { Checkbox } from './Checkbox'
import { TaskEditor } from './TaskEditor'
import {
  CalendarIcon,
  FlagIcon,
  NotesIcon,
  ChecklistIcon,
  RepeatIcon,
  StarIcon,
  MoonIcon,
  BoxIcon,
} from './icons'
import { shortDayLabel, deadlineCountdown } from '../lib/dates'

interface Props {
  task: Task
  showProject?: boolean
  showWhen?: boolean
}

export function TaskRow({ task, showProject, showWhen = true }: Props) {
  const expandedTaskId = useStore((s) => s.expandedTaskId)
  const selectedTaskId = useStore((s) => s.selectedTaskId)
  const expand = useStore((s) => s.expand)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const tags = useStore((s) => s.tags)
  const [completing, setCompleting] = useState(false)

  const expanded = expandedTaskId === task.id
  const selected = selectedTaskId === task.id

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (task.status !== 'open') {
      useStore.getState().uncompleteTask(task.id)
      return
    }
    setCompleting(true)
    window.setTimeout(() => {
      useStore.getState().completeTask(task.id)
    }, 380)
  }

  if (expanded) {
    return (
      <TaskEditor task={task} onClose={() => expand(null)} />
    )
  }

  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null
  const area = task.areaId ? areas.find((a) => a.id === task.areaId) : null
  const taskTags = tags.filter((t) => task.tags.includes(t.id))
  const dl = task.deadline ? deadlineCountdown(task.deadline) : null
  const checklistDone = task.checklist.filter((c) => c.done).length
  const isDone = task.status === 'completed' || task.status === 'canceled'

  let whenGlyph: React.ReactNode = null
  if (showWhen && task.status === 'open') {
    if (task.when === 'today')
      whenGlyph = <StarIcon size={13} className="text-[#E0A800]" />
    else if (task.when === 'evening')
      whenGlyph = <MoonIcon size={12} className="text-[#7782a0]" />
    else if (task.when === 'someday')
      whenGlyph = <BoxIcon size={13} className="text-[#C9A66B]" />
    else if (typeof task.when === 'string' && task.when.includes('-'))
      whenGlyph = (
        <span className="inline-flex items-center gap-1 text-[12px] text-secondary">
          <CalendarIcon size={12} />
          {shortDayLabel(task.when)}
        </span>
      )
  }

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        expand(task.id)
      }}
      className={[
        'group flex items-start gap-3 px-3.5 py-[7px] mx-1.5 rounded-[7px] cursor-default select-none transition-colors',
        completing ? 'opacity-50' : '',
        selected ? 'bg-[var(--bg-hover)]' : 'hover:bg-[var(--bg-hover)]',
      ].join(' ')}
    >
      <div className="pt-[1px]">
        <Checkbox status={completing ? 'completed' : task.status} onToggle={toggle} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={[
              'text-[15px] leading-tight truncate',
              isDone ? 'text-tertiary line-through' : 'text-primary',
            ].join(' ')}
          >
            {task.title || <span className="text-tertiary">New To-Do</span>}
          </span>
        </div>
        {showProject && (project || area) && (
          <div className="text-[11.5px] text-tertiary mt-0.5 flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)' }}
            />
            {project?.title || area?.title}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-[2px]">
        {task.notes.trim() && <NotesIcon size={14} className="text-tertiary" />}
        {task.checklist.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11.5px] text-tertiary">
            <ChecklistIcon size={13} />
            {checklistDone}/{task.checklist.length}
          </span>
        )}
        {task.repeatRule && <RepeatIcon size={13} className="text-tertiary" />}
        {taskTags.slice(0, 3).map((t) => (
          <span
            key={t.id}
            className="w-2 h-2 rounded-full"
            style={{ background: t.color }}
            title={t.name}
          />
        ))}
        {dl && (
          <span
            className="inline-flex items-center gap-0.5 text-[11.5px] font-medium"
            style={{ color: dl.overdue ? '#FF5C5C' : 'var(--text-tertiary)' }}
          >
            <FlagIcon size={12} />
            {dl.soon || dl.overdue ? dl.label : ''}
          </span>
        )}
        {whenGlyph}
      </div>
    </div>
  )
}
