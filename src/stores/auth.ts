import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(localStorage.getItem('refresh_token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const scanBalance = computed(() => user.value?.scan_balance ?? 0)

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
    } catch {
      return
    }
    try {
      await loadMe()
    } catch {
      // ignore
    }
  }

  async function loadMe() {
    const { data } = await authApi.me()
    user.value = data
  }

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password)
    setTokens(data.access_token, data.refresh_token)
    user.value = data.user
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
    localStorage.removeItem('refresh_token')
  }

  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    isAdmin,
    scanBalance,
    setTokens,
    init,
    loadMe,
    login,
    register,
    logout,
  }
})
