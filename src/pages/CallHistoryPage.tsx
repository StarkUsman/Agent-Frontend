import { useState, useEffect, useCallback } from 'react'
import { MdKeyboardArrowDown, MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import CallTableRow from '../components/calls/CallTableRow'
import { useAgents } from '../contexts/AgentsContext'
import { fetchCalls, type CallsResponse } from '../api/calls'

const DEFAULT_LIMIT  = 25
const RESULT_OPTIONS = ['All results', 'Completed', 'Escalated', 'On a call', 'Failed']
const DATE_OPTIONS   = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days']
const COLUMNS        = ['Call ID', 'Agent', 'Result', 'Duration', 'Time']

// ── Filter dropdown ────────────────────────────────────────────────────────
interface FilterSelectProps {
  value:        string
  options:      string[]
  onChange:     (val: string) => void
  disabled?:    boolean
  placeholder?: string
}

const FilterSelect = ({ value, options, onChange, disabled, placeholder }: FilterSelectProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`appearance-none text-sm border rounded-lg pl-3 pr-8 py-2 transition-colors
        ${disabled
          ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 cursor-not-allowed'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer'}
      `}
    >
      {disabled && placeholder
        ? <option>{placeholder}</option>
        : options.map((opt) => <option key={opt} value={opt}>{opt}</option>)
      }
    </select>
    <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg" />
  </div>
)

// ── Page ───────────────────────────────────────────────────────────────────
const CallHistoryPage = () => {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents()
  const agentOptions           = ['All agents', ...agents.map((a) => a.name)]
  const agentFilterDisabled    = agentsLoading || !!agentsError || agents.length === 0
  const agentFilterPlaceholder = agentsLoading ? 'Loading agents…' : agentsError ? 'Failed to load agents' : 'No agents found'

  const [agentFilter,  setAgentFilter]  = useState('All agents')
  const [resultFilter, setResultFilter] = useState('All results')
  const [dateFilter,   setDateFilter]   = useState('Today')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [currentPage,  setCurrentPage]  = useState(1)

  const [response, setResponse] = useState<CallsResponse | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Parameters<typeof fetchCalls>[0] = {
        page:  currentPage,
        limit: DEFAULT_LIMIT,
      }
      const RESULT_MAP: Record<string, string> = {
        'Completed': 'completed',
        'Escalated': 'escalated',
        'On a call': 'onCall',
        'Failed':    'failed',
      }
      if (resultFilter !== 'All results') params.result = RESULT_MAP[resultFilter] ?? resultFilter.toLowerCase()
      if (agentFilter  !== 'All agents')  params.agent_name = agentFilter
      if (searchQuery.trim())             params.call_id    = searchQuery.trim()

      const data = await fetchCalls(params)
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calls')
    } finally {
      setLoading(false)
    }
  }, [currentPage, resultFilter, agentFilter, searchQuery])

  useEffect(() => { load() }, [load])

  const handleFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const calls      = response?.data       ?? []
  const pagination = response?.pagination ?? { total: 0, limit: DEFAULT_LIMIT, page: 1, totalPages: 1 }
  const startItem  = calls.length === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem    = Math.min(pagination.page * pagination.limit, pagination.total)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Call history</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            A record of every call handled by your agents.
          </p>
        </div>

        {/* Scrollable area */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8 space-y-4">

          {/* Filters */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FilterSelect
                value={agentFilter}
                options={agentOptions}
                onChange={handleFilter(setAgentFilter)}
                disabled={agentFilterDisabled}
                placeholder={agentFilterPlaceholder}
              />
              <FilterSelect value={resultFilter} options={RESULT_OPTIONS} onChange={handleFilter(setResultFilter)} />
              <FilterSelect value={dateFilter}   options={DATE_OPTIONS}   onChange={handleFilter(setDateFilter)} />
            </div>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Paste call ID…"
                className="w-56 pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-md dark:shadow-black/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200"
              />
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {COLUMNS.map((col) => (
                    <th key={col} className="py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide first:pl-6 last:pr-6 px-4">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      Loading calls…
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : calls.length > 0 ? (
                  calls.map((call) => (
                    <CallTableRow
                      key={call.call_id}
                      id={call.call_id}
                      agent={call.agent_name}
                      result={call.result}
                      duration={call.duration}
                      time={call.call_time}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      No calls match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{pagination.total}</span> calls
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === currentPage ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={page === currentPage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === pagination.totalPages}
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

export default CallHistoryPage
