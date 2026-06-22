import { useEffect } from 'react'
import { MdClose, MdEdit, MdOutlineDeleteOutline } from 'react-icons/md'
import { formatDateTime } from '../calls/CallTableRow'
import type { ManagerAgent } from '../../api/manager'

interface Props {
  agent:    ManagerAgent
  onClose:  () => void
  onEdit:   () => void
  onDelete: () => void
}

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium break-all">{value ?? '—'}</div>
  </div>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
  </div>
)

const StatusBadge = ({ status }: { status: string }) => {
  const isRunning = status === 'running'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      isRunning
        ? 'border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
        : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800'
    }`}>
      {isRunning ? 'Active' : 'Inactive'}
    </span>
  )
}

const AgentDetailModal = ({ agent, onClose, onEdit, onDelete }: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{agent.id}</span>
              <StatusBadge status={agent.status} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{agent.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6">

          <Section title="Overview">
            <Field label="Name"           value={agent.name} />
            <Field label="ID"             value={agent.id} />
            <Field label="Port"           value={agent.port} />
            <Field label="Flow API port"  value={agent.flow_api_port} />
          </Section>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <Section title="Configuration">
            <Field label="Model"        value={agent.config?.OPENAI_MODEL} />
            <Field label="TTS provider" value={agent.config?.TTS_PROVIDER} />
            <Field label="Base URL"     value={agent.config?.OPENAI_BASE_URL} />
          </Section>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <Section title="Timestamps">
            <Field label="Created at" value={formatDateTime(agent.created_at)} />
            <Field label="Updated at" value={formatDateTime(agent.updated_at)} />
          </Section>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 shrink-0">
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <MdOutlineDeleteOutline className="text-base" />
            Delete
          </button>
          <button
            onClick={onEdit}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer hover:opacity-90"
            style={{ backgroundColor: '#6366f1' }}
          >
            <MdEdit className="text-base" />
            Edit agent
          </button>
        </div>
      </div>
    </div>
  )
}

export default AgentDetailModal
