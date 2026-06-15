import { NavLink, useNavigate } from 'react-router-dom'
import { MdOutlineDashboard, MdOutlineSmartToy, MdOutlineAddCircleOutline, MdOutlineHistory, MdOutlineBarChart, MdOutlineSettings, MdOutlinePets, MdOutlinePeopleAlt } from 'react-icons/md'
import { HiOutlineLogout } from 'react-icons/hi'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useCurrentUser } from '../../contexts/CurrentUserContext'
import type { Permission } from '../../lib/permissions'
import UserAvatar from '../users/UserAvatar'

// ── Nav item definition ────────────────────────────────────────────────────
interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  end?: boolean
  badge?: number
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',      icon: MdOutlineDashboard,         to: '/dashboard', end: true },
  { label: 'My agents',     icon: MdOutlineSmartToy,          to: '/agents',    badge: 6 },
  { label: 'Create agent',  icon: MdOutlineAddCircleOutline,  to: '/agents/new', permission: 'agents:create' },
  { label: 'Call history',  icon: MdOutlineHistory,           to: '/calls',     badge: 3 },
  { label: 'Reports',       icon: MdOutlineBarChart,          to: '/reports' },
  { label: 'Users',         icon: MdOutlinePeopleAlt,         to: '/users' },
]

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, hasPermission, logout } = useCurrentUser()

  const navItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    logout()
    navigate('/')
  }

  return (
    <aside className="w-60 h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">

      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#6366f1' }}
        >
          <MdOutlinePets className="text-white text-lg" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">PipCat Studio</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Voice AI Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`text-lg shrink-0 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
                />
                <span className="flex-1">{item.label}</span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-2">

          {/* Avatar */}
          <UserAvatar id={user.id} firstName={user.first_name} lastName={user.last_name} profilePic={user.profile_pic} />

          {/* Name + role */}
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.first_name} {user.last_name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.role}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="text-base" /> : <Moon className="text-base" />}
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
              <MdOutlineSettings className="text-base" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
              title="Sign out"
            >
              <HiOutlineLogout className="text-base" />
            </button>
          </div>
        </div>
      </div>

    </aside>
  )
}

export default Sidebar
