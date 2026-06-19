import { authRequest } from './client'

export interface ApiCallRecord {
  call_id:           string
  session_id:        string
  agent_id:          string
  agent_name:        string
  started_at:        string
  ended_at:          string
  duration_seconds:  number
  status:            string
  last_node:         string
  turns:             number
  prompt_tokens:     string
  completion_tokens: string
  total_tokens:      string
  tts_characters:    string
  avg_llm_ttfb_ms:   number
  avg_tts_ttfb_ms:   number
  error:             string | null
  created_at:        string
}

export interface CallsPagination {
  total:      number
  limit:      number
  page:       number
  totalPages: number
}

export interface CallsResponse {
  data:       ApiCallRecord[]
  pagination: CallsPagination
}

export interface CallsParams {
  page:         number
  limit:        number
  status?:      string
  agent_name?:  string
  call_id?:     string
  date_filter?: string
}

export async function fetchCalls(params: CallsParams): Promise<CallsResponse> {
  const qs = new URLSearchParams()
  qs.set('page',  String(params.page))
  qs.set('limit', String(params.limit))
  if (params.status)      qs.set('status',      params.status)
  if (params.agent_name)  qs.set('agent_name',  params.agent_name)
  if (params.call_id)     qs.set('call_id',     params.call_id)
  if (params.date_filter) qs.set('date_filter', params.date_filter)

  return authRequest<CallsResponse>(`/api/call?${qs}`)
}
