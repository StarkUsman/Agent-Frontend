import { useState, useEffect } from 'react'
import axios from 'axios'
import { MdAdd } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
interface UserProfile {
  id: number
  name: string
  email: string
  role: string
  avatar: string
}

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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) { setLoading(false); return }

    axios
      .get<UserProfile>('https://api.escuelajs.co/api/v1/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => setUser(data))
      .catch(() => {/* silent — falls back to "there" */})
      .finally(() => setLoading(false))
  }, [])

  // First name only (e.g. "John Doe" → "John")
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex items-center justify-between px-8 pt-5 pb-4">

      {/* ── Left: Greeting ── */}
      <div>
        {loading ? (
          /* Skeleton while fetching profile */
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Here's what's happening with your voice agents today.
            </p>
          </>
        )}
      </div>

      {/* ── Right: CTA Button ── */}
      <button
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95 cursor-pointer shrink-0"
        style={{ backgroundColor: '#6366f1' }}
      >
        <MdAdd className="text-lg" />
        Create new agent
      </button>

    </div>
  )
}

export default DashboardHeader
