/**
 * Lightweight subsequence fuzzy matcher with simple scoring.
 * Returns a score (higher = better) or null when no match.
 */
export function fuzzyScore(query: string, target: string): number | null {
  const q = query.trim().toLowerCase()
  const t = target.toLowerCase()
  if (!q) return 0
  if (!t) return null

  let qi = 0
  let score = 0
  let streak = 0
  let prevIdx = -1

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      // bonus for consecutive matches and word-boundary matches
      streak = prevIdx === ti - 1 ? streak + 1 : 0
      score += 1 + streak * 2
      if (ti === 0 || /[\s\-_/]/.test(t[ti - 1])) score += 4
      if (ti === 0) score += 3
      prevIdx = ti
      qi++
    }
  }

  if (qi < q.length) return null
  // prefer shorter targets and tighter matches
  score -= t.length * 0.05
  return score
}
