import { defineStore } from 'pinia'
import { ref } from 'vue'
import { npApi, type DistributeInput } from '@/api/np'
import { sessionApi } from '@/api/sessions'
import type { ValidateResult, Group, DistributeResult, SessionTTN } from '@/types'

export const useNPStore = defineStore('np', () => {
  const results = ref<ValidateResult[]>([])
  const groups = ref<Group[]>([])
  const distributeResults = ref<DistributeResult[]>([])
  const currentSessionId = ref<string | null>(null)
  const loading = ref(false)
  const distributing = ref(false)
  const error = ref<string | null>(null)

  async function validate(ttns: string[]) {
    loading.value = true
    error.value = null
    try {
      const session = await sessionApi.create()
      currentSessionId.value = session.data.id

      const { data } = await npApi.validate(ttns)
      results.value = data.results
      groups.value = data.groups

      // Save TTNs immediately so history shows results even without distribute
      await sessionApi.saveTTNs(session.data.id, data.results.map((r) => ({
        ttn: r.ttn,
        status: r.status,
        message: r.message ?? '',
        registry: '',
      })))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Помилка валідації'
      error.value = msg
    } finally {
      loading.value = false
    }
  }

  async function distribute() {
    if (!currentSessionId.value || groups.value.length === 0) return
    distributing.value = true
    error.value = null
    try {
      const inputs: DistributeInput[] = groups.value.map((g) => ({
        key: g.key,
        doc_refs: g.doc_refs,
        ttns: g.ttns,
        sheet_name: g.suggested_name,
      }))
      const { data } = await npApi.distribute(currentSessionId.value, inputs)
      distributeResults.value = data.results

      const sessionTTNs: Partial<SessionTTN>[] = data.results.map((r) => ({
        ttn: r.ttn,
        status: r.status,
        message: r.message,
        registry: r.registry,
      }))
      await sessionApi.finish(currentSessionId.value, sessionTTNs)
      currentSessionId.value = null
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Помилка розподілу'
      error.value = msg
    } finally {
      distributing.value = false
    }
  }

  function reset() {
    results.value = []
    groups.value = []
    distributeResults.value = []
    currentSessionId.value = null
    error.value = null
  }

  return { results, groups, distributeResults, currentSessionId, loading, distributing, error, validate, distribute, reset }
})
