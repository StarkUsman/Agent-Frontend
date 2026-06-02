import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdAdd, MdOutlineWarningAmber, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import AgentTableRow from '../components/agents/AgentTableRow'
import { AGENTS } from '../data/agents'

// ── Config ─────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6

// ── Read live flow node count from localStorage ────────────────────────────
const getStoredFlow = (agentId: number): { nodes: number } | null => {
  try {
    const raw = localStorage.getItem(`pipcat-flow-agent-${agentId}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.nodes) && parsed.nodes.length > 0) {
      return { nodes: parsed.nodes.length }
    }
  } catch {}
  return null
}

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
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  // Merge static agent data with live flow counts from localStorage
  const agents      = AGENTS.map((a) => ({ ...a, flow: getStoredFlow(a.id) ?? a.flow }))
  const totalPages  = Math.ceil(agents.length / ITEMS_PER_PAGE)
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated   = agents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const startItem   = startIndex + 1
  const endItem     = Math.min(startIndex + ITEMS_PER_PAGE, agents.length)
  const noFlowCount = agents.filter((a) => a.flow === null).length

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar */}
        <div className="flex items-center justify-between px-8 pt-5 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">My agents</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage and configure your voice agents.
            </p>
          </div>
          <button
            onClick={() => navigate('/agents/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
            style={{ backgroundColor: '#6366f1' }}
          >
            <MdAdd className="text-lg" />
            Create agent
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b border-slate-200">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.label}
                      className={`${col.width} py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider first:pl-6 last:pr-6 px-4`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((agent) => (
                  <AgentTableRow key={agent.id} {...agent} />
                ))}
              </tbody>
            </table>

            {noFlowCount > 0 && (
              <div className="flex items-center gap-3 mx-6 mt-2 mb-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <MdOutlineWarningAmber className="text-amber-500 text-lg shrink-0" />
                <p className="text-sm text-slate-600">
                  {noFlowCount} agent{noFlowCount > 1 ? 's have' : ' has'} no conversation flow
                  and cannot handle calls.{' '}
                  <a href="#" className="font-semibold text-amber-600 underline underline-offset-2 hover:text-amber-700">
                    Add a flow →
                  </a>
                </p>
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600">{startItem}–{endItem}</span> of{' '}
                <span className="font-semibold text-slate-600">{AGENTS.length}</span> agents
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <MdChevronLeft className="text-lg" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      page === currentPage ? 'text-white' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    style={page === currentPage ? { backgroundColor: '#6366f1' } : {}}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
