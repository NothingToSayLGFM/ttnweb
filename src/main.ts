import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)

// Init auth BEFORE registering router so the first navigation guard
// already sees the correct isAuthenticated state
const auth = useAuthStore()
auth.init().finally(() => {
  app.use(router)
  app.mount('#app')
})
