import { db } from './database'
import { uid } from '../lib/id'
import { toISODate } from '../lib/dates'
import { addDays } from 'date-fns'
import type { Task, Project, Heading, Area, Tag } from '../types'

export async function seedIfEmpty(): Promise<void> {
  const now = Date.now()
  let order = 0
  const next = () => (order += 100)

  const tags: Tag[] = [
    { id: uid(), name: 'Home', color: '#FF9F40' },
    { id: uid(), name: 'Work', color: '#2B7FFF' },
    { id: uid(), name: 'Errand', color: '#1FB6B6' },
  ]

  const personalArea: Area = { id: uid(), title: 'Personal', tags: [], sortOrder: next() }
  const workArea: Area = { id: uid(), title: 'Work', tags: [], sortOrder: next() }

  const websiteProject: Project = {
    id: uid(),
    title: 'Launch Personal Website',
    notes: 'Ship the new portfolio site before the end of the month.',
    areaId: workArea.id,
    status: 'open',
    when: null,
    deadline: toISODate(addDays(new Date(), 12)),
    tags: [tags[1].id],
    sortOrder: next(),
    createdAt: now,
    completedAt: null,
  }

  const tripProject: Project = {
    id: uid(),
    title: 'Weekend Trip',
    notes: '',
    areaId: personalArea.id,
    status: 'open',
    when: null,
    deadline: null,
    tags: [],
    sortOrder: next(),
    createdAt: now,
    completedAt: null,
  }

  const designHeading: Heading = {
    id: uid(),
    title: 'Design',
    projectId: websiteProject.id,
    sortOrder: next(),
  }
  const devHeading: Heading = {
    id: uid(),
    title: 'Development',
    projectId: websiteProject.id,
    sortOrder: next(),
  }

  const mk = (t: Partial<Task> & { title: string }): Task => ({
    id: uid(),
    title: t.title,
    notes: t.notes ?? '',
    checklist: t.checklist ?? [],
    status: t.status ?? 'open',
    when: t.when ?? null,
    deadline: t.deadline ?? null,
    tags: t.tags ?? [],
    projectId: t.projectId ?? null,
    areaId: t.areaId ?? null,
    headingId: t.headingId ?? null,
    createdAt: now,
    completedAt: t.completedAt ?? null,
    sortOrder: t.sortOrder ?? next(),
    repeatRule: t.repeatRule ?? null,
  })

  const tasks: Task[] = [
    mk({ title: 'Welcome to Things 👋 — click me to expand', notes: 'This is your personal task manager.\n\nClick a task to edit it inline. Use the blue + button or press ⌘N to add a new one. Press ⌘K to search.', when: 'today' }),
    mk({ title: 'Try checking me off', when: 'today' }),
    mk({ title: 'Buy groceries', when: 'today', tags: [tags[2].id], checklist: [
      { id: uid(), title: 'Milk', done: false },
      { id: uid(), title: 'Coffee beans', done: true },
      { id: uid(), title: 'Bread', done: false },
    ] }),
    mk({ title: 'Call the dentist', when: 'evening', tags: [tags[0].id] }),
    mk({ title: 'Read for 20 minutes', when: 'evening' }),
    mk({ title: 'Quick capture idea — sitting in the Inbox' }),
    mk({ title: 'Plan Q3 roadmap', deadline: toISODate(addDays(new Date(), 5)), tags: [tags[1].id] }),
    mk({ title: 'Water the plants', when: 'someday', repeatRule: { unit: 'week', interval: 1 } }),
    mk({ title: 'Renew passport', when: 'someday' }),
    mk({ title: 'Pick a color palette', projectId: websiteProject.id, headingId: designHeading.id, tags: [tags[1].id] }),
    mk({ title: 'Design the landing page', projectId: websiteProject.id, headingId: designHeading.id }),
    mk({ title: 'Set up the project repo', projectId: websiteProject.id, headingId: devHeading.id, status: 'completed', completedAt: now - 86400000 }),
    mk({ title: 'Build the hero section', projectId: websiteProject.id, headingId: devHeading.id }),
    mk({ title: 'Deploy to production', projectId: websiteProject.id, headingId: devHeading.id, when: toISODate(addDays(new Date(), 9)) }),
    mk({ title: 'Book a hotel', projectId: tripProject.id }),
    mk({ title: 'Make a packing list', projectId: tripProject.id }),
    mk({ title: 'Schedule dentist appointment', status: 'completed', completedAt: now - 3600_000 }),
    mk({ title: 'Submit expense report', status: 'completed', completedAt: now - 2 * 86400000, tags: [tags[1].id] }),
    mk({ title: 'Old idea I gave up on', status: 'canceled', completedAt: now - 3 * 86400000 }),
  ]

  await db.transaction(
    'rw',
    [db.tasks, db.projects, db.headings, db.areas, db.tags],
    async () => {
      // Atomic guard: bail if anything was seeded by a concurrent call.
      if ((await db.tasks.count()) > 0 || (await db.projects.count()) > 0) return
      await db.areas.bulkAdd([personalArea, workArea])
      await db.projects.bulkAdd([websiteProject, tripProject])
      await db.headings.bulkAdd([designHeading, devHeading])
      await db.tags.bulkAdd(tags)
      await db.tasks.bulkAdd(tasks)
    }
  )
}
