import client from './client'
import type { ValidateResult, Group, DistributeResult, ScanSheet } from '@/types'

export interface DistributeInput {
  key: string
  doc_refs: string[]
  ttns: string[]
  sheet_name: string
}

export const npApi = {
  validate: (ttns: string[]) =>
    client.post<{ results: ValidateResult[]; groups: Group[] }>('/np/validate', { ttns }),

  distribute: (sessionId: string, groups: DistributeInput[]) =>
    client.post<{ results: DistributeResult[] }>('/np/distribute', {
      session_id: sessionId,
      groups,
    }),

  scanSheets: () => client.get<ScanSheet[]>('/np/scan-sheets'),

  printed: () => client.get<unknown[]>('/np/printed'),
}
