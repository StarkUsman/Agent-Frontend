import { useState } from 'react'
import { MdContentCopy, MdCheck } from 'react-icons/md'

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
  const d = new Date(iso)
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${date}, ${time}`
}

// ── Result cell ────────────────────────────────────────────────────────────
const CHIP_STYLES: Record<string, { chip: string; label: string }> = {
  completed:  { chip: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', label: 'Completed' },
  escalated:  { chip: 'border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-900/30  text-amber-600  dark:text-amber-400',       label: 'Escalated'  },
  failed:     { chip: 'border-red-200    dark:border-red-800    bg-red-50    dark:bg-red-900/30    text-red-600    dark:text-red-400',          label: 'Failed'     },
  oncall:     { chip: 'border-blue-200   dark:border-blue-800   bg-blue-50   dark:bg-blue-900/30   text-blue-600   dark:text-blue-400',         label: 'On a call'  },
}

const normalise = (r: string) =>
  r.toLowerCase().replace(/[^a-z]/g, '')

const ResultCell = ({ result }: { result: string }) => {
  const key    = normalise(result)
  const styles = CHIP_STYLES[key] ?? CHIP_STYLES['failed']

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles.chip}`}>
      {styles.label}
    </span>
  )
}

// ── ID cell with copy-on-click ─────────────────────────────────────────────
const IdCell = ({ id }: { id: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Click to copy: ${id}`}
      className="group flex items-center gap-1.5 cursor-pointer"
    >
      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
        {id.slice(0, 8)}…
      </span>
      {copied
        ? <MdCheck className="text-emerald-500 text-sm shrink-0" />
        : <MdContentCopy className="text-slate-300 dark:text-slate-600 text-sm shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      }
    </button>
  )
}

// ── Row ────────────────────────────────────────────────────────────────────
const CallTableRow = ({ id, agent, result, duration, time }: CallRecord) => (
  <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">

    <td className="py-4 pl-6 pr-4">
      <IdCell id={id} />
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
