import type { AgentDraft } from '../../pages/CreateAgentPage'
import StepNav, { type StepNavProps } from './StepNav'

const LANGUAGE_LABELS: Record<string, string> = {
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  'es':    'Spanish',
  'fr':    'French',
  'de':    'German',
  'it':    'Italian',
  'pt-BR': 'Portuguese (BR)',
  'nl':    'Dutch',
  'pl':    'Polish',
  'ja':    'Japanese',
  'ko':    'Korean',
  'zh-CN': 'Chinese (Simplified)',
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) + '…' : s

// ── Single label / value row ───────────────────────────────────────────────
const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-6 py-3.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
    <span className="text-sm text-slate-400 dark:text-slate-500 shrink-0 w-36">{label}</span>
    <span className="text-sm text-slate-800 dark:text-slate-200 font-medium text-right">{value}</span>
  </div>
)

// ── Step component ─────────────────────────────────────────────────────────
interface Props extends StepNavProps {
  draft:  AgentDraft
  onEdit: () => void
}

const Step5Review = ({ draft, onEdit, ...navProps }: Props) => {
  const voiceValue = [
    draft.voiceName,
    draft.voiceProvider,
    draft.age,
    draft.voiceGender ? cap(draft.voiceGender) : '',
  ].filter(Boolean).join(' — ')

  const topicsLines = draft.topicsHandled.split('\n').filter((l) => l.trim())
  const topicsValue =
    topicsLines.slice(0, 2).join(', ') +
    (topicsLines.length > 2 ? `, +${topicsLines.length - 2} more` : '')

  return (
    <div className="max-w-xxl">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Agent configuration</h3>
          <button
            onClick={onEdit}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>

        {/* Rows */}
        <div className="px-6">
          <Row label="Name"             value={draft.name || '—'} />
          <Row label="Voice"            value={voiceValue || '—'} />
          <Row label="Language"         value={LANGUAGE_LABELS[draft.language] ?? draft.language} />
          <Row label="Voice recognition" value={`${draft.voiceProvider} (nova-3)`} />
          <Row label="AI pipeline"      value="Speech-to-speech — Voice-native AI" />
          <Row label="Model"            value={draft.openaiModel} />
          <Row label="Base URL"         value={draft.openaiBaseUrl} />
          {/* <Row label="Opening greeting" value={truncate(draft.openingGreeting, 70) || '—'} />
          <Row label="Topics handled"   value={topicsValue || '—'} /> */}
          {draft.topicsToAvoid.trim() && (
            <Row
              label="Topics to avoid"
              value={truncate(draft.topicsToAvoid.split('\n')[0], 60)}
            />
          )}
        </div>

      </div>
      <StepNav {...navProps} />
    </div>
  )
}

export default Step5Review
