<template>
  <ion-page>
    <app-header back="/student" :title="lesson ? `${lesson.emoji} ${lesson.title}` : ''" />
    <ion-content class="ion-padding">
      <template v-if="lesson && profile">
        <ion-accordion-group :value="showLesson ? 'lesson' : undefined" @ion-change="showLesson = !!$event.detail.value">
          <ion-accordion value="lesson">
            <ion-item slot="header"><ion-label>📖 Repasar la lección</ion-label></ion-item>
            <div slot="content" class="ion-padding lesson-body">
              <p v-for="(b, i) in lesson.body" :key="i">{{ b }}</p>
            </div>
          </ion-accordion>
        </ion-accordion-group>

        <!-- Selector de ejercicio -->
        <ion-segment :value="exIndex" scrollable style="margin: 12px 0" @ion-change="pick(Number($event.detail.value))">
          <ion-segment-button v-for="(e, i) in lesson.exercises" :key="e.id" :value="i">
            <ion-label>{{ solvedIds.has(e.id) ? '✅' : '🎯' }} {{ i + 1 }}</ion-label>
          </ion-segment-button>
        </ion-segment>

        <ion-card v-if="ex">
          <ion-card-header>
            <span class="pill info">{{ lesson.concepts[ex.concept] }}</span>
            <ion-card-title style="font-size: 1.15rem; margin-top: 8px">{{ ex.prompt }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div style="display: flex; gap: 8px; align-items: center">
              <ion-input
                v-model="answer"
                fill="outline"
                placeholder="Tu respuesta"
                inputmode="text"
                :disabled="solvedNow"
                style="flex: 1"
                @keyup.enter="check"
              />
              <ion-button :disabled="!answer.trim() || solvedNow || llm.busy" @click="check">Comprobar</ion-button>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px">
              <ion-button size="small" fill="outline" :disabled="solvedNow || llm.busy || hintLevel >= 3" @click="hint()">
                💡 Pedir pista ({{ hintLevel }}/3)
              </ion-button>
              <ion-button v-if="hintLevel >= 3 && !solvedNow && !revealed" size="small" fill="outline" color="warning" @click="reveal">
                👀 Ver la solución explicada
              </ion-button>
              <ion-button v-if="solvedNow || revealed" size="small" color="secondary" @click="next">Siguiente reto →</ion-button>
            </div>
            <div v-if="solvedNow" class="notice" style="margin-top: 10px">🎉 ¡Correcto! Lo resolviste {{ hintLevel ? `con ${hintLevel} pista(s)` : 'sin pistas' }}.</div>
            <div v-if="revealed" class="callout" style="margin-top: 10px">📘 {{ ex.solution }}<br /><span class="muted">Tu docente verá que este concepto necesita repaso. ¡No pasa nada!</span></div>

            <ai-bubble v-for="m in chat" :key="m.id" :msg="m" @rate="(k) => rate(m, k)" />
          </ion-card-content>
        </ion-card>

        <!-- Pregunta libre -->
        <ion-card>
          <ion-card-header>
            <ion-card-title style="font-size: 1rem">🌱 Pregúntale a Semilla sobre esta lección</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div style="display: flex; gap: 8px">
              <ion-input v-model="question" fill="outline" placeholder="¿Por qué el denominador no se suma?" style="flex: 1" @keyup.enter="ask" />
              <ion-button :disabled="!question.trim() || llm.busy" @click="ask">Enviar</ion-button>
            </div>
            <div v-if="pii.length" class="callout" style="margin-top: 8px">
              🛡️ <b>¡Alto, detective!</b> Tu mensaje parece tener <b>{{ pii.map((f) => f.kind).join(', ') }}</b>.
              No compartas datos personales con una IA (ni con nadie en internet). Bórralo y vuelve a intentarlo.
            </div>
            <div v-if="!aiAvailable()" class="muted" style="margin-top: 8px">
              📘 La IA no está activa en este dispositivo. Puedes seguir con las pistas escritas por docentes, o activarla en Ajustes.
            </div>
            <ai-bubble v-for="m in qa" :key="m.id" :msg="m" @rate="(k) => rate(m, k)" />
          </ion-card-content>
        </ion-card>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton, IonInput,
  IonSegment, IonSegmentButton, IonLabel, IonAccordion, IonAccordionGroup, IonItem, onIonViewWillEnter,
} from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import AiBubble, { type ChatMsg } from '../components/AiBubble.vue'
import { getLesson, isCorrect, findMisconception } from '../data/lessons'
import { db, uid, deviceId } from '../db'
import { session, loadSession } from '../services/session'
import { llm, aiAvailable, chat as llmChat } from '../llm/engine'
import { hintMessages, askMessages } from '../llm/prompts'
import { detectPII, leaksAnswer } from '../llm/guardrails'
import { countPending } from '../services/sync'

const route = useRoute()
const router = useRouter()
const lesson = computed(() => getLesson(String(route.params.id)))
const profile = computed(() => session.profile)
const showLesson = ref(true)
const exIndex = ref(0)
const ex = computed(() => lesson.value?.exercises[exIndex.value])
const answer = ref('')
const hintLevel = ref(0)
const solvedNow = ref(false)
const revealed = ref(false)
const chat = ref<ChatMsg[]>([])
const solvedIds = ref(new Set<string>())
const question = ref('')
const qa = ref<ChatMsg[]>([])
const pii = computed(() => detectPII(question.value))

onIonViewWillEnter(async () => {
  await loadSession()
  if (!session.profile) return router.replace('/')
  const rows = await db.attempts.where('profileId').equals(session.profile.id).filter((a) => a.correct).toArray()
  solvedIds.value = new Set(rows.map((r) => r.exerciseId))
})

function pick(i: number) {
  exIndex.value = i
  answer.value = ''
  hintLevel.value = 0
  solvedNow.value = false
  revealed.value = false
  chat.value = []
  showLesson.value = false
}
function next() {
  if (!lesson.value) return
  pick((exIndex.value + 1) % lesson.value.exercises.length)
}

async function record(correct: boolean, extra: { misconception?: string; revealed?: boolean } = {}) {
  if (!ex.value || !lesson.value || !profile.value) return
  await db.attempts.add({
    id: uid(),
    profileId: profile.value.id,
    lessonId: lesson.value.id,
    exerciseId: ex.value.id,
    concept: ex.value.concept,
    input: answer.value,
    correct,
    hintLevel: hintLevel.value,
    ts: Date.now(),
    deviceId: await deviceId(),
    synced: 0,
    ...extra,
  })
  countPending()
}

async function check() {
  if (!ex.value) return
  const input = answer.value.trim()
  chat.value.push({ id: uid(), role: 'user', text: `Mi respuesta: ${input}` })
  if (isCorrect(ex.value, input)) {
    solvedNow.value = true
    solvedIds.value.add(ex.value.id)
    await record(true)
    return
  }
  const mis = findMisconception(ex.value, input)
  await record(false, { misconception: mis?.label })
  await hint(mis?.label, mis?.hint)
}

/** Pista progresiva: IA local si está disponible; si no, pista escrita por docentes. */
async function hint(misLabel?: string, misHint?: string) {
  if (!ex.value || !lesson.value || !profile.value) return
  if (hintLevel.value < 3) hintLevel.value++
  const fallback = misHint ?? ex.value.hints[hintLevel.value - 1]
  const msg = reactive<ChatMsg>({ id: uid(), role: 'ai', text: '', source: 'ia', lesson: lesson.value.title, streaming: true })
  if (!aiAvailable()) {
    Object.assign(msg, { text: fallback, source: 'docente', streaming: false })
    chat.value.push(msg)
    return
  }
  chat.value.push(msg)
  try {
    const out = await llmChat(
      hintMessages({
        lesson: lesson.value,
        exercise: ex.value,
        studentAnswer: answer.value,
        hintLevel: hintLevel.value,
        misconceptionLabel: misLabel,
        ageGroup: profile.value.ageGroup,
      }),
      { onToken: (t) => (msg.text = t), maxTokens: 160 },
    )
    if (!out || leaksAnswer(out, ex.value.answer, ex.value.prompt)) {
      // guardarraíl: la IA iba a "hacer la tarea" → pista segura
      Object.assign(msg, { text: fallback, guarded: true, source: 'docente' })
    }
  } catch {
    Object.assign(msg, { text: fallback, source: 'docente' })
  } finally {
    msg.streaming = false
  }
}

async function reveal() {
  revealed.value = true
  await record(false, { revealed: true })
}

async function ask() {
  if (!lesson.value || !profile.value || !question.value.trim()) return
  if (pii.value.length) {
    await db.feedback.add({
      id: uid(), profileId: profile.value.id, kind: 'pii-blocked', context: lesson.value.id,
      text: pii.value.map((f) => f.kind).join(', '), ts: Date.now(), deviceId: await deviceId(), synced: 0,
    })
    return
  }
  const q = question.value.trim()
  question.value = ''
  qa.value.push({ id: uid(), role: 'user', text: q })
  const msg = reactive<ChatMsg>({ id: uid(), role: 'ai', text: '', source: 'ia', lesson: lesson.value.title, streaming: true })
  if (!aiAvailable()) {
    Object.assign(msg, {
      text: 'La IA no está activa en este dispositivo. Revisa la lección de arriba o pregúntale a tu docente. 🌱',
      source: 'docente', streaming: false,
    })
    qa.value.push(msg)
    return
  }
  qa.value.push(msg)
  const history = qa.value
    .filter((m) => m !== msg && !m.streaming)
    .slice(0, -1)
    .map((m) => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), content: m.text }))
  try {
    let out = await llmChat(askMessages({ lesson: lesson.value, question: q, ageGroup: profile.value.ageGroup, history }), {
      onToken: (t) => (msg.text = t),
      maxTokens: 200,
    })
    // si la pregunta es un ejercicio de la lección, no regalar el resultado
    const leaked = lesson.value.exercises.find((e) => leaksAnswer(out, e.answer, e.prompt) && q.includes(e.prompt.slice(0, 12)))
    if (leaked) {
      out = `Buena pregunta. Intenta resolverlo tú: ${leaked.hints[0]}`
      msg.guarded = true
    }
    msg.text = out
  } catch {
    msg.text = 'No pude responder ahora. Intenta de nuevo o pregunta a tu docente.'
  } finally {
    msg.streaming = false
  }
}

async function rate(m: ChatMsg, kind: 'helpful' | 'error') {
  m.rated = kind
  if (!profile.value || !lesson.value) return
  await db.feedback.add({
    id: uid(), profileId: profile.value.id, kind, context: lesson.value.id, text: m.text,
    ts: Date.now(), deviceId: await deviceId(), synced: 0,
  })
  countPending()
}
</script>
