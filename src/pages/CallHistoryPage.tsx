import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardArrowDown } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import CallTableRow, { type CallRecord, type CallResult } from '../components/calls/CallTableRow'

// ── Mock data ──────────────────────────────────────────────────────────────
const CALLS: CallRecord[] = [
  {
    id: 'C-1042',
    topic: 'Billing query',
    agent: 'Customer support',
    platform: 'Genesys Cloud',
    result: 'Completed',
    duration: '3m 12s',
    time: '10:42 AM',
  },
  {
    id: 'C-1041',
    topic: 'Pricing enquiry',
    agent: 'Sales assistant',
    platform: 'Genesys Engage',
    result: 'Escalated',
    duration: '1m 47s',
    time: '10:38 AM',
  },
  {
    id: 'C-1040',
    topic: 'Account access',
    agent: 'Customer support',
    platform: 'Genesys Cloud',
    result: 'On a call',
    duration: null,
    time: '10:55 AM',
  },
  {
    id: 'C-1039',
    topic: 'Unknown',
    agent: 'IT helpdesk',
    platform: 'Genesys Engage',
    result: 'Failed',
    duration: '0m 22s',
    time: '10:21 AM',
  },
  {
    id: 'C-1038',
    topic: 'Appointment booking',
    agent: 'Appointment',
    platform: 'Genesys Cloud',
    result: 'Completed',
    duration: '4m 05s',
    time: '09:58 AM',
  },
]

// ── Filter options ─────────────────────────────────────────────────────────
const AGENT_OPTIONS  = ['All agents',  ...new Set(CALLS.map((c) => c.agent))]
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
      className="appearance-none text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg" />
  </div>
)

// ── Page ───────────────────────────────────────────────────────────────────
const CallHistoryPage = () => {
  const navigate = useNavigate()

  const [agentFilter,  setAgentFilter]  = useState('All agents')
  const [resultFilter, setResultFilter] = useState('All results')
  const [dateFilter,   setDateFilter]   = useState('Today')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  // Recompute only when filter values change
  const filteredCalls = useMemo(() => {
    return CALLS.filter((call) => {
      const agentMatch  = agentFilter  === 'All agents'  || call.agent  === agentFilter
      const resultMatch = resultFilter === 'All results' || call.result === (resultFilter as CallResult)
      return agentMatch && resultMatch
    })
  }, [agentFilter, resultFilter])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar — never scrolls */}
        <div className="px-8 pt-5 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Call history</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            A record of every call handled by your agents.
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8 space-y-4">

          {/* Filter row */}
          <div className="flex items-center gap-3">
            <FilterSelect
              value={agentFilter}
              options={AGENT_OPTIONS}
              onChange={setAgentFilter}
            />
            <FilterSelect
              value={resultFilter}
              options={RESULT_OPTIONS}
              onChange={setResultFilter}
            />
            <FilterSelect
              value={dateFilter}
              options={DATE_OPTIONS}
              onChange={setDateFilter}
            />
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">

              {/* Column headers */}
              <thead>
                <tr className="border-b border-slate-100">
                  {COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide first:pl-6 last:pr-6 px-4"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Call rows */}
              <tbody>
                {filteredCalls.length > 0 ? (
                  filteredCalls.map((call) => (
                    <CallTableRow key={call.id} {...call} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-sm text-slate-400">
                      No calls match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Row count */}
          <p className="text-xs text-slate-400 text-right">
            Showing {filteredCalls.length} of {CALLS.length} calls
          </p>

        </div>
      </main>
    </div>
  )
}

export default CallHistoryPage
