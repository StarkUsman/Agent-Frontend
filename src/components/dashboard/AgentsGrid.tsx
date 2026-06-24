import { useNavigate } from 'react-router-dom'
import { useAgents } from '../../contexts/AgentsContext'
import AgentCard, { AgentCardSkeleton, type AgentCardProps } from './AgentCard'
import type { ManagerAgent } from '../../api/manager'

// ── Mapping ────────────────────────────────────────────────────────────────

const toCard = (a: ManagerAgent): AgentCardProps => ({
  id:          a.id,
  name:        a.name,
  status:      a.status === 'running' ? 'Active' : 'Inactive',
  description: a.config?.S2S_PROVIDER ?? a.config?.OPENAI_MODEL ?? `Port ${a.port}`,
  callsToday:  0,
  avgTtfb:     '—',
  nodes:       0,
})

// ── Component ──────────────────────────────────────────────────────────────

const AgentsGrid = () => {
  const navigate = useNavigate()
  const { agents, loading } = useAgents()

  // Split by kind: 'pipeline' = normal agents, 's2s' = STS agents
  const pipeline = agents.filter((a) => a.kind !== 's2s')
  const sts      = agents.filter((a) => a.kind === 's2s')

  // Show 2 pipeline + 2 STS; if one category is empty, fill all 4 from the other
  let displayed: ManagerAgent[]
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
          : displayed.map((a) => <AgentCard key={a.id} {...toCard(a)} />)
        }
      </div>

    </section>
  )
}

export default AgentsGrid
