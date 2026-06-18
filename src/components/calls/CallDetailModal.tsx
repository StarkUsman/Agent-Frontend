import { useEffect } from 'react'
import { MdClose } from 'react-icons/md'
import type { ApiCallRecord } from '../../api/calls'
import { StatusChip, formatDuration, formatDateTime } from './CallTableRow'

interface Props {
  call:    ApiCallRecord
  onClose: () => void
}

// ── Label + value row ──────────────────────────────────────────────────────
const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
    <div className="text-sm text-slate-800 dark:text-slate-200 font-medium break-all">{value ?? '—'}</div>
  </div>
)

// ── Section wrapper ────────────────────────────────────────────────────────
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {children}
    </div>
  </div>
)

// ── Modal ──────────────────────────────────────────────────────────────────
const CallDetailModal = ({ call, onClose }: Props) => {
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
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">{call.call_id}</span>
              <StatusChip status={call.status} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{call.agent_name}</h2>
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
            <Field label="Call ID"    value={call.call_id} />
            <Field label="Session ID" value={call.session_id} />
            <Field label="Agent"      value={call.agent_name} />
            <Field label="Agent ID"   value={call.agent_id} />
            <Field label="Last node"  value={call.last_node} />
            <Field label="Turns"      value={call.turns} />
            {call.error && (
              <div className="col-span-2">
                <Field
                  label="Error"
                  value={
                    <span className="text-red-500 dark:text-red-400">{call.error}</span>
                  }
                />
              </div>
            )}
          </Section>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <Section title="Timing">
            <Field label="Started at" value={formatDateTime(call.started_at)} />
            <Field label="Ended at"   value={formatDateTime(call.ended_at)} />
            <Field label="Duration"   value={formatDuration(call.duration_seconds)} />
            <Field label="Created at" value={formatDateTime(call.created_at)} />
          </Section>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <Section title="Token usage">
            <Field label="Prompt tokens"     value={call.prompt_tokens} />
            <Field label="Completion tokens" value={call.completion_tokens} />
            <Field label="Total tokens"      value={call.total_tokens} />
            <Field label="TTS characters"    value={call.tts_characters} />
          </Section>

          <div className="border-t border-slate-100 dark:border-slate-700" />

          <Section title="Performance">
            <Field label="Avg LLM TTFB" value={`${call.avg_llm_ttfb_ms} ms`} />
            <Field label="Avg TTS TTFB" value={`${call.avg_tts_ttfb_ms} ms`} />
          </Section>

        </div>
      </div>
    </div>
  )
}

export default CallDetailModal
