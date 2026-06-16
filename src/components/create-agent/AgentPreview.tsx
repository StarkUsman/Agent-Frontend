import { MdLock, MdCheck } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'

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

type SectionState = 'upcoming' | 'current' | 'past'

const getState = (sectionStep: number, currentStep: number): SectionState =>
  currentStep < sectionStep ? 'upcoming'
  : currentStep === sectionStep ? 'current'
  : 'past'

// ── Key status row ─────────────────────────────────────────────────────────
const KeyRow = ({ label, set }: { label: string; set: boolean }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
      set ? 'bg-green-100 dark:bg-green-900/40' : 'bg-slate-100 dark:bg-slate-700'
    }`}>
      {set
        ? <MdCheck className="text-green-500 dark:text-green-400" style={{ fontSize: 9 }} />
        : <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-500 block" />
      }
    </div>
    <span className={`text-xs ${set ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
      {label}
    </span>
  </div>
)

// ── Section wrapper ────────────────────────────────────────────────────────
interface SectionProps {
  title: string
  state: SectionState
  children: React.ReactNode
}

const Section = ({ title, state, children }: SectionProps) => (
  <div className={`rounded-xl border p-4 transition-all duration-300 ${
    state === 'current'
      ? 'border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/20'
      : state === 'past'
        ? 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800'
        : 'border-slate-100 dark:border-slate-700 bg-white/60 dark:bg-slate-800/50 opacity-40 pointer-events-none'
  }`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </p>
      {state === 'current' && (
        <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
          Filling now
        </span>
      )}
      {state === 'upcoming' && (
        <MdLock className="text-slate-300 dark:text-slate-600 text-sm" />
      )}
    </div>
    {children}
  </div>
)

// ── Main component ─────────────────────────────────────────────────────────
interface Props {
  draft:       AgentDraft
  currentStep: number
  totalSteps:  number
}

const AgentPreview = ({ draft, currentStep, totalSteps }: Props) => {
  const initial       = draft.name.trim().charAt(0).toUpperCase()
  const identityState = getState(1, currentStep)
  const voiceState    = getState(2, currentStep)
  const aiState       = getState(3, currentStep)

  return (
    <div className="h-full flex flex-col">

      {/* Panel header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Live preview
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">

        {/* ── Step 1: Basic info ──────────────────── */}
        <Section title="Basic info" state={identityState}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
              initial ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-slate-100 dark:bg-slate-700'
            }`}>
              {initial
                ? <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{initial}</span>
                : <span className="text-base text-slate-300 dark:text-slate-500">?</span>
              }
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold truncate ${
                draft.name ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300 dark:text-slate-600'
              }`}>
                {draft.name || 'Agent name'}
              </p>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                {LANGUAGE_LABELS[draft.language] ?? draft.language}
              </span>
            </div>
          </div>
          <p className={`text-xs leading-relaxed line-clamp-3 ${
            draft.purpose ? 'text-slate-500 dark:text-slate-400' : 'text-slate-300 dark:text-slate-600 italic'
          }`}>
            {draft.purpose || 'No purpose set yet…'}
          </p>
        </Section>

        {/* ── Step 2: Voice ───────────────────────── */}
        <Section title="Voice" state={voiceState}>
          {draft.voiceId ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {draft.voiceName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{draft.voiceName}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {draft.voiceProvider} · {cap(draft.voiceGender)}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300 dark:text-slate-600 italic">No voice selected yet…</p>
          )}
        </Section>

        {/* ── Step 3: AI settings ─────────────────── */}
        <Section title="AI Settings" state={aiState}>
          <div className="space-y-2.5">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                {draft.openaiModel}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">via Groq · OpenAI-compatible</p>
            </div>
            <div className="space-y-1.5 pt-0.5">
              <KeyRow label="Groq API key"    set={!!draft.openaiApiKey.trim()} />
              <KeyRow label="Deepgram API key" set={!!draft.deepgramApiKey.trim()} />
            </div>
          </div>
        </Section>

        {/* ── Progress bar ────────────────────────── */}
        <div className="pt-1">
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
              <div
                key={n}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  n < currentStep  ? 'bg-indigo-500'
                  : n === currentStep ? 'bg-indigo-300 dark:bg-indigo-600'
                  : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-right">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

      </div>
    </div>
  )
}

export default AgentPreview
