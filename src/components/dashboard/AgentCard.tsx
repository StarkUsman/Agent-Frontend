import { TbGitFork } from 'react-icons/tb'

// ── Types ──────────────────────────────────────────────────────────────────
export interface AgentCardProps {
  id: string | number
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

// ── Skeleton card ─────────────────────────────────────────────────────────

export const AgentCardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
    <div className="flex items-start justify-between gap-3 mb-1.5">
      <div className="h-4 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
    </div>
    <div className="space-y-1.5 mb-3">
      <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" />
    </div>
    <div className="flex items-end justify-between">
      <div className="flex gap-6">
        <div className="space-y-1">
          <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" />
          <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" />
          <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      </div>
      <div className="h-3.5 w-16 rounded bg-slate-100 dark:bg-slate-700/70 animate-pulse" />
    </div>
  </div>
)

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
