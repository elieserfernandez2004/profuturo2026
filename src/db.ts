/**
 * Base de datos local (IndexedDB). Nada sale del dispositivo salvo que la persona
 * docente exporte un paquete o configure una sincronización.
 * No se guardan nombres reales: solo apodo + avatar + grupo de edad.
 */
import Dexie, { type Table } from 'dexie'

export type AgeGroup = '8-10' | '11-14'

export interface Profile {
  id: string
  nickname: string
  avatar: string
  ageGroup: AgeGroup
  createdAt: number
}

export interface Attempt {
  id: string
  profileId: string
  lessonId: string
  exerciseId: string
  concept: string
  input: string
  correct: boolean
  hintLevel: number
  misconception?: string
  revealed?: boolean
  ts: number
  deviceId: string
  synced: 0 | 1
}

export interface AiFeedback {
  id: string
  profileId: string
  kind: 'helpful' | 'error' | 'pii-blocked'
  context: string
  text: string
  ts: number
  deviceId: string
  synced: 0 | 1
}

export interface DetectiveResult {
  id: string
  profileId: string
  game: 'verdad' | 'usar-ia' | 'datos' | 'en-vivo'
  itemId: string
  correct: boolean
  ts: number
  deviceId: string
  synced: 0 | 1
}

export interface Activity {
  id: string
  lessonId: string
  title: string
  level: string
  content: string
  approved: boolean
  aiGenerated: boolean
  createdAt: number
}

export interface Message {
  id: string
  to: string // 'all' o id de perfil
  text: string
  ts: number
}

/** Reto 20: evidencia observable de una habilidad (nunca una puntuación ni etiqueta). */
export type Skill = 'creatividad' | 'logica' | 'comunicacion' | 'colaboracion' | 'problemas' | 'critico'
export interface Evidence {
  id: string
  profileId: string
  skill: Skill
  source: string // actividad que la generó
  detail: string // qué se observó, en palabras
  by: 'actividad' | 'docente' | 'compañero'
  ts: number
  deviceId: string
  synced: 0 | 1
}

export interface KV {
  key: string
  value: unknown
}

class SemillaDB extends Dexie {
  profiles!: Table<Profile, string>
  attempts!: Table<Attempt, string>
  feedback!: Table<AiFeedback, string>
  detective!: Table<DetectiveResult, string>
  activities!: Table<Activity, string>
  messages!: Table<Message, string>
  kv!: Table<KV, string>
  evidence!: Table<Evidence, string>

  constructor() {
    super('semilla')
    this.version(1).stores({
      profiles: 'id, nickname',
      attempts: 'id, profileId, concept, exerciseId, synced, ts',
      feedback: 'id, profileId, kind, synced, ts',
      detective: 'id, profileId, game, synced, ts',
      activities: 'id, lessonId, approved, createdAt',
      messages: 'id, to, ts',
      kv: 'key',
    })
    this.version(2).stores({
      evidence: 'id, profileId, skill, synced, ts',
    })
  }
}

export const db = new SemillaDB()

export function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export async function getKV<T>(key: string, fallback: T): Promise<T> {
  const row = await db.kv.get(key)
  return row ? (row.value as T) : fallback
}
export async function setKV(key: string, value: unknown) {
  await db.kv.put({ key, value })
}

let _deviceId = ''
export async function deviceId(): Promise<string> {
  if (_deviceId) return _deviceId
  let id = await getKV<string>('deviceId', '')
  if (!id) {
    id = 'disp-' + uid().slice(0, 8)
    await setKV('deviceId', id)
  }
  _deviceId = id
  return id
}

/** "Borrar avances": la familia puede eliminar todo en cualquier momento. */
export async function wipeAll() {
  await db.delete()
  await db.open()
}
