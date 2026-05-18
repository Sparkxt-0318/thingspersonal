import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/store'
import { SunIcon, MoonIcon, GearIcon, CloseIcon } from './icons'

export function Settings() {
  const open = useStore((s) => s.settingsOpen)
  const setOpen = useStore((s) => s.setSettingsOpen)
  const settings = useStore((s) => s.settings)
  const setTheme = useStore((s) => s.setTheme)
  const exportData = useStore((s) => s.exportData)
  const importData = useStore((s) => s.importData)
  const resetAll = useStore((s) => s.resetAll)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, setOpen])

  const doExport = async () => {
    const json = await exportData()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `things-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const doImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        await importData(String(reader.result))
      } catch {
        alert('Could not import — invalid file.')
      }
    }
    reader.readAsText(file)
  }

  const themes: { id: typeof settings.theme; label: string; icon: React.ReactNode }[] =
    [
      { id: 'light', label: 'Light', icon: <SunIcon size={16} /> },
      { id: 'dark', label: 'Dark', icon: <MoonIcon size={14} /> },
      { id: 'system', label: 'Auto', icon: <GearIcon size={15} /> },
    ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/25 backdrop-blur-[2px]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[440px] max-w-[92vw] bg-elevated rounded-2xl overflow-hidden"
            style={{ boxShadow: 'var(--shadow-pop)' }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-[18px] font-bold text-primary">Settings</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-tertiary hover:text-primary p-1"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-6">
              <div>
                <div className="text-[12px] font-semibold text-tertiary uppercase tracking-wide mb-2">
                  Appearance
                </div>
                <div className="flex gap-2">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={[
                        'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-colors',
                        settings.theme === t.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                          : 'border-divider text-secondary hover:bg-[var(--bg-hover)]',
                      ].join(' ')}
                    >
                      {t.icon}
                      <span className="text-[12.5px] font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[12px] font-semibold text-tertiary uppercase tracking-wide mb-2">
                  Backup
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={doExport}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--accent)] text-white text-[13.5px] font-medium hover:opacity-90"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex-1 py-2.5 rounded-xl field-bg text-primary text-[13.5px] font-medium hover:bg-[var(--bg-hover)]"
                  >
                    Import JSON
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) doImport(f)
                      e.target.value = ''
                    }}
                  />
                </div>
                <p className="text-[12px] text-tertiary mt-2 leading-relaxed">
                  All data lives locally in your browser (IndexedDB). Export
                  regularly to keep a backup.
                </p>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Erase everything and reseed example data? This cannot be undone.'
                      )
                    )
                      resetAll()
                  }}
                  className="text-[12.5px] text-[#FF5C5C] hover:underline"
                >
                  Reset all data
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
