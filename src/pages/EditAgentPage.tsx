import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MdInfoOutline } from 'react-icons/md'
import Sidebar from '../components/dashboard/Sidebar'
import StepIndicator from '../components/create-agent/StepIndicator'
import AgentPreview from '../components/create-agent/AgentPreview'
import Step1BasicInfo from '../components/create-agent/Step1BasicInfo'
import Step2ChooseVoice from '../components/create-agent/Step2ChooseVoice'
import Step3AISettings from '../components/create-agent/Step3AISettings'
import Step5Review from '../components/create-agent/Step5Review'
import { getAgent, updateAgent, type ManagerAgent, type ProviderCatalog } from '../api/manager'
import { useProviderCatalog, findProvider, neededKeyEnvs, buildAgentConfig } from '../components/create-agent/catalog'
import { useAgents } from '../contexts/AgentsContext'
import type { AgentDraft } from './CreateAgentPage'

const STEPS = [
  { number: 1, label: 'Basic info' },
  { number: 2, label: 'Choose voice' },
  { number: 3, label: 'AI settings' },
  { number: 4, label: 'Review' },
]
const TOTAL_STEPS = STEPS.length

const draftFromAgent = (agent: ManagerAgent, catalog: ProviderCatalog): AgentDraft => {
  const cfg = agent.config ?? {}

  // Back-compat: agents created by the old form used OPENAI_MODEL/OPENAI_BASE_URL
  // with an implicit Groq/OpenAI provider.
  const llmProvider = cfg.LLM_PROVIDER
    ?? (cfg.OPENAI_BASE_URL?.includes('groq') ? 'groq' : 'openai')
  const ttsProvider = cfg.TTS_PROVIDER ?? 'deepgram'
  const voiceId     = cfg.TTS_VOICE ?? ''

  const ttsCat = findProvider(catalog, 'tts', ttsProvider)
  const voice  = ttsCat?.voices?.find((v) => v.id === voiceId)

  return {
    name:            agent.name,
    language:        'en-GB',
    ttsProvider,
    ttsModel:        cfg.TTS_MODEL ?? '',
    voiceId,
    voiceName:       voice?.name ?? voiceId,
    voiceProvider:   ttsCat?.label ?? '',
    age:             '',
    voiceGender:     (voice?.gender as AgentDraft['voiceGender']) ?? 'neutral',
    llmProvider,
    llmModel:        cfg.LLM_MODEL ?? cfg.OPENAI_MODEL ?? '',
    llmBaseUrl:      cfg.LLM_BASE_URL ?? cfg.OPENAI_BASE_URL ?? '',
    sttProvider:     cfg.STT_PROVIDER ?? 'deepgram',
    sttModel:        cfg.STT_MODEL ?? '',
    sttLanguage:     cfg.STT_LANGUAGE ?? '',
    apiKeys:         {},
    openingGreeting: '',
    topicsHandled:   '',
    topicsToAvoid:   '',
  }
}

const canAdvance = (step: number, draft: AgentDraft): boolean => {
  if (step === 1) return draft.name.trim().length > 0
  if (step === 2) return draft.voiceId.trim().length > 0
  // Keys are optional in edit mode (blank keeps existing), so no key gate here.
  return true
}

const EditAgentPage = () => {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const { refresh } = useAgents()
  const { catalog } = useProviderCatalog()

  const [agent,       setAgent]       = useState<ManagerAgent | null>(null)
  const [fetchError,  setFetchError]  = useState<string | null>(null)
  const [step,        setStep]        = useState(1)
  const [draft,       setDraft]       = useState<AgentDraft | null>(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getAgent(id)
      .then((a) => { setAgent(a); setDraft(draftFromAgent(a, catalog)) })
      .catch((err) => setFetchError(err instanceof Error ? err.message : 'Failed to load agent'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (fetchError) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-red-500">{fetchError}</p>
        </main>
      </div>
    )
  }

  if (!draft || !agent) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
        </main>
      </div>
    )
  }

  const updateDraft = (patch: Partial<AgentDraft>) =>
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))

  const submitAgent = async () => {
    if (!draft) return
    const config = buildAgentConfig(catalog, draft)

    setSubmitting(true)
    setSubmitError(null)
    try {
      await updateAgent(agent.id, { name: draft.name.trim(), config })
      refresh()
      navigate('/agents')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to update agent')
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinue = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else submitAgent()
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

  const isFinalStep   = step === TOTAL_STEPS
  const continueReady = canAdvance(step, draft)

  return (
    <div className="flex h-screen bg-white dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Edit agent</h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{agent.id}</p>
          </div>
          <button
            onClick={() => navigate('/agents')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>

        <StepIndicator
          steps={STEPS}
          currentStep={step}
          onStepClick={(t) => { if (isStepClickable(t)) setStep(t) }}
          isClickable={isStepClickable}
        />

        {submitError && (
          <div className="mx-8 mt-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 shrink-0">
            {submitError}
          </div>
        )}

        {/* Step content */}
        <div className="flex-1 w-full flex overflow-hidden bg-slate-50 dark:bg-slate-900">

          {/* Left: form */}
          <div className="flex-1 overflow-y-auto px-8 py-5">

            {/* Key masking notice on AI settings step */}
            {step === 3 && (
              <div className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <MdInfoOutline className="text-amber-500 dark:text-amber-400 text-base shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                  API keys are not returned by the server. Leave key fields blank to keep existing values, or enter a new value to replace them.
                </p>
              </div>
            )}

            {step === 1 && (
              <Step1BasicInfo
                draft={draft}
                onChange={updateDraft}
                nameDisabled
                onContinue={handleContinue}
                canContinue={continueReady}
                isFinalStep={isFinalStep}
              />
            )}
            {step === 2 && (
              <Step2ChooseVoice
                draft={draft}
                onChange={updateDraft}
                catalog={catalog}
                onBack={handleBack}
                onContinue={handleContinue}
                canContinue={continueReady}
                isFinalStep={isFinalStep}
              />
            )}
            {step === 3 && (
              <Step3AISettings
                draft={draft}
                onChange={updateDraft}
                catalog={catalog}
                neededEnvs={neededKeyEnvs(catalog, draft)}
                onBack={handleBack}
                onContinue={handleContinue}
                canContinue={continueReady}
                isFinalStep={isFinalStep}
                submitting={submitting}
                finalLabel="Save changes"
                editMode
              />
            )}
            {step === 4 && (
              <Step5Review
                draft={draft}
                onEdit={() => setStep(1)}
                onBack={handleBack}
                onContinue={handleContinue}
                canContinue={continueReady}
                isFinalStep={isFinalStep}
                submitting={submitting}
                finalLabel="Save changes"
              />
            )}
          </div>

          {/* Right: live preview */}
          <div className="w-90 rounded-2xl mr-8 mt-4 shrink-0 border-l border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-y-auto">
            <AgentPreview draft={draft} currentStep={step} totalSteps={TOTAL_STEPS} catalog={catalog} />
          </div>

        </div>

      </main>
    </div>
  )
}

export default EditAgentPage
