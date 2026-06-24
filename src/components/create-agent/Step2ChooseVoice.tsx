import { useEffect, useRef, useState } from 'react'
import { MdPlayArrow, MdStop } from 'react-icons/md'
import type { AgentDraft } from '../../pages/CreateAgentPage'
import type { ProviderCatalog, CatalogVoice } from '../../api/manager'
import { findProvider } from './catalog'
import SearchableSelect from './SearchableSelect'
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

// Preview audio is only bundled for the Deepgram Aura-2 voices; other providers
// render without a preview button. Keyed by the catalog voice id.
const PREVIEW_AUDIO: Record<string, string> = {
  'aura-2-amalthea-en': amaltheaAudio,
  'aura-2-asteria-en':  asteriaAudio,
  'aura-2-athena-en':   athenaAudio,
  'aura-2-draco-en':    dracoAudio,
  'aura-2-electra-en':  electraAudio,
  'aura-2-helena-en':   helenaAudio,
  'aura-2-hyperion-en': hyperionAudio,
  'aura-2-pandora-en':  pandoraAudio,
  'aura-2-zeus-en':     zeusAudio,
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Single voice card ──────────────────────────────────────────────────────
interface CardProps {
  voice:      CatalogVoice
  isSelected: boolean
  isPlaying:  boolean
  preview?:   string
  onSelect:   () => void
  onPreview:  () => void
}

const VoiceCard = ({ voice, isSelected, isPlaying, preview, onSelect, onPreview }: CardProps) => (
  <div
    onClick={onSelect}
    className={`
      relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-5 cursor-pointer transition-all
      ${isSelected
        ? 'border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-indigo-900/30 dark:border-indigo-400'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm'}
    `}
  >
    {isSelected && (
      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
        Selected
      </span>
    )}

    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center mb-3">
      <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">{voice.name.charAt(0)}</span>
    </div>

    <p className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">{voice.name}</p>

    {voice.description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mb-3">{voice.description}</p>
    )}

    <div className="flex flex-wrap gap-1.5 mb-4">
      {voice.accent && (
        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
          {voice.accent}
        </span>
      )}
      {voice.gender && (
        <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full">
          {cap(voice.gender)}
        </span>
      )}
    </div>

    {preview && (
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
    )}
  </div>
)

// ── Step component ─────────────────────────────────────────────────────────
interface Props extends StepNavProps {
  draft:    AgentDraft
  onChange: (patch: Partial<AgentDraft>) => void
  catalog:  ProviderCatalog
}

const inputLabel = 'block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5'

const Step2ChooseVoice = ({ draft, onChange, catalog, ...navProps }: Props) => {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // For s2s agents the realtime provider is chosen here and drives the voices;
  // for pipeline agents this is the TTS provider.
  const isS2s = draft.agentType === 's2s'
  const modality = isS2s ? 's2s' : 'tts'
  const providers = isS2s ? catalog.s2s : catalog.tts
  const selectedId = isS2s ? draft.s2sProvider : draft.ttsProvider
  const provider = findProvider(catalog, modality, selectedId) ?? providers[0]
  const voices = provider?.voices ?? []

  const stopAudio = () => {
    audioRef.current?.pause()
    audioRef.current = null
    setPlayingId(null)
  }

  const handlePreview = (voice: CatalogVoice) => {
    const file = PREVIEW_AUDIO[voice.id]
    if (!file) return
    if (playingId === voice.id) { stopAudio(); return }
    stopAudio()
    const audio = new Audio(file)
    audio.onended = () => setPlayingId(null)
    audio.play()
    audioRef.current = audio
    setPlayingId(voice.id)
  }

  const selectVoice = (v: CatalogVoice) =>
    onChange({
      voiceId: v.id,
      voiceName: v.name,
      voiceProvider: provider?.label ?? '',
      voiceGender: (v.gender as AgentDraft['voiceGender']) ?? 'neutral',
      age: '',
    })

  const selectProvider = (id: string) => {
    if (id === selectedId) return
    stopAudio()
    const next = findProvider(catalog, modality, id)
    const first = next?.voices?.[0]
    onChange({
      ...(isS2s ? { s2sProvider: id, s2sModel: next?.models?.[0] ?? '' } : { ttsProvider: id }),
      voiceId: first?.id ?? '',
      voiceName: first?.name ?? '',
      voiceProvider: next?.label ?? '',
      voiceGender: (first?.gender as AgentDraft['voiceGender']) ?? 'neutral',
      age: '',
    })
  }

  // Ensure the selected voice belongs to the current provider (e.g. on first
  // mount, or if a stale id was carried in). Auto-select the first voice.
  useEffect(() => {
    if (voices.length > 0 && !voices.some((v) => v.id === draft.voiceId)) {
      selectVoice(voices[0])
    }
    return () => { audioRef.current?.pause() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, voices.length])

  return (
    <div className="max-w-xxl space-y-6">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {isS2s
          ? 'Choose the realtime speech-to-speech provider and a voice for your agent. Callers will hear this voice throughout the conversation.'
          : 'Choose the text-to-speech provider and a voice for your agent. Callers will hear this voice throughout the conversation.'}
      </p>

      {/* ── Provider ── */}
      <div className="max-w-sm">
        <label className={inputLabel}>{isS2s ? 'Speech-to-speech provider' : 'TTS provider'}</label>
        <SearchableSelect
          value={selectedId}
          onChange={selectProvider}
          options={providers.map((p) => ({ value: p.id, label: p.label }))}
          placeholder={isS2s ? 'Select a realtime provider…' : 'Select a TTS provider…'}
        />
      </div>

      {/* ── Voices for the selected provider ── */}
      {voices.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {voices.map((v) => (
            <VoiceCard
              key={v.id}
              voice={v}
              isSelected={draft.voiceId === v.id}
              isPlaying={playingId === v.id}
              preview={PREVIEW_AUDIO[v.id]}
              onSelect={() => selectVoice(v)}
              onPreview={() => handlePreview(v)}
            />
          ))}
        </div>
      ) : (
        <div className="max-w-sm">
          <label className={inputLabel}>Voice ID</label>
          <input
            type="text"
            value={draft.voiceId}
            onChange={(e) => onChange({ voiceId: e.target.value, voiceName: e.target.value, voiceProvider: provider?.label ?? '' })}
            placeholder="Enter a provider-specific voice id"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            This provider has no preset voices — paste a voice id from the provider's dashboard.
          </p>
        </div>
      )}

      <StepNav {...navProps} />
    </div>
  )
}

export default Step2ChooseVoice
