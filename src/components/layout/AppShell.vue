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
  <div class="flex h-screen bg-gray-950 text-white overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      <div class="px-4 py-5 border-b border-gray-800">
        <span class="text-blue-400 font-bold text-lg">TTNFlow</span>
      </div>

      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          to="/scanner"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          active-class="bg-gray-800 text-white"
        >
          Scanner
        </RouterLink>
        <RouterLink
          to="/history"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          active-class="bg-gray-800 text-white"
        >
          Історія
        </RouterLink>
        <RouterLink
          to="/profile"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
          active-class="bg-gray-800 text-white"
        >
          Профіль
        </RouterLink>

        <template v-if="auth.isAdmin">
          <div class="pt-3 pb-1 px-3 text-xs text-gray-500 uppercase tracking-wider">Адмін</div>
          <RouterLink
            to="/admin/users"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            active-class="bg-gray-800 text-white"
          >
            Користувачі
          </RouterLink>
          <RouterLink
            to="/admin/sessions"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition"
            active-class="bg-gray-800 text-white"
          >
            Всі сесії
          </RouterLink>
        </template>
      </nav>

      <div class="px-4 py-4 border-t border-gray-800">
        <p class="text-xs text-gray-500 truncate mb-2">{{ auth.user?.email }}</p>
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
      <!-- Subscription banner for non-subscribed users -->
      <div
        v-if="!auth.hasSubscription && !auth.isAdmin"
        class="bg-yellow-900/40 border-b border-yellow-700/50 px-6 py-3 text-sm text-yellow-200 flex items-center gap-2"
      >
        У вас немає активної підписки. Зверніться до адміна в
        <a href="https://t.me/your_telegram" target="_blank" class="underline text-yellow-300">Telegram</a>
        для її отримання.
      </div>

      <RouterView />
    </main>
  </div>
</template>
