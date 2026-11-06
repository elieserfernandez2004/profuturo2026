<template>
  <ion-page>
    <app-header back="/" />
    <ion-content class="ion-padding">
      <template v-if="p">
        <div class="hero">
          <div class="eyebrow">✦ Tu siguiente aventura</div>
          <h2>{{ p.avatar }} ¡Hola, {{ p.nickname }}!</h2>
          <p>Aprender empieza con curiosidad. Equivocarse también es aprender.</p>
          <div style="margin-top: 12px; position: relative; z-index: 1">
            <div class="muted" style="display: flex; justify-content: space-between">
              <span>Ejercicios resueltos</span><span>{{ solved }} / {{ totalEx }}</span>
            </div>
            <div class="progressbar"><span :style="{ width: `${(solved / totalEx) * 100}%` }" /></div>
          </div>
        </div>

        <div v-for="m in messages" :key="m.id" class="callout" style="margin: 0 4px 10px">
          📨 <b>Mensaje de tu docente:</b> {{ m.text }}
        </div>

        <div class="section-title">Mis rutas de aprendizaje</div>
        <div class="grid-cards">
          <ion-card v-for="l in LESSONS" :key="l.id" button @click="$router.push(`/lesson/${l.id}`)">
            <ion-card-header>
              <div style="display: flex; justify-content: space-between; align-items: center">
                <div class="route-icon">{{ l.emoji }}</div>
                <span class="pill warn">{{ l.grade }}</span>
              </div>
              <ion-card-title style="font-size: 1.05rem; margin-top: 8px">{{ l.title }}</ion-card-title>
              <ion-card-subtitle>{{ l.exercises.length }} retos · tutor con pistas</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </div>

        <ion-card button style="margin-top: 12px" @click="$router.push('/talents')">
          <ion-card-header>
            <div style="display: flex; gap: 12px; align-items: center">
              <div class="route-icon">🌟</div>
              <div>
                <ion-card-title style="font-size: 1.05rem">Mi jardín de talentos</ion-card-title>
                <ion-card-subtitle>Acertijos, inventos, explicaciones y semillas para tu equipo. ¡Sin notas!</ion-card-subtitle>
              </div>
            </div>
          </ion-card-header>
        </ion-card>

        <div class="section-title">Aprender a usar la IA con cabeza</div>
        <div class="grid-cards">
          <ion-card button @click="$router.push('/detective')">
            <ion-card-header>
              <div class="route-icon">🕵️</div>
              <ion-card-title style="font-size: 1.05rem; margin-top: 8px">Detective de IA</ion-card-title>
              <ion-card-subtitle>¿La IA dijo la verdad? Descubre errores, sesgos y cuándo NO usarla.</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
          <ion-card button @click="$router.push('/limits')">
            <ion-card-header>
              <div class="route-icon">💡</div>
              <ion-card-title style="font-size: 1.05rem; margin-top: 8px">¿Cómo funciona Semilla?</ion-card-title>
              <ion-card-subtitle>Qué hace la IA, qué no puede hacer y cómo cuida tus datos.</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </div>

        <template v-if="activities.length">
          <div class="section-title">Actividades de tu docente</div>
          <ion-card v-for="a in activities" :key="a.id" button @click="$router.push(`/activity/${a.id}`)">
            <ion-card-header>
              <ion-card-title style="font-size: 1rem">📝 {{ a.title }}</ion-card-title>
              <ion-card-subtitle>Revisada por tu docente · {{ a.level }}</ion-card-subtitle>
            </ion-card-header>
          </ion-card>
        </template>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { LESSONS } from '../data/lessons'
import { db, type Activity, type Message } from '../db'
import { session, loadSession } from '../services/session'

const router = useRouter()
const p = computed(() => session.profile)
const solved = ref(0)
const totalEx = LESSONS.reduce((n, l) => n + l.exercises.length, 0)
const messages = ref<Message[]>([])
const activities = ref<Activity[]>([])

onIonViewWillEnter(async () => {
  await loadSession()
  if (!session.profile) return router.replace('/')
  const id = session.profile.id
  const rows = await db.attempts.where('profileId').equals(id).filter((a) => a.correct).toArray()
  solved.value = new Set(rows.map((r) => r.exerciseId)).size
  messages.value = (await db.messages.orderBy('ts').reverse().toArray()).filter((m) => m.to === 'all' || m.to === id).slice(0, 3)
  activities.value = await db.activities.filter((a) => a.approved).toArray()
})
</script>
