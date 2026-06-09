import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
