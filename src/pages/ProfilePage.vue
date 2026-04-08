<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/api/auth'
import type { NPAPIKey } from '@/types'

const auth = useAuthStore()

const name = ref(auth.user?.name ?? '')
const password = ref('')
const saving = ref(false)
const saved = ref(false)
const profileError = ref('')

const apiKeys = ref<NPAPIKey[]>([])
const newKeyLabel = ref('')
const newKeyValue = ref('')
const showNewKey = ref(false)
const keyError = ref('')
const keySaving = ref(false)

onMounted(async () => {
  name.value = auth.user?.name ?? ''
  await loadKeys()
})

async function loadKeys() {
  try {
    const { data } = await authApi.listAPIKeys()
    apiKeys.value = data
  } catch {
    // ignore
  }
}

async function saveProfile() {
  saving.value = true
  profileError.value = ''
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
    profileError.value = 'Помилка збереження'
  } finally {
    saving.value = false
  }
}

async function addKey() {
  if (!newKeyValue.value) return
  keySaving.value = true
  keyError.value = ''
  try {
    const { data } = await authApi.createAPIKey(
      newKeyLabel.value || 'Ключ',
      newKeyValue.value,
    )
    apiKeys.value.push(data)
    newKeyLabel.value = ''
    newKeyValue.value = ''
  } catch {
    keyError.value = 'Помилка додавання ключа'
  } finally {
    keySaving.value = false
  }
}

async function activateKey(id: string) {
  try {
    await authApi.activateAPIKey(id)
    apiKeys.value = apiKeys.value.map((k) => ({ ...k, is_active: k.id === id }))
  } catch {
    keyError.value = 'Помилка активації'
  }
}

async function deleteKey(id: string) {
  try {
    await authApi.deleteAPIKey(id)
    apiKeys.value = apiKeys.value.filter((k) => k.id !== id)
  } catch {
    keyError.value = 'Помилка видалення'
  }
}

function maskKey(key: string) {
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-6">Профіль</h1>

    <div class="grid grid-cols-2 gap-6">
      <!-- Left column: subscription + personal data -->
      <div class="flex flex-col gap-4">
        <!-- Subscription status -->
        <div
          class="p-4 rounded-xl border"
          :class="auth.hasSubscription ? 'border-green-600/50 bg-green-900/20' : 'border-yellow-600/50 bg-yellow-900/20'"
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
        <div class="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h2 class="text-sm font-semibold text-gray-200 mb-4">Особисті дані</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-xs text-gray-400 mb-1">Email</label>
              <p class="text-white text-sm">{{ auth.user?.email }}</p>
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Ім'я</label>
              <input v-model="name" type="text"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-400 mb-1">Новий пароль (залиште порожнім якщо не змінюєте)</label>
              <input v-model="password" type="password" placeholder="••••••••"
                class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <p v-if="profileError" class="text-red-400 text-xs">{{ profileError }}</p>
            <button @click="saveProfile" :disabled="saving"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              {{ saved ? 'Збережено!' : saving ? 'Зберігаємо...' : 'Зберегти' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right column: NP API Keys -->
      <div class="bg-gray-800 rounded-xl border border-gray-700 p-5 self-start">
        <h2 class="text-sm font-semibold text-gray-200 mb-4">API ключі Нової Пошти</h2>

        <!-- Key list -->
        <div v-if="apiKeys.length > 0" class="space-y-2 mb-4">
          <div
            v-for="k in apiKeys"
            :key="k.id"
            class="flex items-center gap-3 p-3 rounded-lg border transition"
            :class="k.is_active ? 'border-emerald-600/50 bg-emerald-900/10' : 'border-gray-600 bg-gray-700/50'"
          >
            <!-- Radio -->
            <button
              @click="activateKey(k.id)"
              class="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition"
              :class="k.is_active ? 'border-emerald-500' : 'border-gray-500 hover:border-gray-300'"
            >
              <span v-if="k.is_active" class="w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            <!-- Label + key -->
            <div class="flex-1 min-w-0">
              <p class="text-sm text-white font-medium">{{ k.label }}</p>
              <p class="text-xs text-gray-400 font-mono">{{ maskKey(k.api_key) }}</p>
            </div>

            <!-- Active badge -->
            <span v-if="k.is_active" class="text-xs text-emerald-400 font-medium">активний</span>

            <!-- Delete -->
            <button
              @click="deleteKey(k.id)"
              class="text-gray-500 hover:text-red-400 transition text-lg leading-none"
              title="Видалити"
            >×</button>
          </div>
        </div>

        <p v-else class="text-xs text-gray-400 mb-4">Ключів ще немає. Додайте перший.</p>

        <!-- Add new key form -->
        <div class="space-y-2 pt-3 border-t border-gray-700">
          <p class="text-xs text-gray-400 mb-2">Додати ключ</p>
          <input
            v-model="newKeyLabel"
            type="text"
            placeholder="Назва (наприклад: Основний)"
            class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
          <div class="flex gap-2">
            <input
              v-model="newKeyValue"
              :type="showNewKey ? 'text' : 'password'"
              placeholder="Вставте NP API ключ"
              class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-blue-500"
            />
            <button @click="showNewKey = !showNewKey" class="text-gray-300 hover:text-white px-2 text-sm transition">
              {{ showNewKey ? 'Сховати' : 'Показати' }}
            </button>
          </div>
          <p v-if="keyError" class="text-red-400 text-xs">{{ keyError }}</p>
          <button @click="addKey" :disabled="keySaving || !newKeyValue"
            class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            {{ keySaving ? 'Зберігаємо...' : 'Додати ключ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
