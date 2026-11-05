<template>
  <ion-header class="ion-no-border">
    <ion-toolbar>
      <ion-buttons slot="start">
        <ion-back-button v-if="back" :default-href="back" text="" />
      </ion-buttons>
      <ion-title>
        <span class="brand"><span class="brandmark">🌱</span><span v-if="!title">semilla<em>.</em></span><span v-else>{{ title }}</span></span>
      </ion-title>
      <ion-buttons slot="end">
        <span class="pill" :class="net.online ? 'info' : 'ok'" :title="net.online ? 'Con red' : 'Sin red: todo sigue funcionando'">
          {{ net.online ? '📶 En línea' : '✈️ Sin red' }}
        </span>
        <span class="pill" :class="aiPill.cls" style="margin-left: 6px" @click="$router.push('/settings')">{{ aiPill.text }}</span>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/vue'
import { net } from '../services/sync'
import { llm } from '../llm/engine'

defineProps<{ title?: string; back?: string }>()

const aiPill = computed(() => {
  switch (llm.status) {
    case 'ready':
      return { cls: 'ok', text: '🧠 IA local' }
    case 'loading':
      return { cls: 'warn', text: `⏳ ${Math.round(llm.progress * 100)}%` }
    case 'unsupported':
      return { cls: 'warn', text: '📘 Sin IA' }
    case 'error':
      return { cls: 'bad', text: '⚠️ IA' }
    default:
      return { cls: 'info', text: '⬇️ IA' }
  }
})
</script>
