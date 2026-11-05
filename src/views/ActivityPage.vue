<template>
  <ion-page>
    <app-header back="/student" title="📝 Actividad" />
    <ion-content class="ion-padding">
      <ion-card v-if="act">
        <ion-card-header>
          <ion-card-title>{{ act.title }}</ion-card-title>
          <ion-card-subtitle>{{ act.aiGenerated ? '🤖 Propuesta por IA y ' : '' }}✅ revisada por tu docente</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div style="white-space: pre-wrap; line-height: 1.6">{{ visible }}</div>
          <ion-button v-if="!showAnswers && hasAnswers" fill="outline" style="margin-top: 12px" @click="showAnswers = true">Ver respuestas (cuando termines)</ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, onIonViewWillEnter } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
import { db, type Activity } from '../db'

const route = useRoute()
const act = ref<Activity>()
const showAnswers = ref(false)
const splitAt = computed(() => act.value?.content.search(/\n\s*\**\s*respuestas/i) ?? -1)
const hasAnswers = computed(() => splitAt.value > 0)
const visible = computed(() => {
  if (!act.value) return ''
  return hasAnswers.value && !showAnswers.value ? act.value.content.slice(0, splitAt.value) : act.value.content
})

onIonViewWillEnter(async () => {
  act.value = await db.activities.get(String(route.params.id))
  showAnswers.value = false
})
</script>
