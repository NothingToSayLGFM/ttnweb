<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/scanner')
  } catch {
    error.value = 'Невірний email або пароль'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-gray-900 rounded-2xl p-8 border border-gray-800">
      <h1 class="text-2xl font-bold text-white mb-6">Увійти до TTNFlow</h1>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm text-gray-400 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm text-gray-400 mb-1">Пароль</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition"
        >
          {{ loading ? 'Входимо...' : 'Увійти' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500">
        Немає акаунту?
        <RouterLink to="/register" class="text-blue-400 hover:underline">Зареєструватись</RouterLink>
      </p>
    </div>
  </div>
</template>
