import { createContext, useContext, useEffect, useState } from 'react'
import { USERS } from '../data/users'
import type { UserRowData } from '../components/users/UserTableRow'

export type CurrentUser = Omit<UserRowData, 'password'>

const stripPassword = (user: UserRowData): CurrentUser => {
  const { password, ...rest } = user
  return rest
}

const DEFAULT_USER: CurrentUser = stripPassword(USERS[0])

interface CurrentUserContextValue {
  user: CurrentUser
  isViewer: boolean
  loginAs: (email: string) => void
  logout: () => void
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null)

const getInitialUser = (): CurrentUser => {
  const stored = localStorage.getItem('current_user')
  if (stored) {
    try {
      return JSON.parse(stored) as CurrentUser
    } catch {
      // fall through to default
    }
  }
  return DEFAULT_USER
}

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<CurrentUser>(getInitialUser)

  useEffect(() => {
    localStorage.setItem('current_user', JSON.stringify(user))
  }, [user])

  const loginAs = (email: string) => {
    const match = USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    setUser(stripPassword(match ?? USERS[0]))
  }

  const logout = () => setUser(DEFAULT_USER)

  return (
    <CurrentUserContext.Provider value={{ user, isViewer: user.role === 'Viewer', loginAs, logout }}>
      {children}
    </CurrentUserContext.Provider>
  )
}

export const useCurrentUser = () => {
  const ctx = useContext(CurrentUserContext)
  if (!ctx) throw new Error('useCurrentUser must be used inside CurrentUserProvider')
  return ctx
}
