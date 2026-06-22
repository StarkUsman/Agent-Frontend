import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdChevronLeft, MdChevronRight, MdSearch, MdRefresh } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import AgentTableRow, { type AgentRowData } from '../components/agents/AgentTableRow'
import {
  activateAgent,
  deactivateAgent,
  agentClientUrl,
  type ManagerAgent,
} from '../api/manager'
import { useCurrentUser } from '../contexts/CurrentUserContext'
import { useAgents } from '../contexts/AgentsContext'

// ── Helpers ─────────────────────────────────────────────────────────────────
const toRow = (a: ManagerAgent): AgentRowData => ({
  id: a.id,
  name: a.name,
  description: a.config?.OPENAI_MODEL ?? `Port ${a.port}`,
  calls: 0,
  avgTtfb: null,
  interruptions: null,
  clientUrl: agentClientUrl(a.port),
  status: a.status === 'running' ? 'Active' : 'Inactive',
})

const COLUMNS = [
  { label: 'Agent name', width: 'w-[36%]' },
  { label: 'URL', width: 'w-[18%]' },
  { label: 'Calls', width: 'w-[7%]' },
  { label: 'Avg TTFB', width: 'w-[9%]' },
  { label: 'Interruptions', width: 'w-[9%]' },
  { label: 'Conversation flow', width: 'w-[12%]' },
  { label: 'Status', width: 'w-[9%]' },
]

// ── Page ───────────────────────────────────────────────────────────────────
const AgentsPage = () => {
  const navigate = useNavigate()
  const { hasPermission } = useCurrentUser()
  const canCreateAgents = hasPermission('agents:create')
  const [searchQuery, setSearchQuery] = useState('')
  const { agents: rawAgents, loading, error, pagination, setPage, refresh } = useAgents()

  const handleToggleStatus = async (id: string, status: AgentRowData['status']) => {
    try {
      if (status === 'Active') {
        await deactivateAgent(id)
      } else {
        await activateAgent(id)
      }
      refresh()
    } catch (err) {
      console.error('Failed to update agent status', err)
    }
  }

  const q = searchQuery.trim().toLowerCase()
  const rows = rawAgents.map(toRow)
  const filtered = q
    ? rows.filter((a) => a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q))
    : rows

  const { page, totalPages, total, limit } = pagination
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1
  const endItem = Math.min(page * limit, total)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
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
                className="
                   w-56
                  pl-9 pr-4 py-2
                  text-sm
                    rounded-xl
                 bg-slate-50 dark:bg-slate-900
                 text-slate-900 dark:text-slate-100
                   border border-slate-200 dark:border-slate-700
                   placeholder-slate-400 dark:placeholder-slate-500
                    shadow-sm
                    dark:shadow-md dark:shadow-black/40
                    focus:outline-none
                     focus:ring-2 focus:ring-indigo-500/40
                     focus:border-indigo-500
                     hover:border-slate-300 dark:hover:border-slate-600
                       transition-colors duration-200"
              />
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              title="Reload agents"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
            </button>
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
                          onClick={refresh}
                          className="font-semibold underline underline-offset-2 hover:text-red-600 cursor-pointer"
                        >
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                        {q
                          ? <><span>No agents match </span><span className="font-semibold text-slate-600 dark:text-slate-300">"{searchQuery}"</span></>
                          : 'No agents yet — create one to get started.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((agent) => (
                      <AgentTableRow key={agent.id} {...agent} onToggleStatus={handleToggleStatus} />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span> agents
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1 || loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${p === page ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    style={p === page ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages || loading}
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
