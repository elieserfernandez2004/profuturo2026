<template>
  <ion-page>
    <app-header back="/" title="⚙️ IA local y ajustes" />
    <ion-content class="ion-padding">
      <div class="hero">
        <div class="eyebrow">✦ IA en el dispositivo</div>
        <h2>{{ statusTitle }}</h2>
        <p>Se descarga una sola vez (con wifi o en la red local de la escuela). Después funciona en modo avión.</p>
      </div>

      <ion-card>
        <ion-card-header><ion-card-title style="font-size: 1rem">📱 Este dispositivo</ion-card-title></ion-card-header>
        <ion-card-content>
          <p>WebGPU: <b>{{ llm.status === 'unsupported' ? 'no disponible → modo sin IA (pistas de docentes)' : 'disponible' }}</b></p>
          <p v-if="llm.gpuName">GPU: {{ llm.gpuName }} {{ llm.f16 ? '· f16 ✔' : '' }}</p>
          <p>Memoria aprox.: {{ llm.deviceMemory ? `${llm.deviceMemory} GB` : 'desconocida' }} · Recomendado: <b>{{ llm.recommended }}</b></p>
          <p v-if="storage">Almacenamiento usado: {{ storage }}</p>
        </ion-card-content>
      </ion-card>

      <ion-card v-for="m in MODEL_OPTIONS" :key="m.tier">
        <ion-card-header>
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px">
            <ion-card-title style="font-size: 1rem">{{ m.label }}</ion-card-title>
            <span v-if="m.tier === llm.recommended" class="pill ok">Recomendado</span>
          </div>
          <ion-card-subtitle>{{ m.note }} · ~{{ (m.sizeMB / 1000).toFixed(1) }} GB · {{ cached[m.tier] ? '✔ descargado' : 'no descargado' }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <template v-if="llm.status === 'loading' && currentTier() === m.tier">
            <div class="progressbar"><span :style="{ width: `${llm.progress * 100}%` }" /></div>
            <p class="muted" style="font-size: 0.75rem">{{ llm.progressText }}</p>
          </template>
          <template v-else>
            <ion-button
              size="small"
              :disabled="llm.status === 'unsupported' || llm.status === 'loading' || (llm.status === 'ready' && currentTier() === m.tier)"
              @click="use(m.tier)"
            >
              {{ llm.status === 'ready' && currentTier() === m.tier ? '✔ En uso' : cached[m.tier] ? 'Usar este modelo' : '⬇️ Descargar y usar' }}
            </ion-button>
            <ion-button v-if="cached[m.tier]" size="small" fill="clear" color="danger" @click="remove(m.tier)">Borrar</ion-button>
          </template>
        </ion-card-content>
      </ion-card>
      <p v-if="llm.error" class="callout">⚠️ {{ llm.error }}</p>

      <ion-card>
        <ion-card-header><ion-card-title style="font-size: 1rem">🔐 Docente y familia</ion-card-title></ion-card-header>
        <ion-card-content>
          <ion-input v-model="newPin" type="password" inputmode="numeric" fill="outline" label="Nuevo PIN docente" label-placement="stacked" />
          <ion-button size="small" style="margin-top: 8px" :disabled="newPin.length < 4" @click="savePin">Guardar PIN</ion-button>
          <p v-if="pinSaved" class="notice">PIN actualizado ✔</p>
          <hr style="border: 0; border-top: 1px solid var(--violet-line); margin: 16px 0" />
          <p>🧹 <b>Borrar avances</b>: elimina perfiles, progreso y actividades de este dispositivo (el modelo de IA se conserva).</p>
          <ion-button color="danger" fill="outline" size="small" @click="confirmWipe">Borrar todos los avances</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonInput, alertController, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { llm, MODEL_OPTIONS, isCached, loadModel, deleteModel, currentTier, detectDevice, type Tier } from '../llm/engine'
import { setKV, wipeAll } from '../db'
import { session } from '../services/session'

const router = useRouter()
const cached = reactive<Record<Tier, boolean>>({ alta: false, media: false, baja: false })
const storage = ref('')
const newPin = ref('')
const pinSaved = ref(false)

const statusTitle = computed(
  () =>
    ({
      idle: 'Comprobando…',
      checking: 'Comprobando el dispositivo…',
      'not-downloaded': 'Lista para descargar',
      loading: `Preparando la IA… ${Math.round(llm.progress * 100)}%`,
      ready: '🧠 IA local activa',
      unsupported: 'Modo sin IA (funciona igual)',
      error: 'No se pudo cargar la IA',
    })[llm.status],
)

async function refresh() {
  if (llm.status === 'idle') await detectDevice()
  for (const m of MODEL_OPTIONS) cached[m.tier] = await isCached(m.tier)
  try {
    const est = await navigator.storage?.estimate?.()
    if (est?.usage) storage.value = `${(est.usage / 1e9).toFixed(2)} GB de ${((est.quota ?? 0) / 1e9).toFixed(0)} GB`
  } catch {
    /* sin soporte */
  }
}
onIonViewWillEnter(refresh)

async function use(t: Tier) {
  // pedir almacenamiento persistente para que el navegador no borre el modelo
  try {
    await navigator.storage?.persist?.()
  } catch {
    /* opcional */
  }
  await loadModel(t)
  refresh()
}
async function remove(t: Tier) {
  await deleteModel(t)
  refresh()
}
async function savePin() {
  await setKV('teacherPin', newPin.value)
  newPin.value = ''
  pinSaved.value = true
}
async function confirmWipe() {
  const a = await alertController.create({
    header: '¿Borrar todos los avances?',
    message: 'Se eliminarán perfiles, progreso, mensajes y actividades de este dispositivo. No se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Borrar',
        role: 'destructive',
        handler: async () => {
          await wipeAll()
          session.profile = null
          session.consent = false
          session.teacherUnlocked = false
          router.replace('/')
        },
      },
    ],
  })
  await a.present()
}
</script>
