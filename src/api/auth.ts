import client from './client'
import type { User, NPAPIKey } from '@/types'

export const authApi = {
  register: (email: string, name: string, password: string) =>
    client.post<User>('/auth/register', { email, name, password }),

  login: (email: string, password: string) =>
    client.post<{ access_token: string; refresh_token: string; expires_in: number; user: User }>(
      '/auth/login',
      { email, password }
    ),

  logout: (refreshToken: string) =>
    client.post('/auth/logout', { refresh_token: refreshToken }),

  me: () => client.get<User>('/me'),

  updateMe: (data: { name?: string; password?: string }) => client.patch<User>('/me', data),

  listAPIKeys: () => client.get<NPAPIKey[]>('/me/api-keys'),
  createAPIKey: (label: string, api_key: string) =>
    client.post<NPAPIKey>('/me/api-keys', { label, api_key }),
  activateAPIKey: (id: string) => client.patch(`/me/api-keys/${id}/activate`),
  deleteAPIKey: (id: string) => client.delete(`/me/api-keys/${id}`),

  downloadApp: () =>
    client.get('/me/download-app', { responseType: 'blob' }),

  resetDesktopToken: () =>
    client.post<{ message: string }>('/me/reset-desktop-token'),
}
