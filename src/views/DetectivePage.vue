<template>
  <ion-page>
    <app-header back="/student" title="🕵️ Detective de IA" />
    <ion-content class="ion-padding">
      <div class="hero">
        <div class="eyebrow">✦ Pensamiento crítico</div>
        <h2>Las IA también se equivocan</h2>
        <p>Descubre errores, sesgos, fuentes inventadas y cuándo NO usar IA. Puntos: <b>{{ score }}</b> 🏅</p>
      </div>

      <ion-segment v-model="game" scrollable>
        <ion-segment-button value="verdad"><ion-label>¿Verdad?</ion-label></ion-segment-button>
        <ion-segment-button value="en-vivo"><ion-label>IA en vivo</ion-label></ion-segment-button>
        <ion-segment-button value="usar-ia"><ion-label>¿Usar IA?</ion-label></ion-segment-button>
        <ion-segment-button value="datos"><ion-label>Mis datos</ion-label></ion-segment-button>
      </ion-segment>

      <!-- 1. Verdad o alucinación -->
      <ion-card v-if="game === 'verdad'">
        <ion-card-header>
          <ion-card-subtitle>Una IA dijo… ({{ ti + 1 }}/{{ TRUTH_ITEMS.length }})</ion-card-subtitle>
          <ion-card-title style="font-size: 1.15rem">🤖 “{{ truth.claim }}”</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <template v-if="!answered">
            <ion-button expand="block" color="secondary" @click="answerTruth(true)">✅ Es verdad</ion-button>
            <ion-button expand="block" color="danger" @click="answerTruth(false)">❌ Es falso o injusto</ion-button>
          </template>
          <template v-else>
            <div :class="lastOk ? 'notice' : 'callout'">
              {{ lastOk ? '🎉 ¡Bien visto!' : '🤔 Esta vez no.' }} <span class="pill info">{{ truth.kind }}</span><br />{{ truth.why }}
            </div>
            <ion-button expand="block" style="margin-top: 10px" @click="nextItem">Siguiente →</ion-button>
          </template>
        </ion-card-content>
      </ion-card>

      <!-- 2. IA en vivo: el modelo real responde, el niño verifica con la lección -->
      <ion-card v-if="game === 'en-vivo'">
        <ion-card-header>
          <ion-card-subtitle>La IA de este dispositivo responde. Tú decides si acertó.</ion-card-subtitle>
          <ion-card-title style="font-size: 1.1rem">❓ {{ fact.q }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div v-if="!aiAvailable()" class="callout">Activa la IA local en Ajustes para jugar este modo.</div>
          <template v-else>
            <ion-button v-if="!live.text && !live.loading" expand="block" @click="askLive">🤖 Preguntar a la IA</ion-button>
            <div v-if="live.text || live.loading" class="bubble ai">
              {{ live.text }}<span v-if="live.loading"> ▍</span>
              <div class="meta"><span class="pill info">🤖 Generado por IA local</span><span>· Puede equivocarse</span></div>
            </div>
            <template v-if="live.text && !live.loading && liveVerdict === null">
              <p><b>¿La IA acertó?</b> Compruébalo con lo que aprendiste.</p>
              <ion-button expand="block" color="secondary" @click="judgeLive(true)">✅ Acertó</ion-button>
              <ion-button expand="block" color="danger" @click="judgeLive(false)">❌ Se equivocó</ion-button>
            </template>
            <template v-if="liveVerdict !== null">
              <div class="notice">📘 Respuesta correcta según la lección: <b>{{ fact.a }}</b>.<br />Compara y piensa: ¿tu juicio coincidió? Tu docente puede revisarlo contigo.</div>
              <ion-button expand="block" style="margin-top: 10px" @click="nextFact">Otra pregunta →</ion-button>
            </template>
          </template>
        </ion-card-content>
      </ion-card>

      <!-- 3. ¿Es buena idea usar IA? -->
      <ion-card v-if="game === 'usar-ia'">
        <ion-card-header>
          <ion-card-subtitle>¿Usarías IA en esta situación? ({{ ui + 1 }}/{{ USE_AI_ITEMS.length }})</ion-card-subtitle>
          <ion-card-title style="font-size: 1.1rem">{{ useAi.situation }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <template v-if="!answered">
            <ion-button expand="block" color="secondary" @click="answerUse(true)">👍 Buena idea</ion-button>
            <ion-button expand="block" color="warning" @click="answerUse(false)">✋ Mejor no / con un adulto</ion-button>
          </template>
          <template v-else>
            <div :class="lastOk ? 'notice' : 'callout'">{{ lastOk ? '🎉 ¡Exacto!' : '🤔 Piénsalo otra vez.' }} {{ useAi.why }}</div>
            <ion-button expand="block" style="margin-top: 10px" @click="nextItem">Siguiente →</ion-button>
          </template>
        </ion-card-content>
      </ion-card>

      <!-- 4. Escudo de datos -->
      <ion-card v-if="game === 'datos'">
        <ion-card-header>
          <ion-card-subtitle>¿Este mensaje comparte datos personales? ({{ di + 1 }}/{{ DATA_ITEMS.length }})</ion-card-subtitle>
          <ion-card-title style="font-size: 1.1rem">💬 “{{ data.message }}”</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <template v-if="!answered">
            <ion-button expand="block" color="danger" @click="answerData(true)">🛡️ Sí, tiene datos personales</ion-button>
            <ion-button expand="block" color="secondary" @click="answerData(false)">👌 No, es seguro</ion-button>
          </template>
          <template v-else>
            <div :class="lastOk ? 'notice' : 'callout'">{{ lastOk ? '🎉 ¡Bien protegido!' : '🤔 Revisa otra vez.' }} {{ data.why }}</div>
            <ion-button expand="block" style="margin-top: 10px" @click="nextItem">Siguiente →</ion-button>
          </template>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSegment, IonSegmentButton, IonLabel, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { TRUTH_ITEMS, USE_AI_ITEMS, DATA_ITEMS } from '../data/detective'
import { LESSONS } from '../data/lessons'
import { db, uid, deviceId, type DetectiveResult } from '../db'
import { session, loadSession } from '../services/session'
import { aiAvailable, chat } from '../llm/engine'
import { factMessages } from '../llm/prompts'
import { countPending } from '../services/sync'

const game = ref<DetectiveResult['game']>('verdad')
const ti = ref(0), ui = ref(0), di = ref(0), fi = ref(0)
const answered = ref(false)
const lastOk = ref(false)
const score = ref(0)
const truth = computed(() => TRUTH_ITEMS[ti.value])
const useAi = computed(() => USE_AI_ITEMS[ui.value])
const data = computed(() => DATA_ITEMS[di.value])
const FACTS = LESSONS.flatMap((l) => l.facts)
const fact = computed(() => FACTS[fi.value])
const live = reactive({ text: '', loading: false })
const liveVerdict = ref<boolean | null>(null)

watch(game, () => (answered.value = false))

onIonViewWillEnter(async () => {
  await loadSession()
  if (session.profile) score.value = await db.detective.where('profileId').equals(session.profile.id).filter((r) => r.correct).count()
})

async function save(itemId: string, correct: boolean) {
  lastOk.value = correct
  answered.value = true
  if (correct) score.value++
  if (!session.profile) return
  await db.detective.add({ id: uid(), profileId: session.profile.id, game: game.value, itemId, correct, ts: Date.now(), deviceId: await deviceId(), synced: 0 })
  countPending()
}
const answerTruth = (v: boolean) => save(truth.value.id, v === truth.value.truth)
const answerUse = (v: boolean) => save(useAi.value.id, v === useAi.value.good)
const answerData = (v: boolean) => save(data.value.id, v === data.value.personal)

function nextItem() {
  answered.value = false
  if (game.value === 'verdad') ti.value = (ti.value + 1) % TRUTH_ITEMS.length
  if (game.value === 'usar-ia') ui.value = (ui.value + 1) % USE_AI_ITEMS.length
  if (game.value === 'datos') di.value = (di.value + 1) % DATA_ITEMS.length
}

async function askLive() {
  live.loading = true
  live.text = ''
  try {
    live.text = await chat(factMessages(fact.value.q), { onToken: (t) => (live.text = t), maxTokens: 60, temperature: 0.7 })
  } catch {
    live.text = '(La IA no pudo responder)'
  } finally {
    live.loading = false
  }
}
async function judgeLive(v: boolean) {
  liveVerdict.value = v
  // no sabemos con certeza si el modelo acertó: guardamos el juicio para que la docente lo revise
  if (!session.profile) return
  await db.feedback.add({
    id: uid(), profileId: session.profile.id, kind: v ? 'helpful' : 'error',
    context: `detective-en-vivo: ${fact.value.q}`, text: live.text, ts: Date.now(), deviceId: await deviceId(), synced: 0,
  })
  countPending()
}
function nextFact() {
  fi.value = (fi.value + 1) % FACTS.length
  live.text = ''
  liveVerdict.value = null
}
</script>
