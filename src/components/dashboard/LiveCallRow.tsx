import { MdPhone } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
export interface LiveCallRowProps {
  id: number
  agent: string
  detail: string
  elapsed: string
  turns: number
}

// ── Component ──────────────────────────────────────────────────────────────
const LiveCallRow = ({ agent, detail, elapsed, turns }: LiveCallRowProps) => {
  return (
    <div className="flex items-center gap-4 py-4 px-5">

      {/* Phone icon */}
      <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
        <MdPhone className="text-emerald-500 text-base" />
      </div>

      {/* Agent name + call detail */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{agent}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{detail}</p>
      </div>

      {/* Elapsed + turns */}
      <div className="flex items-center gap-6 shrink-0">
        <div className="text-right">
          <p className="text-sm font-semibold text-emerald-500">{elapsed}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">elapsed</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-700">{turns}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">turns</p>
        </div>
      </div>

    </div>
  )
}

export default LiveCallRow
