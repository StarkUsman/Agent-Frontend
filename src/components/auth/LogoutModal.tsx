import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineDevices, MdOutlinePhoneAndroid, MdClose } from 'react-icons/md'
import { apiLogout, apiLogoutAll } from '../../api/auth'
import { getAccessToken } from '../../api/client'
import { useCurrentUser } from '../../contexts/CurrentUserContext'

interface LogoutModalProps {
  onClose: () => void
}

const LogoutModal = ({ onClose }: LogoutModalProps) => {
  const navigate = useNavigate()
  const { clearSession } = useCurrentUser()
  const [loading, setLoading] = useState<'current' | 'all' | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const finish = () => {
    clearSession()
    navigate('/')
  }

  const handleLogout = async () => {
    setLoading('current')
    setError(null)
    try {
      await apiLogout()
      finish()
    } catch {
      // Even if the server call fails, clear locally so the user isn't stuck
      finish()
    }
  }

  const handleLogoutAll = async () => {
    setLoading('all')
    setError(null)
    const token = getAccessToken()
    if (!token) { finish(); return }
    try {
      await apiLogoutAll(token)
      finish()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout all devices.')
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sign out</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Choose how you'd like to sign out.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <MdClose className="text-lg" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="px-6 pb-6 space-y-3">
          {/* This device */}
          <button
            onClick={handleLogout}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group cursor-pointer text-left"
          >
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 transition-colors shrink-0">
              <MdOutlinePhoneAndroid className="text-xl text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {loading === 'current' ? 'Signing out…' : 'This device only'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Stay signed in on your other devices
              </p>
            </div>
          </button>

          {/* All devices */}
          <button
            onClick={handleLogoutAll}
            disabled={loading !== null}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50/50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all group cursor-pointer text-left"
          >
            <span className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors shrink-0">
              <MdOutlineDevices className="text-xl text-slate-500 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {loading === 'all' ? 'Signing out everywhere…' : 'All devices'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Revoke all active sessions everywhere
              </p>
            </div>
          </button>

          <button
            onClick={onClose}
            disabled={loading !== null}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal
