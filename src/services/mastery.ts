/**
 * Detección de dificultades por concepto (Reto 04: "que el docente conozca en qué
 * conceptos necesita apoyo cada estudiante"). Reglas transparentes y explicables,
 * no una caja negra.
 */
import { db, type Attempt } from '../db'
import { allConcepts } from '../data/lessons'

export interface ConceptStat {
  concept: string
  label: string
  attempts: number
  solved: number // ejercicios resueltos
  wrong: number
  hints: number
  revealed: number
  misconceptions: string[]
  score: number | null // 0..100
  needsSupport: boolean
  reason: string
}

export function computeStats(attempts: Attempt[]): ConceptStat[] {
  return allConcepts()
    .map(({ id, label }) => {
      const rows = attempts.filter((a) => a.concept === id)
      const solvedEx = new Set(rows.filter((r) => r.correct).map((r) => r.exerciseId))
      const wrong = rows.filter((r) => !r.correct).length
      const hints = rows.reduce((m, r) => Math.max(m, r.hintLevel), 0)
      const revealed = rows.filter((r) => r.revealed).length
      const mis = [...new Set(rows.map((r) => r.misconception).filter(Boolean) as string[])]
      const exercisesTouched = new Set(rows.map((r) => r.exerciseId)).size
      let score: number | null = null
      if (exercisesTouched > 0) {
        // resolver suma; errores, pistas y solución revelada restan
        score = Math.round(
          Math.max(0, Math.min(100, (solvedEx.size / exercisesTouched) * 100 - wrong * 8 - revealed * 15 - hints * 3)),
        )
      }
      const reasons: string[] = []
      if (wrong >= 3) reasons.push(`${wrong} intentos fallidos`)
      if (revealed) reasons.push('pidió ver la solución')
      if (mis.length) reasons.push(`error típico: ${mis[0].toLowerCase()}`)
      const needsSupport = score !== null && (score < 60 || mis.length > 0 || revealed > 0)
      return {
        concept: id,
        label,
        attempts: rows.length,
        solved: solvedEx.size,
        wrong,
        hints,
        revealed,
        misconceptions: mis,
        score,
        needsSupport,
        reason: reasons.join(' · '),
      }
    })
}

export async function statsForProfile(profileId: string) {
  return computeStats(await db.attempts.where('profileId').equals(profileId).toArray())
}

export function masteryClass(score: number | null) {
  if (score === null) return 'm-none'
  if (score < 50) return 'm-low'
  if (score < 80) return 'm-mid'
  return 'm-high'
}
