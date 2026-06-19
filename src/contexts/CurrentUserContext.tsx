import { createContext, useContext, useState } from 'react'
import { apiLogin } from '../api/auth'
import type { ApiAuthUser } from '../api/auth'
import { setAccessToken, clearAuthStorage } from '../api/client'
import { toUserRole } from '../api/users'
import { ROLE_PERMISSIONS, type Permission } from '../lib/permissions'
import type { UserRole } from '../components/users/UserTableRow'

export interface CurrentUser {
  id:                number
  first_name:        string
  last_name:         string
  username:          string
  email:             string
  role:              UserRole
  profile_pic:       string
  organisation_name: string
}

interface CurrentUserContextValue {
  user:          CurrentUser
  hasPermission: (permission: Permission) => boolean
  login:         (email: string, password: string) => Promise<void>
  clearSession:  () => void
}

const GUEST: CurrentUser = {
  id: 0, first_name: '', last_name: '', username: '',
  email: '', role: 'Viewer', profile_pic: '', organisation_name: '',
}

function fromApiUser(u: ApiAuthUser): CurrentUser {
  return {
    id:                parseInt(u.user_id, 10) || 0,
    first_name:        u.first_name,
    last_name:         u.last_name,
    username:          u.username,
    email:             u.email,
    role:              toUserRole(u.role),
    profile_pic:       u.profile_pic ?? '',
    organisation_name: u.organization_name,
  }
}

function loadStoredUser(): CurrentUser {
  try {
    const raw = localStorage.getItem('current_user')
    if (raw) return JSON.parse(raw) as CurrentUser
  } catch { /* ignore */ }
  return GUEST
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CurrentUser>(loadStoredUser)

  const login = async (email: string, password: string): Promise<void> => {
    const res = await apiLogin(email, password)
    setAccessToken(res.access_token)
    const currentUser = fromApiUser(res.user)
    localStorage.setItem('current_user', JSON.stringify(currentUser))
    setUser(currentUser)
  }

  const clearSession = () => {
    clearAuthStorage()
    setUser(GUEST)
  }

  const hasPermission = (permission: Permission) =>
    ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false

  return (
    <CurrentUserContext.Provider value={{ user, hasPermission, login, clearSession }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be inside CurrentUserProvider')
  return ctx
}
