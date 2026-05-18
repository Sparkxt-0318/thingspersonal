import type { Task, Project, Area, Heading } from '../types'
import { todayISO, isISODate, parseDate, monthTitle, dayLabel } from '../lib/dates'
import { isToday, differenceInCalendarDays } from 'date-fns'

export interface TaskGroup {
  key: string
  title?: string
  subtitle?: string
  kind?: 'today' | 'evening' | 'heading' | 'project' | 'date' | 'plain' | 'completed'
  tasks: Task[]
}

interface Data {
  tasks: Task[]
  projects: Project[]
  areas: Area[]
  headings: Heading[]
}

const byOrder = (a: Task, b: Task) => a.sortOrder - b.sortOrder

function open(tasks: Task[]) {
  return tasks.filter((t) => t.status === 'open')
}

/** A scheduled ISO `when` that is today or in the past. */
function overdueScheduled(t: Task): boolean {
  return isISODate(t.when) && (t.when as string) <= todayISO()
}

export function inboxTasks(d: Data): Task[] {
  return open(d.tasks)
    .filter(
      (t) =>
        t.when === null &&
        !t.projectId &&
        !t.areaId
    )
    .sort(byOrder)
}

export function todayGroups(d: Data): TaskGroup[] {
  const o = open(d.tasks)
  const todayList = o
    .filter((t) => t.when === 'today' || overdueScheduled(t))
    .sort(byOrder)
  const evening = o.filter((t) => t.when === 'evening').sort(byOrder)
  const groups: TaskGroup[] = []
  groups.push({ key: 'today', kind: 'today', tasks: todayList })
  if (evening.length || todayList.length) {
    groups.push({ key: 'evening', kind: 'evening', title: 'This Evening', tasks: evening })
  }
  return groups
}

export function todayCount(d: Data): number {
  return open(d.tasks).filter(
    (t) => t.when === 'today' || t.when === 'evening' || overdueScheduled(t)
  ).length
}

export function upcomingGroups(d: Data): TaskGroup[] {
  const o = open(d.tasks)
  const today = todayISO()
  // Future scheduled tasks, or future deadlines.
  const entries = new Map<string, Task[]>()
  for (const t of o) {
    let date: string | null = null
    if (isISODate(t.when) && (t.when as string) > today) date = t.when as string
    else if (
      t.deadline &&
      isISODate(t.deadline) &&
      t.deadline > today &&
      !isISODate(t.when) &&
      t.when !== 'today' &&
      t.when !== 'evening'
    )
      date = t.deadline
    if (!date) continue
    if (!entries.has(date)) entries.set(date, [])
    entries.get(date)!.push(t)
  }
  const sortedDates = [...entries.keys()].sort()
  let lastMonth = ''
  const groups: TaskGroup[] = []
  for (const date of sortedDates) {
    const d2 = parseDate(date)
    const month = monthTitle(d2)
    const showMonth = month !== lastMonth
    lastMonth = month
    groups.push({
      key: date,
      kind: 'date',
      title: dayLabel(date),
      subtitle: showMonth ? month : undefined,
      tasks: entries.get(date)!.sort(byOrder),
    })
  }
  return groups
}

export function upcomingCount(d: Data): number {
  return upcomingGroups(d).reduce((n, g) => n + g.tasks.length, 0)
}

function projectLabel(d: Data, t: Task): string | undefined {
  if (t.projectId) return d.projects.find((p) => p.id === t.projectId)?.title
  if (t.areaId) return d.areas.find((a) => a.id === t.areaId)?.title
  return undefined
}

export function anytimeGroups(d: Data): TaskGroup[] {
  const o = open(d.tasks).filter(
    (t) =>
      t.when !== 'someday' &&
      !(isISODate(t.when) && (t.when as string) > todayISO())
  )
  // Group by project (open projects), then area-loose, then unassigned.
  const groups: TaskGroup[] = []
  const loose = o.filter((t) => !t.projectId && !t.areaId).sort(byOrder)
  if (loose.length) groups.push({ key: '_loose', kind: 'plain', tasks: loose })

  const openProjects = d.projects
    .filter((p) => p.status === 'open')
    .sort((a, b) => a.sortOrder - b.sortOrder)
  for (const p of openProjects) {
    const ts = o.filter((t) => t.projectId === p.id).sort(byOrder)
    if (ts.length)
      groups.push({ key: 'p:' + p.id, kind: 'project', title: p.title, tasks: ts })
  }
  for (const a of [...d.areas].sort((x, y) => x.sortOrder - y.sortOrder)) {
    const ts = o.filter((t) => !t.projectId && t.areaId === a.id).sort(byOrder)
    if (ts.length)
      groups.push({ key: 'a:' + a.id, kind: 'project', title: a.title, tasks: ts })
  }
  return groups
}

export function somedayGroups(d: Data): TaskGroup[] {
  const o = open(d.tasks).filter((t) => t.when === 'someday')
  const groups: TaskGroup[] = []
  const loose = o.filter((t) => !t.projectId && !t.areaId).sort(byOrder)
  if (loose.length) groups.push({ key: '_loose', kind: 'plain', tasks: loose })
  const openProjects = d.projects.sort((a, b) => a.sortOrder - b.sortOrder)
  for (const p of openProjects) {
    const ts = o.filter((t) => t.projectId === p.id).sort(byOrder)
    if (ts.length) groups.push({ key: 'p:' + p.id, kind: 'project', title: p.title, tasks: ts })
  }
  for (const a of d.areas) {
    const ts = o.filter((t) => !t.projectId && t.areaId === a.id).sort(byOrder)
    if (ts.length) groups.push({ key: 'a:' + a.id, kind: 'project', title: a.title, tasks: ts })
  }
  return groups
}

export function logbookGroups(d: Data): TaskGroup[] {
  const done = d.tasks
    .filter((t) => (t.status === 'completed' || t.status === 'canceled') && t.completedAt)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
  const map = new Map<string, Task[]>()
  for (const t of done) {
    const dt = new Date(t.completedAt!)
    const key = dt.toISOString().slice(0, 10)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  const groups: TaskGroup[] = []
  for (const [key, tasks] of map) {
    const dt = parseDate(key)
    let title: string
    if (isToday(dt)) title = 'Today'
    else {
      const diff = differenceInCalendarDays(new Date(), dt)
      title = diff === 1 ? 'Yesterday' : dayLabel(key)
    }
    groups.push({ key, kind: 'date', title, tasks })
  }
  return groups
}

export function projectGroups(d: Data, projectId: string): TaskGroup[] {
  const ts = d.tasks.filter((t) => t.projectId === projectId)
  const openTs = ts.filter((t) => t.status === 'open')
  const groups: TaskGroup[] = []

  const loose = openTs.filter((t) => !t.headingId).sort(byOrder)
  groups.push({ key: '_root', kind: 'plain', tasks: loose })

  const hs = d.headings
    .filter((h) => h.projectId === projectId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
  for (const h of hs) {
    const hts = openTs.filter((t) => t.headingId === h.id).sort(byOrder)
    groups.push({ key: 'h:' + h.id, kind: 'heading', title: h.title, tasks: hts })
  }

  const completed = ts
    .filter((t) => t.status === 'completed' || t.status === 'canceled')
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
  if (completed.length)
    groups.push({ key: '_done', kind: 'completed', title: 'Logbook', tasks: completed })

  return groups
}

export function projectProgress(d: Data, projectId: string): number {
  const ts = d.tasks.filter(
    (t) => t.projectId === projectId && t.status !== 'trashed'
  )
  if (ts.length === 0) return 0
  const done = ts.filter((t) => t.status === 'completed').length
  return done / ts.length
}

export interface AreaContent {
  projects: Project[]
  looseGroups: TaskGroup[]
}

export function areaContent(d: Data, areaId: string): AreaContent {
  const projects = d.projects
    .filter((p) => p.areaId === areaId && p.status === 'open')
    .sort((a, b) => a.sortOrder - b.sortOrder)
  const loose = open(d.tasks)
    .filter((t) => t.areaId === areaId && !t.projectId)
    .sort(byOrder)
  return {
    projects,
    looseGroups: loose.length ? [{ key: '_loose', kind: 'plain', tasks: loose }] : [],
  }
}

export { projectLabel }
