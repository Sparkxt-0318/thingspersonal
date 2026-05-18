import {
  format,
  parseISO,
  differenceInCalendarDays,
  isToday,
  isTomorrow,
  isThisYear,
  startOfDay,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from 'date-fns'
import type { RepeatRule } from '../types'

/** Local calendar date as yyyy-MM-dd (no timezone drift). */
export function toISODate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseDate(iso: string): Date {
  return startOfDay(parseISO(iso))
}

export function isISODate(v: string | null | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v)
}

/** Human label for a scheduled day, Things-style. */
export function dayLabel(iso: string): string {
  const d = parseDate(iso)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isThisYear(d)) return format(d, 'EEE d MMM')
  return format(d, 'd MMM yyyy')
}

/** Short label used in row metadata pills. */
export function shortDayLabel(iso: string): string {
  const d = parseDate(iso)
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  const days = differenceInCalendarDays(d, startOfDay(new Date()))
  if (days > 0 && days < 7) return format(d, 'EEEE')
  if (isThisYear(d)) return format(d, 'd MMM')
  return format(d, 'd MMM yyyy')
}

export interface CountdownInfo {
  label: string
  overdue: boolean
  soon: boolean
}

/** Countdown badge text for a deadline. */
export function deadlineCountdown(iso: string): CountdownInfo {
  const d = parseDate(iso)
  const days = differenceInCalendarDays(d, startOfDay(new Date()))
  if (days < 0) {
    const n = Math.abs(days)
    return { label: n === 1 ? '1 day overdue' : `${n} days overdue`, overdue: true, soon: false }
  }
  if (days === 0) return { label: 'Today', overdue: false, soon: true }
  if (days === 1) return { label: '1 day left', overdue: false, soon: true }
  return { label: `${days} days left`, overdue: false, soon: days <= 3 }
}

export function monthTitle(d: Date): string {
  return isThisYear(d) ? format(d, 'MMMM') : format(d, 'MMMM yyyy')
}

export function fullDateLabel(iso: string): string {
  return format(parseDate(iso), 'EEEE, d MMMM yyyy')
}

/** Compute the next occurrence date for a repeating task. */
export function nextOccurrence(fromISO: string, rule: RepeatRule): string {
  const base = parseDate(fromISO)
  let next: Date
  switch (rule.unit) {
    case 'day':
      next = addDays(base, rule.interval)
      break
    case 'week':
      next = addWeeks(base, rule.interval)
      break
    case 'month':
      next = addMonths(base, rule.interval)
      break
    case 'year':
      next = addYears(base, rule.interval)
      break
  }
  return toISODate(next)
}

export function describeRepeat(rule: RepeatRule): string {
  const { interval, unit } = rule
  if (interval === 1) {
    return { day: 'Every day', week: 'Every week', month: 'Every month', year: 'Every year' }[unit]
  }
  return `Every ${interval} ${unit}s`
}

export { differenceInCalendarDays, isToday, parseISO, startOfDay, addDays }
