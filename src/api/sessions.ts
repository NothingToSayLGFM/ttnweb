import client from './client'
import type { Session, SessionTTN, Paginated } from '@/types'

export const sessionApi = {
  create: () => client.post<Session>('/sessions'),

  list: (limit = 20, offset = 0) =>
    client.get<Paginated<Session>>('/sessions', { params: { limit, offset } }),

  get: (id: string) =>
    client.get<{ session: Session; ttns: SessionTTN[] }>(`/sessions/${id}`),

  saveTTNs: (id: string, ttns: Partial<SessionTTN>[]) =>
    client.put(`/sessions/${id}/ttns`, { ttns }),

  finish: (id: string, ttns: Partial<SessionTTN>[], status = 'done') =>
    client.patch<Session>(`/sessions/${id}`, { status, ttns }),

  adminList: (limit = 20, offset = 0) =>
    client.get<Paginated<Session>>('/admin/sessions', { params: { limit, offset } }),
}
