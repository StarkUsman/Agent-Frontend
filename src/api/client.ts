import { apiRefresh } from './auth'

const BASE_URL = (
  (import.meta.env.VITE_CALLS_URL as string | undefined) ?? 'http://localhost:8790'
).replace(/\/+$/, '')

// ── Token helpers ──────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token')
}

export function setAccessToken(token: string) {
  localStorage.setItem('access_token', token)
}

export function clearAuthStorage() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('current_user')
}

// ── Refresh queue ──────────────────────────────────────────────────────────
// When multiple requests hit 401 simultaneously, only one refresh call goes
// out. The others wait and reuse the new token once it arrives.
let isRefreshing = false
let waiters: Array<(token: string | null) => void> = []

function enqueueWaiter(): Promise<string | null> {
  return new Promise((resolve) => waiters.push(resolve))
}

function drainWaiters(token: string | null) {
  waiters.forEach((r) => r(token))
  waiters = []
}

// ── Core fetch ─────────────────────────────────────────────────────────────
async function rawFetch(path: string, token: string | null, init?: RequestInit): Promise<Response> {
  const headers = new Headers((init?.headers as HeadersInit | undefined))
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
}

// ── Authenticated fetch with auto-refresh ──────────────────────────────────
async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getAccessToken()
  let res = await rawFetch(path, token, init)

  if (res.status !== 401) return res

  // 401 — attempt token refresh
  if (isRefreshing) {
    const newToken = await enqueueWaiter()
    if (!newToken) return res
    return rawFetch(path, newToken, init)
  }

  isRefreshing = true
  try {
    const { access_token } = await apiRefresh()
    setAccessToken(access_token)
    drainWaiters(access_token)
    isRefreshing = false
    res = await rawFetch(path, access_token, init)
  } catch {
    isRefreshing = false
    drainWaiters(null)
    clearAuthStorage()
    window.location.href = '/'
  }

  return res
}

// ── Public helper used by API modules ─────────────────────────────────────
export async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await authFetch(path, init)
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
      else if (body?.message) message = body.message
    } catch { /* non-JSON body */ }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
