<template>
  <ion-page>
    <app-header back="/student" title="💡 Cómo funciona Semilla" />
    <ion-content class="ion-padding">
      <div class="hero">
        <div class="eyebrow">✦ Transparencia</div>
        <h2>Una IA que explica sus límites</h2>
        <p>Semilla usa un modelo de lenguaje pequeño que vive dentro de este dispositivo.</p>
      </div>

      <ion-card>
        <ion-card-header><ion-card-title>🧠 ¿Qué es la IA de Semilla?</ion-card-title></ion-card-header>
        <ion-card-content>
          Es un programa que aprendió a <b>predecir palabras</b> leyendo muchísimos textos. No “piensa” como una persona y
          <b>no sabe si lo que dice es verdad</b>: escribe lo que le parece más probable.
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header><ion-card-title>✅ Lo que hace bien</ion-card-title></ion-card-header>
        <ion-card-content>
          <ul>
            <li>Darte pistas y hacerte preguntas para que pienses.</li>
            <li>Explicar la lección con otras palabras.</li>
            <li>Ayudar a tu docente a preparar actividades (que siempre revisa una persona).</li>
          </ul>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header><ion-card-title>⚠️ Lo que NO puede hacer</ion-card-title></ion-card-header>
        <ion-card-content>
          <ul>
            <li><b>Se puede equivocar</b>, incluso sonando muy segura. Siempre compruébalo con la lección o tu docente.</li>
            <li>Puede repetir <b>prejuicios</b> que aprendió de los textos.</li>
            <li>Puede <b>inventar</b> datos, estudios o fuentes.</li>
            <li>No reemplaza a tu docente, a tu familia ni a un médico.</li>
            <li>Solo conoce las lecciones guardadas en Semilla.</li>
          </ul>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header><ion-card-title>🔒 Cómo cuida tus datos</ion-card-title></ion-card-header>
        <ion-card-content>
          <ul>
            <li>La IA corre <b>dentro de este dispositivo</b>: lo que escribes no viaja a internet.</li>
            <li>Solo usamos un apodo; nunca pedimos tu nombre, dirección ni ubicación.</li>
            <li>Si escribes datos personales, Semilla te avisa antes de enviarlos.</li>
            <li>Tu docente ve tu progreso por temas para ayudarte, no tus conversaciones privadas.</li>
            <li>Tu familia puede borrar todo en Ajustes.</li>
          </ul>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header><ion-card-title>🏷️ Cómo reconocer lo que hizo la IA</ion-card-title></ion-card-header>
        <ion-card-content>
          <p><span class="pill info">🤖 Generado por IA local</span> lo escribió la IA: puede equivocarse.</p>
          <p><span class="pill ok">📘 Pista escrita por docentes</span> lo escribieron personas expertas.</p>
          <p><span class="pill warn">🛡️ Respuesta protegida</span> la IA iba a darte la respuesta y Semilla la cambió por una pista, para que aprendas tú.</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/vue'
import AppHeader from '../components/AppHeader.vue'
</script>
