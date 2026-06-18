import { useEffect, useRef, useState } from 'react'
import { MdPlayArrow, MdStop } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'
import StepNav, { type StepNavProps } from './StepNav'

import amaltheaAudio  from '../../assets/deepgram-voices/Aura-2-amalthea.wav'
import asteriaAudio   from '../../assets/deepgram-voices/Aura-2-asteria.wav'
import athenaAudio    from '../../assets/deepgram-voices/Aura-2-athena.wav'
import dracoAudio     from '../../assets/deepgram-voices/Aura-2-draco.wav'
import electraAudio   from '../../assets/deepgram-voices/Aura-2-electra.wav'
import helenaAudio    from '../../assets/deepgram-voices/Aura-2-helena.wav'
import hyperionAudio  from '../../assets/deepgram-voices/Aura-2-hyperion.wav'
import pandoraAudio   from '../../assets/deepgram-voices/Aura-2-pandora.wav'
import zeusAudio      from '../../assets/deepgram-voices/Aura-2-zeus.wav'

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
    Age:         'Adult',
    previewFile: asteriaAudio,
  },
  {
    id:          'aura-2-hyperion-en',
    name:        'Hyperion',
    provider:    'Deepgram',
    initial:     'H',
    description: 'Interview. Australian accent.',
    accent:      'Australian',
    genderLabel: 'Male',
    gender:      'male' as const,
    Age:         'Adult',
    previewFile: hyperionAudio,
  },
  {
    id:          'aura-2-amalthea-en',
    name:        'Amalthea',
    provider:    'Deepgram',
    initial:     'A',
    description: 'Casual chat. Filipino accent.',
    accent:      'Filipino',
    genderLabel: 'Female',
    gender:      'female' as const,
    Age:         'Young Adult',
    previewFile: amaltheaAudio,
  },
  {
    id:          'aura-2-draco-en',
    name:        'Draco',
    provider:    'Deepgram',
    initial:     'D',
    description: 'Storytelling. British accent.',
    accent:      'British',
    genderLabel: 'Male',
    gender:      'male' as const,
    Age:         'Adult',
    previewFile: dracoAudio,
  },
  {
    id:          'aura-2-electra-en',
    name:        'Electra',
    provider:    'Deepgram',
    initial:     'E',
    description: 'IVR, advertising, customer service. American accent.',
    accent:      'American',
    genderLabel: 'Female',
    gender:      'female' as const,
    Age:         'Adult',
    previewFile: electraAudio,
  },
  {
    id:          'aura-2-pandora-en',
    name:        'Pandora',
    provider:    'Deepgram',
    initial:     'P',
    description: 'IVR, informative. British accent.',
    accent:      'British',
    genderLabel: 'Female',
    gender:      'female' as const,
    Age:         'Adult',
    previewFile: pandoraAudio,
  },
  {
    id:          'aura-2-zeus-en',
    name:        'Zeus',
    provider:    'Deepgram',
    initial:     'Z',
    description: 'IVR. American accent.',
    accent:      'American',
    genderLabel: 'Male',
    gender:      'male' as const,
    Age:         'Adult',
    previewFile: zeusAudio,
  },
  {
    id:          'aura-2-helena-en',
    name:        'Helena',
    provider:    'Deepgram',
    initial:     'H',
    description: 'IVR, casual chat. American accent.',
    accent:      'American',
    genderLabel: 'Female',
    gender:      'female' as const,
    Age:         'Adult',
    previewFile: helenaAudio,
  },
  {
    id:          'aura-2-athena-en',
    name:        'Athena',
    provider:    'Deepgram',
    initial:     'A',
    description: 'Storytelling. American accent.',
    accent:      'American',
    genderLabel: 'Female',
    gender:      'female' as const,
    Age:         'Mature',
    previewFile: athenaAudio,
  },
]

// ── Single voice card ──────────────────────────────────────────────────────
interface CardProps {
  voice:      typeof VOICES[0]
  isSelected: boolean
  isPlaying:  boolean
  onSelect:   () => void
  onPreview:  () => void
}

const VoiceCard = ({ voice, isSelected, isPlaying, onSelect, onPreview }: CardProps) => (
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

    {/* Preview button */}
    <button
      onClick={(e) => { e.stopPropagation(); onPreview() }}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer
        ${isPlaying
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}
      `}
    >
      {isPlaying ? <MdStop className="text-sm" /> : <MdPlayArrow className="text-sm" />}
      {isPlaying ? 'Stop' : 'Preview voice'}
    </button>
  </div>
)

// ── Step component ─────────────────────────────────────────────────────────
interface Props extends StepNavProps {
  draft:    AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
}

const Step2ChooseVoice = ({ draft, onChange, ...navProps }: Props) => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopAudio = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingId(null)
  }

  const handlePreview = (voice: typeof VOICES[0]) => {
    if (playingId === voice.id) {
      stopAudio()
      return
    }
    stopAudio()
    const audio = new Audio(voice.previewFile)
    audio.onended = () => setPlayingId(null)
    audio.play()
    audioRef.current = audio
    setPlayingId(voice.id)
  }

  // Auto-select the first voice on mount
  useEffect(() => {
    if (!draft.voiceId) {
      const v = VOICES[0]
      onChange({ voiceId: v.id, voiceName: v.name, age: v.Age, voiceProvider: v.provider, voiceGender: v.gender })
    }
    return () => { audioRef.current?.pause() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedId = draft.voiceId || VOICES[0].id

  const select = (v: typeof VOICES[0]) =>
    onChange({ voiceId: v.id, voiceName: v.name, age: v.Age, voiceProvider: v.provider, voiceGender: v.gender })

  return (
    <div className="max-w-xxl">
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Choose a voice for your agent. Callers will hear this voice throughout the conversation.
      </p>

      <div className="grid grid-cols-3 gap-4">
        {VOICES.map((v) => (
          <VoiceCard
            key={v.id}
            voice={v}
            isSelected={selectedId === v.id}
            isPlaying={playingId === v.id}
            onSelect={() => select(v)}
            onPreview={() => handlePreview(v)}
          />
        ))}
      </div>
      <StepNav {...navProps} />
    </div>
  )
}

export default Step2ChooseVoice
