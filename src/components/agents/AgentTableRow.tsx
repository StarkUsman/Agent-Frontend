import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TbGitFork } from 'react-icons/tb'
import { MdOpenInNew, MdContentCopy, MdCheck } from 'react-icons/md'
import type { AgentKind } from '../../api/manager'

// ── Types ──────────────────────────────────────────────────────────────────
export interface AgentRowData {
  id: string
  name: string
  description: string
  kind: AgentKind
  calls: number
  avgTtfb: string | null
  interruptions: string | null
  clientUrl: string
  status: 'Active' | 'Inactive'
}

interface AgentRowProps extends AgentRowData {
  onToggleStatus: (id: string, status: AgentRowData['status'], kind: AgentKind) => Promise<void> | void
  onClick?:       () => void
}

// ── Sub-components ─────────────────────────────────────────────────────────
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
  kind,
  onToggle,
}: {
  id: string
  status: AgentRowData['status']
  kind: AgentKind
  onToggle: AgentRowProps['onToggleStatus']
}) => {
  const [pending, setPending] = useState(false)
  const isActive = status === 'Active'

  const handleClick = async () => {
    if (pending) return
    setPending(true)
    try {
      await onToggle(id, status, kind)
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

// ── Skeleton row ──────────────────────────────────────────────────────────

export const AgentTableRowSkeleton = () => (
  <tr className="border-b border-slate-100 dark:border-slate-700">
    <td className="py-4 pl-6 pr-4">
      <div className="h-3.5 w-32 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="h-3 w-20 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse mt-1.5" />
    </td>
    <td className="py-4 px-4">
      <div className="h-3 w-36 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
    <td className="py-4 px-4">
      <div className="h-3 w-8 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
    <td className="py-4 px-4">
      <div className="h-3 w-12 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
    <td className="py-4 px-4">
      <div className="h-3 w-10 rounded-md bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
    <td className="py-4 px-4">
      <div className="h-6 w-20 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
    <td className="py-4 pl-4 pr-6">
      <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
    </td>
  </tr>
)

// ── Row component ──────────────────────────────────────────────────────────
const AgentTableRow = ({
  id,
  name,
  description,
  kind,
  calls,
  avgTtfb,
  interruptions,
  clientUrl,
  status,
  onToggleStatus,
  onClick,
}: AgentRowProps) => {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Agent name + description */}
      <td className="py-4 pl-6 pr-4">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {name}
          </p>
          {kind === 's2s' && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              S2S
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{description}</p>
      </td>

      {/* URL — stop propagation so copying doesn't open the detail modal */}
      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
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

      {/* Conversation flow — stop propagation so navigation doesn't also open modal */}
      <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
        <FlowCell id={id} />
      </td>

      {/* Status — stop propagation so toggle doesn't also open modal */}
      <td className="py-4 pl-4 pr-6" onClick={(e) => e.stopPropagation()}>
        <StatusToggle id={id} status={status} kind={kind} onToggle={onToggleStatus} />
      </td>

    </tr>
  )
}

export default AgentTableRow
