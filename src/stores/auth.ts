import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User, SubscriptionStatus } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)
  const subscription = ref<SubscriptionStatus | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const hasSubscription = computed(() => subscription.value?.active === true)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('refresh_token', refresh)
  }

  async function init() {
    const stored = localStorage.getItem('refresh_token')
    if (!stored) return
    try {
      const { data } = await import('axios').then((m) =>
        m.default.post('/api/v1/auth/refresh', { refresh_token: stored })
      )
      setTokens(data.access_token, data.refresh_token)
      await loadMe()
    } catch {
      logout()
    }
  }

  async function loadMe() {
    const { data } = await authApi.me()
    user.value = data
    const { data: sub } = await authApi.mySubscription()
    subscription.value = sub
  }

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password)
    setTokens(data.access_token, data.refresh_token)
    user.value = data.user
    const { data: sub } = await authApi.mySubscription()
    subscription.value = sub
  }

  async function register(email: string, name: string, password: string) {
    await authApi.register(email, name, password)
    await login(email, password)
  }

  function logout() {
    if (refreshToken.value) {
      authApi.logout(refreshToken.value).catch(() => {})
    }
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    subscription.value = null
    localStorage.removeItem('refresh_token')
  }

  return {
    accessToken,
    refreshToken,
    user,
    subscription,
    isAuthenticated,
    isAdmin,
    hasSubscription,
    setTokens,
    init,
    loadMe,
    login,
    register,
    logout,
  }
})
