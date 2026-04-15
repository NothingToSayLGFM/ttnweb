export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  scan_balance: number
  created_at: string
}

export interface NPAPIKey {
  id: string
  user_id: string
  label: string
  api_key: string
  is_active: boolean
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  user_email?: string
  user_name?: string
  device_type: 'web' | 'desktop' | 'zebra'
  started_at: string
  finished_at?: string
  ttn_count: number
  status: 'running' | 'done' | 'error'
}

export interface SessionTTN {
  id: number
  session_id: string
  ttn: string
  status: string
  message?: string
  registry?: string
  created_at: string
}

export interface ValidateResult {
  ttn: string
  status: 'ok' | 'not_found' | 'already_in_registry' | 'duplicate' | 'error'
  message?: string
  doc_ref?: string
  sender_description?: string
  sender_address_description?: string
  warehouse_number?: string
  scan_sheet_number?: string
}

export interface Group {
  key: string
  suggested_name: string
  sender_description: string
  sender_address_description: string
  warehouse_number: string
  ttns: string[]
  doc_refs: string[]
  ttn_count: number
}

export interface DistributeResult {
  ttn: string
  status: string
  message?: string
  registry?: string
}

export interface ScanSheet {
  Ref: string
  Number: string
  Description: string
}

export interface Paginated<T> {
  data: T[]
  total: number
}
