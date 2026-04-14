<script setup lang="ts">
import { ref, computed } from 'vue'

const file1Content = ref<string | null>(null)
const file2Content = ref<string | null>(null)
const file1Name = ref('')
const file2Name = ref('')

function parseTTNs(content: string): Set<string> {
  const ttns = new Set<string>()
  for (const line of content.split('\n')) {
    const ttn = line.trim()
    if (ttn && ttn !== '-') {
      ttns.add(ttn)
    }
  }
  return ttns
}

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

async function onFile1(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  file1Name.value = file.name
  file1Content.value = await readFile(file)
}

async function onFile2(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  file2Name.value = file.name
  file2Content.value = await readFile(file)
}

const result = computed(() => {
  if (!file1Content.value || !file2Content.value) return null

  const set1 = parseTTNs(file1Content.value)
  const set2 = parseTTNs(file2Content.value)

  const onlyInFile1 = [...set1].filter(t => !set2.has(t))
  const onlyInFile2 = [...set2].filter(t => !set1.has(t))
  const common = [...set1].filter(t => set2.has(t))

  return { onlyInFile1, onlyInFile2, common }
})

function copyList(list: string[]) {
  navigator.clipboard.writeText(list.join('\n'))
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-white mb-6">Порівняння файлів</h1>

    <!-- File inputs -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Вихідний файл</p>
        <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <span v-if="file1Name" class="text-sm text-white font-medium">{{ file1Name }}</span>
          <span v-else class="text-sm text-gray-400">Оберіть .txt файл</span>
          <input type="file" accept=".txt" class="hidden" @change="onFile1" />
        </label>
        <p v-if="file1Content" class="text-xs text-gray-500 mt-2">
          {{ parseTTNs(file1Content).size }} ТТН
        </p>
      </div>

      <div class="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <p class="text-xs text-gray-400 uppercase tracking-wider mb-3">Файл для порівняння</p>
        <label class="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition">
          <span v-if="file2Name" class="text-sm text-white font-medium">{{ file2Name }}</span>
          <span v-else class="text-sm text-gray-400">Оберіть .txt файл</span>
          <input type="file" accept=".txt" class="hidden" @change="onFile2" />
        </label>
        <p v-if="file2Content" class="text-xs text-gray-500 mt-2">
          {{ parseTTNs(file2Content).size }} ТТН
        </p>
      </div>
    </div>

    <!-- Results -->
    <template v-if="result">
      <div class="grid grid-cols-2 gap-4">
        <!-- Only in file 1 -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Тільки у вихідному</p>
              <p class="text-xs text-gray-500 mt-0.5">є в першому, немає в другому</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-red-400">{{ result.onlyInFile1.length }}</span>
              <button
                v-if="result.onlyInFile1.length"
                @click="copyList(result.onlyInFile1)"
                class="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-gray-600 hover:border-gray-400"
              >
                Копіювати
              </button>
            </div>
          </div>
          <div class="h-72 overflow-y-auto space-y-1">
            <div v-if="!result.onlyInFile1.length" class="h-full flex items-center justify-center text-gray-500 text-sm">
              Немає відмінностей
            </div>
            <div
              v-for="ttn in result.onlyInFile1"
              :key="ttn"
              class="font-mono text-sm text-red-300 bg-red-900/20 rounded px-2 py-1"
            >
              {{ ttn }}
            </div>
          </div>
        </div>

        <!-- Only in file 2 -->
        <div class="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider">Тільки у другому</p>
              <p class="text-xs text-gray-500 mt-0.5">є в другому, немає в першому</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-green-400">{{ result.onlyInFile2.length }}</span>
              <button
                v-if="result.onlyInFile2.length"
                @click="copyList(result.onlyInFile2)"
                class="text-xs text-gray-400 hover:text-white transition px-2 py-1 rounded border border-gray-600 hover:border-gray-400"
              >
                Копіювати
              </button>
            </div>
          </div>
          <div class="h-72 overflow-y-auto space-y-1">
            <div v-if="!result.onlyInFile2.length" class="h-full flex items-center justify-center text-gray-500 text-sm">
              Немає відмінностей
            </div>
            <div
              v-for="ttn in result.onlyInFile2"
              :key="ttn"
              class="font-mono text-sm text-green-300 bg-green-900/20 rounded px-2 py-1"
            >
              {{ ttn }}
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="mt-4 bg-gray-800 rounded-xl border border-gray-700 p-4 flex gap-8">
        <div>
          <p class="text-xs text-gray-400">Спільних ТТН</p>
          <p class="text-lg font-semibold text-white">{{ result.common.length }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400">Відсутні в другому</p>
          <p class="text-lg font-semibold text-red-400">{{ result.onlyInFile1.length }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-400">Нові в другому</p>
          <p class="text-lg font-semibold text-green-400">{{ result.onlyInFile2.length }}</p>
        </div>
      </div>
    </template>

    <div v-else-if="file1Content || file2Content" class="text-sm text-gray-400 mt-2">
      Завантажте обидва файли для порівняння.
    </div>
  </div>
</template>
