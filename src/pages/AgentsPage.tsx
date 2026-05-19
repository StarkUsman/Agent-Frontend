import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdOutlineWarningAmber } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import AgentTableRow, { type AgentRowData } from '../components/agents/AgentTableRow'

// ── Mock data ──────────────────────────────────────────────────────────────
const AGENTS: AgentRowData[] = [
  {
    id: 1,
    name: 'Customer support',
    description: 'Helps callers with billing questions and account issues',
    voice: { initial: 'C', name: 'Clara', color: '#6366f1' },
    calls: 584,
    avgTtfb: '720ms',
    interruptions: '9%',
    flow: { nodes: 4 },
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sales assistant',
    description: 'Qualifies new leads before connecting to a sales rep',
    voice: { initial: 'J', name: 'James', color: '#64748b' },
    calls: 312,
    avgTtfb: '840ms',
    interruptions: '14%',
    flow: { nodes: 6 },
    status: 'Active',
  },
  {
    id: 3,
    name: 'Appointment booking',
    description: 'Books and reschedules appointments automatically',
    voice: { initial: 'S', name: 'Sophie', color: '#0891b2' },
    calls: 241,
    avgTtfb: '680ms',
    interruptions: '6%',
    flow: { nodes: 5 },
    status: 'Active',
  },
  {
    id: 4,
    name: 'IT helpdesk',
    description: 'Handles common IT questions and password resets',
    voice: { initial: 'M', name: 'Marcus', color: '#475569' },
    calls: 147,
    avgTtfb: '410ms',
    interruptions: '11%',
    flow: { nodes: 3 },
    status: 'Inactive',
  },
  {
    id: 5,
    name: 'Complaint handler',
    description: 'Manages escalated complaints with empathy',
    voice: { initial: 'A', name: 'Aria', color: '#8b5cf6' },
    calls: 63,
    avgTtfb: null,
    interruptions: null,
    flow: null,
    status: 'Inactive',
  },
  {
    id: 6,
    name: 'Post-call survey',
    description: 'Collects customer satisfaction scores after each call',
    voice: { initial: 'E', name: 'Emma', color: '#0284c7' },
    calls: 208,
    avgTtfb: '750ms',
    interruptions: '3%',
    flow: { nodes: 2 },
    status: 'Active',
  },
]

// Count agents with no conversation flow for the warning banner
const noFlowCount = AGENTS.filter((a) => a.flow === null).length

// ── Table header columns ───────────────────────────────────────────────────
const COLUMNS = [
  { label: 'Agent name',        width: 'w-[35%]' },
  { label: 'Voice',             width: 'w-[12%]' },
  { label: 'Calls',             width: 'w-[8%]'  },
  { label: 'Avg TTFB',          width: 'w-[10%]' },
  { label: 'Interruptions',     width: 'w-[10%]' },
  { label: 'Conversation flow', width: 'w-[15%]' },
  { label: 'Status',            width: 'w-[10%]' },
]

// ── Page ───────────────────────────────────────────────────────────────────
const AgentsPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar — never scrolls */}
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My agents</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and configure your voice agents.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: '#6366f1' }}
          >
            <MdAdd className="text-lg" />
            Create agent
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">

              {/* Column headers */}
              <thead>
                <tr className="border-b border-slate-100">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      className={`${col.width} py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide first:pl-6 last:pr-6 px-4`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Agent rows */}
              <tbody>
                {AGENTS.map((agent) => (
                  <AgentTableRow key={agent.id} {...agent} />
                ))}
              </tbody>

            </table>

            {/* Warning banner — only shown when agents have no flow */}
            {noFlowCount > 0 && (
              <div className="flex items-center gap-3 mx-6 mb-5 mt-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <MdOutlineWarningAmber className="text-amber-500 text-lg shrink-0" />
                <p className="text-sm text-slate-600">
                  {noFlowCount} agent{noFlowCount > 1 ? 's have' : ' has'} no conversation flow
                  and cannot handle calls.{' '}
                  <a
                    href="#"
                    className="font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-700"
                  >
                    Add a flow →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

export default AgentsPage
