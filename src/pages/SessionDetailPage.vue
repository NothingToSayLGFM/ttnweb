<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { sessionApi } from '@/api/sessions'
import type { Session, SessionTTN } from '@/types'

const route = useRoute()
const session = ref<Session | null>(null)
const ttns = ref<SessionTTN[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await sessionApi.get(route.params['id'] as string)
    session.value = data.session
    ttns.value = data.ttns ?? []
  } finally {
    loading.value = false
  }
})

function statusColor(s: string) {
  const map: Record<string, string> = {
    ok: 'text-green-400',
    done: 'text-blue-400',
    not_found: 'text-red-400',
    already_in_registry: 'text-yellow-400',
    duplicate: 'text-gray-500',
    error: 'text-red-500',
  }
  return map[s] ?? 'text-gray-400'
}
</script>

<template>
  <div class="p-6">
    <RouterLink to="/history" class="text-blue-400 text-sm hover:underline mb-4 inline-block">← Назад</RouterLink>

    <div v-if="loading" class="text-gray-500">Завантаження...</div>

    <template v-else-if="session">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-white">Сесія</h1>
        <p class="text-gray-400 text-sm mt-1">
          {{ new Date(session.started_at).toLocaleString('uk-UA') }} · {{ session.ttn_count }} ТТН · {{ session.status }}
        </p>
      </div>

      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-800 text-gray-400 text-xs uppercase">
              <th class="text-left px-4 py-3">ТТН</th>
              <th class="text-left px-4 py-3">Статус</th>
              <th class="text-left px-4 py-3">Реєстр</th>
              <th class="text-left px-4 py-3">Повідомлення</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in ttns" :key="t.id" class="border-b border-gray-800 last:border-0">
              <td class="px-4 py-2.5 font-mono text-white text-xs">{{ t.ttn }}</td>
              <td :class="['px-4 py-2.5 text-xs font-medium', statusColor(t.status)]">{{ t.status }}</td>
              <td class="px-4 py-2.5 text-gray-400 text-xs">{{ t.registry || '—' }}</td>
              <td class="px-4 py-2.5 text-gray-500 text-xs">{{ t.message || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
