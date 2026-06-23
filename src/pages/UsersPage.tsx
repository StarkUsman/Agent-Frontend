import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdChevronLeft, MdChevronRight, MdSearch, MdRefresh } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import UserTableRow, { UserTableRowSkeleton } from '../components/users/UserTableRow'
import type { UserRowData } from '../components/users/UserTableRow'
import { fetchUsers, deleteUser, toUserRole } from '../api/users'
import type { UsersPagination } from '../api/users'
import { useCurrentUser } from '../contexts/CurrentUserContext'
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal'
import { showToast } from '../components/ui/Toast'

// ── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 25

const BASE_COLUMNS = [
  { label: 'User',         width: 'w-[30%]' },
  { label: 'Username',     width: 'w-[15%]' },
  { label: 'Email',        width: 'w-[20%]' },
  { label: 'Role',         width: 'w-[12%]' },
  { label: 'Organisation', width: 'w-[13%]' },
]

const ACTIONS_COLUMN = { label: 'Actions', width: 'w-[10%]' }

// ── Page ───────────────────────────────────────────────────────────────────
const UsersPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useCurrentUser()
  const canManageUsers = hasPermission('users:manage')
  const COLUMNS = canManageUsers ? [...BASE_COLUMNS, ACTIONS_COLUMN] : BASE_COLUMNS

  const [users, setUsers]             = useState<UserRowData[]>([])
  const [pagination, setPagination]   = useState<UsersPagination>({ total: 0, limit: ITEMS_PER_PAGE, page: 1, totalPages: 1 })
  const [currentPage, setCurrentPage] = useState(1)
  // searchInput: what the user is typing — does NOT trigger API calls
  // appliedSearch: what was last submitted (Enter / search button) — drives the API
  const [searchInput, setSearchInput]     = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<UserRowData | null>(null)
  const [deleting, setDeleting]     = useState(false)

  const load = useCallback(async (page: number, search: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchUsers({ page, limit: ITEMS_PER_PAGE, search: search || undefined })
      const mapped: UserRowData[] = res.data.map((u, i) => ({
        id:                parseInt(u.user_id, 10) || (page - 1) * ITEMS_PER_PAGE + i + 1,
        first_name:        u.first_name,
        last_name:         u.last_name,
        username:          u.username,
        email:             u.email,
        password:          '',
        role:              toUserRole(u.role),
        profile_pic:       u.profile_pic ?? '',
        organisation_name: u.organization_name,
      }))
      setUsers(mapped)
      setPagination(res.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  // Single fetch on mount
  useEffect(() => { load(1, '') }, [load])

  const submitSearch = () => {
    setAppliedSearch(searchInput)
    setCurrentPage(1)
    load(1, searchInput)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    load(page, appliedSearch)
  }

  const handleRefresh = () => {
    load(currentPage, appliedSearch)
  }

  const handleDeleteRequest = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (user) setPendingDelete(user)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    const name = `${pendingDelete.first_name} ${pendingDelete.last_name}`
    setDeleting(true)
    try {
      await deleteUser(String(pendingDelete.id))
      setPendingDelete(null)
      load(currentPage, appliedSearch)
      showToast.success('User deleted', `${name} has been removed.`)
    } catch (err) {
      showToast.error('Failed to delete user', err instanceof Error ? err.message : undefined)
    } finally {
      setDeleting(false)
    }
  }

  const { total, totalPages } = pagination
  const safePage  = Math.min(currentPage, Math.max(1, totalPages))
  const startItem = total === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1
  const endItem   = Math.min(safePage * ITEMS_PER_PAGE, total)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar */}
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage user accounts and access for your organisation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search — fires only on Enter or clicking the icon */}
            <div className="relative">
              <button
                onClick={submitSearch}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg hover:text-indigo-500 transition-colors cursor-pointer"
                tabIndex={-1}
                aria-label="Search"
              >
                <MdSearch />
              </button>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                placeholder="Search users…"
                className="
                  w-56 pl-9 pr-4 py-2 text-sm rounded-xl
                  bg-slate-50 dark:bg-slate-900
                  text-slate-900 dark:text-slate-100
                  border border-slate-200 dark:border-slate-700
                  placeholder-slate-400 dark:placeholder-slate-500
                  shadow-sm dark:shadow-md dark:shadow-black/40
                  focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
                  hover:border-slate-300 dark:hover:border-slate-600
                  transition-colors duration-200"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              title="Reload users"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            </button>

            {canManageUsers && (
              <button
                onClick={() => navigate('/users/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                style={{ backgroundColor: '#6366f1' }}
              >
                <MdAdd className="text-lg" />
                Create user
              </button>
            )}
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 flex flex-col min-h-0 px-8 pt-5 pb-5">
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-clip">

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-900">
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.label}
                        className={`${col.width} py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider first:pl-6 last:pr-6 px-4`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <UserTableRowSkeleton key={i} showActions={canManageUsers} />
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-red-500 dark:text-red-400">
                        {error}{' '}
                        <button onClick={handleRefresh} className="font-semibold underline underline-offset-2 hover:text-red-600 cursor-pointer">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                        {appliedSearch
                          ? <>No users match <span className="font-semibold text-slate-600 dark:text-slate-300">"{appliedSearch}"</span></>
                          : 'No users found.'}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <UserTableRow key={user.id} {...user} onDelete={handleDeleteRequest} showActions={canManageUsers} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span> users
                {appliedSearch && <span className="ml-1">for "{appliedSearch}"</span>}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage === 1 || loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === safePage ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={page === safePage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage === totalPages || loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronRight className="text-lg" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {pendingDelete && (
        <DeleteConfirmModal
          title="Confirm Delete"
          description={`Are you sure you want to delete ${pendingDelete.first_name} ${pendingDelete.last_name}? This action cannot be undone.`}
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}

export default UsersPage
