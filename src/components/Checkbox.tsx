import { motion } from 'framer-motion'
import type { TaskStatus } from '../types'

interface Props {
  status: TaskStatus
  onToggle: (e: React.MouseEvent) => void
  size?: number
  tint?: string
}

export function Checkbox({ status, onToggle, size = 19, tint }: Props) {
  const done = status === 'completed'
  const canceled = status === 'canceled'
  const filled = done || canceled
  const fill = canceled ? '#B8B8BD' : tint || 'var(--accent)'

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle complete"
      className="group/cb relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
        {/* empty ring */}
        <circle
          cx="12"
          cy="12"
          r="9.5"
          fill="none"
          stroke={filled ? fill : 'currentColor'}
          strokeWidth="1.6"
          className={
            filled
              ? ''
              : 'text-[#cfcfd4] dark:text-[#4a4a50] group-hover/cb:text-[var(--accent)] transition-colors'
          }
        />
        {/* hover faint fill */}
        {!filled && (
          <circle
            cx="12"
            cy="12"
            r="8.7"
            className="fill-[var(--accent)] opacity-0 group-hover/cb:opacity-[0.10] transition-opacity"
          />
        )}
        {filled && (
          <motion.circle
            cx="12"
            cy="12"
            r="9.5"
            fill={fill}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformOrigin: 'center' }}
          />
        )}
        {done && (
          <motion.path
            d="M7 12.4l3.2 3.2L17 8.6"
            fill="none"
            stroke="#fff"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.22, delay: 0.08, ease: 'easeOut' }}
          />
        )}
        {canceled && (
          <motion.path
            d="M8.5 8.5l7 7M15.5 8.5l-7 7"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
          />
        )}
      </svg>
    </button>
  )
}
