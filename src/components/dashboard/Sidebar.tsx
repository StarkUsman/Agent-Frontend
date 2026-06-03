import { NavLink, useNavigate } from 'react-router-dom'
import { MdOutlineDashboard, MdOutlineSmartToy, MdOutlineAddCircleOutline, MdOutlineHistory, MdOutlineBarChart, MdOutlineSettings } from 'react-icons/md'
import { HiOutlineLogout } from 'react-icons/hi'
import logo from '../../assets/logo.png'

// ── Nav item definition ────────────────────────────────────────────────────
interface NavItem {
  label: string
  icon: React.ElementType
  to: string
  end?: boolean
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview',      icon: MdOutlineDashboard,         to: '/dashboard', end: true },
  { label: 'My agents',     icon: MdOutlineSmartToy,          to: '/agents',    badge: 6 },
  { label: 'Create agent',  icon: MdOutlineAddCircleOutline,  to: '/agents/new' },
  { label: 'Call history',  icon: MdOutlineHistory,           to: '/calls',     badge: 3 },
  { label: 'Reports',       icon: MdOutlineBarChart,          to: '/reports' },
]

// ── Sidebar ────────────────────────────────────────────────────────────────
const Sidebar = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    navigate('/')
  }

  return (
    <aside className="w-60 h-screen bg-white border-r border-slate-100 flex flex-col shrink-0">

      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#dde3e3' }}
        >
          <img src={logo} alt="PipeCat Studio logo" className="w-7 h-7 object-contain" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-900 tracking-tight">PipeCat Studio</p>
          <p className="text-[11px] text-slate-400">Voice AI Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`text-lg shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`}
                />
                <span className="flex-1">{item.label}</span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-slate-100 text-slate-500'
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
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: '#6366f1' }}
          >
            MU
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0 leading-tight">
            <p className="text-sm font-semibold text-slate-800 truncate">M Usman</p>
            <p className="text-[11px] text-slate-400 truncate">Admin</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <MdOutlineSettings className="text-base" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
