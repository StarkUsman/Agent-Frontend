import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdChevronLeft, MdChevronRight, MdSearch } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import AgentTableRow, { type AgentRowData } from '../components/agents/AgentTableRow'
import {
  listAgents,
  activateAgent,
  deactivateAgent,
  agentClientUrl,
  type ManagerAgent,
} from '../api/manager'
import { useCurrentUser } from '../contexts/CurrentUserContext'

// ── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6

const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

// Backend agents have no voice/analytics yet — derive a stable avatar and show
// placeholders for metrics the manager doesn't track.
const toRow = (a: ManagerAgent): AgentRowData => {
  const initial = (a.name.trim()[0] ?? '?').toUpperCase()
  const color = AVATAR_COLORS[a.id.charCodeAt(0) % AVATAR_COLORS.length]
  return {
    id: a.id,
    name: a.name,
    description: `Agent on port ${a.port}`,
    voice: { initial, name: '—', color },
    calls: 0,
    avgTtfb: null,
    interruptions: null,
    clientUrl: agentClientUrl(a.port),
    status: a.status === 'running' ? 'Active' : 'Inactive',
  }
}

const COLUMNS = [
  { label: 'Agent name',        width: 'w-[26%]' },
  { label: 'Voice',             width: 'w-[10%]' },
  { label: 'URL',               width: 'w-[18%]' },
  { label: 'Calls',             width: 'w-[7%]'  },
  { label: 'Avg TTFB',          width: 'w-[9%]'  },
  { label: 'Interruptions',     width: 'w-[9%]'  },
  { label: 'Conversation flow', width: 'w-[12%]' },
  { label: 'Status',            width: 'w-[9%]'  },
]

// ── Page ───────────────────────────────────────────────────────────────────
const AgentsPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useCurrentUser()
  const canCreateAgents = hasPermission('agents:create')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState<AgentRowData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAgents = async () => {
    try {
      const data = await listAgents()
      setRows(data.map(toRow))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  const handleToggleStatus = async (id: string, status: AgentRowData['status']) => {
    try {
      if (status === 'Active') {
        await deactivateAgent(id)
      } else {
        await activateAgent(id)
      }
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: status === 'Active' ? 'Inactive' : 'Active' } : r
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agent status')
    }
  }

  const q           = searchQuery.trim().toLowerCase()
  const agents      = q
    ? rows.filter((a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q))
    : rows
  const totalPages  = Math.max(1, Math.ceil(agents.length / ITEMS_PER_PAGE))
  const safePage    = Math.min(currentPage, totalPages)
  const startIndex  = (safePage - 1) * ITEMS_PER_PAGE
  const paginated   = agents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const startItem   = agents.length === 0 ? 0 : startIndex + 1
  const endItem     = Math.min(startIndex + ITEMS_PER_PAGE, agents.length)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar */}
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My agents</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Manage and configure your voice agents.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search agents..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-56"
              />
            </div>
            {canCreateAgents && (
              <button
                onClick={() => navigate('/agents/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                style={{ backgroundColor: '#6366f1' }}
              >
                <MdAdd className="text-lg" />
                Create agent
              </button>
            )}
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
                {loading ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      Loading agents…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-red-500">
                      {error}{' '}
                      <button
                        onClick={() => { setLoading(true); loadAgents() }}
                        className="font-semibold underline underline-offset-2 hover:text-red-600 cursor-pointer"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      {q
                        ? <>No agents match <span className="font-semibold text-slate-600 dark:text-slate-300">"{searchQuery}"</span></>
                        : 'No agents yet — create one to get started.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map((agent) => (
                    <AgentTableRow key={agent.id} {...agent} onToggleStatus={handleToggleStatus} />
                  ))
                )}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{agents.length}</span> agents
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

export default AgentsPage
