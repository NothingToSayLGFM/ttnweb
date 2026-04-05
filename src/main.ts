import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

// Init auth from stored refresh token before first navigation
const auth = useAuthStore()
auth.init().finally(() => {
  app.mount('#app')
})
