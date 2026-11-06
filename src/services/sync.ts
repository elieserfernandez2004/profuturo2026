/**
 * Sincronización offline-first (Reto 02).
 *
 * 1. Todo se guarda primero en el dispositivo (IndexedDB), con marca synced=0.
 * 2. Cuando vuelve la red y hay un servidor configurado, se envían los pendientes.
 * 3. Sin servidor ni internet: "paquete" JSON que se comparte por Bluetooth, cable,
 *    USB o la red local de la maleta, y que la tablet docente importa y combina.
 */
import { reactive } from 'vue'
import { db, deviceId, getKV, setKV } from '../db'

export const net = reactive({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  pending: 0,
  lastSync: 0,
  syncing: false,
  lastError: '',
})

export async function countPending() {
  const [a, f, d, e] = await Promise.all([
    db.attempts.where('synced').equals(0).count(),
    db.feedback.where('synced').equals(0).count(),
    db.detective.where('synced').equals(0).count(),
    db.evidence.where('synced').equals(0).count(),
  ])
  net.pending = a + f + d + e
  return net.pending
}

export async function syncNow(): Promise<string> {
  const url = await getKV<string>('syncUrl', '')
  await countPending()
  if (!url) return 'Sin servidor configurado: usa “Exportar paquete”.'
  if (!navigator.onLine) return 'Sin conexión: los datos quedan guardados y se enviarán luego.'
  if (net.syncing) return 'Sincronizando…'
  net.syncing = true
  try {
    const payload = {
      deviceId: await deviceId(),
      attempts: await db.attempts.where('synced').equals(0).toArray(),
      feedback: await db.feedback.where('synced').equals(0).toArray(),
      detective: await db.detective.where('synced').equals(0).toArray(),
      evidence: await db.evidence.where('synced').equals(0).toArray(),
    }
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    await db.transaction('rw', [db.attempts, db.feedback, db.detective, db.evidence], async () => {
      await db.attempts.bulkUpdate(payload.attempts.map((r) => ({ key: r.id, changes: { synced: 1 as const } })))
      await db.feedback.bulkUpdate(payload.feedback.map((r) => ({ key: r.id, changes: { synced: 1 as const } })))
      await db.detective.bulkUpdate(payload.detective.map((r) => ({ key: r.id, changes: { synced: 1 as const } })))
      await db.evidence.bulkUpdate(payload.evidence.map((r) => ({ key: r.id, changes: { synced: 1 as const } })))
    })
    net.lastSync = Date.now()
    await setKV('lastSync', net.lastSync)
    net.lastError = ''
    await countPending()
    return 'Sincronizado ✔'
  } catch (e) {
    net.lastError = e instanceof Error ? e.message : String(e)
    return 'No se pudo sincronizar; se reintentará al volver la red.'
  } finally {
    net.syncing = false
  }
}

export interface SyncPack {
  format: 'semilla-pack'
  version: 1
  deviceId: string
  exportedAt: number
  profiles: unknown[]
  attempts: unknown[]
  feedback: unknown[]
  detective: unknown[]
  evidence?: unknown[]
  kv?: unknown[]
  activities?: unknown[]
  messages?: unknown[]
}

/** Paquete para compartir sin internet (estudiante → docente, o docente → tablets). */
export async function buildPack(includeTeacherContent = false): Promise<SyncPack> {
  return {
    format: 'semilla-pack',
    version: 1,
    deviceId: await deviceId(),
    exportedAt: Date.now(),
    profiles: await db.profiles.toArray(),
    attempts: await db.attempts.toArray(),
    feedback: await db.feedback.toArray(),
    detective: await db.detective.toArray(),
    evidence: await db.evidence.toArray(),
    kv: await db.kv.filter((r) => r.key.startsWith('interests:')).toArray(),
    ...(includeTeacherContent
      ? { activities: await db.activities.filter((a) => a.approved).toArray(), messages: await db.messages.toArray() }
      : {}),
  }
}

export async function exportPack(includeTeacherContent = false) {
  const pack = await buildPack(includeTeacherContent)
  const name = `semilla-${pack.deviceId}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
  const blob = new Blob([JSON.stringify(pack)], { type: 'application/json' })
  const file = new File([blob], name, { type: 'application/json' })
  // en móviles: compartir por Bluetooth / Nearby Share / WhatsApp, sin internet
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: 'Paquete Semilla' })
      return name
    } catch {
      /* cancelado → descarga normal */
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  return name
}

export async function importPack(file: File): Promise<string> {
  const pack = JSON.parse(await file.text()) as SyncPack
  if (pack.format !== 'semilla-pack') throw new Error('Archivo no válido')
  await db.transaction('rw', [db.profiles, db.attempts, db.feedback, db.detective, db.activities, db.messages, db.evidence, db.kv], async () => {
    // ids únicos (uuid) → combinar varias tablets no duplica datos
    await db.profiles.bulkPut(pack.profiles as never[])
    await db.attempts.bulkPut(pack.attempts as never[])
    await db.feedback.bulkPut(pack.feedback as never[])
    await db.detective.bulkPut(pack.detective as never[])
    if (pack.evidence) await db.evidence.bulkPut(pack.evidence as never[])
    if (pack.kv) await db.kv.bulkPut(pack.kv as never[])
    if (pack.activities) await db.activities.bulkPut(pack.activities as never[])
    if (pack.messages) await db.messages.bulkPut(pack.messages as never[])
  })
  await countPending()
  return `Importado desde ${pack.deviceId}: ${pack.attempts.length} intentos, ${pack.profiles.length} perfiles.`
}

export function initSync() {
  window.addEventListener('online', () => {
    net.online = true
    syncNow()
  })
  window.addEventListener('offline', () => (net.online = false))
  getKV<number>('lastSync', 0).then((v) => (net.lastSync = v))
  countPending()
}
