<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { sessionApi } from '@/api/sessions'
import Pagination from '@/components/ui/Pagination.vue'
import type { Session } from '@/types'

const PAGE_SIZE = 20

const router = useRouter()
const sessions = ref<Session[]>([])
const total = ref(0)
const page = ref(0)
const loading = ref(true)
const deleting = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    const { data } = await sessionApi.list(PAGE_SIZE, page.value * PAGE_SIZE)
    sessions.value = data.data ?? []
    total.value = data.total
  } finally {
    loading.value = false
  }
}

function changePage(p: number) {
  page.value = p
  load()
}

onMounted(load)

function formatDate(d: string) {
  return new Date(d).toLocaleString('uk-UA', { dateStyle: 'short', timeStyle: 'short' })
}

function statusColor(s: string) {
  return s === 'done' ? 'text-green-400' : s === 'error' ? 'text-red-400' : 'text-yellow-400'
}

async function deleteSession(id: string) {
  if (!confirm('Видалити сесію?')) return
  deleting.value = id
  try {
    await sessionApi.delete(id)
    // If we just removed the last row on a non-first page, step back.
    if (sessions.value.length === 1 && page.value > 0) {
      page.value--
    }
    await load()
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-6">
      Історія сесій<span v-if="total" class="text-gray-500 font-normal"> ({{ total }})</span>
    </h1>

    <div v-if="loading" class="text-gray-500">Завантаження...</div>

    <div v-else-if="sessions.length === 0" class="text-gray-500">Сесій ще немає</div>

    <div v-else class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-800 text-gray-400 text-xs uppercase">
            <th class="text-left px-4 py-3">Дата</th>
            <th class="text-left px-4 py-3">ТТН</th>
            <th class="text-left px-4 py-3">Статус</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in sessions"
            :key="s.id"
            class="border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition"
          >
            <td class="px-4 py-3 text-gray-300">{{ formatDate(s.started_at) }}</td>
            <td class="px-4 py-3 text-white font-medium">{{ s.ttn_count }}</td>
            <td :class="['px-4 py-3 font-medium', statusColor(s.status)]">{{ s.status }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3 justify-end">
                <button
                  @click="router.push(`/history/${s.id}`)"
                  class="text-blue-400 hover:underline text-xs"
                >
                  Деталі
                </button>
                <button
                  @click="deleteSession(s.id)"
                  :disabled="deleting === s.id"
                  class="text-gray-600 hover:text-red-400 transition disabled:opacity-40"
                  title="Видалити"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        :page="page"
        :page-size="PAGE_SIZE"
        :total="total"
        :disabled="loading"
        @update:page="changePage"
      />
    </div>
  </div>
</template>
