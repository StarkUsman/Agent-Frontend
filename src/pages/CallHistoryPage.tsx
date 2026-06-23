import { useState, useCallback, useEffect } from 'react'
import { MdKeyboardArrowDown, MdSearch, MdChevronLeft, MdChevronRight, MdRefresh } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import CallTableRow, { CallTableRowSkeleton } from '../components/calls/CallTableRow'
import CallDetailModal from '../components/calls/CallDetailModal'
import { useAgents } from '../contexts/AgentsContext'
import { fetchCalls, type CallsResponse, type ApiCallRecord } from '../api/calls'

const DEFAULT_LIMIT    = 25
const STATUS_OPTIONS   = ['All results', 'Completed', 'Escalated', 'On a call', 'Failed']
const DATE_OPTIONS     = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days']
const COLUMNS          = ['Call ID', 'Agent', 'Status', 'Duration', 'Date & Time']

const STATUS_MAP: Record<string, string> = {
  'Completed': 'completed',
  'Escalated': 'escalated',
  'On a call': 'onCall',
  'Failed':    'failed',
}

const DATE_MAP: Record<string, string> = {
  'Today':        'today',
  'Yesterday':    'yesterday',
  'Last 7 days':  'last_7_days',
  'Last 30 days': 'last_30_days',
}

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
  const [statusFilter, setStatusFilter] = useState('All results')
  const [dateFilter,   setDateFilter]   = useState('Today')
  // searchInput: what the user types — never triggers a call
  // appliedSearch: submitted via Enter / search icon — drives the API
  const [searchInput,   setSearchInput]   = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [currentPage,   setCurrentPage]   = useState(1)

  const [response,     setResponse]     = useState<CallsResponse | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [selectedCall, setSelectedCall] = useState<ApiCallRecord | null>(null)

  const load = useCallback(async (
    page: number,
    search: string,
    status: string,
    agent: string,
    date: string,
  ) => {
    setLoading(true)
    setError(null)
    try {
      const params: Parameters<typeof fetchCalls>[0] = { page, limit: DEFAULT_LIMIT }
      if (status !== 'All results') params.status      = STATUS_MAP[status] ?? status.toLowerCase()
      if (agent  !== 'All agents')  params.agent_name  = agent
      if (search.trim())            params.call_id     = search.trim()
      if (DATE_MAP[date])           params.date_filter = DATE_MAP[date]
      setResponse(await fetchCalls(params))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calls')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1, '', 'All results', 'All agents', 'Today')
  }, [load])

  const handleFilter = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value)
    const newPage = 1
    setCurrentPage(newPage)
    load(newPage, appliedSearch, setter === setStatusFilter ? value : statusFilter,
                                 setter === setAgentFilter  ? value : agentFilter,
                                 setter === setDateFilter   ? value : dateFilter)
  }

  const submitSearch = () => {
    setAppliedSearch(searchInput)
    setCurrentPage(1)
    load(1, searchInput, statusFilter, agentFilter, dateFilter)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    load(page, appliedSearch, statusFilter, agentFilter, dateFilter)
  }

  const handleRefresh = () => {
    load(currentPage, appliedSearch, statusFilter, agentFilter, dateFilter)
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
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Call history</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              A record of every call handled by your agents.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            title="Reload calls"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <MdRefresh className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FilterSelect
              value={agentFilter}
              options={agentOptions}
              onChange={(v) => handleFilter(setAgentFilter, v)}
              disabled={agentFilterDisabled}
              placeholder={agentFilterPlaceholder}
            />
            <FilterSelect value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => handleFilter(setStatusFilter, v)} />
            <FilterSelect value={dateFilter}   options={DATE_OPTIONS}   onChange={(v) => handleFilter(setDateFilter, v)} />
          </div>

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
              placeholder="Paste call ID…"
              className="w-56 pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm dark:shadow-md dark:shadow-black/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-300 dark:hover:border-slate-600 transition-colors duration-200"
            />
          </div>
        </div>

        {/* Table area */}
        <div className="flex-1 flex flex-col min-h-0 px-8 pt-5 pb-5">
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-clip">

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-white dark:bg-slate-800">
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
                    Array.from({ length: 8 }).map((_, i) => (
                      <CallTableRowSkeleton key={i} />
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-red-500">
                        {error}{' '}
                        <button onClick={handleRefresh} className="font-semibold underline underline-offset-2 hover:text-red-600 cursor-pointer">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : calls.length > 0 ? (
                    calls.map((call) => (
                      <CallTableRow
                        key={call.call_id}
                        id={call.call_id}
                        agent={call.agent_name}
                        status={call.status}
                        duration_seconds={call.duration_seconds}
                        started_at={call.started_at}
                        onClick={() => setSelectedCall(call)}
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
            </div>

            {/* Pagination */}
            <div className="shrink-0 flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{pagination.total}</span> calls
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === currentPage ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    style={page === currentPage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages || loading}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronRight className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Detail modal */}
      {selectedCall && (
        <CallDetailModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}
    </div>
  )
}

export default CallHistoryPage
