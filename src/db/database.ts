import Dexie, { type Table } from 'dexie'
import type { Task, Project, Heading, Area, Tag, Settings } from '../types'

export class ThingsDB extends Dexie {
  tasks!: Table<Task, string>
  projects!: Table<Project, string>
  headings!: Table<Heading, string>
  areas!: Table<Area, string>
  tags!: Table<Tag, string>
  settings!: Table<Settings, string>

  constructor() {
    super('things-personal')
    this.version(1).stores({
      tasks: 'id, status, when, projectId, areaId, headingId, sortOrder, completedAt',
      projects: 'id, status, areaId, sortOrder',
      headings: 'id, projectId, sortOrder',
      areas: 'id, sortOrder',
      tags: 'id, name',
      settings: 'id',
    })
  }
}

export const db = new ThingsDB()
