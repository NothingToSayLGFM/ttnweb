<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'

const auth = useAuthStore()

const name = ref(auth.user?.name ?? '')
const password = ref('')
const apiKey = ref('')
const showKey = ref(false)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

onMounted(() => {
  name.value = auth.user?.name ?? ''
})

async function saveProfile() {
  saving.value = true
  error.value = ''
  try {
    const payload: { name?: string; password?: string } = {}
    if (name.value && name.value !== auth.user?.name) payload.name = name.value
    if (password.value) payload.password = password.value
    if (Object.keys(payload).length > 0) {
      await authApi.updateMe(payload)
      await auth.loadMe()
    }
    password.value = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch {
    error.value = 'Помилка збереження'
  } finally {
    saving.value = false
  }
}

async function saveAPIKey() {
  if (!apiKey.value) return
  saving.value = true
  try {
    await authApi.updateAPIKey(apiKey.value)
    apiKey.value = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 2000)
  } catch {
    error.value = 'Помилка збереження API ключа'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-xl">
    <h1 class="text-xl font-semibold text-white mb-6">Профіль</h1>

    <!-- Subscription status -->
    <div class="mb-6 p-4 rounded-xl border"
      :class="auth.hasSubscription ? 'border-green-700/50 bg-green-900/20' : 'border-yellow-700/50 bg-yellow-900/20'"
    >
      <p class="text-sm font-medium" :class="auth.hasSubscription ? 'text-green-400' : 'text-yellow-400'">
        {{ auth.hasSubscription ? 'Підписка активна' : 'Підписка відсутня' }}
      </p>
      <p v-if="auth.hasSubscription && auth.subscription?.ends_at" class="text-xs text-gray-400 mt-1">
        Дійсна до: {{ new Date(auth.subscription.ends_at).toLocaleDateString('uk-UA') }}
      </p>
      <p v-else-if="!auth.hasSubscription" class="text-xs text-gray-400 mt-1">
        Зверніться до адміна в
        <a href="https://t.me/your_telegram" target="_blank" class="underline text-yellow-300">Telegram</a>
      </p>
    </div>

    <!-- Profile form -->
    <div class="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-4">
      <h2 class="text-sm font-medium text-gray-300 mb-4">Особисті дані</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Email</label>
          <p class="text-white text-sm">{{ auth.user?.email }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Ім'я</label>
          <input v-model="name" type="text"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Новий пароль (залиште порожнім якщо не змінюєте)</label>
          <input v-model="password" type="password" placeholder="••••••••"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>
        <button @click="saveProfile" :disabled="saving"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {{ saved ? 'Збережено!' : saving ? 'Зберігаємо...' : 'Зберегти' }}
        </button>
      </div>
    </div>

    <!-- NP API Key -->
    <div class="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h2 class="text-sm font-medium text-gray-300 mb-4">API ключ Нової Пошти</h2>
      <div class="flex gap-2">
        <input
          v-model="apiKey"
          :type="showKey ? 'text' : 'password'"
          placeholder="Вставте ваш NP API ключ"
          class="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
        />
        <button @click="showKey = !showKey" class="text-gray-400 hover:text-white px-2 text-sm transition">
          {{ showKey ? 'Сховати' : 'Показати' }}
        </button>
      </div>
      <button @click="saveAPIKey" :disabled="saving || !apiKey"
        class="mt-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
      >
        Зберегти API ключ
      </button>
    </div>
  </div>
</template>
