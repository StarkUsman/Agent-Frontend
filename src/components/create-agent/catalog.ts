import { useEffect, useState } from 'react'
import { getProviders, getS2sProviders, type ProviderCatalog, type CatalogProvider } from '../../api/manager'
import type { AgentDraft } from '../../pages/CreateAgentPage'

// Resilient fallback mirroring services.PROVIDER_CATALOG on the manager, so the
// form still works if GET /providers is briefly unreachable. The live fetch
// overrides this on success.
export const FALLBACK_CATALOG: ProviderCatalog = {
  stt: [
    { id: 'deepgram',   label: 'Deepgram',           apiKeyEnv: 'DEEPGRAM_API_KEY',   models: ['nova-3', 'nova-2'] },
    { id: 'assemblyai', label: 'AssemblyAI',         apiKeyEnv: 'ASSEMBLYAI_API_KEY', models: [] },
    { id: 'gladia',     label: 'Gladia',             apiKeyEnv: 'GLADIA_API_KEY',     models: [] },
    { id: 'openai',     label: 'OpenAI (Whisper)',   apiKeyEnv: 'OPENAI_API_KEY',     models: ['whisper-1', 'gpt-4o-transcribe'] },
    { id: 'groq',       label: 'Groq (Whisper)',     apiKeyEnv: 'GROQ_API_KEY',       models: ['whisper-large-v3'] },
  ],
  llm: [
    { id: 'openai',     label: 'OpenAI',             apiKeyEnv: 'OPENAI_API_KEY',     models: ['gpt-4o', 'gpt-4o-mini'] },
    { id: 'anthropic',  label: 'Anthropic (Claude)', apiKeyEnv: 'ANTHROPIC_API_KEY',  models: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'] },
    { id: 'google',     label: 'Google (Gemini)',    apiKeyEnv: 'GOOGLE_API_KEY',     models: ['gemini-2.0-flash', 'gemini-2.0-pro'] },
    { id: 'groq',       label: 'Groq',               apiKeyEnv: 'GROQ_API_KEY',       baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
    { id: 'openrouter', label: 'OpenRouter',         apiKeyEnv: 'OPENROUTER_API_KEY', baseUrl: 'https://openrouter.ai/api/v1', models: [] },
    { id: 'together',   label: 'Together',           apiKeyEnv: 'TOGETHER_API_KEY',   baseUrl: 'https://api.together.xyz/v1', models: [] },
    { id: 'fireworks',  label: 'Fireworks',          apiKeyEnv: 'FIREWORKS_API_KEY',  baseUrl: 'https://api.fireworks.ai/inference/v1', models: [] },
    { id: 'deepseek',   label: 'DeepSeek',           apiKeyEnv: 'DEEPSEEK_API_KEY',   baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'] },
    { id: 'cerebras',   label: 'Cerebras',           apiKeyEnv: 'CEREBRAS_API_KEY',   baseUrl: 'https://api.cerebras.ai/v1', models: [] },
    { id: 'perplexity', label: 'Perplexity',         apiKeyEnv: 'PERPLEXITY_API_KEY', baseUrl: 'https://api.perplexity.ai', models: [] },
    { id: 'ollama',     label: 'Ollama (local)',     apiKeyEnv: null, baseUrl: 'http://localhost:11434/v1', models: [] },
  ],
  tts: [
    { id: 'deepgram',   label: 'Deepgram (Aura-2)',  apiKeyEnv: 'DEEPGRAM_API_KEY', models: [], voices: [
      { id: 'aura-2-helena-en',   name: 'Helena',   gender: 'female', accent: 'American',  description: 'IVR, casual chat.' },
      { id: 'aura-2-asteria-en',  name: 'Asteria',  gender: 'female', accent: 'American',  description: 'Natural, conversational.' },
      { id: 'aura-2-hyperion-en', name: 'Hyperion', gender: 'male',   accent: 'Australian', description: 'Interview.' },
      { id: 'aura-2-amalthea-en', name: 'Amalthea', gender: 'female', accent: 'Filipino',  description: 'Casual chat.' },
      { id: 'aura-2-draco-en',    name: 'Draco',    gender: 'male',   accent: 'British',   description: 'Storytelling.' },
      { id: 'aura-2-electra-en',  name: 'Electra',  gender: 'female', accent: 'American',  description: 'IVR, advertising, customer service.' },
      { id: 'aura-2-pandora-en',  name: 'Pandora',  gender: 'female', accent: 'British',   description: 'IVR, informative.' },
      { id: 'aura-2-zeus-en',     name: 'Zeus',     gender: 'male',   accent: 'American',  description: 'IVR.' },
      { id: 'aura-2-athena-en',   name: 'Athena',   gender: 'female', accent: 'American',  description: 'Storytelling.' },
    ] },
    { id: 'cartesia',   label: 'Cartesia',   apiKeyEnv: 'CARTESIA_API_KEY', models: [], voices: [
      { id: 'e07c00bc-4134-4eae-9ea4-1a55fb45746b', name: 'Default (Sonic)', gender: 'neutral', accent: 'American', description: 'Natural, low-latency.' },
    ] },
    { id: 'elevenlabs', label: 'ElevenLabs', apiKeyEnv: 'ELEVENLABS_API_KEY', models: ['eleven_flash_v2_5', 'eleven_multilingual_v2', 'eleven_turbo_v2_5'], voices: [
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah',  gender: 'female', accent: 'American', description: 'Multilingual, natural.' },
      { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', accent: 'American', description: 'Calm, multilingual.' },
    ] },
    { id: 'openai',     label: 'OpenAI',     apiKeyEnv: 'OPENAI_API_KEY', models: ['tts-1', 'tts-1-hd', 'gpt-4o-mini-tts'], voices: [
      { id: 'alloy',   name: 'Alloy',   gender: 'neutral', accent: 'American', description: 'Balanced, neutral.' },
      { id: 'echo',    name: 'Echo',    gender: 'male',    accent: 'American', description: 'Warm, measured.' },
      { id: 'fable',   name: 'Fable',   gender: 'neutral', accent: 'British',  description: 'Expressive, storytelling.' },
      { id: 'onyx',    name: 'Onyx',    gender: 'male',    accent: 'American', description: 'Deep, authoritative.' },
      { id: 'nova',    name: 'Nova',    gender: 'female',  accent: 'American', description: 'Bright, friendly.' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female',  accent: 'American', description: 'Soft, gentle.' },
    ] },
  ],
  // Mirrors services.S2S_PROVIDER_CATALOG on the manager (GET /STS/providers).
  // Each realtime provider bundles STT+LLM+TTS; one entry drives the agent.
  s2s: [
    { id: 'openai_realtime', label: 'OpenAI Realtime', apiKeyEnv: 'OPENAI_API_KEY',
      models: ['gpt-realtime-1.5', 'gpt-4o-realtime-preview', 'gpt-4o-mini-realtime-preview'], voices: [
      { id: 'alloy',   name: 'Alloy',   gender: 'neutral', description: 'Balanced, neutral.' },
      { id: 'echo',    name: 'Echo',    gender: 'male',    description: 'Warm, measured.' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female',  description: 'Soft, gentle.' },
      { id: 'marin',   name: 'Marin',   gender: 'female',  description: 'Natural, conversational.' },
      { id: 'cedar',   name: 'Cedar',   gender: 'male',    description: 'Natural, conversational.' },
    ] },
    { id: 'gemini_live', label: 'Google Gemini Live', apiKeyEnv: 'GOOGLE_API_KEY',
      models: ['models/gemini-2.5-flash-native-audio-preview-12-2025', 'models/gemini-2.0-flash-live-001'], voices: [
      { id: 'Charon', name: 'Charon', gender: 'male',   description: 'Default, informative.' },
      { id: 'Puck',   name: 'Puck',   gender: 'male',   description: 'Upbeat.' },
      { id: 'Kore',   name: 'Kore',   gender: 'female', description: 'Firm.' },
      { id: 'Fenrir', name: 'Fenrir', gender: 'male',   description: 'Excitable.' },
      { id: 'Aoede',  name: 'Aoede',  gender: 'female', description: 'Breezy.' },
    ] },
    { id: 'aws_nova_sonic', label: 'AWS Nova Sonic', apiKeyEnv: 'AWS_SECRET_ACCESS_KEY',
      models: ['amazon.nova-2-sonic-v1:0', 'amazon.nova-sonic-v1:0'], voices: [
      { id: 'matthew', name: 'Matthew', gender: 'male',   description: 'American English.' },
      { id: 'tiffany', name: 'Tiffany', gender: 'female', description: 'American English.' },
      { id: 'amy',     name: 'Amy',     gender: 'female', description: 'British English.' },
    ] },
    { id: 'azure_realtime', label: 'Azure OpenAI Realtime', apiKeyEnv: 'AZURE_API_KEY', models: [], voices: [
      { id: 'alloy',   name: 'Alloy',   gender: 'neutral', description: 'Balanced, neutral.' },
      { id: 'echo',    name: 'Echo',    gender: 'male',    description: 'Warm, measured.' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female',  description: 'Soft, gentle.' },
      { id: 'marin',   name: 'Marin',   gender: 'female',  description: 'Natural, conversational.' },
      { id: 'cedar',   name: 'Cedar',   gender: 'male',    description: 'Natural, conversational.' },
    ] },
    { id: 'xai_realtime', label: 'xAI Grok Realtime', apiKeyEnv: 'XAI_API_KEY', models: [], voices: [
      { id: 'Ara', name: 'Ara', gender: 'female', description: 'Default.' },
      { id: 'Rex', name: 'Rex', gender: 'male',   description: 'Grok realtime voice.' },
      { id: 'Eve', name: 'Eve', gender: 'female', description: 'Grok realtime voice.' },
      { id: 'Leo', name: 'Leo', gender: 'male',   description: 'Grok realtime voice.' },
    ] },
    { id: 'inworld_realtime', label: 'Inworld Realtime', apiKeyEnv: 'INWORLD_API_KEY',
      models: ['openai/gpt-4.1-nano', 'openai/gpt-4.1-mini'], voices: [
      { id: 'Sarah', name: 'Sarah', gender: 'female', description: 'Inworld TTS voice.' },
      { id: 'Clive', name: 'Clive', gender: 'male',   description: 'Inworld TTS voice.' },
    ] },
  ],
}

// Fetch the catalog once; fall back to the bundled copy on error. The pipeline
// providers and the s2s providers come from two endpoints, merged into one
// catalog object.
export function useProviderCatalog() {
  const [catalog, setCatalog] = useState<ProviderCatalog>(FALLBACK_CATALOG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([getProviders(), getS2sProviders()])
      .then(([pipeline, s2s]) => { if (active) setCatalog({ ...pipeline, s2s }) })
      .catch(() => { /* keep fallback */ })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return { catalog, loading }
}

export const findProvider = (
  catalog: ProviderCatalog,
  modality: keyof ProviderCatalog,
  id: string,
): CatalogProvider | undefined => catalog[modality].find((p) => p.id === id)

// Deduped, non-null API-key env vars required by the currently selected
// providers. For s2s agents that's the single realtime provider's key; for
// pipeline agents it's the LLM + STT + TTS keys (an all-OpenAI stack collapses
// to one key).
export function neededKeyEnvs(catalog: ProviderCatalog, draft: AgentDraft): string[] {
  if (draft.agentType === 's2s') {
    const env = findProvider(catalog, 's2s', draft.s2sProvider)?.apiKeyEnv
    return env ? [env] : []
  }
  const envs = [
    findProvider(catalog, 'llm', draft.llmProvider)?.apiKeyEnv,
    findProvider(catalog, 'stt', draft.sttProvider)?.apiKeyEnv,
    findProvider(catalog, 'tts', draft.ttsProvider)?.apiKeyEnv,
  ].filter((e): e is string => !!e)
  return [...new Set(envs)]
}

// Build the manager `config` dict from the draft. Optional fields are only
// included when set; only the needed, non-empty API keys are sent (so blank
// keys in edit mode preserve the server's existing values). Shared by the
// create and edit flows.
export function buildAgentConfig(catalog: ProviderCatalog, draft: AgentDraft): Record<string, string> {
  // Speech-to-speech: a single realtime provider + optional model + voice.
  if (draft.agentType === 's2s') {
    const s2sConfig: Record<string, string> = { S2S_PROVIDER: draft.s2sProvider }
    if (draft.s2sModel.trim()) s2sConfig.S2S_MODEL = draft.s2sModel.trim()
    if (draft.voiceId.trim())  s2sConfig.S2S_VOICE = draft.voiceId.trim()
    for (const env of neededKeyEnvs(catalog, draft)) {
      const v = draft.apiKeys[env]?.trim()
      if (v) s2sConfig[env] = v
    }
    return s2sConfig
  }

  const config: Record<string, string> = {
    LLM_PROVIDER: draft.llmProvider,
    STT_PROVIDER: draft.sttProvider,
    TTS_PROVIDER: draft.ttsProvider,
  }
  if (draft.llmModel.trim())    config.LLM_MODEL    = draft.llmModel.trim()
  if (draft.llmBaseUrl.trim())  config.LLM_BASE_URL = draft.llmBaseUrl.trim()
  if (draft.sttModel.trim())    config.STT_MODEL    = draft.sttModel.trim()
  if (draft.sttLanguage.trim()) config.STT_LANGUAGE = draft.sttLanguage.trim()
  if (draft.voiceId.trim())     config.TTS_VOICE    = draft.voiceId.trim()
  if (draft.ttsModel.trim())    config.TTS_MODEL    = draft.ttsModel.trim()
  for (const env of neededKeyEnvs(catalog, draft)) {
    const v = draft.apiKeys[env]?.trim()
    if (v) config[env] = v
  }
  return config
}
