<template>
  <ion-page>
    <app-header back="/" title="👩‍🏫 Espacio docente" />
    <ion-content class="ion-padding">
      <!-- PIN -->
      <ion-card v-if="!session.teacherUnlocked">
        <ion-card-header>
          <ion-card-title>🔐 Acceso docente</ion-card-title>
          <ion-card-subtitle>PIN de demostración: 1234 (cámbialo en Ajustes)</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-input v-model="pin" type="password" inputmode="numeric" fill="outline" placeholder="PIN" @keyup.enter="unlock" />
          <p v-if="pinError" class="muted" style="color: #e11d48">PIN incorrecto</p>
          <ion-button expand="block" style="margin-top: 10px" @click="unlock">Entrar</ion-button>
        </ion-card-content>
      </ion-card>

      <template v-else>
        <ion-segment v-model="tab" scrollable>
          <ion-segment-button value="panel"><ion-label>📊 Panel</ion-label></ion-segment-button>
          <ion-segment-button value="talentos"><ion-label>🌟 Talentos</ion-label></ion-segment-button>
          <ion-segment-button value="actividades"><ion-label>📝 Actividades</ion-label></ion-segment-button>
          <ion-segment-button value="mensajes"><ion-label>📨 Mensajes</ion-label></ion-segment-button>
          <ion-segment-button value="sync"><ion-label>🔄 Sincronizar</ion-label></ion-segment-button>
        </ion-segment>

        <!-- PANEL -->
        <template v-if="tab === 'panel'">
          <div class="hero" style="margin-top: 12px">
            <div class="eyebrow">✦ ¿Quién necesita apoyo y en qué?</div>
            <h2>{{ needSupport.length }} alerta(s) de apoyo</h2>
            <p>Reglas transparentes: errores repetidos, errores típicos detectados o solución revelada.</p>
          </div>

          <ion-card v-for="n in needSupport" :key="n.key">
            <ion-card-content>
              <b>{{ n.avatar }} {{ n.nickname }}</b> necesita apoyo en <b>{{ n.label }}</b>
              <div class="muted">{{ n.reason }}</div>
            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-header><ion-card-title style="font-size: 1rem">Dominio por concepto</ion-card-title></ion-card-header>
            <ion-card-content style="overflow-x: auto">
              <table class="dash">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th v-for="c in concepts" :key="c.id" :title="c.label">{{ c.short }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in table" :key="row.profile.id">
                    <td>{{ row.profile.avatar }} {{ row.profile.nickname }}</td>
                    <td v-for="s in row.stats" :key="s.concept">
                      <span class="mastery" :class="masteryClass(s.score)" :title="s.reason">{{ s.score === null ? '—' : s.score }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="!table.length" class="muted">Aún no hay estudiantes. Importa paquetes de las tablets en “Sincronizar”.</p>
              <p class="muted">— sin intentos · <span class="mastery m-low">&lt;50</span> <span class="mastery m-mid">50–79</span> <span class="mastery m-high">80+</span></p>
            </ion-card-content>
          </ion-card>

          <ion-card>
            <ion-card-header><ion-card-title style="font-size: 1rem">🛡️ Uso responsable de la IA</ion-card-title></ion-card-header>
            <ion-card-content>
              <p>⚠️ Respuestas de IA reportadas como erróneas por estudiantes: <b>{{ fb.error }}</b></p>
              <p>👍 Respuestas útiles: <b>{{ fb.helpful }}</b></p>
              <p>🔒 Mensajes con datos personales bloqueados: <b>{{ fb.pii }}</b></p>
              <p class="muted">Los reportes de error sirven para revisar la calidad de la IA y conversar en clase sobre sus límites.</p>
            </ion-card-content>
          </ion-card>
        </template>

        <!-- TALENTOS (Reto 20) -->
        <teacher-talents v-if="tab === 'talentos'" />

        <!-- ACTIVIDADES -->
        <template v-if="tab === 'actividades'">
          <ion-card>
            <ion-card-header>
              <ion-card-title style="font-size: 1rem">✨ Crear actividad con IA local</ion-card-title>
              <ion-card-subtitle>La IA propone, tú revisas y apruebas. Nada se publica sin revisión humana.</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-select v-model="actLesson" label="Lección" label-placement="stacked" fill="outline" interface="popover">
                <ion-select-option v-for="l in LESSONS" :key="l.id" :value="l.id">{{ l.emoji }} {{ l.title }}</ion-select-option>
              </ion-select>
              <ion-select v-model="actLevel" label="Nivel" label-placement="stacked" fill="outline" interface="popover" style="margin-top: 8px">
                <ion-select-option value="refuerzo">Refuerzo (más fácil)</ion-select-option>
                <ion-select-option value="básico">Básico</ion-select-option>
                <ion-select-option value="reto">Reto (más difícil)</ion-select-option>
              </ion-select>
              <ion-input v-model="actExtra" label="Indicaciones (opcional)" label-placement="stacked" fill="outline" placeholder="Ej.: usar ejemplos del mercado" style="margin-top: 8px" />
              <ion-button expand="block" style="margin-top: 10px" :disabled="llm.busy" @click="generate">
                {{ aiAvailable() ? '✨ Generar propuesta' : '📘 Crear desde el banco de ejercicios' }}
              </ion-button>
              <template v-if="draft">
                <ion-textarea v-model="draft" auto-grow fill="outline" label="Revisa y edita" label-placement="stacked" style="margin-top: 10px" />
                <div class="callout" style="margin-top: 8px">✏️ Revisa que las respuestas sean correctas: la IA puede equivocarse.</div>
                <ion-button expand="block" color="secondary" style="margin-top: 8px" :disabled="llm.busy" @click="approve">✅ Aprobar y publicar para estudiantes</ion-button>
              </template>
            </ion-card-content>
          </ion-card>
          <ion-card v-for="a in activities" :key="a.id">
            <ion-card-header>
              <ion-card-title style="font-size: 0.95rem">📝 {{ a.title }}</ion-card-title>
              <ion-card-subtitle>{{ a.aiGenerated ? '🤖 Propuesta por IA · ' : '' }}✅ Revisada por docente</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <ion-button size="small" fill="clear" color="danger" @click="removeActivity(a.id)">Retirar</ion-button>
            </ion-card-content>
          </ion-card>
        </template>

        <!-- MENSAJES -->
        <template v-if="tab === 'mensajes'">
          <ion-card>
            <ion-card-header><ion-card-title style="font-size: 1rem">📨 Enviar mensaje</ion-card-title></ion-card-header>
            <ion-card-content>
              <ion-select v-model="msgTo" label="Para" label-placement="stacked" fill="outline" interface="popover">
                <ion-select-option value="all">Todo el grupo</ion-select-option>
                <ion-select-option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.avatar }} {{ p.nickname }}</ion-select-option>
              </ion-select>
              <ion-textarea v-model="msgText" fill="outline" auto-grow placeholder="¡Muy bien con las fracciones! Mañana repasamos perímetro." style="margin-top: 8px" />
              <ion-button expand="block" style="margin-top: 8px" :disabled="!msgText.trim()" @click="sendMsg">Guardar mensaje</ion-button>
              <p class="muted">Se muestra al entrar el estudiante. Para otras tablets: “Exportar contenido docente” en Sincronizar.</p>
            </ion-card-content>
          </ion-card>
        </template>

        <!-- SINCRONIZAR -->
        <template v-if="tab === 'sync'">
          <ion-card>
            <ion-card-header>
              <ion-card-title style="font-size: 1rem">🔄 Funciona sin internet, sincroniza cuando puede</ion-card-title>
              <ion-card-subtitle>{{ net.online ? '📶 Con red' : '✈️ Sin red' }} · {{ net.pending }} registro(s) pendientes de enviar</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <p><b>Opción A · Sin internet:</b> cada tablet exporta un paquete y lo comparte por Bluetooth, cable o USB. Esta tablet lo importa y combina.</p>
              <ion-button expand="block" @click="exportPack(false)">⬆️ Exportar progreso de este dispositivo</ion-button>
              <ion-button expand="block" fill="outline" @click="exportPack(true)">⬆️ Exportar contenido docente (actividades y mensajes)</ion-button>
              <ion-button expand="block" color="secondary" @click="fileInput?.click()">⬇️ Importar paquete(s)</ion-button>
              <input ref="fileInput" type="file" accept="application/json,.json" multiple hidden @change="onImport" />
              <p><b>Opción B · Cuando vuelve la red:</b> los pendientes se envían solos a este servidor (opcional).</p>
              <ion-input v-model="syncUrl" fill="outline" label="URL del servidor de sincronización" label-placement="stacked" placeholder="https://…/api/semilla/sync" @ion-blur="saveUrl" />
              <ion-button expand="block" fill="outline" style="margin-top: 8px" :disabled="net.syncing" @click="doSync">Sincronizar ahora</ion-button>
              <p v-if="syncMsg" class="notice">{{ syncMsg }}</p>
            </ion-card-content>
          </ion-card>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonInput,
  IonTextarea, IonSelect, IonSelectOption, IonSegment, IonSegmentButton, IonLabel, onIonViewWillEnter,
} from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import TeacherTalents from '../components/TeacherTalents.vue'
import { LESSONS, getLesson } from '../data/lessons'
import { db, uid, getKV, setKV, type Activity, type Profile } from '../db'
import { session, loadSession, checkPin } from '../services/session'
import { computeStats, masteryClass, type ConceptStat } from '../services/mastery'
import { net, exportPack, importPack, syncNow, countPending } from '../services/sync'
import { llm, aiAvailable, chat } from '../llm/engine'
import { activityMessages } from '../llm/prompts'

const pin = ref('')
const pinError = ref(false)
const tab = ref('panel')
const profiles = ref<Profile[]>([])
const table = ref<{ profile: Profile; stats: ConceptStat[] }[]>([])
const fb = reactive({ error: 0, helpful: 0, pii: 0 })
const activities = ref<Activity[]>([])
const concepts = LESSONS.flatMap((l) => Object.entries(l.concepts).map(([id, label]) => ({ id, label, short: `${l.emoji} ${label.split(' ').slice(0, 2).join(' ')}` })))

const needSupport = computed(() =>
  table.value.flatMap((r) =>
    r.stats.filter((s) => s.needsSupport).map((s) => ({ key: r.profile.id + s.concept, nickname: r.profile.nickname, avatar: r.profile.avatar, label: s.label, reason: s.reason })),
  ),
)

async function refresh() {
  profiles.value = await db.profiles.orderBy('nickname').toArray()
  const attempts = await db.attempts.toArray()
  table.value = profiles.value.map((p) => ({ profile: p, stats: computeStats(attempts.filter((a) => a.profileId === p.id)) }))
  const all = await db.feedback.toArray()
  fb.error = all.filter((f) => f.kind === 'error').length
  fb.helpful = all.filter((f) => f.kind === 'helpful').length
  fb.pii = all.filter((f) => f.kind === 'pii-blocked').length
  activities.value = await db.activities.orderBy('createdAt').reverse().toArray()
  syncUrl.value = await getKV('syncUrl', '')
  countPending()
}
onIonViewWillEnter(async () => {
  await loadSession()
  if (session.teacherUnlocked) refresh()
})
watch(tab, refresh)

async function unlock() {
  pinError.value = !(await checkPin(pin.value))
  pin.value = ''
  if (!pinError.value) refresh()
}

// ── Actividades ──
const actLesson = ref(LESSONS[0].id)
const actLevel = ref('básico')
const actExtra = ref('')
const draft = ref('')
const draftAI = ref(false)

async function generate() {
  const lesson = getLesson(actLesson.value)!
  if (!aiAvailable()) {
    draftAI.value = false
    draft.value = [
      `Objetivo: practicar ${lesson.title.toLowerCase()}.`,
      ...lesson.exercises.map((e, i) => `${i + 1}. ${e.prompt}`),
      '',
      'Respuestas',
      ...lesson.exercises.map((e, i) => `${i + 1}. ${e.answer}`),
    ].join('\n')
    return
  }
  draftAI.value = true
  draft.value = ''
  try {
    await chat(activityMessages(lesson, actLevel.value, actExtra.value), { onToken: (t) => (draft.value = t), maxTokens: 450, temperature: 0.6 })
  } catch {
    draft.value = '(No se pudo generar. Intenta de nuevo.)'
  }
}
async function approve() {
  const lesson = getLesson(actLesson.value)!
  await db.activities.add({
    id: uid(), lessonId: lesson.id, title: `${lesson.emoji} ${lesson.title} · ${actLevel.value}`, level: actLevel.value,
    content: draft.value, approved: true, aiGenerated: draftAI.value, createdAt: Date.now(),
  })
  draft.value = ''
  refresh()
}
async function removeActivity(id: string) {
  await db.activities.delete(id)
  refresh()
}

// ── Mensajes ──
const msgTo = ref('all')
const msgText = ref('')
async function sendMsg() {
  await db.messages.add({ id: uid(), to: msgTo.value, text: msgText.value.trim(), ts: Date.now() })
  msgText.value = ''
  syncMsg.value = 'Mensaje guardado ✔'
}

// ── Sincronización ──
const fileInput = ref<HTMLInputElement | null>(null)
const syncUrl = ref('')
const syncMsg = ref('')
async function onImport(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  const out: string[] = []
  for (const f of files) {
    try {
      out.push(await importPack(f))
    } catch (err) {
      out.push(`${f.name}: ${err instanceof Error ? err.message : 'error'}`)
    }
  }
  syncMsg.value = out.join('\n')
  ;(e.target as HTMLInputElement).value = ''
  refresh()
}
async function saveUrl() {
  await setKV('syncUrl', syncUrl.value.trim())
}
async function doSync() {
  await saveUrl()
  syncMsg.value = await syncNow()
}
</script>
