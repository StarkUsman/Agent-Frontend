import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import UserTableRow from '../components/users/UserTableRow'
import { USERS } from '../data/users'

// ── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6

const COLUMNS = [
  { label: 'User',         width: 'w-[30%]' },
  { label: 'Username',     width: 'w-[15%]' },
  { label: 'Email',        width: 'w-[20%]' },
  { label: 'Role',         width: 'w-[12%]' },
  { label: 'Organisation', width: 'w-[13%]' },
  { label: 'Actions',      width: 'w-[10%]' },
]

// ── Page ───────────────────────────────────────────────────────────────────
const UsersPage = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState(() => [...USERS])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  const q       = searchQuery.trim().toLowerCase()
  const filtered = q
    ? users.filter((u) =>
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organisation_name.toLowerCase().includes(q)
      )
    : users
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginated  = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const startItem  = filtered.length === 0 ? 0 : startIndex + 1
  const endItem    = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDelete = (id: number) => {
    const user = users.find((u) => u.id === id)
    if (!user) return
    if (!window.confirm(`Delete ${user.first_name} ${user.last_name}? This cannot be undone.`)) return

    setUsers((prev) => {
      const next = prev.filter((u) => u.id !== id)
      USERS.length = 0
      USERS.push(...next)
      return next
    })
  }

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
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-56"
              />
            </div>
            <button
              onClick={() => navigate('/users/new')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
              style={{ backgroundColor: '#6366f1' }}
            >
              <MdAdd className="text-lg" />
              Create user
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
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
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      No users match <span className="font-semibold text-slate-600 dark:text-slate-300">"{searchQuery}"</span>
                    </td>
                  </tr>
                ) : (
                  paginated.map((user) => (
                    <UserTableRow key={user.id} {...user} onDelete={handleDelete} />
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> users
                {q && <span className="ml-1">for "{searchQuery}"</span>}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={safePage === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === safePage ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={page === safePage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={safePage === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronRight className="text-lg" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default UsersPage
