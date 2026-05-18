import { create } from 'zustand'
import { db } from '../db/database'
import { seedIfEmpty } from '../db/seed'
import { uid } from '../lib/id'
import { todayISO, nextOccurrence, isISODate, toISODate } from '../lib/dates'
import { addDays } from 'date-fns'
import type {
  Task,
  Project,
  Heading,
  Area,
  Tag,
  Settings,
  ViewRef,
  WhenValue,
} from '../types'

const PALETTE = [
  '#FF5C5C',
  '#FF9F40',
  '#FFC107',
  '#4CB782',
  '#1FB6B6',
  '#2B7FFF',
  '#8A6FE8',
  '#E86FB8',
]

/** Guards against React StrictMode double-invoking init() and racing the seed. */
let initPromise: Promise<void> | null = null

interface State {
  loaded: boolean
  tasks: Task[]
  projects: Project[]
  headings: Heading[]
  areas: Area[]
  tags: Tag[]
  settings: Settings

  view: ViewRef
  selectedTaskId: string | null
  expandedTaskId: string | null
  draggingId: string | null
  plusDragging: boolean
  quickFindOpen: boolean
  settingsOpen: boolean

  init: () => Promise<void>
  setView: (v: ViewRef) => void
  select: (id: string | null) => void
  expand: (id: string | null) => void
  setDragging: (id: string | null) => void
  setPlusDragging: (v: boolean) => void
  setQuickFind: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void

  createTask: (partial?: Partial<Task>, atTop?: boolean) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  completeTask: (id: string, status?: 'completed' | 'canceled') => void
  uncompleteTask: (id: string) => void
  trashTask: (id: string) => void
  restoreTask: (id: string) => void
  deleteTaskForever: (id: string) => void
  reorderTask: (id: string, newSortOrder: number) => void
  moveTask: (
    id: string,
    target: { projectId?: string | null; areaId?: string | null; headingId?: string | null }
  ) => void

  createProject: (partial?: Partial<Project>) => Project
  updateProject: (id: string, patch: Partial<Project>) => void
  trashProject: (id: string) => void

  createHeading: (projectId: string, title?: string) => Heading
  updateHeading: (id: string, patch: Partial<Heading>) => void
  deleteHeading: (id: string) => void

  createArea: (title?: string) => Area
  updateArea: (id: string, patch: Partial<Area>) => void
  deleteArea: (id: string) => void
  toggleAreaCollapsed: (id: string) => void

  createTag: (name: string) => Tag
  setTheme: (theme: Settings['theme']) => void

  exportData: () => Promise<string>
  importData: (json: string) => Promise<void>
  resetAll: () => Promise<void>
}

export const useStore = create<State>((set, get) => ({
  loaded: false,
  tasks: [],
  projects: [],
  headings: [],
  areas: [],
  tags: [],
  settings: { id: 'app', theme: 'system' },

  view: { kind: 'list', id: 'today' },
  selectedTaskId: null,
  expandedTaskId: null,
  draggingId: null,
  plusDragging: false,
  quickFindOpen: false,
  settingsOpen: false,

  init: async () => {
    if (initPromise) return initPromise
    initPromise = (async () => {
      await seedIfEmpty()
      const [tasks, projects, headings, areas, tags, settings] = await Promise.all([
        db.tasks.toArray(),
        db.projects.toArray(),
        db.headings.toArray(),
        db.areas.toArray(),
        db.tags.toArray(),
        db.settings.get('app'),
      ])
      set({
        tasks,
        projects,
        headings,
        areas,
        tags,
        settings: settings ?? { id: 'app', theme: 'system' },
        loaded: true,
      })
    })()
    return initPromise
  },

  setView: (v) => set({ view: v, selectedTaskId: null, expandedTaskId: null }),
  select: (id) => set({ selectedTaskId: id }),
  expand: (id) => {
    const prev = get().expandedTaskId
    if (prev && prev !== id) {
      const t = get().tasks.find((x) => x.id === prev)
      if (
        t &&
        t.status === 'open' &&
        t.title.trim() === '' &&
        t.notes.trim() === '' &&
        t.checklist.length === 0
      ) {
        set((s) => ({ tasks: s.tasks.filter((x) => x.id !== prev) }))
        db.tasks.delete(prev)
      }
    }
    set({ expandedTaskId: id, selectedTaskId: id ?? get().selectedTaskId })
  },
  setDragging: (id) => set({ draggingId: id }),
  setPlusDragging: (v) => set({ plusDragging: v }),
  setQuickFind: (open) => set({ quickFindOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),

  createTask: (partial = {}, atTop = true) => {
    const state = get()
    const view = state.view
    const base: Partial<Task> = {}
    if (view.kind === 'list') {
      if (view.id === 'today') base.when = 'today'
      else if (view.id === 'someday') base.when = 'someday'
      else if (view.id === 'upcoming')
        base.when = toISODate(addDays(new Date(), 1))
    } else if (view.kind === 'project') {
      base.projectId = view.id
    } else if (view.kind === 'area') {
      base.areaId = view.id
    }
    const orders = state.tasks.map((t) => t.sortOrder)
    const sortOrder = atTop
      ? (orders.length ? Math.min(...orders) : 0) - 100
      : (orders.length ? Math.max(...orders) : 0) + 100
    const task: Task = {
      id: uid(),
      title: '',
      notes: '',
      checklist: [],
      status: 'open',
      when: null,
      deadline: null,
      tags: [],
      projectId: null,
      areaId: null,
      headingId: null,
      createdAt: Date.now(),
      completedAt: null,
      sortOrder,
      repeatRule: null,
      ...base,
      ...partial,
    }
    set({ tasks: [...state.tasks, task], selectedTaskId: task.id, expandedTaskId: task.id })
    db.tasks.add(task)
    return task
  },

  updateTask: (id, patch) => {
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
    const t = get().tasks.find((x) => x.id === id)
    if (t) db.tasks.put(t)
  },

  completeTask: (id, status = 'completed') => {
    const t = get().tasks.find((x) => x.id === id)
    if (!t) return

    // Spawn next occurrence for repeating tasks.
    if (t.repeatRule && status === 'completed') {
      const anchor = isISODate(t.when) ? (t.when as string) : t.deadline && isISODate(t.deadline) ? t.deadline : todayISO()
      const nextWhen = nextOccurrence(anchor, t.repeatRule)
      const clone: Task = {
        ...t,
        id: uid(),
        status: 'open',
        when: nextWhen,
        completedAt: null,
        createdAt: Date.now(),
        checklist: t.checklist.map((c) => ({ ...c, id: uid(), done: false })),
        sortOrder: t.sortOrder + 1,
      }
      set((s) => ({ tasks: [...s.tasks, clone] }))
      db.tasks.add(clone)
    }

    get().updateTask(id, { status, completedAt: Date.now() })
  },

  uncompleteTask: (id) => {
    get().updateTask(id, { status: 'open', completedAt: null })
  },

  trashTask: (id) => {
    get().updateTask(id, { status: 'trashed' })
    if (get().expandedTaskId === id) set({ expandedTaskId: null })
  },

  restoreTask: (id) => get().updateTask(id, { status: 'open' }),

  deleteTaskForever: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
    db.tasks.delete(id)
  },

  reorderTask: (id, newSortOrder) => {
    get().updateTask(id, { sortOrder: newSortOrder })
  },

  moveTask: (id, target) => {
    get().updateTask(id, {
      projectId: target.projectId ?? null,
      areaId: target.areaId ?? null,
      headingId: target.headingId ?? null,
    })
  },

  createProject: (partial = {}) => {
    const state = get()
    const areaId = state.view.kind === 'area' ? state.view.id : partial.areaId ?? null
    const sortOrder =
      (state.projects.length ? Math.max(...state.projects.map((p) => p.sortOrder)) : 0) + 100
    const project: Project = {
      id: uid(),
      title: '',
      notes: '',
      areaId,
      status: 'open',
      when: null,
      deadline: null,
      tags: [],
      sortOrder,
      createdAt: Date.now(),
      completedAt: null,
      ...partial,
    }
    set({ projects: [...state.projects, project] })
    db.projects.add(project)
    set({ view: { kind: 'project', id: project.id } })
    return project
  },

  updateProject: (id, patch) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
    const p = get().projects.find((x) => x.id === id)
    if (p) db.projects.put(p)
  },

  trashProject: (id) => {
    get().updateProject(id, { status: 'trashed' })
    const s = get()
    s.tasks.filter((t) => t.projectId === id && t.status === 'open').forEach((t) => {
      get().updateTask(t.id, { status: 'trashed' })
    })
    if (s.view.kind === 'project' && s.view.id === id) {
      set({ view: { kind: 'list', id: 'today' } })
    }
  },

  createHeading: (projectId, title = '') => {
    const state = get()
    const sortOrder =
      (state.headings.length ? Math.max(...state.headings.map((h) => h.sortOrder)) : 0) + 100
    const heading: Heading = { id: uid(), title, projectId, sortOrder }
    set({ headings: [...state.headings, heading] })
    db.headings.add(heading)
    return heading
  },

  updateHeading: (id, patch) => {
    set((s) => ({
      headings: s.headings.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }))
    const h = get().headings.find((x) => x.id === id)
    if (h) db.headings.put(h)
  },

  deleteHeading: (id) => {
    set((s) => ({
      headings: s.headings.filter((h) => h.id !== id),
      tasks: s.tasks.map((t) => (t.headingId === id ? { ...t, headingId: null } : t)),
    }))
    db.headings.delete(id)
    get()
      .tasks.filter((t) => t.headingId === null)
      .forEach((t) => db.tasks.put(t))
  },

  createArea: (title = '') => {
    const state = get()
    const sortOrder =
      (state.areas.length ? Math.max(...state.areas.map((a) => a.sortOrder)) : 0) + 100
    const area: Area = { id: uid(), title, tags: [], sortOrder }
    set({ areas: [...state.areas, area] })
    db.areas.add(area)
    set({ view: { kind: 'area', id: area.id } })
    return area
  },

  updateArea: (id, patch) => {
    set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
    const a = get().areas.find((x) => x.id === id)
    if (a) db.areas.put(a)
  },

  deleteArea: (id) => {
    set((s) => ({
      areas: s.areas.filter((a) => a.id !== id),
      projects: s.projects.map((p) => (p.areaId === id ? { ...p, areaId: null } : p)),
      tasks: s.tasks.map((t) => (t.areaId === id ? { ...t, areaId: null } : t)),
    }))
    db.areas.delete(id)
    get().projects.filter((p) => p.areaId === null).forEach((p) => db.projects.put(p))
    if (get().view.kind === 'area' && get().view.id === id) {
      set({ view: { kind: 'list', id: 'today' } })
    }
  },

  toggleAreaCollapsed: (id) => {
    const a = get().areas.find((x) => x.id === id)
    if (a) get().updateArea(id, { collapsed: !a.collapsed })
  },

  createTag: (name) => {
    const existing = get().tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    const color = PALETTE[get().tags.length % PALETTE.length]
    const tag: Tag = { id: uid(), name, color }
    set((s) => ({ tags: [...s.tags, tag] }))
    db.tags.add(tag)
    return tag
  },

  setTheme: (theme) => {
    const settings = { ...get().settings, theme }
    set({ settings })
    db.settings.put(settings)
  },

  exportData: async () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: get().tasks,
      projects: get().projects,
      headings: get().headings,
      areas: get().areas,
      tags: get().tags,
      settings: get().settings,
    }
    return JSON.stringify(data, null, 2)
  },

  importData: async (json) => {
    const data = JSON.parse(json)
    await db.transaction(
      'rw',
      [db.tasks, db.projects, db.headings, db.areas, db.tags, db.settings],
      async () => {
        await Promise.all([
          db.tasks.clear(),
          db.projects.clear(),
          db.headings.clear(),
          db.areas.clear(),
          db.tags.clear(),
        ])
        if (data.tasks) await db.tasks.bulkAdd(data.tasks)
        if (data.projects) await db.projects.bulkAdd(data.projects)
        if (data.headings) await db.headings.bulkAdd(data.headings)
        if (data.areas) await db.areas.bulkAdd(data.areas)
        if (data.tags) await db.tags.bulkAdd(data.tags)
        if (data.settings) await db.settings.put(data.settings)
      }
    )
    initPromise = null
    await get().init()
  },

  resetAll: async () => {
    await db.transaction(
      'rw',
      [db.tasks, db.projects, db.headings, db.areas, db.tags, db.settings],
      async () => {
        await Promise.all([
          db.tasks.clear(),
          db.projects.clear(),
          db.headings.clear(),
          db.areas.clear(),
          db.tags.clear(),
          db.settings.clear(),
        ])
      }
    )
    set({ tasks: [], projects: [], headings: [], areas: [], tags: [] })
    initPromise = null
    await get().init()
  },
}))

export type { WhenValue }
