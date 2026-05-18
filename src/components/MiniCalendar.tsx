import { useState } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { toISODate } from '../lib/dates'
import { ChevronIcon } from './icons'

interface Props {
  value: string | null
  onSelect: (iso: string) => void
}

export function MiniCalendar({ value, onSelect }: Props) {
  const selected = value ? new Date(value + 'T00:00:00') : null
  const [cursor, setCursor] = useState(
    startOfMonth(selected ?? new Date())
  )

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  })

  return (
    <div className="px-3 pb-3 pt-1 select-none">
      <div className="flex items-center justify-between px-1 mb-2">
        <button
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-secondary"
        >
          <ChevronIcon size={15} className="rotate-180" />
        </button>
        <div className="text-[12.5px] font-semibold text-primary">
          {format(cursor, 'MMMM yyyy')}
        </div>
        <button
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-secondary"
        >
          <ChevronIcon size={15} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-[10px] font-semibold text-tertiary pb-1">
            {d}
          </div>
        ))}
        {days.map((d) => {
          const out = !isSameMonth(d, cursor)
          const sel = selected && isSameDay(d, selected)
          const today = isToday(d)
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelect(toISODate(d))}
              className="flex items-center justify-center mx-auto"
            >
              <span
                className={[
                  'w-7 h-7 flex items-center justify-center rounded-full text-[12px] transition-colors',
                  sel
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : today
                      ? 'text-[var(--accent)] font-bold hover:bg-[var(--bg-hover)]'
                      : out
                        ? 'text-tertiary hover:bg-[var(--bg-hover)]'
                        : 'text-primary hover:bg-[var(--bg-hover)]',
                ].join(' ')}
              >
                {format(d, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
