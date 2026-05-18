import { useMemo, useState } from 'react'
import { Popover } from './Popover'
import { MiniCalendar } from './MiniCalendar'
import { useStore } from '../store/store'
import { describeRepeat } from '../lib/dates'
import type { Task, RepeatRule, RepeatUnit } from '../types'
import {
  StarIcon,
  MoonIcon,
  BoxIcon,
  CloseIcon,
  CalendarIcon,
  InboxIcon,
  ProjectIcon,
  AreaIcon,
  RepeatIcon,
  CheckIcon,
} from './icons'

function Row({
  icon,
  label,
  onClick,
  tint,
  danger,
  active,
}: {
  icon?: React.ReactNode
  label: string
  onClick: () => void
  tint?: string
  danger?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-[7px] rounded-md hover:bg-[var(--bg-hover)] text-left transition-colors"
    >
      <span
        className="w-[18px] flex justify-center"
        style={{ color: tint || (danger ? '#FF5C5C' : 'var(--text-secondary)') }}
      >
        {icon}
      </span>
      <span className={danger ? 'text-[#FF5C5C]' : 'text-primary'}>{label}</span>
      {active && <CheckIcon size={15} className="ml-auto text-[var(--accent)]" />}
    </button>
  )
}

const Divider = () => <div className="my-1 border-t border-divider" />

export function WhenPopover({
  task,
  anchor,
  open,
  onClose,
}: {
  task: Task
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const updateTask = useStore((s) => s.updateTask)
  const set = (when: Task['when']) => {
    updateTask(task.id, { when })
    onClose()
  }
  return (
    <Popover anchor={anchor} open={open} onClose={onClose} width={264}>
      <div className="p-1.5">
        <Row icon={<StarIcon size={17} />} tint="#FFC107" label="Today" active={task.when === 'today'} onClick={() => set('today')} />
        <Row icon={<MoonIcon size={15} />} tint="#5b6b8c" label="This Evening" active={task.when === 'evening'} onClick={() => set('evening')} />
        <Divider />
        <MiniCalendar value={typeof task.when === 'string' && task.when.includes('-') ? task.when : null} onSelect={(iso) => set(iso)} />
        <Divider />
        <Row icon={<BoxIcon size={17} />} tint="#C9A66B" label="Someday" active={task.when === 'someday'} onClick={() => set('someday')} />
        {task.when !== null && (
          <>
            <Divider />
            <Row icon={<CloseIcon size={15} />} label="Clear" onClick={() => set(null)} />
          </>
        )}
      </div>
    </Popover>
  )
}

export function DeadlinePopover({
  task,
  anchor,
  open,
  onClose,
}: {
  task: Task
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const updateTask = useStore((s) => s.updateTask)
  return (
    <Popover anchor={anchor} open={open} onClose={onClose} width={264}>
      <div className="p-1.5">
        <div className="px-3 pt-1.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-tertiary flex items-center gap-1.5">
          <CalendarIcon size={13} /> Deadline
        </div>
        <MiniCalendar
          value={task.deadline}
          onSelect={(iso) => {
            updateTask(task.id, { deadline: iso })
            onClose()
          }}
        />
        {task.deadline && (
          <>
            <Divider />
            <Row
              icon={<CloseIcon size={15} />}
              label="Clear Deadline"
              onClick={() => {
                updateTask(task.id, { deadline: null })
                onClose()
              }}
            />
          </>
        )}
      </div>
    </Popover>
  )
}

export function TagsPopover({
  task,
  anchor,
  open,
  onClose,
}: {
  task: Task
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const tags = useStore((s) => s.tags)
  const createTag = useStore((s) => s.createTag)
  const updateTask = useStore((s) => s.updateTask)
  const [q, setQ] = useState('')

  const filtered = tags.filter((t) => t.name.toLowerCase().includes(q.toLowerCase()))
  const exact = tags.some((t) => t.name.toLowerCase() === q.trim().toLowerCase())

  const toggle = (tagId: string) => {
    const has = task.tags.includes(tagId)
    updateTask(task.id, {
      tags: has ? task.tags.filter((x) => x !== tagId) : [...task.tags, tagId],
    })
  }

  return (
    <Popover anchor={anchor} open={open} onClose={onClose} width={244}>
      <div className="p-1.5">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && q.trim() && !exact) {
              const t = createTag(q.trim())
              toggle(t.id)
              setQ('')
            }
          }}
          placeholder="Search or create tag…"
          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] outline-none text-primary placeholder:text-tertiary"
        />
        <Divider />
        <div className="max-h-56 overflow-y-auto scroll-area">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md hover:bg-[var(--bg-hover)] text-left"
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
              <span className="text-primary">{t.name}</span>
              {task.tags.includes(t.id) && (
                <CheckIcon size={15} className="ml-auto text-[var(--accent)]" />
              )}
            </button>
          ))}
          {q.trim() && !exact && (
            <button
              onClick={() => {
                const t = createTag(q.trim())
                toggle(t.id)
                setQ('')
              }}
              className="w-full flex items-center gap-2 px-2.5 py-[7px] rounded-md hover:bg-[var(--bg-hover)] text-left text-secondary"
            >
              Create <span className="text-primary font-medium">“{q.trim()}”</span>
            </button>
          )}
          {filtered.length === 0 && !q.trim() && (
            <div className="px-2.5 py-2 text-tertiary text-[12px]">No tags yet</div>
          )}
        </div>
      </div>
    </Popover>
  )
}

export function MovePopover({
  task,
  anchor,
  open,
  onClose,
}: {
  task: Task
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const moveTask = useStore((s) => s.moveTask)
  const [q, setQ] = useState('')

  const items = useMemo(() => {
    const list: { label: string; icon: React.ReactNode; on: () => void; key: string }[] = []
    list.push({
      key: 'inbox',
      label: 'Inbox',
      icon: <InboxIcon size={16} />,
      on: () => moveTask(task.id, {}),
    })
    for (const a of areas) {
      list.push({
        key: 'a' + a.id,
        label: a.title || 'New Area',
        icon: <AreaIcon size={15} className="text-[var(--accent)]" />,
        on: () => moveTask(task.id, { areaId: a.id }),
      })
      for (const p of projects.filter((p) => p.areaId === a.id && p.status === 'open')) {
        list.push({
          key: 'p' + p.id,
          label: '  ' + (p.title || 'New Project'),
          icon: <ProjectIcon size={15} className="text-[var(--accent)]" />,
          on: () => moveTask(task.id, { projectId: p.id }),
        })
      }
    }
    for (const p of projects.filter((p) => !p.areaId && p.status === 'open')) {
      list.push({
        key: 'p' + p.id,
        label: p.title || 'New Project',
        icon: <ProjectIcon size={15} className="text-[var(--accent)]" />,
        on: () => moveTask(task.id, { projectId: p.id }),
      })
    }
    return list.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
  }, [projects, areas, q, task.id, moveTask])

  return (
    <Popover anchor={anchor} open={open} onClose={onClose} width={250}>
      <div className="p-1.5">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Move to…"
          className="w-full bg-transparent px-2.5 py-1.5 text-[13px] outline-none text-primary placeholder:text-tertiary"
        />
        <Divider />
        <div className="max-h-64 overflow-y-auto scroll-area">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={() => {
                i.on()
                onClose()
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md hover:bg-[var(--bg-hover)] text-left"
            >
              <span className="w-[18px] flex justify-center text-secondary">{i.icon}</span>
              <span className="text-primary whitespace-pre">{i.label}</span>
            </button>
          ))}
          {items.length === 0 && (
            <div className="px-2.5 py-2 text-tertiary text-[12px]">No matches</div>
          )}
        </div>
      </div>
    </Popover>
  )
}

export function RepeatPopover({
  task,
  anchor,
  open,
  onClose,
}: {
  task: Task
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
}) {
  const updateTask = useStore((s) => s.updateTask)
  const [interval, setInterval] = useState(task.repeatRule?.interval ?? 1)
  const [unit, setUnit] = useState<RepeatUnit>(task.repeatRule?.unit ?? 'week')

  const apply = (rule: RepeatRule | null) => {
    const patch: Partial<Task> = { repeatRule: rule }
    if (rule && task.when === null) patch.when = 'today'
    updateTask(task.id, patch)
    onClose()
  }

  const presets: RepeatRule[] = [
    { unit: 'day', interval: 1 },
    { unit: 'week', interval: 1 },
    { unit: 'month', interval: 1 },
    { unit: 'year', interval: 1 },
  ]

  return (
    <Popover anchor={anchor} open={open} onClose={onClose} width={244}>
      <div className="p-1.5">
        <div className="px-3 pt-1.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-tertiary flex items-center gap-1.5">
          <RepeatIcon size={13} /> Repeat
        </div>
        {presets.map((p) => (
          <Row
            key={p.unit}
            label={describeRepeat(p)}
            active={
              task.repeatRule?.unit === p.unit && task.repeatRule?.interval === p.interval
            }
            onClick={() => apply(p)}
          />
        ))}
        <Divider />
        <div className="flex items-center gap-2 px-3 py-1.5 text-[13px]">
          <span className="text-secondary">Every</span>
          <input
            type="number"
            min={1}
            value={interval}
            onChange={(e) => setInterval(Math.max(1, +e.target.value))}
            className="w-12 field-bg rounded px-1.5 py-1 text-center outline-none text-primary"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as RepeatUnit)}
            className="field-bg rounded px-1.5 py-1 outline-none text-primary"
          >
            <option value="day">days</option>
            <option value="week">weeks</option>
            <option value="month">months</option>
            <option value="year">years</option>
          </select>
        </div>
        <button
          onClick={() => apply({ unit, interval })}
          className="w-full mx-0 mt-0.5 px-3 py-1.5 rounded-md bg-[var(--accent)] text-white text-[12.5px] font-medium"
        >
          Set Custom Repeat
        </button>
        {task.repeatRule && (
          <>
            <Divider />
            <Row icon={<CloseIcon size={15} />} label="Stop Repeating" danger onClick={() => apply(null)} />
          </>
        )}
      </div>
    </Popover>
  )
}
