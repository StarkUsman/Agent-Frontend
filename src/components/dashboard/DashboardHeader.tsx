import { MdAdd } from 'react-icons/md'
import { useCurrentUser } from '../../contexts/CurrentUserContext'

// ── Helpers ────────────────────────────────────────────────────────────────
const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 21) return 'Good evening'
  return 'Good night'
}

// ── Component ──────────────────────────────────────────────────────────────
const DashboardHeader = () => {
  const { user, hasPermission } = useCurrentUser()

  return (
    <div className="flex items-center justify-between px-8 pt-5 pb-4">

      {/* ── Left: Greeting ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {getGreeting()}, {user.first_name} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Here's what's happening with your voice agents today.
        </p>
      </div>

    </div>
  )
}

export default DashboardHeader
