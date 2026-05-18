import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/store'
import { fuzzyScore } from '../lib/fuzzy'
import { StarIcon, ProjectIcon, AreaIcon, SearchIcon } from './icons'

interface Result {
  id: string
  label: string
  sub?: string
  icon: React.ReactNode
  go: () => void
  score: number
}

export function QuickFind() {
  const open = useStore((s) => s.quickFindOpen)
  const setOpen = useStore((s) => s.setQuickFind)
  const tasks = useStore((s) => s.tasks)
  const projects = useStore((s) => s.projects)
  const areas = useStore((s) => s.areas)
  const setView = useStore((s) => s.setView)
  const expand = useStore((s) => s.expand)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const results = useMemo<Result[]>(() => {
    if (!q.trim()) {
      return [
        ...projects
          .filter((p) => p.status === 'open')
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            label: p.title || 'New Project',
            sub: 'Project',
            icon: <ProjectIcon size={16} className="text-[var(--accent)]" />,
            go: () => setView({ kind: 'project', id: p.id }),
            score: 0,
          })),
      ]
    }
    const out: Result[] = []
    for (const t of tasks) {
      if (t.status === 'trashed') continue
      const s = fuzzyScore(q, t.title)
      if (s != null)
        out.push({
          id: t.id,
          label: t.title || 'Untitled',
          sub:
            t.status === 'completed'
              ? 'Logbook'
              : projects.find((p) => p.id === t.projectId)?.title || 'To-Do',
          icon: <StarIcon size={15} className="text-tertiary" />,
          score: s + 1,
          go: () => {
            if (t.status === 'completed' || t.status === 'canceled')
              setView({ kind: 'list', id: 'logbook' })
            else if (t.projectId)
              setView({ kind: 'project', id: t.projectId })
            else if (t.when === 'today' || t.when === 'evening')
              setView({ kind: 'list', id: 'today' })
            else setView({ kind: 'list', id: 'inbox' })
            setTimeout(() => expand(t.id), 60)
          },
        })
    }
    for (const p of projects) {
      const s = fuzzyScore(q, p.title)
      if (s != null)
        out.push({
          id: p.id,
          label: p.title || 'New Project',
          sub: 'Project',
          icon: <ProjectIcon size={16} className="text-[var(--accent)]" />,
          score: s + 3,
          go: () => setView({ kind: 'project', id: p.id }),
        })
    }
    for (const a of areas) {
      const s = fuzzyScore(q, a.title)
      if (s != null)
        out.push({
          id: a.id,
          label: a.title || 'New Area',
          sub: 'Area',
          icon: <AreaIcon size={15} className="text-[var(--accent)]" />,
          score: s + 3,
          go: () => setView({ kind: 'area', id: a.id }),
        })
    }
    return out.sort((a, b) => b.score - a.score).slice(0, 9)
  }, [q, tasks, projects, areas, setView, expand])

  useEffect(() => {
    if (sel >= results.length) setSel(0)
  }, [results, sel])

  if (!open) return null

  const choose = (r?: Result) => {
    const target = r ?? results[sel]
    if (target) {
      target.go()
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] flex items-start justify-center pt-[15vh] bg-black/20 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.96, y: -8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-[560px] max-w-[92vw] bg-elevated rounded-2xl overflow-hidden"
          style={{ boxShadow: 'var(--shadow-pop)' }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-divider">
            <SearchIcon size={18} className="text-tertiary" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSel((s) => Math.min(s + 1, results.length - 1))
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSel((s) => Math.max(s - 1, 0))
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  choose()
                } else if (e.key === 'Escape') {
                  setOpen(false)
                }
              }}
              placeholder="Quick Find"
              className="flex-1 bg-transparent outline-none text-[16px] text-primary placeholder:text-tertiary"
            />
            <kbd className="text-[11px] text-tertiary border border-divider rounded px-1.5 py-0.5">
              esc
            </kbd>
          </div>
          <div className="max-h-[52vh] overflow-y-auto scroll-area py-1.5">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-tertiary">
                No results
              </div>
            ) : (
              results.map((r, i) => (
                <button
                  key={r.id}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => choose(r)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    i === sel ? 'bg-[var(--accent)] text-white' : 'text-primary',
                  ].join(' ')}
                >
                  <span
                    className={i === sel ? 'text-white' : ''}
                  >
                    {r.icon}
                  </span>
                  <span className="flex-1 truncate text-[14px]">{r.label}</span>
                  <span
                    className={[
                      'text-[12px]',
                      i === sel ? 'text-white/75' : 'text-tertiary',
                    ].join(' ')}
                  >
                    {r.sub}
                  </span>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
