<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { adminApi } from '@/api/admin'
import type { User } from '@/types'

const route = useRoute()
const userId = route.params['id'] as string

const user = ref<User | null>(null)
const loading = ref(true)

const balanceInput = ref(0)
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

onMounted(async () => {
  try {
    const { data } = await adminApi.getUser(userId)
    user.value = data
    balanceInput.value = data.scan_balance
  } finally {
    loading.value = false
  }
})

async function saveScanBalance() {
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    const { data } = await adminApi.setScanBalance(userId, balanceInput.value)
    user.value = data
    balanceInput.value = data.scan_balance
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 2000)
  } catch {
    saveError.value = 'Помилка збереження'
  } finally {
    saving.value = false
  }
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

      <!-- Scan balance -->
      <div class="bg-gray-900 rounded-xl border border-gray-800 p-5">
        <h2 class="text-sm font-medium text-gray-300 mb-1">Баланс сканувань</h2>
        <p class="text-xs text-gray-500 mb-4">
          Поточний баланс:
          <span :class="user.scan_balance === -1 ? 'text-blue-400' : 'text-white'" class="font-semibold">
            {{ user.scan_balance === -1 ? '∞ (безліміт)' : user.scan_balance }}
          </span>
        </p>

        <div class="flex gap-3 items-end">
          <div class="flex-1">
            <label class="text-xs text-gray-500 block mb-1">Нове значення (-1 = безліміт)</label>
            <input
              type="number"
              v-model.number="balanceInput"
              min="-1"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            @click="saveScanBalance"
            :disabled="saving"
            class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            {{ saving ? 'Зберігаємо...' : 'Зберегти' }}
          </button>
        </div>

        <p v-if="saveError" class="text-red-400 text-xs mt-2">{{ saveError }}</p>
        <p v-if="saveSuccess" class="text-green-400 text-xs mt-2">Збережено</p>

        <!-- Quick presets -->
        <div class="mt-4 flex gap-2 flex-wrap">
          <button
            v-for="preset in [100, 500, 1000, 5000, -1]"
            :key="preset"
            @click="balanceInput = preset"
            class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md transition"
          >
            {{ preset === -1 ? '∞' : preset }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>
