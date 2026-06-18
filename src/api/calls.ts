const BASE_URL = (
  (import.meta.env.VITE_CALLS_URL as string | undefined) ?? 'http://localhost:8790'
).replace(/\/+$/, '')

export interface ApiCallRecord {
  call_id:    string
  agent_name: string
  result:     string
  duration:   number // seconds
  call_time:  string // ISO 8601
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
  page:        number
  limit:       number
  result?:     string
  agent_name?: string
  call_id?:    string
}

export async function fetchCalls(params: CallsParams): Promise<CallsResponse> {
  const qs = new URLSearchParams()
  qs.set('page',  String(params.page))
  qs.set('limit', String(params.limit))
  if (params.result)     qs.set('result',     params.result)
  if (params.agent_name) qs.set('agent_name', params.agent_name)
  if (params.call_id)    qs.set('call_id',    params.call_id)

  const res = await fetch(`${BASE_URL}/api/call?${qs}`)
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch { /* non-JSON body */ }
    throw new Error(message)
  }
  return res.json() as Promise<CallsResponse>
}
