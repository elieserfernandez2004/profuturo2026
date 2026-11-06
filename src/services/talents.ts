/**
 * Mapa de talentos (Reto 20). Principios:
 * - Señales, no etiquetas: se muestran evidencias concretas con su origen, sin puntajes ni rankings.
 * - Solo suman: nunca se "pierde" una habilidad ni se compara con otros.
 * - Ninguna decisión automática: el docente interpreta, confirma o descarta.
 */
import { db, deviceId, getKV, setKV, uid, type Evidence, type Skill } from '../db'
import { SKILLS } from '../data/talents'
import { countPending } from './sync'

export interface Signal {
  skill: Skill
  source: string
  detail: string
  by: Evidence['by'] | 'progreso'
  ts: number
}

export async function addEvidence(profileId: string, skill: Skill, source: string, detail: string, by: Evidence['by'] = 'actividad') {
  await db.evidence.add({ id: uid(), profileId, skill, source, detail, by, ts: Date.now(), deviceId: await deviceId(), synced: 0 })
  countPending()
}

export async function getInterests(profileId: string) {
  return getKV<string[]>(`interests:${profileId}`, [])
}
export async function setInterests(profileId: string, list: string[]) {
  await setKV(`interests:${profileId}`, list)
}

/** Señales derivadas del uso normal de la app (tutor y detective), además de las actividades. */
export async function signalsFor(profileId: string): Promise<Signal[]> {
  const out: Signal[] = (await db.evidence.where('profileId').equals(profileId).toArray()).map((e) => ({ ...e }))

  const attempts = await db.attempts.where('profileId').equals(profileId).toArray()
  const byEx = new Map<string, typeof attempts>()
  for (const a of attempts) byEx.set(a.exerciseId, [...(byEx.get(a.exerciseId) ?? []), a])
  for (const [ex, rows] of byEx) {
    const solved = rows.find((r) => r.correct)
    if (!solved) continue
    const wrongBefore = rows.filter((r) => !r.correct && r.ts < solved.ts).length
    if (wrongBefore >= 2) {
      out.push({ skill: 'problemas', source: 'Tutor', detail: `Siguió intentando y resolvió el ejercicio ${ex} tras ${wrongBefore} intentos (perseverancia).`, by: 'progreso', ts: solved.ts })
    } else if (solved.hintLevel === 0) {
      out.push({ skill: 'logica', source: 'Tutor', detail: `Resolvió el ejercicio ${ex} sin pedir pistas.`, by: 'progreso', ts: solved.ts })
    }
  }

  const det = await db.detective.where('profileId').equals(profileId).filter((d) => d.correct).toArray()
  if (det.length >= 3) {
    out.push({ skill: 'critico', source: 'Detective de IA', detail: `Detectó correctamente ${det.length} errores, sesgos o riesgos de la IA.`, by: 'progreso', ts: Math.max(...det.map((d) => d.ts)) })
  }
  const reported = await db.feedback.where('profileId').equals(profileId).filter((f) => f.kind === 'error').count()
  if (reported) {
    out.push({ skill: 'critico', source: 'Tutor', detail: `Cuestionó ${reported} respuesta(s) de la IA que le parecieron incorrectas.`, by: 'progreso', ts: Date.now() })
  }
  return out.sort((a, b) => b.ts - a.ts)
}

export function groupBySkill(signals: Signal[]) {
  return (Object.keys(SKILLS) as Skill[]).map((skill) => ({ skill, ...SKILLS[skill], signals: signals.filter((s) => s.skill === skill) }))
}

/** Etapa del "jardín" del estudiante: solo crece, nunca baja. */
export function gardenStage(n: number) {
  if (n === 0) return { emoji: '🟤', text: 'Semilla por descubrir' }
  if (n < 2) return { emoji: '🌱', text: 'Brotando' }
  if (n < 4) return { emoji: '🌿', text: 'Creciendo' }
  return { emoji: '🌻', text: 'Floreciendo' }
}
