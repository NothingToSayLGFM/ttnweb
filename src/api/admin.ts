import client from './client'
import type { User, Subscription, Paginated } from '@/types'

export const adminApi = {
  listUsers: (limit = 20, offset = 0) =>
    client.get<Paginated<User>>('/admin/users', { params: { limit, offset } }),

  getUser: (id: string) => client.get<User>(`/admin/users/${id}`),

  updateUser: (id: string, data: { name?: string; role?: string }) =>
    client.patch<User>(`/admin/users/${id}`, data),

  deleteUser: (id: string) => client.delete(`/admin/users/${id}`),

  listSubscriptions: (userId: string) =>
    client.get<Subscription[]>(`/admin/users/${userId}/subscriptions`),

  grantSubscription: (userId: string, data: { starts_at: string; ends_at: string; note?: string }) =>
    client.post<Subscription>(`/admin/users/${userId}/subscriptions`, data),

  deleteSubscription: (subId: string) => client.delete(`/admin/subscriptions/${subId}`),
}
