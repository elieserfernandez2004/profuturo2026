/**
 * Guardarraíles éticos (corren en el dispositivo, antes y después de la IA).
 *
 * 1. Detector de datos personales: avisa al niño/a ANTES de enviar su mensaje
 *    (aprendizaje en el momento: Reto 07 "proteger datos personales").
 * 2. Filtro anti-respuesta: si la IA intenta dar la solución del ejercicio,
 *    se sustituye por una pista pre-escrita (Reto 04 "tutor que no te da la respuesta").
 */
import { normalizeAnswer } from '../data/lessons'

export interface PiiFinding {
  kind: string
  sample: string
}

const PII_RULES: { kind: string; re: RegExp }[] = [
  { kind: 'correo electrónico', re: /[\w.+-]+@[\w-]+\.[\w.]+/i },
  { kind: 'número de teléfono', re: /(?:\+?\d[\s-]?){8,}/ },
  { kind: 'dirección', re: /\b(calle|av(enida)?\.?|carrera|jr\.?|jir[oó]n|pasaje|barrio|manzana|mz\.?|casa\s+n[°º.]?)\s+\S+/i },
  { kind: 'nombre completo', re: /\b(me llamo|mi nombre es|soy)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+/ },
  { kind: 'documento de identidad', re: /\b(c[eé]dula|dni|pasaporte|curp|rut)\b[^\n]{0,5}\d{5,}/i },
  { kind: 'escuela o ubicación exacta', re: /\b(vivo en|mi escuela es|estudio en)\s+\S+/i },
]

export function detectPII(text: string): PiiFinding[] {
  const out: PiiFinding[] = []
  for (const r of PII_RULES) {
    const m = text.match(r.re)
    if (m) out.push({ kind: r.kind, sample: m[0] })
  }
  return out
}

/** ¿La respuesta de la IA "regala" la solución? */
export function leaksAnswer(aiText: string, answer: string, exercisePrompt = ''): boolean {
  const ans = normalizeAnswer(answer).replace('.', '\\.')
  const t = normalizeAnswer(aiText)
  const isolated = new RegExp(`(^|[^\\d./])${ans}([^\\d/]|$)`)
  const asResult = new RegExp(`(=|es|son|da|resultado|respuesta|total)(:)?${ans}([^\\d/]|$)`)
  // si el número ya aparece en el enunciado (p. ej. "7 × 0"), solo cuenta como fuga
  // cuando se presenta como resultado ("= 0", "la respuesta es 0")
  const inPrompt = isolated.test(normalizeAnswer(exercisePrompt))
  return inPrompt ? asResult.test(t) : isolated.test(t)
}
