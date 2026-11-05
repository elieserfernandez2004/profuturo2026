<template>
  <ion-page>
    <app-header />
    <ion-content class="ion-padding">
      <!-- 1. Consentimiento de la persona adulta -->
      <ion-card v-if="session.loaded && !session.consent">
        <ion-card-header>
          <div class="big-emoji">🛡️</div>
          <ion-card-title>Antes de empezar</ion-card-title>
          <ion-card-subtitle>Lee esto con una persona adulta.</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="notice" style="margin-bottom: 8px">👪 El uso debe ser autorizado y acompañado por una madre, padre, tutor o docente.</div>
          <div class="notice" style="margin-bottom: 8px">🔒 No pedimos datos reales: solo un apodo y un avatar.</div>
          <div class="notice" style="margin-bottom: 8px">🧠 La IA funciona <b>dentro de este dispositivo</b>. Lo que escribes no se envía a internet.</div>
          <div class="notice" style="margin-bottom: 8px">🧹 Los avances se pueden borrar en cualquier momento desde Ajustes.</div>
          <ion-item lines="none">
            <ion-checkbox v-model="agree" label-placement="end">Soy una persona adulta responsable y autorizo el uso acompañado.</ion-checkbox>
          </ion-item>
          <ion-button expand="block" :disabled="!agree" @click="giveConsent()">Continuar →</ion-button>
        </ion-card-content>
      </ion-card>

      <template v-else-if="session.loaded">
        <div class="hero">
          <div class="eyebrow">✦ Aprender sin conexión</div>
          <h2>¡Hola! ¿Quién aprende hoy?</h2>
          <p>Elige tu perfil o crea uno nuevo con un apodo. Semilla te acompaña con pistas, no con respuestas.</p>
        </div>

        <div class="section-title">Perfiles en este dispositivo</div>
        <div class="avatar-options" style="margin: 0 4px 10px">
          <button v-for="p in profiles" :key="p.id" class="avatar-option" style="width: auto; padding: 0 12px; font-size: 16px" @click="enter(p)">
            {{ p.avatar }} {{ p.nickname }}
          </button>
          <span v-if="!profiles.length" class="muted">Todavía no hay perfiles.</span>
        </div>

        <ion-card>
          <ion-card-header><ion-card-title>🌱 Crea tu espacio</ion-card-title></ion-card-header>
          <ion-card-content>
            <ion-input v-model="nickname" label="Tu apodo" label-placement="stacked" fill="outline" placeholder="Ej.: Estrella" :maxlength="16" />
            <p class="muted">No uses tu nombre completo.</p>
            <div v-if="nickPii.length" class="callout">🛡️ Parece un nombre completo. Usa solo un apodo para proteger tus datos.</div>
            <ion-segment v-model="ageGroup" style="margin: 10px 0">
              <ion-segment-button value="8-10"><ion-label>8–10 años</ion-label></ion-segment-button>
              <ion-segment-button value="11-14"><ion-label>11–14 años</ion-label></ion-segment-button>
            </ion-segment>
            <div class="avatar-options">
              <button v-for="a in AVATARS" :key="a" class="avatar-option" :class="{ selected: a === avatar }" @click="avatar = a">{{ a }}</button>
            </div>
            <ion-button expand="block" style="margin-top: 14px" :disabled="!nickname.trim() || nickPii.length > 0" @click="create">Guardar perfil y empezar →</ion-button>
          </ion-card-content>
        </ion-card>

        <ion-button fill="outline" expand="block" @click="$router.push('/teacher')">👩‍🏫 Soy docente</ion-button>
        <ion-button fill="clear" expand="block" @click="$router.push('/settings')">⚙️ IA local y ajustes</ion-button>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonInput, IonItem, IonCheckbox, IonSegment, IonSegmentButton, IonLabel, onIonViewWillEnter,
} from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { db, uid, type AgeGroup, type Profile } from '../db'
import { session, loadSession, giveConsent, selectProfile, AVATARS } from '../services/session'
import { detectPII } from '../llm/guardrails'

const router = useRouter()
const agree = ref(false)
const profiles = ref<Profile[]>([])
const nickname = ref('')
const ageGroup = ref<AgeGroup>('8-10')
const avatar = ref(AVATARS[0])
const nickPii = computed(() => detectPII(`me llamo ${nickname.value}`).filter((f) => f.kind === 'nombre completo'))

async function refresh() {
  profiles.value = await db.profiles.orderBy('nickname').toArray()
}
onMounted(async () => {
  await loadSession()
  await refresh()
})
onIonViewWillEnter(refresh)

async function create() {
  const p: Profile = { id: uid(), nickname: nickname.value.trim(), avatar: avatar.value, ageGroup: ageGroup.value, createdAt: Date.now() }
  await db.profiles.add(p)
  nickname.value = ''
  await enter(p)
}
async function enter(p: Profile) {
  await selectProfile(p)
  router.push('/student')
}
</script>
