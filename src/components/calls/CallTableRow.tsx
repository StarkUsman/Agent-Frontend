export interface CallRecord {
  id:       string
  agent:    string
  result:   string // lowercase from API: 'completed' | 'failed' | 'escalated' | 'on_a_call'
  duration: number // seconds
  time:     string // ISO 8601
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ── Result cell ────────────────────────────────────────────────────────────
const RESULT_STYLES: Record<string, string> = {
  completed:  'text-emerald-600 dark:text-emerald-400',
  escalated:  'text-amber-500',
  failed:     'text-red-500',
}

const ResultCell = ({ result }: { result: string }) => {
  const key = result.toLowerCase()

  if (key === 'on_a_call' || key === 'on a call') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
        On a call
      </span>
    )
  }

  const colour = RESULT_STYLES[key] ?? 'text-slate-500'
  const label  = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase()

  return (
    <span className={`text-sm font-semibold ${colour}`}>{label}</span>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────
const CallTableRow = ({ id, agent, result, duration, time }: CallRecord) => (
  <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">

    <td className="py-4 pl-6 pr-4">
      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500 truncate max-w-30 block" title={id}>
        {id.slice(0, 8)}…
      </span>
    </td>

    <td className="py-4 px-4">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{agent}</p>
    </td>

    <td className="py-4 px-4">
      <ResultCell result={result} />
    </td>

    <td className="py-4 px-4">
      <span className="text-sm text-slate-600 dark:text-slate-400">{formatDuration(duration)}</span>
    </td>

    <td className="py-4 pl-4 pr-6">
      <span className="text-sm text-slate-400 dark:text-slate-500">{formatTime(time)}</span>
    </td>

  </tr>
)

export default CallTableRow
