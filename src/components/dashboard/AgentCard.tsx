import { TbGitFork } from 'react-icons/tb'

// ── Types ──────────────────────────────────────────────────────────────────
export interface AgentCardProps {
  id: number
  name: string
  status: 'Active' | 'Inactive'
  description: string
  callsToday: number
  avgTtfb: string
  nodes: number
}

// ── Sub-component: Status badge ────────────────────────────────────────────
const StatusBadge = ({ status }: { status: AgentCardProps['status'] }) => {
  const isActive = status === 'Active'
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
        isActive
          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
      }`}
    >
      {status}
    </span>
  )
}

// ── Component ──────────────────────────────────────────────────────────────
const AgentCard = ({
  name,
  status,
  description,
  callsToday,
  avgTtfb,
  nodes,
}: AgentCardProps) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600 transition-all cursor-pointer group">

      {/* Top row: name + status badge */}
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>
        <StatusBadge status={status} />
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed mb-3">
        {description}
      </p>

      {/* Bottom row: stats + nodes */}
      <div className="flex items-end justify-between">

        {/* Calls today + Avg TTFB */}
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
              Calls today
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {callsToday.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">
              Avg TTFB
            </p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{avgTtfb}</p>
          </div>
        </div>

        {/* Nodes indicator */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          <TbGitFork className="text-sm" />
          <span className="text-xs font-medium">{nodes} nodes</span>
        </div>

      </div>
    </div>
  )
}

export default AgentCard
