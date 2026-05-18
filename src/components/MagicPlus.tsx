import { useStore } from '../store/store'
import { PlusIcon } from './icons'
import { motion } from 'framer-motion'

export function MagicPlus() {
  const createTask = useStore((s) => s.createTask)
  const expand = useStore((s) => s.expand)
  const setPlusDragging = useStore((s) => s.setPlusDragging)
  const plusDragging = useStore((s) => s.plusDragging)

  const create = () => {
    const t = createTask({}, true)
    expand(t.id)
  }

  return (
    <motion.button
      onClick={create}
      draggable
      onDragStart={(e) => {
        // hide default ghost
        const img = new Image()
        img.src =
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
        ;(e as unknown as DragEvent).dataTransfer?.setDragImage(img, 0, 0)
        setPlusDragging(true)
      }}
      onDragEnd={() => setPlusDragging(false)}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      title="New To-Do (⌘N) — drag to insert"
      className={[
        'fixed bottom-7 right-8 z-30 w-[52px] h-[52px] rounded-full bg-[var(--accent)] text-white flex items-center justify-center',
        plusDragging ? 'opacity-60' : '',
      ].join(' ')}
      style={{ boxShadow: '0 6px 20px rgba(43,127,255,0.45)' }}
    >
      <PlusIcon size={26} strokeWidth={2.4} />
    </motion.button>
  )
}
