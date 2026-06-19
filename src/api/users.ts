import type { UserRole } from '../components/users/UserTableRow'

const BASE_URL = (
  (import.meta.env.VITE_CALLS_URL as string | undefined) ?? 'http://localhost:8790'
).replace(/\/+$/, '')

export interface ApiUser {
  user_id:           string
  profile_pic:       string
  first_name:        string
  last_name:         string
  username:          string
  email:             string
  role:              string
  organization_name: string
  created_at:        string
  updated_at:        string
}

export interface UsersPagination {
  total:      number
  limit:      number
  page:       number
  totalPages: number
}

export interface UsersResponse {
  data:       ApiUser[]
  pagination: UsersPagination
}

export interface UsersParams {
  page:    number
  limit:   number
  search?: string
}

export interface UserPayload {
  first_name:        string
  last_name:         string
  username:          string
  email:             string
  role:              string
  organization_name: string
  profile_pic?:      string
  password?:         string
}

export function toUserRole(raw: string): UserRole {
  const title = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  const valid: UserRole[] = ['Admin', 'Manager', 'Agent', 'Viewer']
  return valid.includes(title as UserRole) ? (title as UserRole) : 'Viewer'
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch { /* non-JSON body */ }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function fetchUsers(params: UsersParams): Promise<UsersResponse> {
  const qs = new URLSearchParams()
  qs.set('page',  String(params.page))
  qs.set('limit', String(params.limit))
  if (params.search) qs.set('search', params.search)
  return request<UsersResponse>(`/api/users?${qs}`)
}

export async function fetchUser(id: string): Promise<ApiUser> {
  return request<ApiUser>(`/api/users/${id}`)
}

export async function createUser(payload: UserPayload): Promise<ApiUser> {
  return request<ApiUser>('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateUser(id: string, payload: Partial<UserPayload>): Promise<ApiUser> {
  return request<ApiUser>(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteUser(id: string): Promise<void> {
  return request<void>(`/api/users/${id}`, { method: 'DELETE' })
}
