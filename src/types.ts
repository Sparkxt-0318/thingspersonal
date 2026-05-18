export type TaskStatus = 'open' | 'completed' | 'canceled' | 'trashed'

/**
 * `when` semantics:
 *  - null         → no scheduled day (Inbox / Anytime depending on assignment)
 *  - 'today'      → shows in Today (Today group)
 *  - 'evening'    → shows in Today (This Evening group)
 *  - 'someday'    → Someday
 *  - ISO date     → scheduled for a specific calendar day (Upcoming)
 */
export type WhenValue = null | 'today' | 'evening' | 'someday' | string

export type RepeatUnit = 'day' | 'week' | 'month' | 'year'

export interface RepeatRule {
  unit: RepeatUnit
  /** every N units, e.g. every 3 days */
  interval: number
}

export interface ChecklistItem {
  id: string
  title: string
  done: boolean
}

export interface Task {
  id: string
  title: string
  notes: string
  checklist: ChecklistItem[]
  status: TaskStatus
  when: WhenValue
  deadline: string | null
  tags: string[]
  projectId?: string | null
  areaId?: string | null
  headingId?: string | null
  createdAt: number
  completedAt: number | null
  sortOrder: number
  repeatRule?: RepeatRule | null
}

export type ProjectStatus = 'open' | 'completed' | 'canceled' | 'trashed'

export interface Project {
  id: string
  title: string
  notes: string
  areaId?: string | null
  status: ProjectStatus
  when: WhenValue
  deadline: string | null
  tags: string[]
  sortOrder: number
  createdAt: number
  completedAt: number | null
}

export interface Heading {
  id: string
  title: string
  projectId: string
  sortOrder: number
}

export interface Area {
  id: string
  title: string
  tags: string[]
  sortOrder: number
  collapsed?: boolean
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface Settings {
  id: 'app'
  theme: 'light' | 'dark' | 'system'
}

export type FixedListId =
  | 'inbox'
  | 'today'
  | 'upcoming'
  | 'anytime'
  | 'someday'
  | 'logbook'
  | 'trash'

export type ViewRef =
  | { kind: 'list'; id: FixedListId }
  | { kind: 'project'; id: string }
  | { kind: 'area'; id: string }
