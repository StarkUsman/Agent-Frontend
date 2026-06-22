import { useState } from 'react'
import { MdInfoOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'
import type { ProviderCatalog } from '../../api/manager'
import { findProvider } from './catalog'
import SearchableSelect from './SearchableSelect'
import StepNav, { type StepNavProps } from './StepNav'

interface Props extends StepNavProps {
  draft:      AgentDraft
  onChange:   (patch: Partial<AgentDraft>) => void
  catalog:    ProviderCatalog
  neededEnvs: string[]
  editMode?:  boolean
}

// Common STT languages (free-text still allowed for anything not listed).
const STT_LANGUAGES = [
  { value: '',      label: 'Auto / provider default' },
  { value: 'en',    label: 'English (en)' },
  { value: 'en-US', label: 'English — US (en-US)' },
  { value: 'en-GB', label: 'English — UK (en-GB)' },
  { value: 'hi',    label: 'Hindi (hi)' },
  { value: 'ur',    label: 'Urdu (ur)' },
  { value: 'es',    label: 'Spanish (es)' },
  { value: 'fr',    label: 'French (fr)' },
  { value: 'de',    label: 'German (de)' },
  { value: 'ar',    label: 'Arabic (ar)' },
]

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm ' +
  'text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

const label = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5'

const Step3AISettings = ({ draft, onChange, catalog, neededEnvs, editMode, ...navProps }: Props) => {
  const [shown, setShown] = useState<Record<string, boolean>>({})

  const llm = findProvider(catalog, 'llm', draft.llmProvider)
  const stt = findProvider(catalog, 'stt', draft.sttProvider)

  const toOpts = (vals: string[] = []) => vals.map((v) => ({ value: v, label: v }))

  const selectLlmProvider = (id: string) => {
    const p = findProvider(catalog, 'llm', id)
    onChange({
      llmProvider: id,
      llmModel: p?.models?.[0] ?? '',
      llmBaseUrl: p?.baseUrl ?? '',
    })
  }

  const selectSttProvider = (id: string) => {
    const p = findProvider(catalog, 'stt', id)
    onChange({ sttProvider: id, sttModel: p?.models?.[0] ?? '' })
  }

  const setKey = (env: string, value: string) =>
    onChange({ apiKeys: { ...draft.apiKeys, [env]: value } })

  // Which provider(s) need each env var — shown as a hint on the key field.
  const keyHint = (env: string): string => {
    const labels: string[] = []
    if (llm?.apiKeyEnv === env) labels.push(llm.label)
    if (stt?.apiKeyEnv === env) labels.push(stt.label)
    const tts = findProvider(catalog, 'tts', draft.ttsProvider)
    if (tts?.apiKeyEnv === env) labels.push(tts.label)
    return [...new Set(labels)].join(', ')
  }

  return (
    <div className="max-w-xxl space-y-5">

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl">
        <MdInfoOutline className="text-indigo-500 dark:text-indigo-400 text-base shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Choose the language model and speech-to-text provider that power your agent. Only the API keys
          required by your selected providers (including the TTS provider from the previous step) are
          requested below — they're stored securely and never shown after saving.
        </p>
      </div>

      {/* ── LLM ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Language model (LLM)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            The brain of your agent — decides what to say.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Provider</label>
            <SearchableSelect
              value={draft.llmProvider}
              onChange={selectLlmProvider}
              options={catalog.llm.map((p) => ({ value: p.id, label: p.label }))}
              placeholder="Select an LLM provider…"
            />
          </div>
          <div>
            <label className={label}>Model</label>
            <SearchableSelect
              value={draft.llmModel}
              onChange={(v) => onChange({ llmModel: v })}
              options={toOpts(llm?.models)}
              placeholder="Model id…"
              allowCustom
            />
          </div>
        </div>

        <div>
          <label className={label}>Base URL <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
          <input
            type="text"
            value={draft.llmBaseUrl}
            onChange={(e) => onChange({ llmBaseUrl: e.target.value })}
            placeholder={llm?.baseUrl ?? 'Provider default'}
            className={inputClass}
          />
        </div>
      </div>

      {/* ── STT ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Speech recognition (STT)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Transcribes what the caller says.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Provider</label>
            <SearchableSelect
              value={draft.sttProvider}
              onChange={selectSttProvider}
              options={catalog.stt.map((p) => ({ value: p.id, label: p.label }))}
              placeholder="Select an STT provider…"
            />
          </div>
          <div>
            <label className={label}>Model <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
            <SearchableSelect
              value={draft.sttModel}
              onChange={(v) => onChange({ sttModel: v })}
              options={toOpts(stt?.models)}
              placeholder="Provider default"
              allowCustom
            />
          </div>
        </div>

        <div className="max-w-xs">
          <label className={label}>Language <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
          <SearchableSelect
            value={draft.sttLanguage}
            onChange={(v) => onChange({ sttLanguage: v })}
            options={STT_LANGUAGES}
            placeholder="Auto / provider default"
            allowCustom
          />
        </div>
      </div>

      {/* ── API keys (only the ones the selected providers need) ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">API keys</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {editMode
              ? 'Leave blank to keep the existing value, or enter a new key to replace it.'
              : 'Required for the providers you selected across all three steps.'}
          </p>
        </div>

        {neededEnvs.length === 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            The selected providers don't require an API key (e.g. a local Ollama model).
          </p>
        )}

        {neededEnvs.map((env) => {
          const hint = keyHint(env)
          return (
            <div key={env}>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                <span className="font-mono text-slate-500 dark:text-slate-400">{env}</span>
                {editMode
                  ? <span className="text-slate-400 ml-1">(optional)</span>
                  : <span className="text-red-500 ml-0.5">*</span>}
                {hint && <span className="text-slate-400 dark:text-slate-500 ml-1">— {hint}</span>}
              </label>
              <div className="relative">
                <input
                  type={shown[env] ? 'text' : 'password'}
                  value={draft.apiKeys[env] ?? ''}
                  onChange={(e) => setKey(env, e.target.value)}
                  placeholder="••••••••••••••••"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShown((s) => ({ ...s, [env]: !s[env] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {shown[env] ? <MdVisibilityOff className="text-base" /> : <MdVisibility className="text-base" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <StepNav {...navProps} />
    </div>
  )
}

export default Step3AISettings
