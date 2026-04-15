<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sessionApi } from '@/api/sessions'
import type { Session } from '@/types'

const router = useRouter()
const sessions = ref<Session[]>([])
const total = ref(0)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await sessionApi.adminList(50, 0)
    sessions.value = data.data ?? []
    total.value = data.total
  } finally {
    loading.value = false
  }
})

function statusColor(s: string) {
  return s === 'done' ? 'text-green-400' : s === 'error' ? 'text-red-400' : 'text-yellow-400'
}

function deviceLabel(d: string) {
  if (d === 'desktop') return '🖥 Desktop'
  if (d === 'zebra') return '📷 Zebra'
  return '🌐 Web'
}

function deviceColor(d: string) {
  if (d === 'desktop') return 'text-blue-400'
  if (d === 'zebra') return 'text-purple-400'
  return 'text-gray-400'
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-6">Всі сесії ({{ total }})</h1>

    <div v-if="loading" class="text-gray-500">Завантаження...</div>

    <div v-else class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-800 text-gray-400 text-xs uppercase">
            <th class="text-left px-4 py-3">Користувач</th>
            <th class="text-left px-4 py-3">Пристрій</th>
            <th class="text-left px-4 py-3">Дата</th>
            <th class="text-left px-4 py-3">ТТН</th>
            <th class="text-left px-4 py-3">Статус</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in sessions" :key="s.id" class="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
            <td class="px-4 py-3">
              <div class="text-white text-sm">{{ s.user_email ?? s.user_id.slice(0, 8) + '...' }}</div>
              <div v-if="s.user_name" class="text-gray-500 text-xs">{{ s.user_name }}</div>
            </td>
            <td :class="['px-4 py-3 text-xs font-medium', deviceColor(s.device_type)]">
              {{ deviceLabel(s.device_type) }}
            </td>
            <td class="px-4 py-3 text-gray-300">{{ new Date(s.started_at).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' }) }}</td>
            <td class="px-4 py-3 text-white font-medium">{{ s.ttn_count }}</td>
            <td :class="['px-4 py-3 font-medium text-xs', statusColor(s.status)]">{{ s.status }}</td>
            <td class="px-4 py-3">
              <button @click="router.push(`/history/${s.id}`)" class="text-blue-400 hover:underline text-xs">
                Деталі
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
