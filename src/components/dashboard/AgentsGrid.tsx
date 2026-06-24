import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAgentsLiveStatus, type LiveAgent } from '../../api/dashboard'
import AgentCard, { AgentCardSkeleton, type AgentCardProps } from './AgentCard'

// ── Mapping ────────────────────────────────────────────────────────────────

const toCard = (a: LiveAgent): AgentCardProps => ({
  id:          a.port,
  name:        a.name,
  status:      a.status === 'running' ? 'Active' : 'Inactive',
  description: a.kind === 's2s' ? 'Speech-to-speech agent' : 'Pipeline agent',
  callsToday:  a.calls_today,
  avgTtfb:     a.avg_ttfb_ms > 0 ? `${Math.round(a.avg_ttfb_ms)}ms` : '—',
  nodes:       0,
})

// ── Component ──────────────────────────────────────────────────────────────

const AgentsGrid = () => {
  const navigate = useNavigate()

  const [agents,  setAgents]  = useState<LiveAgent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgentsLiveStatus()
      .then((res) => setAgents(res.agents))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false))
  }, [])

  // 2 pipeline + 2 s2s; if one category is empty fill all 4 from the other
  const pipeline = agents.filter((a) => a.kind !== 's2s')
  const sts      = agents.filter((a) => a.kind === 's2s')

  let displayed: LiveAgent[]
  if (pipeline.length === 0) {
    displayed = sts.slice(0, 4)
  } else if (sts.length === 0) {
    displayed = pipeline.slice(0, 4)
  } else {
    displayed = [...pipeline.slice(0, 2), ...sts.slice(0, 2)]
  }

  return (
    <section>

      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Your agents</h2>
        <button
          onClick={() => navigate('/agents')}
          className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
        >
          View all →
        </button>
      </div>

      {/* 2-column responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <AgentCardSkeleton key={i} />)
          : displayed.map((a) => <AgentCard key={a.port} {...toCard(a)} />)
        }
      </div>

    </section>
  )
}

export default AgentsGrid
