import { useEffect, useState } from 'react'
import { MdOutlineSmartToy, MdOutlineAccessTime, MdOutlinePause } from 'react-icons/md'
import { BiPhoneCall } from 'react-icons/bi'
import Sidebar from '../components/dashboard/Sidebar'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsRow from '../components/dashboard/StatsRow'
import LiveCallsSection from '../components/dashboard/LiveCallsSection'
import AgentsGrid from '../components/dashboard/AgentsGrid'
import {
  fetchDashboardAgentStatus,
  fetchDashboardCallsToday,
  fetchDashboardInterruptionRate,
  fetchDashboardAvgLlmLatency,
  type DashboardAgentStatus,
  type DashboardCallsToday,
  type DashboardInterruptionRate,
  type DashboardAvgLlmLatency,
} from '../api/dashboard'
import type { StatCardProps } from '../components/dashboard/StatCard'

// ── Types ─────────────────────────────────────────────────────────────────────

interface KindData {
  agentStatus:      DashboardAgentStatus | null
  callsToday:       DashboardCallsToday | null
  interruptionRate: DashboardInterruptionRate | null
  avgLatency:       DashboardAvgLlmLatency | null
}

const EMPTY: KindData = {
  agentStatus:      null,
  callsToday:       null,
  interruptionRate: null,
  avgLatency:       null,
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtChangePct = (pct: number | null, trend: string): string => {
  if (pct === null || trend === 'no_data') return 'No comparison data'
  const sign = pct >= 0 ? '↑' : '↓'
  return `${sign} ${Math.abs(pct).toFixed(1)}% vs yesterday`
}

const trendSubType = (trend: string): 'positive' | 'neutral' =>
  trend === 'up' ? 'positive' : 'neutral'

const buildCards = (d: KindData, loading: boolean, isS2s: boolean): StatCardProps[] => {
  const agentBg    = isS2s ? '#d1fae5' : '#ede9fe'
  const agentColor = isS2s ? '#059669' : '#7c3aed'
  const callsBg    = isS2s ? '#d1fae5' : '#dbeafe'
  const callsColor = isS2s ? '#059669' : '#2563eb'
  const latBg      = isS2s ? '#d1fae5' : '#e0f2fe'
  const latColor   = isS2s ? '#059669' : '#0284c7'

  return [
    {
      label:     isS2s ? 'Active STS agents' : 'Active agents',
      value:     d.agentStatus ? String(d.agentStatus.active_agents) : 'N/A',
      sub:       d.agentStatus ? `${d.agentStatus.on_call_agents} on calls right now` : '—',
      subType:   'positive',
      icon:      MdOutlineSmartToy,
      iconBg:    agentBg,
      iconColor: agentColor,
      loading,
    },
    {
      label:     isS2s ? 'STS calls today' : 'Calls today',
      value:     d.callsToday ? String(d.callsToday.calls_today) : 'N/A',
      sub:       d.callsToday ? fmtChangePct(d.callsToday.change_pct, d.callsToday.trend) : '—',
      subType:   d.callsToday ? trendSubType(d.callsToday.trend) : 'neutral',
      icon:      BiPhoneCall,
      iconBg:    callsBg,
      iconColor: callsColor,
      loading,
    },
    {
      label:     isS2s ? 'Avg STS latency' : 'Avg response latency',
      value:     d.avgLatency ? `${Math.round(d.avgLatency.avg_llm_ttfb_ms)}ms` : 'N/A',
      sub:       'TTFB p50',
      subType:   'neutral',
      icon:      MdOutlineAccessTime,
      iconBg:    latBg,
      iconColor: latColor,
      loading,
    },
    {
      label:     isS2s ? 'STS interruption rate' : 'Interruption rate',
      value:     d.interruptionRate ? `${d.interruptionRate.interruption_rate.toFixed(1)}%` : 'N/A',
      sub:       d.interruptionRate ? `${d.interruptionRate.failed_calls} interrupted calls` : '—',
      subType:   'neutral',
      icon:      MdOutlinePause,
      iconBg:    agentBg,
      iconColor: agentColor,
      loading,
    },
  ]
}

// ── Page ──────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [pipelineData,    setPipelineData]    = useState<KindData>(EMPTY)
  const [pipelineLoading, setPipelineLoading] = useState(true)

  const [s2sData,    setS2sData]    = useState<KindData>(EMPTY)
  const [s2sLoading, setS2sLoading] = useState(true)

  useEffect(() => {
    // Fetch pipeline and s2s in parallel; each kind resolves together
    Promise.allSettled([
      fetchDashboardAgentStatus('pipeline'),
      fetchDashboardCallsToday('pipeline'),
      fetchDashboardInterruptionRate('pipeline'),
      fetchDashboardAvgLlmLatency('pipeline'),
    ]).then(([agentStatus, callsToday, interruptionRate, avgLatency]) => {
      setPipelineData({
        agentStatus:      agentStatus.status      === 'fulfilled' ? agentStatus.value      : null,
        callsToday:       callsToday.status       === 'fulfilled' ? callsToday.value       : null,
        interruptionRate: interruptionRate.status === 'fulfilled' ? interruptionRate.value : null,
        avgLatency:       avgLatency.status       === 'fulfilled' ? avgLatency.value       : null,
      })
      setPipelineLoading(false)
    })

    Promise.allSettled([
      fetchDashboardAgentStatus('s2s'),
      fetchDashboardCallsToday('s2s'),
      fetchDashboardInterruptionRate('s2s'),
      fetchDashboardAvgLlmLatency('s2s'),
    ]).then(([agentStatus, callsToday, interruptionRate, avgLatency]) => {
      setS2sData({
        agentStatus:      agentStatus.status      === 'fulfilled' ? agentStatus.value      : null,
        callsToday:       callsToday.status       === 'fulfilled' ? callsToday.value       : null,
        interruptionRate: interruptionRate.status === 'fulfilled' ? interruptionRate.value : null,
        avgLatency:       avgLatency.status       === 'fulfilled' ? avgLatency.value       : null,
      })
      setS2sLoading(false)
    })
  }, [])

  const pipelineCards = buildCards(pipelineData, pipelineLoading, false)
  const s2sCards      = buildCards(s2sData,      s2sLoading,      true)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">

      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <DashboardHeader />
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-3 pt-5 space-y-6">

          <StatsRow title="Agents" stats={pipelineCards} />

          <StatsRow title="STS Agents" stats={s2sCards} />

          <LiveCallsSection />

          <AgentsGrid />

        </div>
      </main>

    </div>
  )
}

export default Dashboard
