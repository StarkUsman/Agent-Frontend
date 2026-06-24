import type { AgentDraft } from '../../pages/CreateAgentPage'
import type { ProviderCatalog } from '../../api/manager'
import { findProvider } from './catalog'
import StepNav, { type StepNavProps } from './StepNav'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm ' +
  'text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

const LANGUAGES = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es',    label: 'Spanish' },
  { value: 'fr',    label: 'French' },
  { value: 'de',    label: 'German' },
  { value: 'it',    label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (BR)' },
  { value: 'nl',    label: 'Dutch' },
  { value: 'pl',    label: 'Polish' },
  { value: 'ja',    label: 'Japanese' },
  { value: 'ko',    label: 'Korean' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
]

const AGENT_TYPES: { value: AgentDraft['agentType']; title: string; desc: string }[] = [
  { value: 'pipeline', title: 'STT → LLM → TTS', desc: 'Classic pipeline: pick a speech-to-text, language model and text-to-speech provider separately.' },
  { value: 's2s',      title: 'Speech to Speech', desc: 'Realtime model that listens and speaks directly (OpenAI Realtime, Gemini Live, and more).' },
]

interface Props extends StepNavProps {
  draft: AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
  catalog: ProviderCatalog
  /** Edit flow: the agent name can't be changed after creation. */
  nameDisabled?: boolean
  /** Edit flow: the agent type can't be switched after creation. */
  typeDisabled?: boolean
}

const Step1BasicInfo = ({ draft, onChange, catalog, nameDisabled, typeDisabled, ...navProps }: Props) => {
  // Switching agent type re-points the shared voice fields at the new modality's
  // default provider/voice so the live preview and later steps stay consistent.
  const selectType = (type: AgentDraft['agentType']) => {
    if (type === draft.agentType) return
    if (type === 's2s') {
      const p = findProvider(catalog, 's2s', draft.s2sProvider) ?? catalog.s2s[0]
      const v = p?.voices?.[0]
      onChange({
        agentType: 's2s',
        s2sProvider: p?.id ?? draft.s2sProvider,
        s2sModel: p?.models?.[0] ?? '',
        voiceId: v?.id ?? '',
        voiceName: v?.name ?? '',
        voiceProvider: p?.label ?? '',
        voiceGender: (v?.gender as AgentDraft['voiceGender']) ?? 'neutral',
        age: '',
      })
    } else {
      const p = findProvider(catalog, 'tts', draft.ttsProvider) ?? catalog.tts[0]
      const v = p?.voices?.[0]
      onChange({
        agentType: 'pipeline',
        voiceId: v?.id ?? '',
        voiceName: v?.name ?? '',
        voiceProvider: p?.label ?? '',
        voiceGender: (v?.gender as AgentDraft['voiceGender']) ?? 'neutral',
        age: '',
      })
    }
  }

  return (
    <div className="max-w-xxl">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-8">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">What will this agent do?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Give your agent a clear name so your team knows what it handles.
        </p>

        {/* Agent name */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Agent name {!nameDisabled && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            maxLength={60}
            disabled={nameDisabled}
            placeholder="Enter a name for this agent"
            className={`${inputClass} ${nameDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            {nameDisabled
              ? "The agent name can't be changed after creation."
              : "e.g. 'Customer support', 'Appointment booking'"}
          </p>
        </div>

        {/* Agent type */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Agent type {!typeDisabled && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {AGENT_TYPES.map((t) => {
              const selected = draft.agentType === t.value
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => !typeDisabled && selectType(t.value)}
                  disabled={typeDisabled && !selected}
                  className={`text-left rounded-xl border-2 p-4 transition-all ${
                    selected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  } ${typeDisabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.title}</span>
                    {selected && (
                      <span className="text-[10px] font-semibold text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{t.desc}</p>
                </button>
              )
            })}
          </div>
          {typeDisabled && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
              The agent type can't be changed after creation.
            </p>
          )}
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Language</label>
          <select
            value={draft.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className={`${inputClass} appearance-none cursor-pointer`}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>
      <StepNav {...navProps} />
    </div>
  )
}

export default Step1BasicInfo
