import { authRequest } from './client'

export type DashboardKind = 'pipeline' | 's2s'

export interface DashboardAgentStatus {
  kind:           DashboardKind
  active_agents:  number
  on_call_agents: number
}

export interface DashboardCallsToday {
  kind:             DashboardKind
  date:             string
  calls_today:      number
  calls_yesterday:  number
  change_pct:       number | null
  trend:            string
}

export interface DashboardInterruptionRate {
  kind:              DashboardKind
  date:              string
  total_calls:       number
  failed_calls:      number
  interruption_rate: number
}

export interface DashboardAvgLlmLatency {
  kind:            DashboardKind
  date:            string
  total_calls:     number
  avg_llm_ttfb_ms: number
}

export function fetchDashboardAgentStatus(kind: DashboardKind): Promise<DashboardAgentStatus> {
  return authRequest<DashboardAgentStatus>(`/api/reports/${kind}/dashboard/agent-status`)
}

export function fetchDashboardCallsToday(kind: DashboardKind): Promise<DashboardCallsToday> {
  return authRequest<DashboardCallsToday>(`/api/reports/${kind}/dashboard/calls-today`)
}

export function fetchDashboardInterruptionRate(kind: DashboardKind): Promise<DashboardInterruptionRate> {
  return authRequest<DashboardInterruptionRate>(`/api/reports/${kind}/dashboard/interruption-rate`)
}

export function fetchDashboardAvgLlmLatency(kind: DashboardKind): Promise<DashboardAvgLlmLatency> {
  return authRequest<DashboardAvgLlmLatency>(`/api/reports/${kind}/dashboard/avg-llm-latency`)
}
