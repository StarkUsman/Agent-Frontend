import { useState } from 'react'
import { MdInfoOutline, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'

interface Props {
  draft:    AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
}

const MODELS = [
  { value: 'llama-3.3-70b-versatile',  label: 'Llama 3.3 70B Versatile' },
  { value: 'llama-3.1-70b-versatile',  label: 'Llama 3.1 70B Versatile' },
  { value: 'llama-3.1-8b-instant',     label: 'Llama 3.1 8B Instant' },
  { value: 'mixtral-8x7b-32768',       label: 'Mixtral 8x7B' },
  { value: 'gemma2-9b-it',             label: 'Gemma 2 9B' },
]

const RadioDot = () => (
  <div className="w-4 h-4 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
    <div className="w-2 h-2 rounded-full bg-indigo-600" />
  </div>
)

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 ' +
  'placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 ' +
  'focus:border-indigo-400 transition'

const Step3AISettings = ({ draft, onChange }: Props) => {
  const [showKey, setShowKey] = useState(false)

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Info banner ── */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-indigo-50 border border-indigo-100 rounded-xl">
        <MdInfoOutline className="text-indigo-500 text-base shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Choose the AI services that power your agent. Each service requires an API key — these are
          stored securely and never visible after saving. If your IT team manages shared keys
          centrally, they may already be configured.
        </p>
      </div>

      {/* ── Pipeline mode ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Pipeline mode</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">
          Choose how your agent processes voice. This affects latency, cost, and which providers you can use.
        </p>

        <div className="border-2 border-indigo-500 rounded-xl p-4 bg-white">
          <div className="flex items-start gap-3">
            <RadioDot />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-semibold text-slate-900">
                  Speech-to-speech — Voice-native AI
                </span>
                <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Lowest latency
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                One AI model handles voice directly — no separate recognition or output steps.
                Callers hear a response faster and interruptions feel completely natural.
                Supported providers: OpenAI Realtime, Gemini Live, AWS Nova Sonic, Ultravox.
              </p>
              <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <span>Voice in</span>
                <span>→</span>
                <span>Voice out (one model)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Provider ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Speech-to-speech provider</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-4">
          One model handles voice recognition, understanding, and speaking — all at once.
        </p>

        <div className="border-2 border-indigo-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <RadioDot />
            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-semibold text-slate-900">Groq</span>
                <span className="text-xs text-slate-400">OpenAI-compatible</span>
                <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Run open-source models via Groq's fast inference API using the OpenAI-compatible
                endpoint. Fastest token generation with near-zero cold start.
              </p>

              <div className="flex gap-1.5 flex-wrap mb-5">
                {['Fast inference', 'OpenAI-compatible', 'Open-source models'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* ── Connection settings ── */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Connection settings
                </p>

                {/* OPENAI_API_KEY */}
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5">
                    <span className="font-mono text-slate-500">OPENAI_API_KEY</span>
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={draft.openaiApiKey}
                      onChange={(e) => onChange({ openaiApiKey: e.target.value })}
                      placeholder="gsk_••••••••••••••••"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showKey
                        ? <MdVisibilityOff className="text-base" />
                        : <MdVisibility   className="text-base" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Stored securely — never shown after saving. Get yours from console.groq.com.
                  </p>
                </div>

                {/* OPENAI_BASE_URL */}
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5">
                    <span className="font-mono text-slate-500">OPENAI_BASE_URL</span>
                  </label>
                  <input
                    type="text"
                    value={draft.openaiBaseUrl}
                    onChange={(e) => onChange({ openaiBaseUrl: e.target.value })}
                    className={inputClass}
                  />
                </div>

                {/* OPENAI_MODEL */}
                <div>
                  <label className="block text-xs text-slate-600 mb-1.5">
                    <span className="font-mono text-slate-500">OPENAI_MODEL</span>
                  </label>
                  <select
                    value={draft.openaiModel}
                    onChange={(e) => onChange({ openaiModel: e.target.value })}
                    className={`${inputClass} cursor-pointer`}
                  >
                    {MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Step3AISettings
