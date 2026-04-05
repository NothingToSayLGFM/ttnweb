<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import type { User } from '@/types'

const router = useRouter()
const users = ref<User[]>([])
const total = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await adminApi.listUsers()
    users.value = data.data ?? []
    total.value = data.total
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-6">Користувачі ({{ total }})</h1>

    <div v-if="loading" class="text-gray-500">Завантаження...</div>

    <div v-else class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-800 text-gray-400 text-xs uppercase">
            <th class="text-left px-4 py-3">Email</th>
            <th class="text-left px-4 py-3">Ім'я</th>
            <th class="text-left px-4 py-3">Роль</th>
            <th class="text-left px-4 py-3">Дата</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in users"
            :key="u.id"
            class="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition"
          >
            <td class="px-4 py-3 text-white">{{ u.email }}</td>
            <td class="px-4 py-3 text-gray-300">{{ u.name }}</td>
            <td class="px-4 py-3">
              <span :class="u.role === 'admin' ? 'text-purple-400' : 'text-gray-400'" class="text-xs font-medium">
                {{ u.role }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-xs">
              {{ new Date(u.created_at).toLocaleDateString('uk-UA') }}
            </td>
            <td class="px-4 py-3">
              <button @click="router.push(`/admin/users/${u.id}`)" class="text-blue-400 hover:underline text-xs">
                Управляти
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
