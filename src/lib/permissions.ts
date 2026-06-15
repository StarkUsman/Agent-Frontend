import type { UserRole } from '../components/users/UserTableRow'

export type Permission = 'agents:create' | 'agents:edit' | 'users:manage'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: ['agents:create', 'agents:edit', 'users:manage'],
  Manager: ['agents:create', 'agents:edit'],
  Agent: [],
  Viewer: [],
}
