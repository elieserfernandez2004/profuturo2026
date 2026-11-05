import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'
import './theme.css'

import { initSync } from './services/sync'
import { autoInitLLM } from './llm/engine'

const app = createApp(App).use(IonicVue, { mode: 'md' }).use(router)

router.isReady().then(() => {
  app.mount('#app')
  initSync()
  // si el modelo ya está en caché, lo carga sin red
  autoInitLLM()
})
