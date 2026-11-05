import { reactive } from 'vue'
import { db, getKV, setKV, type Profile } from '../db'

/** Estado de la sesión actual (perfil activo, consentimiento, modo docente). */
export const session = reactive({
  profile: null as Profile | null,
  consent: false,
  teacherUnlocked: false,
  loaded: false,
})

export const AVATARS = ['🦋', '🐸', '🐦', '🌞', '🐢', '🦙', '🐬', '🌻']

export async function loadSession() {
  if (session.loaded) return
  session.consent = await getKV('consent', false)
  const lastId = await getKV<string>('lastProfile', '')
  if (lastId) session.profile = (await db.profiles.get(lastId)) ?? null
  session.loaded = true
}

export async function giveConsent() {
  session.consent = true
  await setKV('consent', true)
}

export async function selectProfile(p: Profile) {
  session.profile = p
  await setKV('lastProfile', p.id)
}

export async function checkPin(pin: string) {
  const saved = await getKV('teacherPin', '1234')
  session.teacherUnlocked = pin === saved
  return session.teacherUnlocked
}
