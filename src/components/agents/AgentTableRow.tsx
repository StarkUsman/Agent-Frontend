import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbGitFork } from 'react-icons/tb'
import { MdOpenInNew, MdContentCopy, MdCheck } from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
export interface AgentRowData {
  id: string
  name: string
  description: string
  voice: { initial: string; name: string; color: string }
  calls: number
  avgTtfb: string | null       // null = no data yet ("—")
  interruptions: string | null // null = no data yet ("—")
  clientUrl: string
  status: 'Active' | 'Inactive'
}

interface AgentRowProps extends AgentRowData {
  onToggleStatus: (id: string, status: AgentRowData['status']) => Promise<void> | void
}

// ── Sub-components ─────────────────────────────────────────────────────────
const VoiceCell = ({ initial, name, color }: AgentRowData['voice']) => (
  <div className="flex items-center gap-2">
    <span
      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
      style={{ backgroundColor: color }}
    >
      {initial}
    </span>
    <span className="text-sm text-slate-600 dark:text-slate-400">{name}</span>
  </div>
)

const UrlCell = ({ url }: { url: string }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex items-center gap-1.5 max-w-[200px]">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        title={url}
        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline truncate"
      >
        <MdOpenInNew className="text-sm shrink-0" />
        <span className="truncate">{url.replace(/^https?:\/\//, '')}</span>
      </a>
      <button
        onClick={copy}
        title="Copy URL"
        className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
      >
        {copied ? <MdCheck className="text-sm text-emerald-500" /> : <MdContentCopy className="text-sm" />}
      </button>
    </div>
  )
}

const FlowCell = ({ id }: { id: string }) => {
  const navigate = useNavigate()
  return (
    <span
      onClick={() => navigate(`/agents/${id}/flow`)}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-medium whitespace-nowrap cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
    >
      <TbGitFork className="text-sm" />
      Edit flow
    </span>
  )
}

const StatusToggle = ({
  id,
  status,
  onToggle,
}: {
  id: string
  status: AgentRowData['status']
  onToggle: AgentRowProps['onToggleStatus']
}) => {
  const [pending, setPending] = useState(false)
  const isActive = status === 'Active'

  const handleClick = async () => {
    if (pending) return
    setPending(true)
    try {
      await onToggle(id, status)
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title={isActive ? 'Click to deactivate' : 'Click to activate'}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait ${
        isActive
          ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
          : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
      }`}
    >
      {pending ? '…' : status}
    </button>
  )
}

// ── Row component ──────────────────────────────────────────────────────────
const AgentTableRow = ({
  id,
  name,
  description,
  voice,
  calls,
  avgTtfb,
  interruptions,
  clientUrl,
  status,
  onToggleStatus,
}: AgentRowProps) => {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors group">

      {/* Agent name + description */}
      <td className="py-4 pl-6 pr-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </td>

      {/* Voice */}
      <td className="py-4 px-4">
        <VoiceCell {...voice} />
      </td>

      {/* URL */}
      <td className="py-4 px-4">
        <UrlCell url={clientUrl} />
      </td>

      {/* Calls */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {calls.toLocaleString()}
        </span>
      </td>

      {/* Avg TTFB */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {avgTtfb ?? '—'}
        </span>
      </td>

      {/* Interruptions */}
      <td className="py-4 px-4">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {interruptions ?? '—'}
        </span>
      </td>

      {/* Conversation flow */}
      <td className="py-4 px-4">
        <FlowCell id={id} />
      </td>

      {/* Status */}
      <td className="py-4 pl-4 pr-6">
        <StatusToggle id={id} status={status} onToggle={onToggleStatus} />
      </td>

    </tr>
  )
}

export default AgentTableRow
