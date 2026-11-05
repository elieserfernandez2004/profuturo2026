<template>
  <div class="bubble" :class="msg.role === 'user' ? 'me' : 'ai'">
    <div>{{ msg.text }}<span v-if="msg.streaming" class="muted"> ▍</span></div>
    <div v-if="msg.role === 'ai'" class="meta">
      <span v-if="msg.source === 'ia'" class="pill info">🤖 Generado por IA local</span>
      <span v-else class="pill ok">📘 Pista escrita por docentes</span>
      <span v-if="msg.guarded" class="pill warn" title="La IA iba a dar la respuesta; Semilla la cambió por una pista">🛡️ Respuesta protegida</span>
      <span v-if="msg.lesson" class="muted">Fuente: {{ msg.lesson }}</span>
      <span v-if="msg.source === 'ia'" class="muted">· Puede equivocarse</span>
      <template v-if="msg.source === 'ia' && !msg.streaming && !msg.rated">
        <ion-button size="small" fill="clear" @click="$emit('rate', 'helpful')">👍 Me ayudó</ion-button>
        <ion-button size="small" fill="clear" color="danger" @click="$emit('rate', 'error')">⚠️ Creo que se equivocó</ion-button>
      </template>
      <span v-if="msg.rated" class="muted">¡Gracias! {{ msg.rated === 'error' ? 'Buen ojo de detective 🕵️' : '' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonButton } from '@ionic/vue'

export interface ChatMsg {
  id: string
  role: 'user' | 'ai'
  text: string
  source?: 'ia' | 'docente'
  guarded?: boolean
  lesson?: string
  streaming?: boolean
  rated?: 'helpful' | 'error'
}
defineProps<{ msg: ChatMsg }>()
defineEmits<{ rate: [kind: 'helpful' | 'error'] }>()
</script>
