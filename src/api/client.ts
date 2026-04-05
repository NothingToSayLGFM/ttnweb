import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const auth = useAuthStore()
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`
  }
  return config
})

let isRefreshing = false
let queue: Array<(token: string) => void> = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }
    original._retry = true

    const auth = useAuthStore()
    if (!auth.refreshToken) {
      auth.logout()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    isRefreshing = true
    try {
      const { data } = await axios.post('/api/v1/auth/refresh', {
        refresh_token: auth.refreshToken,
      })
      auth.setTokens(data.access_token, data.refresh_token)
      queue.forEach((cb) => cb(data.access_token))
      queue = []
      original.headers.Authorization = `Bearer ${data.access_token}`
      return client(original)
    } catch {
      auth.logout()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

export default client
