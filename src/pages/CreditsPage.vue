<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const PRICE_PER_TTN = 1 // ₴ per TTN
const TELEGRAM_URL = 'https://t.me/NothingToSayH'

const quantity = ref(100)

const totalPrice = computed(() => quantity.value * PRICE_PER_TTN)

function setQuantity(n: number) {
  quantity.value = n
}
</script>

<template>
  <div class="p-6 max-w-2xl">
    <h1 class="text-xl font-semibold text-white mb-6">Сканування</h1>

    <!-- Current balance -->
    <div class="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-6">
      <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Ваш поточний баланс</p>
      <p v-if="!auth.isAdmin" :class="['text-4xl font-bold', auth.scanBalance <= 10 ? 'text-red-400' : 'text-white']">
        {{ auth.scanBalance }}
        <span class="text-base font-normal text-gray-400 ml-1">сканувань</span>
      </p>
      <p v-else class="text-4xl font-bold text-blue-400">
        ∞
        <span class="text-base font-normal text-gray-400 ml-1">безліміт</span>
      </p>
      <p class="text-xs text-gray-500 mt-2">1 сканування = 1 ТТН</p>
    </div>

    <!-- Calculator -->
    <div class="bg-gray-900 rounded-xl border border-gray-800 p-5">
      <h2 class="text-sm font-medium text-gray-300 mb-4">Придбати сканування</h2>

      <!-- Preset buttons -->
      <div class="grid grid-cols-4 gap-2 mb-4">
        <button
          v-for="preset in [100, 500, 1000, 5000]"
          :key="preset"
          @click="setQuantity(preset)"
          :class="[
            'py-2 rounded-lg text-sm font-medium transition',
            quantity === preset
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
          ]"
        >
          {{ preset.toLocaleString('uk-UA') }}
        </button>
      </div>

      <!-- Custom input -->
      <div class="mb-6">
        <label class="text-xs text-gray-500 block mb-1">Або введіть кількість</label>
        <input
          type="number"
          v-model.number="quantity"
          min="1"
          class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="Кількість ТТН"
        />
      </div>

      <!-- Price summary -->
      <div class="bg-gray-800 rounded-lg p-4 mb-6">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">Кількість ТТН</span>
          <span class="text-sm text-white font-mono">{{ quantity.toLocaleString('uk-UA') }}</span>
        </div>
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm text-gray-400">Ціна за ТТН</span>
          <span class="text-sm text-white font-mono">₴{{ PRICE_PER_TTN }}</span>
        </div>
        <div class="border-t border-gray-700 my-2"></div>
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-300">Разом</span>
          <span class="text-lg font-bold text-white">₴{{ totalPrice.toLocaleString('uk-UA') }}</span>
        </div>
      </div>

      <!-- CTA -->
      <a
        :href="`${TELEGRAM_URL}?text=${encodeURIComponent(`Хочу придбати ${quantity} сканувань (₴${totalPrice})`)}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.26 13.617l-2.95-.924c-.64-.203-.652-.64.136-.954l11.52-4.44c.534-.194 1.003.131.928.922z"/>
        </svg>
        Придбати через Telegram
      </a>
      <p class="text-xs text-gray-500 text-center mt-3">
        Напишіть нам у Telegram — підтвердимо оплату та поповнимо баланс
      </p>
    </div>
  </div>
</template>
