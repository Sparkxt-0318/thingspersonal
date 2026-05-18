import { useEffect } from 'react'
import { useStore } from './store/store'
import { useTheme } from './hooks/useTheme'
import { useVisibleTaskIds } from './hooks/useVisibleTasks'
import { Sidebar } from './components/Sidebar'
import { ContentPane } from './components/ContentPane'
import { MagicPlus } from './components/MagicPlus'
import { QuickFind } from './components/QuickFind'
import { Settings } from './components/Settings'

function useKeyboard() {
  const visible = useVisibleTaskIds()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState()
      const mod = e.metaKey || e.ctrlKey
      const tag = (e.target as HTMLElement)?.tagName
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable

      // New project
      if (mod && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        s.createProject({})
        return
      }
      // New task
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        const t = s.createTask({}, true)
        s.expand(t.id)
        return
      }
      // Quick find
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        s.setQuickFind(!s.quickFindOpen)
        return
      }
      // Toggle complete via Cmd/Ctrl + .
      if (mod && e.key === '.') {
        e.preventDefault()
        if (s.selectedTaskId) {
          const t = s.tasks.find((x) => x.id === s.selectedTaskId)
          if (t)
            t.status === 'open'
              ? s.completeTask(t.id)
              : s.uncompleteTask(t.id)
        }
        return
      }
      // Trash selected
      if (mod && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (s.selectedTaskId && !typing) {
          e.preventDefault()
          const idx = visible.indexOf(s.selectedTaskId)
          s.trashTask(s.selectedTaskId)
          const nextId = visible[idx + 1] ?? visible[idx - 1] ?? null
          s.select(nextId)
        }
        return
      }

      if (typing) return

      // Selection navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        const idx = s.selectedTaskId ? visible.indexOf(s.selectedTaskId) : -1
        const next = visible[Math.min(idx + 1, visible.length - 1)]
        if (next) s.select(next)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const idx = s.selectedTaskId ? visible.indexOf(s.selectedTaskId) : 0
        const prev = visible[Math.max(idx - 1, 0)]
        if (prev) s.select(prev)
      } else if (e.key === ' ') {
        if (s.selectedTaskId) {
          e.preventDefault()
          const t = s.tasks.find((x) => x.id === s.selectedTaskId)
          if (t)
            t.status === 'open' ? s.completeTask(t.id) : s.uncompleteTask(t.id)
        }
      } else if (e.key === 'Enter') {
        if (s.selectedTaskId && !s.expandedTaskId) {
          e.preventDefault()
          s.expand(s.selectedTaskId)
        }
      } else if (e.key === 'Escape') {
        if (s.expandedTaskId) s.expand(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])
}

export default function App() {
  const init = useStore((s) => s.init)
  const loaded = useStore((s) => s.loaded)
  useTheme()
  useKeyboard()

  useEffect(() => {
    init()
  }, [init])

  if (!loaded) {
    return (
      <div className="h-full flex items-center justify-center bg-content text-tertiary text-sm">
        Loading…
      </div>
    )
  }

  return (
    <div className="h-full flex overflow-hidden bg-content">
      <Sidebar />
      <div className="relative flex-1 flex min-w-0">
        <ContentPane />
        <MagicPlus />
      </div>
      <QuickFind />
      <Settings />
    </div>
  )
}
