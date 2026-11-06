<template>
  <ion-page>
    <app-header back="/student" title="🌟 Mi jardín de talentos" />
    <ion-content class="ion-padding">
      <div class="hero">
        <div class="eyebrow">✦ Todos tenemos talentos</div>
        <h2>Descubre lo que se te da bien</h2>
        <p>Aquí no hay notas ni respuestas malas. Cada actividad riega tu jardín. 🌱</p>
      </div>

      <ion-segment v-model="tab" scrollable>
        <ion-segment-button value="jardin"><ion-label>🌻 Jardín</ion-label></ion-segment-button>
        <ion-segment-button value="intereses"><ion-label>💛 Me gusta</ion-label></ion-segment-button>
        <ion-segment-button value="logica"><ion-label>🧩 Acertijos</ion-label></ion-segment-button>
        <ion-segment-button value="crea"><ion-label>🎨 Inventa</ion-label></ion-segment-button>
        <ion-segment-button value="explica"><ion-label>🗣️ Explica</ion-label></ion-segment-button>
        <ion-segment-button value="equipo"><ion-label>🤝 Reconoce</ion-label></ion-segment-button>
      </ion-segment>

      <!-- Jardín -->
      <template v-if="tab === 'jardin'">
        <div class="grid-cards" style="margin-top: 10px">
          <ion-card v-for="g in garden" :key="g.skill">
            <ion-card-header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <div class="route-icon">{{ g.emoji }}</div>
                <span style="font-size: 2rem">{{ gardenStage(g.signals.length).emoji }}</span>
              </div>
              <ion-card-title style="font-size: 1rem; margin-top: 6px">{{ g.label }}</ion-card-title>
              <ion-card-subtitle>{{ gardenStage(g.signals.length).text }}</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content v-if="g.signals[0]" class="muted" style="font-size: 0.8rem">Lo último: {{ g.signals[0].detail }}</ion-card-content>
          </ion-card>
        </div>
        <p class="notice">Tu jardín solo crece. No se compara con el de nadie: cada persona florece a su manera.</p>
      </template>

      <!-- Intereses -->
      <ion-card v-if="tab === 'intereses'">
        <ion-card-header><ion-card-title style="font-size: 1.05rem">¿Qué te gusta hacer?</ion-card-title><ion-card-subtitle>Elige todos los que quieras. Puedes cambiarlos cuando quieras.</ion-card-subtitle></ion-card-header>
        <ion-card-content>
          <div class="avatar-options">
            <button v-for="i in INTERESTS" :key="i" class="avatar-option" :class="{ selected: interests.includes(i) }" style="width: auto; height: auto; padding: 8px 12px; font-size: 14px" @click="toggleInterest(i)">{{ i }}</button>
          </div>
          <p v-if="savedMsg" class="notice" style="margin-top: 10px">{{ savedMsg }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Acertijos -->
      <ion-card v-if="tab === 'logica'">
        <ion-card-header>
          <ion-card-subtitle>Acertijo {{ pi + 1 }} de {{ PATTERNS.length }} · ¿Qué sigue?</ion-card-subtitle>
          <ion-card-title style="font-size: 1.4rem">{{ puzzle.prompt }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <ion-button v-for="o in puzzle.options" :key="o" :disabled="puzzleDone" fill="outline" size="large" @click="answerPuzzle(o)">{{ o }}</ion-button>
          </div>
          <p v-if="puzzleMsg" :class="puzzleDone ? 'notice' : 'callout'" style="margin-top: 10px">{{ puzzleMsg }}</p>
          <ion-button v-if="puzzleDone" expand="block" style="margin-top: 8px" @click="nextPuzzle">Otro acertijo →</ion-button>
        </ion-card-content>
      </ion-card>

      <!-- Inventa -->
      <ion-card v-if="tab === 'crea'">
        <ion-card-header>
          <ion-card-subtitle>Reto creativo · no hay respuestas incorrectas</ion-card-subtitle>
          <ion-card-title style="font-size: 1.05rem">{{ CREATIVE_PROMPTS[ci] }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-textarea v-model="ideas" auto-grow fill="outline" :rows="5" placeholder="Una maceta&#10;Un juguete&#10;…" />
          <ion-button expand="block" style="margin-top: 8px" :disabled="ideaList.length === 0 || llm.busy" @click="submitIdeas">🌱 Guardar mis ideas ({{ ideaList.length }})</ion-button>
          <ion-button fill="clear" size="small" @click="nextCreative">Otro reto creativo</ion-button>
          <div v-if="creaReply.text" class="bubble ai">
            {{ creaReply.text }}
            <div class="meta"><span :class="['pill', creaReply.ai ? 'info' : 'ok']">{{ creaReply.ai ? '🤖 Generado por IA local' : '📘 Mensaje de Semilla' }}</span></div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Explica -->
      <ion-card v-if="tab === 'explica'">
        <ion-card-header>
          <ion-card-subtitle>Reto de comunicación · tu docente lo leerá</ion-card-subtitle>
          <ion-card-title style="font-size: 1.05rem">{{ EXPLAIN_PROMPTS[ei] }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-textarea v-model="explain" auto-grow fill="outline" :rows="5" placeholder="Escribe con tus palabras…" />
          <div v-if="explainPii.length" class="callout" style="margin-top: 8px">🛡️ Parece que incluiste {{ explainPii.map((f) => f.kind).join(', ') }}. Mejor quítalo.</div>
          <ion-button expand="block" style="margin-top: 8px" :disabled="words < 8 || explainPii.length > 0" @click="submitExplain">Enviar a mi docente ({{ words }} palabras)</ion-button>
          <ion-button fill="clear" size="small" @click="ei = (ei + 1) % EXPLAIN_PROMPTS.length">Otro tema</ion-button>
          <p v-if="explainMsg" class="notice">{{ explainMsg }}</p>
        </ion-card-content>
      </ion-card>

      <!-- Reconoce -->
      <ion-card v-if="tab === 'equipo'">
        <ion-card-header>
          <ion-card-subtitle>Reconoce a un compañero o compañera</ion-card-subtitle>
          <ion-card-title style="font-size: 1.05rem">Regala una semilla 🌱 a alguien de tu grupo</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p v-if="!classmates.length" class="muted">Cuando haya otros perfiles en este dispositivo, podrás reconocerlos aquí.</p>
          <template v-else>
            <div class="avatar-options">
              <button v-for="c in classmates" :key="c.id" class="avatar-option" :class="{ selected: kudosTo === c.id }" style="width: auto; padding: 0 12px; font-size: 15px" @click="kudosTo = c.id">{{ c.avatar }} {{ c.nickname }}</button>
            </div>
            <p style="margin: 12px 0 4px"><b>¿Por qué?</b></p>
            <div class="avatar-options">
              <button v-for="(r, i) in KUDOS_REASONS" :key="r.text" class="avatar-option" :class="{ selected: kudosReason === i }" style="width: auto; height: auto; padding: 8px 12px; font-size: 14px" @click="kudosReason = i">{{ r.text }}</button>
            </div>
            <ion-button expand="block" style="margin-top: 12px" :disabled="!kudosTo || kudosReason < 0" @click="sendKudos">Regalar semilla 🌱</ion-button>
            <p v-if="kudosMsg" class="notice">{{ kudosMsg }}</p>
          </template>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSegment, IonSegmentButton, IonLabel, IonTextarea, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { INTERESTS, PATTERNS, CREATIVE_PROMPTS, EXPLAIN_PROMPTS, KUDOS_REASONS } from '../data/talents'
import { db, type Profile } from '../db'
import { session, loadSession } from '../services/session'
import { addEvidence, getInterests, setInterests, signalsFor, groupBySkill, gardenStage } from '../services/talents'
import { llm, aiAvailable, chat } from '../llm/engine'
import { detectPII } from '../llm/guardrails'

const router = useRouter()
const tab = ref('jardin')
const garden = ref(groupBySkill([]))
const interests = ref<string[]>([])
const savedMsg = ref('')
const classmates = ref<Profile[]>([])
const pid = () => session.profile!.id

async function refresh() {
  await loadSession()
  if (!session.profile) return router.replace('/')
  garden.value = groupBySkill(await signalsFor(pid()))
  interests.value = await getInterests(pid())
  classmates.value = (await db.profiles.toArray()).filter((p) => p.id !== pid())
}
onIonViewWillEnter(refresh)
watch(tab, (t) => t === 'jardin' && refresh())

async function toggleInterest(i: string) {
  interests.value = interests.value.includes(i) ? interests.value.filter((x) => x !== i) : [...interests.value, i]
  await setInterests(pid(), interests.value)
  savedMsg.value = 'Guardado ✔ Tu docente podrá proponerte actividades sobre lo que te gusta.'
}

// ── Acertijos (pensamiento lógico) ──
const pi = ref(0)
const tries = ref(0)
const puzzleDone = ref(false)
const puzzleMsg = ref('')
const puzzle = computed(() => PATTERNS[pi.value])
async function answerPuzzle(o: string) {
  tries.value++
  if (o === puzzle.value.answer) {
    puzzleDone.value = true
    puzzleMsg.value = `🎉 ¡Lo encontraste! ${puzzle.value.why}`
    if (tries.value === 1) await addEvidence(pid(), 'logica', 'Acertijos', `Descubrió el patrón “${puzzle.value.prompt}” al primer intento.`)
    else await addEvidence(pid(), 'problemas', 'Acertijos', `Probó otras opciones hasta descubrir el patrón “${puzzle.value.prompt}”.`)
  } else {
    puzzleMsg.value = '🤔 Casi. Mira cómo cambia cada elemento respecto al anterior e inténtalo otra vez.'
  }
}
function nextPuzzle() {
  pi.value = (pi.value + 1) % PATTERNS.length
  tries.value = 0
  puzzleDone.value = false
  puzzleMsg.value = ''
}

// ── Inventa (creatividad) ──
const ci = ref(0)
const ideas = ref('')
const ideaList = computed(() => [...new Set(ideas.value.split('\n').map((l) => l.trim().toLowerCase()).filter((l) => l.length > 1))])
const creaReply = reactive({ text: '', ai: false })
async function submitIdeas() {
  const list = ideaList.value
  await addEvidence(pid(), 'creatividad', 'Inventa', `Propuso ${list.length} idea(s) para “${CREATIVE_PROMPTS[ci.value].split('?')[0]}?”: ${list.slice(0, 6).join('; ')}.`)
  creaReply.ai = false
  creaReply.text = `¡${list.length} ideas! 🌱 Cada idea nueva hace crecer tu creatividad.`
  if (aiAvailable()) {
    creaReply.ai = true
    creaReply.text = ''
    try {
      await chat(
        [
          { role: 'system', content: 'Eres un compañero entusiasta. Respondes en español, en máximo 2 frases, sin evaluar ni poner nota.' },
          { role: 'user', content: `Reto: ${CREATIVE_PROMPTS[ci.value]}\nIdeas de un estudiante:\n${list.join('\n')}\nCelebra UNA idea concreta y haz una pregunta "¿Y si…?" para que imagine una idea nueva.` },
        ],
        { onToken: (t) => (creaReply.text = t), maxTokens: 90, temperature: 0.8 },
      )
    } catch {
      creaReply.ai = false
      creaReply.text = `¡${list.length} ideas! 🌱 ¿Y si pensaras en una idea que nadie más haya dicho?`
    }
  }
}
function nextCreative() {
  ci.value = (ci.value + 1) % CREATIVE_PROMPTS.length
  ideas.value = ''
  creaReply.text = ''
}

// ── Explica (comunicación) ──
const ei = ref(0)
const explain = ref('')
const explainMsg = ref('')
const words = computed(() => explain.value.trim().split(/\s+/).filter(Boolean).length)
const explainPii = computed(() => detectPII(explain.value))
async function submitExplain() {
  const t = explain.value.trim()
  await addEvidence(pid(), 'comunicacion', 'Explica', `Explicó “${EXPLAIN_PROMPTS[ei.value]}” (${words.value} palabras): “${t.slice(0, 280)}${t.length > 280 ? '…' : ''}”`)
  explain.value = ''
  explainMsg.value = '¡Enviado! 🗣️ Explicar a otros es una gran forma de aprender.'
}

// ── Reconoce (colaboración entre pares) ──
const kudosTo = ref('')
const kudosReason = ref(-1)
const kudosMsg = ref('')
async function sendKudos() {
  const r = KUDOS_REASONS[kudosReason.value]
  const to = classmates.value.find((c) => c.id === kudosTo.value)!
  await addEvidence(to.id, r.skill, 'Reconocimiento de un compañero', `Un compañero dijo: “${r.text}”.`, 'compañero')
  kudosMsg.value = `🌱 ¡Semilla enviada a ${to.nickname}! Reconocer a otros también es un talento.`
  await addEvidence(pid(), 'colaboracion', 'Reconoce', 'Reconoció el aporte de un compañero.')
  kudosTo.value = ''
  kudosReason.value = -1
}
</script>
