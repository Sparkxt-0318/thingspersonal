import { useStore } from '../store/store'
import {
  inboxTasks,
  todayGroups,
  upcomingGroups,
  anytimeGroups,
  somedayGroups,
  logbookGroups,
  projectGroups,
  areaContent,
} from '../store/selectors'

/** Flat, ordered list of task ids currently rendered for the active view. */
export function useVisibleTaskIds(): string[] {
  const view = useStore((s) => s.view)
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const headings = useStore((s) => s.headings)
  const d = { tasks, projects, areas, headings }

  if (view.kind === 'list') {
    if (view.id === 'inbox') return inboxTasks(d).map((t) => t.id)
    if (view.id === 'today')
      return todayGroups(d).flatMap((g) => g.tasks.map((t) => t.id))
    if (view.id === 'upcoming')
      return upcomingGroups(d).flatMap((g) => g.tasks.map((t) => t.id))
    if (view.id === 'anytime')
      return anytimeGroups(d).flatMap((g) => g.tasks.map((t) => t.id))
    if (view.id === 'someday')
      return somedayGroups(d).flatMap((g) => g.tasks.map((t) => t.id))
    if (view.id === 'logbook')
      return logbookGroups(d).flatMap((g) => g.tasks.map((t) => t.id))
    if (view.id === 'trash')
      return tasks.filter((t) => t.status === 'trashed').map((t) => t.id)
  }
  if (view.kind === 'project')
    return projectGroups(d, view.id).flatMap((g) => g.tasks.map((t) => t.id))
  if (view.kind === 'area')
    return areaContent(d, view.id).looseGroups.flatMap((g) =>
      g.tasks.map((t) => t.id)
    )
  return []
}
