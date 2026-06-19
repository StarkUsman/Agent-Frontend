const BASE_URL = (
  (import.meta.env.VITE_CALLS_URL as string | undefined) ?? 'http://localhost:8790'
).replace(/\/+$/, '')

export interface ApiAuthUser {
  user_id:           string
  first_name:        string
  last_name:         string
  username:          string
  email:             string
  role:              string
  organization_name: string
  profile_pic:       string
}

export interface LoginResponse {
  access_token: string
  user:         ApiAuthUser
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body?.message ?? body?.error ?? `${res.status} ${res.statusText}`
  } catch {
    return `${res.status} ${res.statusText}`
  }
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method:      'POST',
    headers:     { 'Content-Type': 'application/json' },
    credentials: 'include', // receive httpOnly refresh token cookie
    body:        JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<LoginResponse>
}

export async function apiRefresh(): Promise<{ access_token: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method:      'POST',
    credentials: 'include', // httpOnly cookie sent automatically
  })
  if (!res.ok) throw new Error('Session expired')
  return res.json()
}

export async function apiLogout(): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method:      'POST',
    credentials: 'include',
  })
}

export async function apiLogoutAll(accessToken: string): Promise<void> {
  await fetch(`${BASE_URL}/api/auth/logout-all`, {
    method:      'POST',
    headers:     { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  })
}
