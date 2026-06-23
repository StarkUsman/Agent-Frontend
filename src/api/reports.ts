import { authRequest } from './client'

// ── Shared window type ────────────────────────────────────────────────────────

export interface ReportWindow {
  from: string
  to:   string
}

// ── Weekly total calls ────────────────────────────────────────────────────────

export interface WeeklyTotalCallsResponse {
  window: ReportWindow
  total:  number
}

export function fetchWeeklyTotalCalls(): Promise<WeeklyTotalCallsResponse> {
  return authRequest<WeeklyTotalCallsResponse>('/api/reports/weekly/total-calls')
}

// ── Weekly avg LLM latency ────────────────────────────────────────────────────

export interface WeeklyAvgLlmLatencyResponse {
  window:          ReportWindow
  total_calls:     number
  avg_llm_ttfb_ms: number
}

export function fetchWeeklyAvgLlmLatency(): Promise<WeeklyAvgLlmLatencyResponse> {
  return authRequest<WeeklyAvgLlmLatencyResponse>('/api/reports/weekly/avg-llm-latency')
}

// ── Weekly interruption rate ───────────────────────────────────────────────────

export interface WeeklyInterruptionRateResponse {
  window:             ReportWindow
  total_calls:        number
  failed_calls:       number
  interruption_rate:  number
}

export function fetchWeeklyInterruptionRate(): Promise<WeeklyInterruptionRateResponse> {
  return authRequest<WeeklyInterruptionRateResponse>('/api/reports/weekly/interruption-rate')
}

// ── Weekly avg TTS latency ────────────────────────────────────────────────────

export interface WeeklyAvgTtsLatencyResponse {
  window:          ReportWindow
  total_calls:     number
  avg_tts_ttfb_ms: number
}

export function fetchWeeklyAvgTtsLatency(): Promise<WeeklyAvgTtsLatencyResponse> {
  return authRequest<WeeklyAvgTtsLatencyResponse>('/api/reports/weekly/avg-tts-latency')
}

// ── Weekly usage totals ───────────────────────────────────────────────────────

export interface WeeklyUsageTotalsResponse {
  window:                   ReportWindow
  total_tts_characters:     number
  total_completion_tokens:  number
  total_prompt_tokens:      number
}

export function fetchWeeklyUsageTotals(): Promise<WeeklyUsageTotalsResponse> {
  return authRequest<WeeklyUsageTotalsResponse>('/api/reports/weekly/usage-totals')
}

// ── Weekly conversation quality ───────────────────────────────────────────────

export interface WeeklyConversationQualityResponse {
  window:                           ReportWindow
  total_calls:                      number
  avg_turns_per_call:               number
  calls_with_interruptions_pct:     number
  calls_without_interruptions_pct:  number
  avg_call_duration_seconds:        number
}

export function fetchWeeklyConversationQuality(): Promise<WeeklyConversationQualityResponse> {
  return authRequest<WeeklyConversationQualityResponse>('/api/reports/weekly/conversation-quality')
}

// ── Weekly calls by agent ─────────────────────────────────────────────────────

export interface WeeklyCallsByAgentItem {
  agent_id:    string
  agent_name:  string
  total_calls: number
}

export interface WeeklyCallsByAgentResponse {
  window: ReportWindow
  agents: WeeklyCallsByAgentItem[]
}

export function fetchWeeklyCallsByAgent(): Promise<WeeklyCallsByAgentResponse> {
  return authRequest<WeeklyCallsByAgentResponse>('/api/reports/weekly/calls-by-agent')
}

// ── Weekly calls by day ───────────────────────────────────────────────────────

export interface WeeklyByDayItem {
  date:  string
  day:   string
  today: boolean
  count: number
}

export function fetchWeeklyByDay(): Promise<WeeklyByDayItem[]> {
  return authRequest<WeeklyByDayItem[]>('/api/reports/weekly/by-day')
}
