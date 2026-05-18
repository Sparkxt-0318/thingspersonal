import { useStore } from '../store/store'
import {
  InboxIcon,
  StarIcon,
  CalendarIcon,
  LayersIcon,
  BoxIcon,
  LogbookIcon,
  TrashIcon,
  AreaIcon,
  ChevronIcon,
  GearIcon,
  SearchIcon,
} from './icons'
import { ProgressPie } from './ProgressPie'
import {
  inboxTasks,
  todayCount,
  upcomingCount,
  projectProgress,
} from '../store/selectors'
import type { FixedListId } from '../types'
import { useState } from 'react'

interface RowProps {
  icon: React.ReactNode
  label: string
  active: boolean
  count?: number
  onClick: () => void
  onDropTask?: () => void
  indent?: boolean
}

function SideRow({ icon, label, active, count, onClick, onDropTask, indent }: RowProps) {
  const [over, setOver] = useState(false)
  return (
    <button
      onClick={onClick}
      onDragOver={(e) => {
        if (onDropTask) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={() => {
        setOver(false)
        onDropTask?.()
      }}
      className={[
        'w-full flex items-center gap-2.5 pr-2 py-[5px] rounded-[7px] text-[14px] transition-colors',
        indent ? 'pl-7' : 'pl-2.5',
        active
          ? 'bg-[var(--accent)] text-white font-medium'
          : over
            ? 'bg-[var(--bg-hover)] ring-1 ring-[var(--accent)]'
            : 'text-primary hover:bg-[var(--bg-hover)]',
      ].join(' ')}
    >
      <span
        className={[
          'w-[19px] flex justify-center shrink-0',
          active ? 'text-white' : '',
        ].join(' ')}
      >
        {icon}
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
      {count != null && count > 0 && (
        <span
          className={[
            'text-[12px] tabular-nums',
            active ? 'text-white/80' : 'text-tertiary',
          ].join(' ')}
        >
          {count}
        </span>
      )}
    </button>
  )
}

export function Sidebar() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const headings = useStore((s) => s.headings)
  const moveTask = useStore((s) => s.moveTask)
  const toggleAreaCollapsed = useStore((s) => s.toggleAreaCollapsed)
  const draggingTaskId = useStore((s) => s.draggingId)
  const setQuickFind = useStore((s) => s.setQuickFind)
  const setSettingsOpen = useStore((s) => s.setSettingsOpen)

  const d = { tasks, projects, areas, headings }
  const trashCount = tasks.filter((t) => t.status === 'trashed').length

  const fixed: {
    id: FixedListId
    label: string
    icon: React.ReactNode
    count?: number
  }[] = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon className="text-things-inbox" />, count: inboxTasks(d).length },
    { id: 'today', label: 'Today', icon: <StarIcon className="text-things-today" />, count: todayCount(d) },
    { id: 'upcoming', label: 'Upcoming', icon: <CalendarIcon className="text-things-upcoming" />, count: upcomingCount(d) },
    { id: 'anytime', label: 'Anytime', icon: <LayersIcon className="text-things-anytime" /> },
    { id: 'someday', label: 'Someday', icon: <BoxIcon className="text-things-someday" /> },
    { id: 'logbook', label: 'Logbook', icon: <LogbookIcon className="text-things-logbook" /> },
  ]

  const standaloneProjects = projects.filter(
    (p) => !p.areaId && p.status === 'open'
  )

  const dropMove = (target: {
    projectId?: string | null
    areaId?: string | null
  }) => {
    if (draggingTaskId) moveTask(draggingTaskId, target)
  }

  return (
    <div className="w-[260px] shrink-0 bg-sidebar h-full flex flex-col select-none border-r border-divider">
      <div className="h-11 shrink-0 flex items-center gap-1 px-3 pt-1" data-tauri-drag>
        <div className="flex gap-1.5 ml-1">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-2.5 pb-3">
        <div className="space-y-[1px]">
          {fixed.map((f) => (
            <SideRow
              key={f.id}
              icon={f.icon}
              label={f.label}
              count={f.count}
              active={view.kind === 'list' && view.id === f.id}
              onClick={() => setView({ kind: 'list', id: f.id })}
              onDropTask={
                f.id === 'inbox'
                  ? () => dropMove({ projectId: null, areaId: null })
                  : f.id === 'today'
                    ? () => draggingTaskId && useStore.getState().updateTask(draggingTaskId, { when: 'today' })
                    : f.id === 'someday'
                      ? () => draggingTaskId && useStore.getState().updateTask(draggingTaskId, { when: 'someday' })
                      : undefined
              }
            />
          ))}
        </div>

        {(areas.length > 0 || standaloneProjects.length > 0) && (
          <div className="my-3 border-t border-divider mx-1" />
        )}

        <div className="space-y-[1px]">
          {[...areas]
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((a) => {
              const areaProjects = projects.filter(
                (p) => p.areaId === a.id && p.status === 'open'
              )
              const collapsed = a.collapsed
              return (
                <div key={a.id}>
                  <div className="flex items-center group">
                    <button
                      onClick={() => toggleAreaCollapsed(a.id)}
                      className="p-1 text-tertiary hover:text-secondary"
                    >
                      <ChevronIcon
                        size={12}
                        className={collapsed ? '' : 'rotate-90'}
                      />
                    </button>
                    <button
                      onClick={() => setView({ kind: 'area', id: a.id })}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => dropMove({ areaId: a.id, projectId: null })}
                      className={[
                        'flex-1 flex items-center gap-2 pr-2 py-[5px] rounded-[7px] text-[13px] font-semibold tracking-wide uppercase transition-colors',
                        view.kind === 'area' && view.id === a.id
                          ? 'text-[var(--accent)]'
                          : 'text-secondary hover:text-primary',
                      ].join(' ')}
                    >
                      <AreaIcon size={14} />
                      <span className="truncate">{a.title || 'New Area'}</span>
                    </button>
                  </div>
                  {!collapsed &&
                    areaProjects.map((p) => (
                      <SideRow
                        key={p.id}
                        indent
                        icon={
                          <ProgressPie
                            progress={projectProgress(d, p.id)}
                            active={view.kind === 'project' && view.id === p.id}
                          />
                        }
                        label={p.title || 'New Project'}
                        active={view.kind === 'project' && view.id === p.id}
                        onClick={() => setView({ kind: 'project', id: p.id })}
                        onDropTask={() => dropMove({ projectId: p.id })}
                      />
                    ))}
                </div>
              )
            })}

          {standaloneProjects.map((p) => (
            <SideRow
              key={p.id}
              icon={
                <ProgressPie
                  progress={projectProgress(d, p.id)}
                  active={view.kind === 'project' && view.id === p.id}
                />
              }
              label={p.title || 'New Project'}
              active={view.kind === 'project' && view.id === p.id}
              onClick={() => setView({ kind: 'project', id: p.id })}
              onDropTask={() => dropMove({ projectId: p.id })}
            />
          ))}
        </div>
      </div>

      <div className="shrink-0 px-2.5 py-2 border-t border-divider flex items-center gap-1">
        <button
          onClick={() => setQuickFind(true)}
          title="Quick Find (⌘K)"
          className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-[7px] text-[13px] text-secondary hover:bg-[var(--bg-hover)] transition-colors"
        >
          <SearchIcon size={15} />
          <span>Quick Find</span>
        </button>
        <button
          onClick={() => setView({ kind: 'list', id: 'trash' })}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => draggingTaskId && useStore.getState().trashTask(draggingTaskId)}
          title="Trash"
          className={[
            'p-2 rounded-[7px] transition-colors',
            view.kind === 'list' && view.id === 'trash'
              ? 'bg-[var(--accent)] text-white'
              : 'text-secondary hover:bg-[var(--bg-hover)]',
          ].join(' ')}
        >
          <TrashIcon size={16} />
          {trashCount > 0 && (
            <span className="sr-only">{trashCount}</span>
          )}
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          className="p-2 rounded-[7px] text-secondary hover:bg-[var(--bg-hover)] transition-colors"
        >
          <GearIcon size={16} />
        </button>
      </div>
    </div>
  )
}
