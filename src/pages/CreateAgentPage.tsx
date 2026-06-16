import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowForward, MdArrowBack, MdCheck } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import StepIndicator    from '../components/create-agent/StepIndicator'
import Step1BasicInfo   from '../components/create-agent/Step1BasicInfo'
import Step2ChooseVoice from '../components/create-agent/Step2ChooseVoice'
import Step3AISettings  from '../components/create-agent/Step3AISettings'
import Step4Behaviour   from '../components/create-agent/Step4Behaviour'
import Step5Review      from '../components/create-agent/Step5Review'
import { createAgent } from '../api/manager'
import { generatePythonCode } from '../features/flow-editor/lib/codegen/pythonGenerator'
import { embedFlowJsonInPython } from '../features/flow-editor/lib/codegen/flowEmbed'
import { EXAMPLES } from '../features/flow-editor/lib/examples'
import type { FlowJson } from '../features/flow-editor/lib/schema/flow.schema'

// ── Shared draft type — imported by all step components ────────────────────
export interface AgentDraft {
  // Step 1
  name: string
  purpose: string
  language: string
  // Step 2
  voiceId: string
  voiceName: string
  voiceProvider: string
  voiceGender: 'male' | 'female' | 'neutral'
  // Step 3
  openaiApiKey: string
  openaiModel: string
  openaiBaseUrl: string
  deepgramApiKey: string
  cartesiaApiKey: string
  ttsProvider: 'deepgram' | 'cartesia'
  // Step 4
  openingGreeting: string
  topicsHandled: string
  topicsToAvoid: string
}

const INITIAL_DRAFT: AgentDraft = {
  name: '',
  purpose: '',
  language: 'en-GB',
  voiceId: '',
  voiceName: '',
  voiceProvider: '',
  voiceGender: 'neutral',
  openaiApiKey: '',
  openaiModel: 'llama-3.3-70b-versatile',
  openaiBaseUrl: 'https://api.groq.com/openai/v1',
  deepgramApiKey: '',
  cartesiaApiKey: '',
  ttsProvider: 'deepgram',
  openingGreeting: "Hello! Thank you for calling. My name is Clara and I'm here to help you today. What can I do for you?",
  topicsHandled: 'Billing questions and invoice queries\nAccount management and password resets\nOrder status and delivery enquiries\nProduct information',
  topicsToAvoid: '',
}

const STEPS = [
  { number: 1, label: 'Basic info' },
  { number: 2, label: 'Choose voice' },
  { number: 3, label: 'AI settings' },
  // { number: 4, label: 'Behaviour' },
  { number: 4, label: 'Review' },
]

const TOTAL_STEPS = STEPS.length

// ── Step validation ────────────────────────────────────────────────────────
const canAdvance = (step: number, draft: AgentDraft): boolean => {
  switch (step) {
    case 1: return draft.name.trim().length > 0 && draft.purpose.trim().length > 0
    case 2: return draft.voiceId.length > 0
    case 3: return draft.openaiApiKey.trim().length > 0 && draft.deepgramApiKey.trim().length > 0
    case 4: return draft.openingGreeting.trim().length > 0 && draft.topicsHandled.trim().length > 0
    default: return true
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
const CreateAgentPage = () => {
  const navigate = useNavigate()
  const [step, setStep]   = useState(1)
  const [draft, setDraft] = useState<AgentDraft>(INITIAL_DRAFT)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateDraft = (patch: Partial<AgentDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }))

  // The backend rejects an empty flow, so new agents start with a minimal
  // valid placeholder; the user builds the real flow afterwards in the editor.
  const buildPlaceholderFlowCode = (): string => {
    const minimal = EXAMPLES[0].json as FlowJson
    return embedFlowJsonInPython(generatePythonCode(minimal), minimal)
  }

  const submitAgent = async () => {
    const config: Record<string, string> = {
      OPENAI_API_KEY: draft.openaiApiKey.trim(),
      OPENAI_MODEL: draft.openaiModel,
      OPENAI_BASE_URL: draft.openaiBaseUrl.trim(),
      DEEPGRAM_API_KEY: draft.deepgramApiKey.trim(),
      TTS_PROVIDER: draft.ttsProvider,
    }
    if (draft.cartesiaApiKey.trim()) {
      config.CARTESIA_API_KEY = draft.cartesiaApiKey.trim()
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAgent({
        name: draft.name.trim(),
        flow_code: buildPlaceholderFlowCode(),
        config,
      })
      navigate('/agents')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      submitAgent()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const isStepClickable = (target: number): boolean => {
    if (target <= step) return true
    for (let s = step; s < target; s++) {
      if (!canAdvance(s, draft)) return false
    }
    return true
  }

  const handleStepClick = (target: number) => {
    if (isStepClickable(target)) setStep(target)
  }

  const isFinalStep   = step === TOTAL_STEPS
  const continueReady = canAdvance(step, draft)

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Create a new agent</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Follow the steps below to set up your voice agent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <MdArrowBack className="text-base" />
                Back
              </button>
            )}
            <button
              onClick={() => navigate('/agents')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!continueReady || submitting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: '#6366f1' }}
            >
              {isFinalStep ? (
                <>
                  <MdCheck className="text-base" />
                  {submitting ? 'Creating…' : 'Create agent'}
                </>
              ) : (
                <>
                  Continue
                  <MdArrowForward className="text-base" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Step indicator ── */}
        <StepIndicator steps={STEPS} currentStep={step} onStepClick={handleStepClick} isClickable={isStepClickable} />

        {submitError && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
            {submitError}
          </div>
        )}

        {/* ── Step content ── */}
        <div className="flex-1 overflow-y-auto px-8 py-10 bg-slate-50 dark:bg-slate-900">
          {step === 1 && <Step1BasicInfo   draft={draft} onChange={updateDraft} />}
          {step === 2 && <Step2ChooseVoice draft={draft} onChange={updateDraft} />}
          {step === 3 && <Step3AISettings  draft={draft} onChange={updateDraft} />}
          {/* {step === 4 && <Step4Behaviour draft={draft} onChange={updateDraft} />} */}
          {step === 4 && <Step5Review    draft={draft} onEdit={() => setStep(1)} />}
        </div>

      </main>
    </div>
  )
}

export default CreateAgentPage
