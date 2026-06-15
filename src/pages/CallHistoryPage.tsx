import { useState, useMemo } from 'react'
import { MdKeyboardArrowDown, MdSearch, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import CallTableRow, { type CallRecord, type CallResult } from '../components/calls/CallTableRow'

// ── Mock data ──────────────────────────────────────────────────────────────
const CALLS: CallRecord[] = [
  { id: 'C-1042', topic: 'Billing query',         agent: 'Customer support',    platform: 'Genesys Cloud',  result: 'Completed', duration: '3m 12s', time: '10:42 AM' },
  { id: 'C-1041', topic: 'Pricing enquiry',        agent: 'Sales assistant',     platform: 'Genesys Engage', result: 'Escalated', duration: '1m 47s', time: '10:38 AM' },
  { id: 'C-1040', topic: 'Account access',         agent: 'Customer support',    platform: 'Genesys Cloud',  result: 'On a call', duration: null,      time: '10:55 AM' },
  { id: 'C-1039', topic: 'Unknown',                agent: 'IT helpdesk',         platform: 'Genesys Engage', result: 'Failed',    duration: '0m 22s', time: '10:21 AM' },
  { id: 'C-1038', topic: 'Appointment booking',    agent: 'Appointment booking', platform: 'Genesys Cloud',  result: 'Completed', duration: '4m 05s', time: '09:58 AM' },
  { id: 'C-1037', topic: 'Password reset',         agent: 'IT helpdesk',         platform: 'Genesys Engage', result: 'Completed', duration: '2m 33s', time: '09:44 AM' },
  { id: 'C-1036', topic: 'Refund request',         agent: 'Customer support',    platform: 'Genesys Cloud',  result: 'Escalated', duration: '5m 10s', time: '09:31 AM' },
  { id: 'C-1035', topic: 'Product demo request',   agent: 'Sales assistant',     platform: 'Genesys Engage', result: 'Completed', duration: '6m 48s', time: '09:15 AM' },
  { id: 'C-1034', topic: 'Complaint — late delivery', agent: 'Complaint handler', platform: 'Genesys Cloud', result: 'Completed', duration: '7m 02s', time: '08:57 AM' },
  { id: 'C-1033', topic: 'Subscription upgrade',   agent: 'Sales assistant',     platform: 'Genesys Engage', result: 'Completed', duration: '3m 59s', time: '08:42 AM' },
  { id: 'C-1032', topic: 'Network outage report',  agent: 'IT helpdesk',         platform: 'Genesys Cloud',  result: 'Failed',    duration: '0m 41s', time: '08:28 AM' },
  { id: 'C-1031', topic: 'Invoice dispute',        agent: 'Customer support',    platform: 'Genesys Engage', result: 'Escalated', duration: '4m 21s', time: '08:11 AM' },
  { id: 'C-1030', topic: 'Rescheduled appointment', agent: 'Appointment booking', platform: 'Genesys Cloud', result: 'Completed', duration: '2m 15s', time: '07:55 AM' },
  { id: 'C-1029', topic: 'Harassment complaint',   agent: 'Complaint handler',   platform: 'Genesys Engage', result: 'Escalated', duration: '8m 37s', time: '07:38 AM' },
  { id: 'C-1028', topic: 'Plan comparison',        agent: 'Sales assistant',     platform: 'Genesys Cloud',  result: 'Completed', duration: '5m 54s', time: '07:20 AM' },
]

const ITEMS_PER_PAGE = 8

const AGENT_OPTIONS  = ['All agents',  ...Array.from(new Set(CALLS.map((c) => c.agent)))]
const RESULT_OPTIONS = ['All results', 'Completed', 'Escalated', 'On a call', 'Failed']
const DATE_OPTIONS   = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days']

// ── Table columns ──────────────────────────────────────────────────────────
const COLUMNS = ['Call ID', 'Topic / Agent', 'Platform', 'Result', 'Duration', 'Time']

// ── Reusable filter dropdown ───────────────────────────────────────────────
interface FilterSelectProps {
  value: string
  options: string[]
  onChange: (val: string) => void
}

const FilterSelect = ({ value, options, onChange }: FilterSelectProps) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none text-sm border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none text-lg" />
  </div>
)

// ── Page ───────────────────────────────────────────────────────────────────
const CallHistoryPage = () => {
  const [agentFilter,  setAgentFilter]  = useState('All agents')
  const [resultFilter, setResultFilter] = useState('All results')
  const [dateFilter,   setDateFilter]   = useState('Today')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [currentPage,  setCurrentPage]  = useState(1)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleFilter = (setter: (v: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const filteredCalls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return CALLS.filter((call) => {
      const agentMatch  = agentFilter  === 'All agents'  || call.agent  === agentFilter
      const resultMatch = resultFilter === 'All results' || call.result === (resultFilter as CallResult)
      const searchMatch = !q || [call.id, call.topic, call.agent, call.platform]
        .some((field) => field.toLowerCase().includes(q))
      return agentMatch && resultMatch && searchMatch
    })
  }, [agentFilter, resultFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / ITEMS_PER_PAGE))
  const safePage   = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const paginated  = filteredCalls.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const startItem  = filteredCalls.length === 0 ? 0 : startIndex + 1
  const endItem    = Math.min(startIndex + ITEMS_PER_PAGE, filteredCalls.length)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar — never scrolls */}
        <div className="px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Call history</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            A record of every call handled by your agents.
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8 space-y-4">

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FilterSelect value={agentFilter}  options={AGENT_OPTIONS}  onChange={handleFilter(setAgentFilter)} />
              <FilterSelect value={resultFilter} options={RESULT_OPTIONS} onChange={handleFilter(setResultFilter)} />
              <FilterSelect value={dateFilter}   options={DATE_OPTIONS}   onChange={handleFilter(setDateFilter)} />
            </div>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search calls..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all w-52"
              />
            </div>
          </div>

          {/* Table card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <table className="w-full">

              {/* Column headers */}
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="py-3 text-left text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide first:pl-6 last:pr-6 px-4"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Call rows */}
              <tbody>
                {paginated.length > 0 ? (
                  paginated.map((call) => (
                    <CallTableRow key={call.id} {...call} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={COLUMNS.length} className="py-16 text-center text-sm text-slate-400 dark:text-slate-500">
                      {searchQuery
                        ? <>No calls match <span className="font-semibold text-slate-600 dark:text-slate-300">"{searchQuery}"</span></>
                        : 'No calls match the selected filters.'}
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{startItem}–{endItem}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredCalls.length}</span> calls
                {searchQuery && <span className="ml-1">for "{searchQuery}"</span>}
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

export default CallHistoryPage
