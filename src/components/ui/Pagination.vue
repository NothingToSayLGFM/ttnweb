<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
  disabled?: boolean
}>()

const emit = defineEmits<{ (e: 'update:page', page: number): void }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (props.total === 0 ? 0 : props.page * props.pageSize + 1))
const to = computed(() => Math.min((props.page + 1) * props.pageSize, props.total))

function go(page: number) {
  if (props.disabled) return
  if (page < 0 || page >= totalPages.value) return
  emit('update:page', page)
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-800 text-xs text-gray-400">
    <span>{{ from }}–{{ to }} з {{ total }}</span>
    <div class="flex items-center gap-2">
      <button
        @click="go(page - 1)"
        :disabled="disabled || page === 0"
        class="px-3 py-1 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Назад
      </button>
      <span class="text-gray-500">{{ page + 1 }} / {{ totalPages }}</span>
      <button
        @click="go(page + 1)"
        :disabled="disabled || page >= totalPages - 1"
        class="px-3 py-1 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Далі
      </button>
    </div>
  </div>
</template>
