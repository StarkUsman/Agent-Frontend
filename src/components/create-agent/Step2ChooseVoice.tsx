import { useEffect } from 'react'
import { MdPlayArrow } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'

// ── Voice catalogue (extend when more providers are added) ─────────────────
const VOICES = [
  {
    id:          'deepgram-aura-asteria',
    name:        'Aura',
    provider:    'Deepgram',
    initial:     'A',
    description: 'Natural, conversational. American accent.',
    accent:      'American',
    genderLabel: 'Female',
    gender:      'female' as const,
  },
]

// ── Single voice card ──────────────────────────────────────────────────────
interface CardProps {
  voice:      typeof VOICES[0]
  isSelected: boolean
  onSelect:   () => void
}

const VoiceCard = ({ voice, isSelected, onSelect }: CardProps) => (
  <div
    onClick={onSelect}
    className={`
      relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 cursor-pointer transition-all
      ${isSelected
        ? 'border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 dark:border-indigo-400'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'}
    `}
  >
    {/* Selected badge */}
    {isSelected && (
      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
        Selected
      </span>
    )}

    {/* Avatar */}
    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3">
      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{voice.initial}</span>
    </div>

    {/* Name */}
    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{voice.name}</p>

    {/* Description */}
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mb-3">{voice.description}</p>

    {/* Accent + gender tags */}
    <div className="flex flex-wrap gap-1.5 mb-4">
      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
        {voice.accent}
      </span>
      <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
        {voice.genderLabel}
      </span>
    </div>

    {/* Preview button — stops click propagating to card select */}
    <button
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
    >
      <MdPlayArrow className="text-sm" />
      Preview voice
    </button>
  </div>
)

// ── Step component ─────────────────────────────────────────────────────────
interface Props {
  draft:    AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
}

const Step2ChooseVoice = ({ draft, onChange }: Props) => {
  // Auto-select the only available voice on mount
  useEffect(() => {
    if (!draft.voiceId) {
      const v = VOICES[0]
      onChange({ voiceId: v.id, voiceName: v.name, voiceProvider: v.provider, voiceGender: v.gender })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedId = draft.voiceId || VOICES[0].id

  const select = (v: typeof VOICES[0]) =>
    onChange({ voiceId: v.id, voiceName: v.name, voiceProvider: v.provider, voiceGender: v.gender })

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Choose a voice for your agent. Callers will hear this voice throughout the conversation.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {VOICES.map((v) => (
          <VoiceCard
            key={v.id}
            voice={v}
            isSelected={selectedId === v.id}
            onSelect={() => select(v)}
          />
        ))}
      </div>
    </div>
  )
}

export default Step2ChooseVoice
