<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { adminApi } from '@/api/admin'
import type { User, Subscription } from '@/types'

const route = useRoute()
const userId = route.params['id'] as string

const user = ref<User | null>(null)
const subs = ref<Subscription[]>([])
const loading = ref(true)

const grantForm = ref({ starts_at: '', ends_at: '', note: '' })
const granting = ref(false)
const grantError = ref('')

onMounted(async () => {
  try {
    const [u, s] = await Promise.all([
      adminApi.getUser(userId),
      adminApi.listSubscriptions(userId),
    ])
    user.value = u.data
    subs.value = s.data
  } finally {
    loading.value = false
  }
})

async function grant() {
  granting.value = true
  grantError.value = ''
  try {
    const { data } = await adminApi.grantSubscription(userId, grantForm.value)
    subs.value.unshift(data)
    grantForm.value = { starts_at: '', ends_at: '', note: '' }
  } catch {
    grantError.value = 'Помилка виданні підписки'
  } finally {
    granting.value = false
  }
}

async function deleteSub(id: string) {
  await adminApi.deleteSubscription(id)
  subs.value = subs.value.filter((s) => s.id !== id)
}
</script>

<template>
  <div class="p-6 max-w-2xl">
    <RouterLink to="/admin/users" class="text-blue-400 text-sm hover:underline mb-4 inline-block">← Назад</RouterLink>

    <div v-if="loading" class="text-gray-500">Завантаження...</div>

    <template v-else-if="user">
      <div class="mb-6">
        <h1 class="text-xl font-semibold text-white">{{ user.name }}</h1>
        <p class="text-gray-400 text-sm">{{ user.email }} · {{ user.role }}</p>
      </div>

      <!-- Grant subscription -->
      <div class="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
        <h2 class="text-sm font-medium text-gray-300 mb-4">Видати підписку</h2>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="text-xs text-gray-500 block mb-1">Початок</label>
            <input type="date" v-model="grantForm.starts_at"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label class="text-xs text-gray-500 block mb-1">Кінець</label>
            <input type="date" v-model="grantForm.ends_at"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <input v-model="grantForm.note" type="text" placeholder="Нотатка (необов'язково)"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 mb-3"
        />
        <p v-if="grantError" class="text-red-400 text-xs mb-2">{{ grantError }}</p>
        <button @click="grant" :disabled="granting || !grantForm.starts_at || !grantForm.ends_at"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {{ granting ? 'Видаємо...' : 'Видати підписку' }}
        </button>
      </div>

      <!-- Subscription history -->
      <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div class="px-5 py-3 border-b border-gray-800">
          <h2 class="text-sm font-medium text-gray-300">Підписки</h2>
        </div>
        <div v-if="subs.length === 0" class="px-5 py-4 text-gray-500 text-sm">Підписок немає</div>
        <div v-for="s in subs" :key="s.id" class="px-5 py-3 border-b border-gray-800 last:border-0 flex items-center justify-between">
          <div>
            <p class="text-sm text-white">
              {{ new Date(s.starts_at).toLocaleDateString('uk-UA') }} —
              {{ new Date(s.ends_at).toLocaleDateString('uk-UA') }}
            </p>
            <p v-if="s.note" class="text-xs text-gray-500">{{ s.note }}</p>
          </div>
          <button @click="deleteSub(s.id)" class="text-red-400 hover:text-red-300 text-xs transition">
            Видалити
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
