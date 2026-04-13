import client from './client'
import type { User, Paginated } from '@/types'

export const adminApi = {
  listUsers: (limit = 20, offset = 0) =>
    client.get<Paginated<User>>('/admin/users', { params: { limit, offset } }),

  getUser: (id: string) => client.get<User>(`/admin/users/${id}`),

  updateUser: (id: string, data: { name?: string; role?: string }) =>
    client.patch<User>(`/admin/users/${id}`, data),

  deleteUser: (id: string) => client.delete(`/admin/users/${id}`),

  setScanBalance: (userId: string, balance: number) =>
    client.patch<User>(`/admin/users/${userId}/scan-balance`, { balance }),
}
