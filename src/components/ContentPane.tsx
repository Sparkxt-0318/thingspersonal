import { useStore } from '../store/store'
import { TaskList } from './TaskList'
import { EmptyState } from './EmptyState'
import { ProgressPie } from './ProgressPie'
import {
  InboxIcon,
  StarIcon,
  CalendarIcon,
  LayersIcon,
  BoxIcon,
  LogbookIcon,
  TrashIcon,
  ProjectIcon,
  FlagIcon,
  PlusIcon,
} from './icons'
import {
  inboxTasks,
  todayGroups,
  upcomingGroups,
  anytimeGroups,
  somedayGroups,
  logbookGroups,
  projectGroups,
  projectProgress,
  areaContent,
} from '../store/selectors'
import { deadlineCountdown } from '../lib/dates'
import { useRef, useState } from 'react'
import { Popover } from './Popover'
import { MiniCalendar } from './MiniCalendar'

function Header({
  icon,
  title,
  count,
  children,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  count?: number
  children?: React.ReactNode
}) {
  return (
    <div className="px-9 pt-8 pb-2">
      <div className="flex items-center gap-3">
        {icon && <span className="[&>svg]:w-7 [&>svg]:h-7">{icon}</span>}
        <h1 className="text-[26px] font-bold text-primary tracking-tight">
          {title}
        </h1>
        {count != null && count > 0 && (
          <span className="text-[20px] text-tertiary font-semibold tabular-nums ml-1">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function InboxView() {
  const d = useStoreData()
  const list = inboxTasks(d)
  return (
    <>
      <Header icon={<InboxIcon className="text-things-inbox" />} title="Inbox" />
      <div className="pt-2">
        {list.length === 0 ? (
          <EmptyState
            icon={<InboxIcon />}
            title="Inbox Empty"
            subtitle="Capture anything that pops into your head — press ⌘N."
          />
        ) : (
          <TaskList groups={[{ key: 'inbox', tasks: list }]} />
        )}
      </div>
    </>
  )
}

function TodayView() {
  const d = useStoreData()
  const groups = todayGroups(d)
  const total = groups.reduce((n, g) => n + g.tasks.length, 0)
  return (
    <>
      <Header icon={<StarIcon className="text-things-today" />} title="Today" />
      <div className="pt-2">
        {total === 0 ? (
          <EmptyState
            icon={<StarIcon />}
            title="Nothing scheduled for today"
            subtitle="Add a to-do or drag one here to plan your day."
          />
        ) : (
          <TaskList groups={groups} showProject showWhen={false} />
        )}
      </div>
    </>
  )
}

function UpcomingView() {
  const d = useStoreData()
  const groups = upcomingGroups(d)
  return (
    <>
      <Header
        icon={<CalendarIcon className="text-things-upcoming" />}
        title="Upcoming"
      />
      <div className="pt-2">
        {groups.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon />}
            title="Nothing upcoming"
            subtitle="Schedule to-dos for future dates and they'll appear here."
          />
        ) : (
          <TaskList groups={groups} showProject showWhen={false} />
        )}
      </div>
    </>
  )
}

function AnytimeView() {
  const d = useStoreData()
  const groups = anytimeGroups(d)
  return (
    <>
      <Header
        icon={<LayersIcon className="text-things-anytime" />}
        title="Anytime"
      />
      <div className="pt-2">
        {groups.length === 0 ? (
          <EmptyState icon={<LayersIcon />} title="Nothing here yet" />
        ) : (
          <TaskList groups={groups} showProject />
        )}
      </div>
    </>
  )
}

function SomedayView() {
  const d = useStoreData()
  const groups = somedayGroups(d)
  return (
    <>
      <Header icon={<BoxIcon className="text-things-someday" />} title="Someday" />
      <div className="pt-2">
        {groups.length === 0 ? (
          <EmptyState
            icon={<BoxIcon />}
            title="Someday"
            subtitle="Ideas and things you might want to do one day."
          />
        ) : (
          <TaskList groups={groups} showProject />
        )}
      </div>
    </>
  )
}

function LogbookView() {
  const d = useStoreData()
  const groups = logbookGroups(d)
  return (
    <>
      <Header
        icon={<LogbookIcon className="text-things-logbook" />}
        title="Logbook"
      />
      <div className="pt-2">
        {groups.length === 0 ? (
          <EmptyState
            icon={<LogbookIcon />}
            title="No completed to-dos yet"
            subtitle="Things you finish will be collected here."
          />
        ) : (
          <TaskList groups={groups} showProject showWhen={false} />
        )}
      </div>
    </>
  )
}

function TrashView() {
  const tasks = useStore((s) => s.tasks)
  const restoreTask = useStore((s) => s.restoreTask)
  const deleteTaskForever = useStore((s) => s.deleteTaskForever)
  const trashed = tasks.filter((t) => t.status === 'trashed')
  return (
    <>
      <Header icon={<TrashIcon className="text-secondary" />} title="Trash" />
      <div className="pt-2">
        {trashed.length === 0 ? (
          <EmptyState icon={<TrashIcon />} title="Trash is empty" />
        ) : (
          <>
            <div className="px-9 pb-2">
              <button
                onClick={() => trashed.forEach((t) => deleteTaskForever(t.id))}
                className="text-[13px] text-[#FF5C5C] hover:underline"
              >
                Empty Trash ({trashed.length})
              </button>
            </div>
            {trashed.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-3 px-5 py-2 mx-1.5 rounded-[7px] hover:bg-[var(--bg-hover)]"
              >
                <span className="flex-1 text-[15px] text-tertiary line-through truncate">
                  {t.title || 'Untitled'}
                </span>
                <button
                  onClick={() => restoreTask(t.id)}
                  className="text-[12px] text-secondary hover:text-[var(--accent)] opacity-0 group-hover:opacity-100"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteTaskForever(t.id)}
                  className="text-[12px] text-secondary hover:text-[#FF5C5C] opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}

function ProjectView({ projectId }: { projectId: string }) {
  const d = useStoreData()
  const projects = useStore((s) => s.projects)
  const updateProject = useStore((s) => s.updateProject)
  const createHeading = useStore((s) => s.createHeading)
  const project = projects.find((p) => p.id === projectId)
  const dlRef = useRef<HTMLButtonElement>(null)
  const [dlOpen, setDlOpen] = useState(false)

  if (!project) return null
  const groups = projectGroups(d, projectId)
  const progress = projectProgress(d, projectId)
  const dl = project.deadline ? deadlineCountdown(project.deadline) : null

  return (
    <>
      <div className="px-9 pt-8 pb-2">
        <div className="flex items-center gap-3">
          <ProgressPie progress={progress} size={24} />
          <input
            value={project.title}
            placeholder="New Project"
            onChange={(e) => updateProject(projectId, { title: e.target.value })}
            className="text-[26px] font-bold text-primary tracking-tight bg-transparent outline-none flex-1 placeholder:text-tertiary"
          />
          <button
            ref={dlRef}
            onClick={() => setDlOpen(true)}
            className="flex items-center gap-1.5 text-[13px] text-secondary hover:text-[var(--accent)] px-2 py-1 rounded-md hover:bg-[var(--bg-hover)]"
          >
            <FlagIcon size={15} />
            {dl ? (
              <span style={{ color: dl.overdue ? '#FF5C5C' : undefined }}>
                {dl.label}
              </span>
            ) : (
              'Deadline'
            )}
          </button>
        </div>
        <textarea
          value={project.notes}
          placeholder="Notes"
          onChange={(e) => updateProject(projectId, { notes: e.target.value })}
          ref={(el) => {
            if (el) {
              el.style.height = 'auto'
              el.style.height = el.scrollHeight + 'px'
            }
          }}
          className="w-full bg-transparent outline-none resize-none text-[14px] text-secondary mt-2 ml-9 placeholder:text-tertiary leading-relaxed"
        />
        <div className="ml-9 mt-2">
          <button
            onClick={() => createHeading(projectId, '')}
            className="inline-flex items-center gap-1 text-[12.5px] text-secondary hover:text-[var(--accent)]"
          >
            <PlusIcon size={13} /> Add Heading
          </button>
        </div>
      </div>
      <div className="pt-1">
        {groups.every((g) => g.tasks.length === 0) ? (
          <EmptyState
            icon={<ProjectIcon />}
            title="No to-dos yet"
            subtitle="Break this project down into actionable steps."
          />
        ) : (
          <ProjectGroups projectId={projectId} />
        )}
      </div>
      <Popover
        anchor={dlRef.current}
        open={dlOpen}
        onClose={() => setDlOpen(false)}
        width={264}
        align="right"
      >
        <div className="p-1.5">
          <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-tertiary flex items-center gap-1.5">
            <FlagIcon size={13} /> Deadline
          </div>
          <MiniCalendar
            value={project.deadline}
            onSelect={(iso) => {
              updateProject(projectId, { deadline: iso })
              setDlOpen(false)
            }}
          />
          {project.deadline && (
            <>
              <div className="my-1 border-t border-divider" />
              <button
                onClick={() => {
                  updateProject(projectId, { deadline: null })
                  setDlOpen(false)
                }}
                className="w-full text-left px-3 py-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[13px] text-primary"
              >
                Clear Deadline
              </button>
            </>
          )}
        </div>
      </Popover>
    </>
  )
}

function ProjectGroups({ projectId }: { projectId: string }) {
  const d = useStoreData()
  const headings = useStore((s) => s.headings)
  const updateHeading = useStore((s) => s.updateHeading)
  const deleteHeading = useStore((s) => s.deleteHeading)
  const groups = projectGroups(d, projectId)

  return (
    <div>
      {groups.map((g) => {
        if (g.kind === 'heading') {
          const h = headings.find((x) => x.id === g.key.replace('h:', ''))
          return (
            <div key={g.key} className="mb-1">
              <div className="px-9 mt-6 mb-1 flex items-center gap-2 group/h">
                <input
                  value={h?.title ?? ''}
                  placeholder="New Heading"
                  onChange={(e) =>
                    h && updateHeading(h.id, { title: e.target.value })
                  }
                  className="text-[15px] font-bold text-primary bg-transparent outline-none border-b border-divider pb-1 flex-1 placeholder:text-tertiary placeholder:font-normal"
                />
                <button
                  onClick={() => h && deleteHeading(h.id)}
                  className="opacity-0 group-hover/h:opacity-100 text-tertiary hover:text-[#FF5C5C] text-[12px]"
                >
                  Remove
                </button>
              </div>
              <TaskList groups={[{ ...g, title: undefined }]} showWhen />
            </div>
          )
        }
        if (g.tasks.length === 0) return null
        return (
          <div key={g.key} className="mb-1">
            {g.kind === 'completed' && (
              <div className="px-9 mt-6 mb-1 text-[13px] font-semibold text-tertiary uppercase tracking-wide">
                Logbook
              </div>
            )}
            <TaskList groups={[{ ...g, title: undefined }]} showWhen />
          </div>
        )
      })}
    </div>
  )
}

function AreaView({ areaId }: { areaId: string }) {
  const d = useStoreData()
  const areas = useStore((s) => s.areas)
  const updateArea = useStore((s) => s.updateArea)
  const setView = useStore((s) => s.setView)
  const createProject = useStore((s) => s.createProject)
  const area = areas.find((a) => a.id === areaId)
  if (!area) return null
  const { projects, looseGroups } = areaContent(d, areaId)

  return (
    <>
      <div className="px-9 pt-8 pb-2">
        <input
          value={area.title}
          placeholder="New Area"
          onChange={(e) => updateArea(areaId, { title: e.target.value })}
          className="text-[26px] font-bold text-primary tracking-tight bg-transparent outline-none w-full placeholder:text-tertiary"
        />
      </div>
      <div className="pt-2">
        {projects.length > 0 && (
          <div className="px-6 mb-3 flex flex-wrap gap-2">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setView({ kind: 'project', id: p.id })}
                className="flex items-center gap-2 px-3 py-2 rounded-lg field-bg hover:bg-[var(--bg-hover)] text-[14px] text-primary"
              >
                <ProgressPie progress={projectProgress(d, p.id)} />
                {p.title || 'New Project'}
              </button>
            ))}
          </div>
        )}
        {looseGroups.length > 0 ? (
          <TaskList groups={looseGroups} showWhen />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<ProjectIcon />}
            title="Empty Area"
            subtitle="Add projects or to-dos to organize this area."
          />
        ) : null}
        <div className="px-9 mt-4">
          <button
            onClick={() => createProject({ areaId })}
            className="inline-flex items-center gap-1 text-[13px] text-secondary hover:text-[var(--accent)]"
          >
            <PlusIcon size={14} /> New Project
          </button>
        </div>
      </div>
    </>
  )
}

function useStoreData() {
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const headings = useStore((s) => s.headings)
  return { tasks, projects, areas, headings }
}

export function ContentPane() {
  const view = useStore((s) => s.view)
  const expand = useStore((s) => s.expand)

  let content: React.ReactNode = null
  if (view.kind === 'list') {
    content =
      view.id === 'inbox' ? (
        <InboxView />
      ) : view.id === 'today' ? (
        <TodayView />
      ) : view.id === 'upcoming' ? (
        <UpcomingView />
      ) : view.id === 'anytime' ? (
        <AnytimeView />
      ) : view.id === 'someday' ? (
        <SomedayView />
      ) : view.id === 'logbook' ? (
        <LogbookView />
      ) : (
        <TrashView />
      )
  } else if (view.kind === 'project') {
    content = <ProjectView projectId={view.id} />
  } else if (view.kind === 'area') {
    content = <AreaView areaId={view.id} />
  }

  return (
    <div
      className="flex-1 h-full overflow-y-auto scroll-area bg-content"
      onClick={() => expand(null)}
    >
      <div className="max-w-[760px] mx-auto pb-40 min-h-full">{content}</div>
    </div>
  )
}
