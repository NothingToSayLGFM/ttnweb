<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNPStore } from '@/stores/np'

const np = useNPStore()
const rawInput = ref('')

const ttnList = computed(() =>
  rawInput.value
    .split(/[\n,\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
)

async function analyze() {
  if (ttnList.value.length === 0) return
  np.reset()
  await np.validate(ttnList.value)
}

async function distribute() {
  await np.distribute()
}

function statusColor(status: string) {
  const map: Record<string, string> = {
    ok: 'text-green-400',
    not_found: 'text-red-400',
    already_in_registry: 'text-yellow-400',
    duplicate: 'text-gray-500',
    done: 'text-blue-400',
    error: 'text-red-500',
  }
  return map[status] ?? 'text-gray-400'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    ok: 'ОК',
    not_found: 'Не знайдено',
    already_in_registry: 'В реєстрі',
    duplicate: 'Дублікат',
    done: 'Розподілено',
    error: 'Помилка',
  }
  return map[status] ?? status
}
</script>

<template>
  <div class="p-6 h-full flex flex-col gap-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-white">Scanner</h1>
      <div class="flex gap-3">
        <button
          @click="analyze"
          :disabled="np.loading || ttnList.length === 0"
          class="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {{ np.loading ? 'Аналізуємо...' : 'Аналізувати' }}
        </button>
        <button
          @click="distribute"
          :disabled="np.distributing || np.groups.length === 0"
          class="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {{ np.distributing ? 'Розподіляємо...' : 'Авторозподіл' }}
        </button>
      </div>
    </div>

    <div class="flex gap-6 flex-1 min-h-0">
      <!-- Left: TTN input + results -->
      <div class="flex flex-col gap-4 w-1/2">
        <textarea
          v-model="rawInput"
          placeholder="Введіть ТТН по одному на рядок..."
          class="w-full h-40 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-blue-500 resize-none"
        />

        <p v-if="np.error" class="text-red-400 text-sm">{{ np.error }}</p>

        <div v-if="np.results.length > 0" class="flex-1 overflow-y-auto bg-gray-900 rounded-xl border border-gray-800">
          <div
            v-for="r in np.results"
            :key="r.ttn"
            class="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 last:border-0"
          >
            <span class="font-mono text-sm text-white">{{ r.ttn }}</span>
            <span :class="['text-xs font-medium', statusColor(r.status)]">
              {{ statusLabel(r.status) }}
              <span v-if="r.scan_sheet_number" class="text-gray-500 ml-1">({{ r.scan_sheet_number }})</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Registry groups -->
      <div class="w-1/2 flex flex-col gap-3 overflow-y-auto">
        <p v-if="np.groups.length === 0 && np.results.length === 0" class="text-gray-600 text-sm mt-4 text-center">
          Введіть ТТН і натисніть "Аналізувати"
        </p>

        <div
          v-for="g in np.groups"
          :key="g.key"
          class="bg-gray-900 border border-gray-800 rounded-xl p-4"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-white font-medium text-sm">{{ g.sender_description }}</p>
              <p class="text-gray-500 text-xs">{{ g.sender_address_description }}</p>
            </div>
            <span class="bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
              {{ g.ttn_count }} ТТН
            </span>
          </div>
          <p class="text-gray-400 text-xs font-mono mt-1">{{ g.suggested_name }}</p>

          <!-- Show distribute results for this group -->
          <div v-if="np.distributeResults.length > 0" class="mt-2 pt-2 border-t border-gray-800">
            <p v-for="r in np.distributeResults.filter(dr => g.ttns.includes(dr.ttn))" :key="r.ttn"
               :class="['text-xs', r.status === 'done' ? 'text-green-400' : 'text-red-400']">
              {{ r.ttn }}: {{ r.status === 'done' ? '✓' : r.message }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
