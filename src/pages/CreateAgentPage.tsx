import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowForward, MdArrowBack, MdCheck } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import StepIndicator    from '../components/create-agent/StepIndicator'
import Step1BasicInfo   from '../components/create-agent/Step1BasicInfo'
import Step2ChooseVoice from '../components/create-agent/Step2ChooseVoice'
import Step3AISettings  from '../components/create-agent/Step3AISettings'
import Step4Behaviour   from '../components/create-agent/Step4Behaviour'
import Step5Review      from '../components/create-agent/Step5Review'
import { AGENTS } from '../data/agents'

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
  openingGreeting: "Hello! Thank you for calling. My name is Clara and I'm here to help you today. What can I do for you?",
  topicsHandled: 'Billing questions and invoice queries\nAccount management and password resets\nOrder status and delivery enquiries\nProduct information',
  topicsToAvoid: '',
}

const STEPS = [
  { number: 1, label: 'Basic info' },
  { number: 2, label: 'Choose voice' },
  { number: 3, label: 'AI settings' },
  { number: 4, label: 'Behaviour' },
  { number: 5, label: 'Review' },
]

const TOTAL_STEPS = STEPS.length

// ── Step validation ────────────────────────────────────────────────────────
const canAdvance = (step: number, draft: AgentDraft): boolean => {
  switch (step) {
    case 1: return draft.name.trim().length > 0 && draft.purpose.trim().length > 0
    case 2: return draft.voiceId.length > 0
    case 4: return draft.openingGreeting.trim().length > 0 && draft.topicsHandled.trim().length > 0
    default: return true
  }
}

// ── Page ───────────────────────────────────────────────────────────────────
const CreateAgentPage = () => {
  const navigate = useNavigate()
  const [step, setStep]   = useState(1)
  const [draft, setDraft] = useState<AgentDraft>(INITIAL_DRAFT)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  const updateDraft = (patch: Partial<AgentDraft>) =>
    setDraft((prev) => ({ ...prev, ...patch }))

  const handleContinue = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      AGENTS.push({
        id: AGENTS.length + 1,
        name: draft.name,
        description: draft.purpose,
        voice: {
          initial: draft.voiceName.charAt(0).toUpperCase(),
          name: draft.voiceName,
          color: '#6366f1',
        },
        calls: 0,
        avgTtfb: null,
        interruptions: null,
        flow: null,
        status: 'Active',
      })
      navigate('/agents')
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const isFinalStep   = step === TOTAL_STEPS
  const continueReady = canAdvance(step, draft)

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-white">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5 bg-white border-b border-slate-100 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Create a new agent</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Follow the steps below to set up your voice agent.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
              >
                <MdArrowBack className="text-base" />
                Back
              </button>
            )}
            <button
              onClick={() => navigate('/agents')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              disabled={!continueReady}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
              style={{ backgroundColor: '#6366f1' }}
            >
              {isFinalStep ? (
                <>
                  <MdCheck className="text-base" />
                  Create agent
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
        <StepIndicator steps={STEPS} currentStep={step} onStepClick={setStep} />

        {/* ── Step content ── */}
        <div className="flex-1 overflow-y-auto px-8 py-10 bg-slate-50">
          {step === 1 && <Step1BasicInfo   draft={draft} onChange={updateDraft} />}
          {step === 2 && <Step2ChooseVoice draft={draft} onChange={updateDraft} />}
          {step === 3 && <Step3AISettings  draft={draft} onChange={updateDraft} />}
          {step === 4 && <Step4Behaviour draft={draft} onChange={updateDraft} />}
          {step === 5 && <Step5Review    draft={draft} onEdit={() => setStep(1)} />}
        </div>

      </main>
    </div>
  )
}

export default CreateAgentPage
