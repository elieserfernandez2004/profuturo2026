import { createRouter, createWebHashHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', component: () => import('./views/HomePage.vue') },
  { path: '/student', component: () => import('./views/StudentHome.vue') },
  { path: '/lesson/:id', component: () => import('./views/LessonPage.vue') },
  { path: '/activity/:id', component: () => import('./views/ActivityPage.vue') },
  { path: '/detective', component: () => import('./views/DetectivePage.vue') },
  { path: '/limits', component: () => import('./views/AiLimitsPage.vue') },
  { path: '/teacher', component: () => import('./views/TeacherPage.vue') },
  { path: '/settings', component: () => import('./views/SettingsPage.vue') },
]

export default createRouter({ history: createWebHashHistory(), routes })
