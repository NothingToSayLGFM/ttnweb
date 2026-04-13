<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-gray-900 text-white overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div class="px-4 py-5 border-b border-gray-700">
        <span class="text-blue-400 font-bold text-lg">TTNFlow</span>
      </div>

      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          to="/scanner"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
          active-class="bg-gray-700 text-white"
        >
          Scanner
        </RouterLink>
        <RouterLink
          to="/history"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
          active-class="bg-gray-700 text-white"
        >
          Історія
        </RouterLink>
        <RouterLink
          to="/credits"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
          active-class="bg-gray-700 text-white"
        >
          Сканування
        </RouterLink>
        <RouterLink
          to="/profile"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
          active-class="bg-gray-700 text-white"
        >
          Профіль
        </RouterLink>

        <template v-if="auth.isAdmin">
          <div class="pt-3 pb-1 px-3 text-xs text-gray-400 uppercase tracking-wider">Адмін</div>
          <RouterLink
            to="/admin/users"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-gray-700 text-white"
          >
            Користувачі
          </RouterLink>
          <RouterLink
            to="/admin/sessions"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition"
            active-class="bg-gray-700 text-white"
          >
            Всі сесії
          </RouterLink>
        </template>
      </nav>

      <div class="px-4 py-4 border-t border-gray-700">
        <!-- Balance display -->
        <div v-if="!auth.isAdmin" class="mb-3">
          <p class="text-xs text-gray-400 mb-1">Сканувань залишилось</p>
          <p :class="['text-sm font-semibold', auth.scanBalance <= 10 ? 'text-red-400' : 'text-white']">
            {{ auth.scanBalance }}
          </p>
        </div>
        <div v-else class="mb-3">
          <p class="text-xs text-gray-400 mb-1">Сканувань залишилось</p>
          <p class="text-sm font-semibold text-blue-400">∞</p>
        </div>

        <p class="text-xs text-gray-400 truncate mb-2">{{ auth.user?.email }}</p>
        <button
          @click="logout"
          class="w-full text-left text-sm text-red-400 hover:text-red-300 transition"
        >
          Вийти
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>
