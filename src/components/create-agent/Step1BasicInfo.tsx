import type { AgentDraft } from '../../pages/CreateAgentPage'

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

interface Props {
  draft: AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
}

const Step1BasicInfo = ({ draft, onChange }: Props) => (
  <div className="max-w-xl">
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
      <h2 className="text-base font-bold text-slate-900">What will this agent do?</h2>
      <p className="text-sm text-slate-500 mt-1 mb-6">
        Give your agent a clear name and purpose so your team knows what it handles.
      </p>

      {/* Agent name */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Agent name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          maxLength={60}
          placeholder="Enter a name for this agent"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
        />
        <p className="text-xs text-slate-400 mt-1.5">e.g. 'Customer support', 'Appointment booking'</p>
      </div>

      {/* Purpose */}
      <div className="mb-5">
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          value={draft.purpose}
          onChange={(e) => onChange({ purpose: e.target.value })}
          maxLength={500}
          rows={4}
          placeholder="This agent handles calls from customers who have questions about their account, billing, or recent orders..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition resize-none"
        />
        <p className="text-xs text-slate-400 mt-1.5">Describe in plain language what calls this agent should handle.</p>
      </div>

      {/* Language */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Language</label>
        <select
          value={draft.language}
          onChange={(e) => onChange({ language: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition bg-white appearance-none cursor-pointer"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>
    </div>
  </div>
)

export default Step1BasicInfo
