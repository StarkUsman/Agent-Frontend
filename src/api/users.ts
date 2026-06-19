import { authRequest } from './client'
import type { UserRole } from '../components/users/UserTableRow'

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

export function fetchUsers(params: UsersParams): Promise<UsersResponse> {
  const qs = new URLSearchParams()
  qs.set('page',  String(params.page))
  qs.set('limit', String(params.limit))
  if (params.search) qs.set('search', params.search)
  return authRequest<UsersResponse>(`/api/users?${qs}`)
}

export function fetchUser(id: string): Promise<ApiUser> {
  return authRequest<ApiUser>(`/api/users/${id}`)
}

export function createUser(payload: UserPayload): Promise<ApiUser> {
  return authRequest<ApiUser>('/api/users', {
    method: 'POST',
    body:   JSON.stringify(payload),
  })
}

export function updateUser(id: string, payload: Partial<UserPayload>): Promise<ApiUser> {
  return authRequest<ApiUser>(`/api/users/${id}`, {
    method: 'PATCH',
    body:   JSON.stringify(payload),
  })
}

export function deleteUser(id: string): Promise<void> {
  return authRequest<void>(`/api/users/${id}`, { method: 'DELETE' })
}
