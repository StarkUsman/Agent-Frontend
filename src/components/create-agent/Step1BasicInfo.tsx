import type { AgentDraft } from '../../pages/CreateAgentPage'
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

interface Props extends StepNavProps {
  draft: AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
  /** Edit flow: the agent name can't be changed after creation. */
  nameDisabled?: boolean
}

const Step1BasicInfo = ({ draft, onChange, nameDisabled, ...navProps }: Props) => (
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

export default Step1BasicInfo
