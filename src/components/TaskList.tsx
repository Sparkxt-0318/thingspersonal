import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Task } from '../types'
import type { TaskGroup } from '../store/selectors'
import { TaskRow } from './TaskRow'
import { useStore } from '../store/store'
import { MoonIcon } from './icons'

interface Props {
  groups: TaskGroup[]
  showProject?: boolean
  showWhen?: boolean
}

export function TaskList({ groups, showProject, showWhen }: Props) {
  const tasks = useStore((s) => s.tasks)
  const setDragging = useStore((s) => s.setDragging)
  const draggingId = useStore((s) => s.draggingId)
  const plusDragging = useStore((s) => s.plusDragging)
  const expandedId = useStore((s) => s.expandedTaskId)
  const reorderTask = useStore((s) => s.reorderTask)
  const updateTask = useStore((s) => s.updateTask)
  const createTask = useStore((s) => s.createTask)
  const [overId, setOverId] = useState<string | null>(null)

  const groupContext = (group: TaskGroup): Partial<Task> => {
    const ctx: Partial<Task> = {}
    if (group.kind === 'heading') ctx.headingId = group.key.replace('h:', '')
    if (group.kind === 'evening') ctx.when = 'evening'
    if (group.kind === 'today') ctx.when = 'today'
    return ctx
  }

  const handleDrop = (target: Task, group: TaskGroup) => {
    setOverId(null)
    if (plusDragging) {
      const t = createTask(
        { ...groupContext(group), sortOrder: target.sortOrder - 1 },
        false
      )
      useStore.getState().setPlusDragging(false)
      useStore.getState().expand(t.id)
      return
    }
    if (!draggingId || draggingId === target.id) return
    const dragged = tasks.find((t) => t.id === draggingId)
    if (!dragged) return
    const patch: Partial<Task> = { sortOrder: target.sortOrder - 1 }
    if (group.kind === 'heading') patch.headingId = group.key.replace('h:', '')
    if (group.kind === 'evening') patch.when = 'evening'
    if (group.kind === 'today' && (dragged.when === 'evening' || !dragged.when))
      patch.when = 'today'
    updateTask(draggingId, patch)
    reorderTask(draggingId, target.sortOrder - 1)
  }

  return (
    <div>
      {groups.map((group) => {
        const empty = group.tasks.length === 0
        if (empty && group.kind !== 'today' && group.kind !== 'evening') return null
        return (
          <div key={group.key} className="mb-1">
            {group.kind === 'evening' ? (
              <div className="flex items-center gap-2 px-4 mt-5 mb-1.5 text-secondary">
                <MoonIcon size={15} className="text-[#7782a0]" />
                <span className="text-[13px] font-semibold">This Evening</span>
                <div className="flex-1 h-px bg-[var(--divider)] ml-1" />
              </div>
            ) : group.title ? (
              <div className="px-4 mt-5 mb-1">
                {group.subtitle && (
                  <div className="text-[12px] font-semibold text-tertiary uppercase tracking-wide mb-1">
                    {group.subtitle}
                  </div>
                )}
                <div
                  className={[
                    'font-semibold',
                    group.kind === 'date'
                      ? 'text-[15px] text-primary'
                      : group.kind === 'completed'
                        ? 'text-[13px] text-tertiary uppercase tracking-wide'
                        : 'text-[15px] text-[var(--accent)]',
                  ].join(' ')}
                >
                  {group.title}
                </div>
              </div>
            ) : null}

            <AnimatePresence initial={false}>
              {group.tasks.map((task) => {
                const isExpanded = expandedId === task.id
                return (
                  <motion.div
                    key={task.id}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div
                      draggable={!isExpanded}
                      onDragStart={(e) => {
                        if (isExpanded) {
                          e.preventDefault()
                          return
                        }
                        e.dataTransfer.effectAllowed = 'move'
                        setDragging(task.id)
                      }}
                      onDragEnd={() => {
                        setDragging(null)
                        setOverId(null)
                      }}
                      onDragOver={(e) => {
                        if (
                          (draggingId && draggingId !== task.id) ||
                          plusDragging
                        ) {
                          e.preventDefault()
                          setOverId(task.id)
                        }
                      }}
                      onDragLeave={() =>
                        setOverId((cur) => (cur === task.id ? null : cur))
                      }
                      onDrop={() => handleDrop(task, group)}
                      className={
                        overId === task.id && !isExpanded
                          ? 'rounded-[7px] ring-2 ring-[var(--accent)]/60'
                          : ''
                      }
                    >
                      <TaskRow
                        task={task}
                        showProject={showProject}
                        showWhen={showWhen}
                      />
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {empty && group.kind === 'today' && (
              <div className="px-4 py-10 text-center text-[13px] text-tertiary select-none">
                No to-dos — enjoy your day.
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
