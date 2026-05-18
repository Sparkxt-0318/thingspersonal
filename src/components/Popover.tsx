import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface Props {
  anchor: HTMLElement | null
  open: boolean
  onClose: () => void
  children: React.ReactNode
  align?: 'left' | 'right' | 'center'
  width?: number
}

export function Popover({ anchor, open, onClose, children, align = 'left', width }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; origin: string }>({
    top: 0,
    left: 0,
    origin: 'top left',
  })

  useLayoutEffect(() => {
    if (!open || !anchor) return
    const compute = () => {
      const r = anchor.getBoundingClientRect()
      const w = width ?? 280
      let left = r.left
      if (align === 'right') left = r.right - w
      if (align === 'center') left = r.left + r.width / 2 - w / 2
      left = Math.max(8, Math.min(left, window.innerWidth - w - 8))
      let top = r.bottom + 6
      let origin = 'top left'
      const estH = ref.current?.offsetHeight ?? 320
      if (top + estH > window.innerHeight - 8) {
        top = Math.max(8, r.top - estH - 6)
        origin = 'bottom left'
      }
      setPos({ top, left, origin })
    }
    compute()
    const id = requestAnimationFrame(compute)
    window.addEventListener('resize', compute)
    window.addEventListener('scroll', compute, true)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('resize', compute)
      window.removeEventListener('scroll', compute, true)
    }
  }, [open, anchor, align, width])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node)) return
      if (anchor?.contains(e.target as Node)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    document.addEventListener('mousedown', onDown, true)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('mousedown', onDown, true)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open, anchor, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.16, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: width ?? 280,
            transformOrigin: pos.origin,
            zIndex: 1000,
          }}
          className="bg-elevated rounded-xl text-[13px] text-primary overflow-hidden"
        >
          <div style={{ boxShadow: 'var(--shadow-pop)' }} className="rounded-xl">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
