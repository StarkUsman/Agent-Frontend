import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  MdOutlineDashboard, MdOutlineSmartToy, MdOutlineHistory,
  MdOutlineBarChart, MdOutlineSettings, MdOutlinePeopleAlt,
  MdChevronLeft, MdChevronRight,
} from 'react-icons/md'
import { HiOutlineLogout } from 'react-icons/hi'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useCurrentUser } from '../../contexts/CurrentUserContext'
import { useAgents } from '../../contexts/AgentsContext'
import type { Permission } from '../../lib/permissions'
import UserAvatar from '../users/UserAvatar'
import favIcon from '../../assets/favIcon.png'

// ── Nav item definition ────────────────────────────────────────────────────
interface NavItem {
  label:       string
  icon:        React.ElementType
  to:          string
  end?:        boolean
  badge?:      number
  permission?: Permission
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',     icon: MdOutlineDashboard,  to: '/dashboard', end: true },
  { label: 'My agents',    icon: MdOutlineSmartToy,   to: '/agents' },
  { label: 'Call history', icon: MdOutlineHistory,    to: '/calls', badge: 3 },
  { label: 'Reports',      icon: MdOutlineBarChart,   to: '/reports' },
  { label: 'Users',        icon: MdOutlinePeopleAlt,  to: '/users' },
]

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { user, hasPermission, logout } = useCurrentUser()
  const { runningCount } = useAgents()

  const [collapsed, setCollapsed] = useState(() =>
    localStorage.getItem('sidebar-collapsed') === 'true'
  )

  const toggle = () =>
    setCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })

  const navItems = NAV_ITEMS.filter((item) => !item.permission || hasPermission(item.permission))

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    logout()
    navigate('/')
  }

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} h-screen bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}
    >

      {/* Brand */}
      <div className={`py-6 flex items-center shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#ea6c2e' }}
        >
          <img src={favIcon} alt="Octavebytes logo" className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="leading-tight overflow-hidden">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight whitespace-nowrap">
              Octavebytes Voice Studio
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">Voice AI Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center py-2.5 rounded-lg text-sm font-medium transition-colors
              ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'}
              ${isActive
                ? 'bg-[rgb(234,108,46)] text-white'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`text-lg shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>
                    {(() => {
                      const badge = item.to === '/agents' ? runningCount : item.badge
                      return badge !== undefined && badge > 0 ? (
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-600 dark:text-slate-700'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {badge}
                        </span>
                      ) : null
                    })()}
                  </>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 py-2 shrink-0">
        <button
          onClick={toggle}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`w-full flex items-center py-2 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer
            ${collapsed ? 'justify-center px-0' : 'gap-2 px-3'}
          `}
        >
          {collapsed
            ? <MdChevronRight className="text-lg" />
            : (
              <>
                <MdChevronLeft className="text-lg shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">Collapse</span>
              </>
            )
          }
        </button>
      </div>

      {/* User profile */}
      <div className="px-2 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
        {collapsed ? (
          /* Collapsed: avatar + stacked action icons */
          <div className="flex flex-col items-center gap-2">
            <UserAvatar id={user.id} firstName={user.first_name} lastName={user.last_name} profilePic={user.profile_pic} />
            <div className="flex flex-col items-center gap-0.5">
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <button
                title="Settings"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <MdOutlineSettings className="text-sm" />
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
              >
                <HiOutlineLogout className="text-sm" />
              </button>
            </div>
          </div>
        ) : (
          /* Expanded: full profile row */
          <div className="flex items-center gap-3 px-1">
            <UserAvatar id={user.id} firstName={user.first_name} lastName={user.last_name} profilePic={user.profile_pic} />
            <div className="flex-1 min-w-0 leading-tight">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user.first_name} {user.last_name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.role}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                aria-label="Toggle theme"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="text-base" /> : <Moon className="text-base" />}
              </button>
              <button
                title="Settings"
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <MdOutlineSettings className="text-base" />
              </button>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors cursor-pointer"
              >
                <HiOutlineLogout className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>

    </aside>
  )
}

export default Sidebar
