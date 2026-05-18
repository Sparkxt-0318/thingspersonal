import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '../types'
import { useStore } from '../store/store'
import { uid } from '../lib/id'
import { Checkbox } from './Checkbox'
import {
  WhenPopover,
  DeadlinePopover,
  TagsPopover,
  MovePopover,
  RepeatPopover,
} from './popovers'
import {
  CalendarIcon,
  FlagIcon,
  TagIcon,
  MoveIcon,
  ChecklistIcon,
  RepeatIcon,
  StarIcon,
  MoonIcon,
  BoxIcon,
  CloseIcon,
} from './icons'
import { shortDayLabel, describeRepeat, deadlineCountdown } from '../lib/dates'

type Pop = null | 'when' | 'deadline' | 'tags' | 'move' | 'repeat'

function WhenChip({ task }: { task: Task }) {
  if (!task.when) return null
  let icon = <CalendarIcon size={13} />
  let label = ''
  let color = 'var(--text-secondary)'
  if (task.when === 'today') {
    icon = <StarIcon size={13} />
    label = 'Today'
    color = '#E0A800'
  } else if (task.when === 'evening') {
    icon = <MoonIcon size={12} />
    label = 'This Evening'
    color = '#7782a0'
  } else if (task.when === 'someday') {
    icon = <BoxIcon size={13} />
    label = 'Someday'
    color = '#C9A66B'
  } else {
    label = shortDayLabel(task.when)
    color = 'var(--accent)'
  }
  return (
    <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
      {icon}
      {label}
    </span>
  )
}

export function TaskEditor({
  task,
  onClose,
}: {
  task: Task
  onClose: () => void
}) {
  const updateTask = useStore((s) => s.updateTask)
  const tags = useStore((s) => s.tags)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const [pop, setPop] = useState<Pop>(null)
  const whenRef = useRef<HTMLButtonElement>(null)
  const deadlineRef = useRef<HTMLButtonElement>(null)
  const tagsRef = useRef<HTMLButtonElement>(null)
  const moveRef = useRef<HTMLButtonElement>(null)
  const repeatRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)
  const [showChecklist, setShowChecklist] = useState(task.checklist.length > 0)

  useEffect(() => {
    const el = titleRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
      if (task.title === '') {
        el.focus()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const project = task.projectId
    ? projects.find((p) => p.id === task.projectId)
    : null
  const area = task.areaId ? areas.find((a) => a.id === task.areaId) : null
  const taskTags = tags.filter((t) => task.tags.includes(t.id))
  const dl = task.deadline ? deadlineCountdown(task.deadline) : null

  const addChecklistItem = () => {
    updateTask(task.id, {
      checklist: [...task.checklist, { id: uid(), title: '', done: false }],
    })
  }

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="bg-elevated rounded-[10px] my-1 mx-1.5"
      style={{ boxShadow: 'var(--shadow-pop)' }}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !pop) {
          e.stopPropagation()
          onClose()
        }
      }}
    >
      <div className="px-3.5 pt-3 pb-3">
        <div className="flex items-start gap-3">
          <div className="pt-[2px]">
            <Checkbox
              status={task.status}
              onToggle={() => {
                useStore.getState().completeTask(task.id)
                onClose()
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              ref={titleRef}
              value={task.title}
              rows={1}
              placeholder="New To-Do"
              onChange={(e) => {
                updateTask(task.id, { title: e.target.value })
                const el = e.target
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onClose()
                }
              }}
              className="w-full bg-transparent outline-none resize-none text-[15px] font-semibold text-primary placeholder:text-tertiary placeholder:font-normal leading-snug"
            />
            <textarea
              value={task.notes}
              placeholder="Notes"
              onChange={(e) => {
                updateTask(task.id, { notes: e.target.value })
                const el = e.target
                el.style.height = 'auto'
                el.style.height = el.scrollHeight + 'px'
              }}
              ref={(el) => {
                if (el) {
                  el.style.height = 'auto'
                  el.style.height = el.scrollHeight + 'px'
                }
              }}
              className="w-full bg-transparent outline-none resize-none text-[13.5px] text-primary/90 placeholder:text-tertiary mt-1.5 leading-relaxed min-h-[20px]"
            />

            {showChecklist && (
              <div className="mt-2.5 space-y-0.5">
                {task.checklist.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 group/cl">
                    <button
                      onClick={() =>
                        updateTask(task.id, {
                          checklist: task.checklist.map((x) =>
                            x.id === c.id ? { ...x, done: !x.done } : x
                          ),
                        })
                      }
                      className="shrink-0"
                    >
                      <span
                        className={[
                          'w-[15px] h-[15px] rounded-[4px] border flex items-center justify-center transition-colors',
                          c.done
                            ? 'bg-[var(--accent)] border-[var(--accent)]'
                            : 'border-[#cfcfd4] dark:border-[#4a4a50]',
                        ].join(' ')}
                      >
                        {c.done && (
                          <svg width="10" height="10" viewBox="0 0 24 24">
                            <path
                              d="M5 12.5l4 4 10-10.5"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                    </button>
                    <input
                      value={c.title}
                      autoFocus={c.title === ''}
                      placeholder="Item"
                      onChange={(e) =>
                        updateTask(task.id, {
                          checklist: task.checklist.map((x) =>
                            x.id === c.id ? { ...x, title: e.target.value } : x
                          ),
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addChecklistItem()
                        }
                        if (e.key === 'Backspace' && c.title === '') {
                          e.preventDefault()
                          updateTask(task.id, {
                            checklist: task.checklist.filter((x) => x.id !== c.id),
                          })
                        }
                      }}
                      className={[
                        'flex-1 bg-transparent outline-none text-[13.5px] py-0.5',
                        c.done ? 'line-through text-tertiary' : 'text-primary',
                      ].join(' ')}
                    />
                    <button
                      onClick={() =>
                        updateTask(task.id, {
                          checklist: task.checklist.filter((x) => x.id !== c.id),
                        })
                      }
                      className="opacity-0 group-hover/cl:opacity-100 text-tertiary hover:text-[#FF5C5C] transition-opacity"
                    >
                      <CloseIcon size={13} />
                    </button>
                    {i === task.checklist.length - 1 && null}
                  </div>
                ))}
                <button
                  onClick={addChecklistItem}
                  className="text-[12.5px] text-secondary hover:text-[var(--accent)] mt-1 ml-[23px]"
                >
                  + Add item
                </button>
              </div>
            )}

            {(taskTags.length > 0 || dl || task.repeatRule) && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                {taskTags.map((t) => (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11.5px] font-medium"
                    style={{ background: t.color + '22', color: t.color }}
                  >
                    {t.name}
                  </span>
                ))}
                {task.repeatRule && (
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-secondary">
                    <RepeatIcon size={12} /> {describeRepeat(task.repeatRule)}
                  </span>
                )}
                {dl && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-[3px] rounded-full text-[11.5px] font-medium"
                    style={{
                      background: dl.overdue ? '#FF5C5C22' : 'var(--field-bg)',
                      color: dl.overdue ? '#FF5C5C' : 'var(--text-secondary)',
                    }}
                  >
                    <FlagIcon size={11} /> {dl.label}
                  </span>
                )}
              </div>
            )}

            {(task.when || project || area) && (
              <div className="mt-2 text-[12px]">
                <WhenChip task={task} />
                {(project || area) && (
                  <span className="ml-2 text-secondary">
                    {project?.title || area?.title}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-divider -mx-3.5 px-3 -mb-1">
          <ToolButton refEl={whenRef} label="When" onClick={() => setPop(pop === 'when' ? null : 'when')}>
            <CalendarIcon size={16} />
          </ToolButton>
          <ToolButton refEl={deadlineRef} label="Deadline" onClick={() => setPop(pop === 'deadline' ? null : 'deadline')}>
            <FlagIcon size={16} />
          </ToolButton>
          <ToolButton refEl={tagsRef} label="Tags" onClick={() => setPop(pop === 'tags' ? null : 'tags')}>
            <TagIcon size={16} />
          </ToolButton>
          <ToolButton refEl={moveRef} label="Move" onClick={() => setPop(pop === 'move' ? null : 'move')}>
            <MoveIcon size={16} />
          </ToolButton>
          <ToolButton
            label="Checklist"
            onClick={() => {
              setShowChecklist(true)
              if (task.checklist.length === 0) addChecklistItem()
            }}
          >
            <ChecklistIcon size={16} />
          </ToolButton>
          <ToolButton refEl={repeatRef} label="Repeat" onClick={() => setPop(pop === 'repeat' ? null : 'repeat')}>
            <RepeatIcon size={16} />
          </ToolButton>
          <div className="flex-1" />
          <button
            onClick={() => {
              useStore.getState().trashTask(task.id)
            }}
            className="px-2 py-1 rounded-md text-tertiary hover:text-[#FF5C5C] hover:bg-[var(--bg-hover)] transition-colors"
            title="Move to Trash"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14M7 7l.8 11A2 2 0 0 0 9.8 20h4.4a2 2 0 0 0 2-1.9L17 7M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <WhenPopover task={task} anchor={whenRef.current} open={pop === 'when'} onClose={() => setPop(null)} />
      <DeadlinePopover task={task} anchor={deadlineRef.current} open={pop === 'deadline'} onClose={() => setPop(null)} />
      <TagsPopover task={task} anchor={tagsRef.current} open={pop === 'tags'} onClose={() => setPop(null)} />
      <MovePopover task={task} anchor={moveRef.current} open={pop === 'move'} onClose={() => setPop(null)} />
      <RepeatPopover task={task} anchor={repeatRef.current} open={pop === 'repeat'} onClose={() => setPop(null)} />
    </motion.div>
  )
}

function ToolButton({
  children,
  label,
  onClick,
  refEl,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  refEl?: React.RefObject<HTMLButtonElement>
}) {
  return (
    <button
      ref={refEl}
      onClick={onClick}
      title={label}
      className="flex items-center gap-1.5 px-2 py-1 rounded-md text-secondary hover:text-[var(--accent)] hover:bg-[var(--bg-hover)] transition-colors text-[12px]"
    >
      {children}
    </button>
  )
}
