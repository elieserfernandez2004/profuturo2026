<template>
  <div>
    <div class="hero" style="margin-top: 12px">
      <div class="eyebrow">✦ Reto 20 · Que ningún talento pase desapercibido</div>
      <h2>Señales, no etiquetas</h2>
      <p>Evidencias concretas de lo que cada estudiante hace bien. Sin puntajes, sin rankings, sin decisiones automáticas: tú interpretas.</p>
    </div>

    <ion-select v-model="selected" label="Estudiante" label-placement="stacked" fill="outline" interface="popover" placeholder="Elige un estudiante">
      <ion-select-option v-for="p in profiles" :key="p.id" :value="p.id">{{ p.avatar }} {{ p.nickname }}</ion-select-option>
    </ion-select>
    <p v-if="!profiles.length" class="muted">Aún no hay estudiantes. Importa paquetes en “Sincronizar”.</p>

    <template v-if="current">
      <ion-card>
        <ion-card-header><ion-card-title style="font-size: 1rem">💛 Le gusta</ion-card-title></ion-card-header>
        <ion-card-content>
          <span v-for="i in interests" :key="i" class="pill info" style="margin: 2px">{{ i }}</span>
          <span v-if="!interests.length" class="muted">Todavía no eligió intereses.</span>
        </ion-card-content>
      </ion-card>

      <ion-card v-for="g in groups" :key="g.skill">
        <ion-card-header>
          <div style="display: flex; justify-content: space-between; align-items: center">
            <ion-card-title style="font-size: 1rem">{{ g.emoji }} {{ g.label }}</ion-card-title>
            <span class="pill" :class="g.signals.length ? 'ok' : 'info'">{{ g.signals.length ? `${g.signals.length} señal(es)` : 'Aún sin señales' }}</span>
          </div>
        </ion-card-header>
        <ion-card-content>
          <div v-for="(s, i) in g.signals.slice(0, 4)" :key="i" style="margin-bottom: 8px">
            <span class="pill" :class="badge(s.by).cls">{{ badge(s.by).text }}</span>
            <span class="muted"> {{ s.source }} · {{ new Date(s.ts).toLocaleDateString() }}</span>
            <div style="font-size: 0.9rem">{{ s.detail }}</div>
          </div>
          <p v-if="!g.signals.length" class="muted" style="font-size: 0.85rem">Que no haya señales no significa que no tenga esta habilidad: quizá aún no tuvo la oportunidad de mostrarla.</p>
          <p v-if="g.signals.length" class="muted" style="font-size: 0.85rem">💡 {{ g.idea }}</p>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title style="font-size: 1rem">🧭 Ideas para personalizar</ion-card-title>
          <ion-card-subtitle>Propuestas para que tú decidas. No se aplican solas.</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ul v-if="ruleIdeas.length" style="padding-left: 18px; margin-top: 0">
            <li v-for="r in ruleIdeas" :key="r">{{ r }}</li>
          </ul>
          <ion-button v-if="aiAvailable()" size="small" fill="outline" :disabled="llm.busy || !hasSignals" @click="aiIdeas">✨ Sugerir actividades con IA local</ion-button>
          <div v-if="aiText" class="bubble ai">
            {{ aiText }}
            <div class="meta"><span class="pill info">🤖 Generado por IA local</span><span>· Revisa antes de usar; puede equivocarse</span></div>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title style="font-size: 1rem">👀 Añadir lo que observé en clase</ion-card-title>
          <ion-card-subtitle>Muchos talentos solo se ven en el aula, el patio o la comunidad.</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <ion-select v-model="obsSkill" label="Habilidad" label-placement="stacked" fill="outline" interface="popover">
            <ion-select-option v-for="(v, k) in SKILLS" :key="k" :value="k">{{ v.emoji }} {{ v.label }}</ion-select-option>
          </ion-select>
          <ion-textarea v-model="obsText" auto-grow fill="outline" placeholder="Organizó al grupo para medir el patio con pasos." style="margin-top: 8px" />
          <ion-button size="small" style="margin-top: 8px" :disabled="!obsText.trim()" @click="addObs">Guardar observación</ion-button>
        </ion-card-content>
      </ion-card>
    </template>

    <div class="callout">
      ⚖️ <b>Uso responsable:</b> estas señales sirven para abrir oportunidades, nunca para clasificar, agrupar por “capacidad” ni tomar decisiones sobre el estudiante. Compártelas con la familia en positivo.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonSelect, IonSelectOption, IonTextarea } from '@ionic/vue'
import { db, type Profile, type Skill } from '../db'
import { SKILLS } from '../data/talents'
import { signalsFor, groupBySkill, getInterests, addEvidence, type Signal } from '../services/talents'
import { llm, aiAvailable, chat } from '../llm/engine'

const profiles = ref<Profile[]>([])
const selected = ref('')
const signals = ref<Signal[]>([])
const interests = ref<string[]>([])
const aiText = ref('')
const obsSkill = ref<Skill>('colaboracion')
const obsText = ref('')

const current = computed(() => profiles.value.find((p) => p.id === selected.value))
const groups = computed(() => groupBySkill(signals.value))
const hasSignals = computed(() => signals.value.length > 0)

const ruleIdeas = computed(() => {
  const strong = groups.value.filter((g) => g.signals.length > 0).sort((a, b) => b.signals.length - a.signals.length)
  const ideas = strong.slice(0, 2).map((g) => g.idea)
  if (interests.value.length && strong.length) {
    ideas.push(`Conecta un reto de ${strong[0].label.toLowerCase()} con lo que le gusta: ${interests.value.slice(0, 2).join(' y ')}.`)
  }
  const unseen = groups.value.filter((g) => !g.signals.length).map((g) => g.label.toLowerCase())
  if (unseen.length) ideas.push(`Dale oportunidades de mostrar: ${unseen.slice(0, 3).join(', ')}.`)
  return ideas
})

function badge(by: Signal['by']) {
  return {
    actividad: { cls: 'info', text: '🎯 Actividad' },
    progreso: { cls: 'info', text: '📈 Uso de la app' },
    docente: { cls: 'warn', text: '👩‍🏫 Docente' },
    compañero: { cls: 'ok', text: '🤝 Compañero' },
  }[by]
}

async function load() {
  profiles.value = await db.profiles.orderBy('nickname').toArray()
  if (!selected.value && profiles.value[0]) selected.value = profiles.value[0].id
}
onMounted(load)
watch(selected, async (id) => {
  aiText.value = ''
  if (!id) return
  signals.value = await signalsFor(id)
  interests.value = await getInterests(id)
})

async function addObs() {
  await addEvidence(selected.value, obsSkill.value, 'Observación en clase', obsText.value.trim(), 'docente')
  obsText.value = ''
  signals.value = await signalsFor(selected.value)
}

async function aiIdeas() {
  // a la IA solo le llegan habilidades observadas e intereses: sin nombre ni apodo
  const summary = groups.value.filter((g) => g.signals.length).map((g) => `${g.label}: ${g.signals.length} señales (p. ej. ${g.signals[0].detail.slice(0, 120)})`).join('\n')
  aiText.value = ''
  try {
    await chat(
      [
        { role: 'system', content: 'Ayudas a docentes de primaria en contextos rurales. Respondes en español. Nunca etiquetas ni diagnosticas al estudiante: propones oportunidades.' },
        { role: 'user', content: `Fortalezas observadas:\n${summary}\nIntereses: ${interests.value.join(', ') || 'no indicados'}\nPropón 3 actividades concretas y breves (una línea cada una) para potenciar estas fortalezas en clase, con materiales sencillos.` },
      ],
      { onToken: (t) => (aiText.value = t), maxTokens: 220, temperature: 0.7 },
    )
  } catch {
    aiText.value = '(No se pudo generar.)'
  }
}
</script>
