import { useEffect, useState } from 'react'
import { MdOutlineAccessTime, MdOutlinePause, MdOutlineSyncAlt } from 'react-icons/md'
import { BiPhoneCall } from 'react-icons/bi'
import Sidebar from '../components/dashboard/Sidebar'
import StatCard, { type StatCardProps } from '../components/dashboard/StatCard'
import CallsBarChart from '../components/reports/CallsBarChart'
import {
  fetchWeeklyTotalCalls,
  fetchWeeklyAvgLlmLatency,
  fetchWeeklyInterruptionRate,
  fetchWeeklyAvgTtsLatency,
  fetchWeeklyUsageTotals,
  fetchWeeklyConversationQuality,
  fetchWeeklyCallsByAgent,
  type WeeklyUsageTotalsResponse,
  type WeeklyConversationQualityResponse,
  type WeeklyCallsByAgentItem,
} from '../api/reports'

// ── Static base data ──────────────────────────────────────────────────────────

const STAT_CARD_BASE: StatCardProps[] = [
  {
    label:     'Total calls this week',
    value:     '',
    sub:       'Across all agents',
    subType:   'neutral',
    icon:      BiPhoneCall,
    iconBg:    '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label:     'Avg TTFB (LLM)',
    value:     '',
    sub:       'avg first token latency',
    subType:   'positive',
    icon:      MdOutlineAccessTime,
    iconBg:    '#e0f2fe',
    iconColor: '#0284c7',
  },
  {
    label:     'Interruption rate',
    value:     '',
    sub:       'interrupted calls',
    subType:   'neutral',
    icon:      MdOutlinePause,
    iconBg:    '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label:     'Transferred',
    value:     '4.1%',
    sub:       '53 calls',
    subType:   'indigo',
    icon:      MdOutlineSyncAlt,
    iconBg:    '#ede9fe',
    iconColor: '#6366f1',
  },
]

const STT_LATENCY = {
  label:   'Voice recognition (STT)',
  sub:     'Deepgram nova-3',
  value:   '118ms',
  color:   '#10b981',
  loading: false,
}

const OUTCOMES = [
  { label: 'Resolved by agent',      value: '94.2%', dot: '#10b981', text: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Transferred to person',  value: '4.1%',  dot: '#f97316', text: 'text-amber-500' },
  { label: 'Call dropped or failed', value: '1.7%',  dot: '#ef4444', text: 'text-red-500'   },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

const fmtDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

// Inline shimmer used for row-level value cells
const ValueSkeleton = () => (
  <div className="h-3.5 w-14 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
)

// ── Page ──────────────────────────────────────────────────────────────────────

const ReportsPage = () => {
  const [totalCalls,        setTotalCalls]        = useState<number | null>(null)
  const [totalCallsLoading, setTotalCallsLoading] = useState(true)

  const [avgLlmTtfb,        setAvgLlmTtfb]        = useState<number | null>(null)
  const [avgLlmTtfbLoading, setAvgLlmTtfbLoading] = useState(true)

  const [interruptionRate,        setInterruptionRate]        = useState<number | null>(null)
  const [interruptionRateLoading, setInterruptionRateLoading] = useState(true)

  const [avgTtsTtfb,        setAvgTtsTtfb]        = useState<number | null>(null)
  const [avgTtsTtfbLoading, setAvgTtsTtfbLoading] = useState(true)

  const [usageTotals,        setUsageTotals]        = useState<WeeklyUsageTotalsResponse | null>(null)
  const [usageTotalsLoading, setUsageTotalsLoading] = useState(true)

  const [convQuality,        setConvQuality]        = useState<WeeklyConversationQualityResponse | null>(null)
  const [convQualityLoading, setConvQualityLoading] = useState(true)

  const [agentCalls,        setAgentCalls]        = useState<WeeklyCallsByAgentItem[]>([])
  const [agentCallsLoading, setAgentCallsLoading] = useState(true)

  useEffect(() => {
    fetchWeeklyTotalCalls()
      .then((res) => setTotalCalls(res.total))
      .catch(() => setTotalCalls(null))
      .finally(() => setTotalCallsLoading(false))

    fetchWeeklyAvgLlmLatency()
      .then((res) => setAvgLlmTtfb(res.avg_llm_ttfb_ms))
      .catch(() => setAvgLlmTtfb(null))
      .finally(() => setAvgLlmTtfbLoading(false))

    fetchWeeklyInterruptionRate()
      .then((res) => setInterruptionRate(res.interruption_rate))
      .catch(() => setInterruptionRate(null))
      .finally(() => setInterruptionRateLoading(false))

    fetchWeeklyAvgTtsLatency()
      .then((res) => setAvgTtsTtfb(res.avg_tts_ttfb_ms))
      .catch(() => setAvgTtsTtfb(null))
      .finally(() => setAvgTtsTtfbLoading(false))

    fetchWeeklyUsageTotals()
      .then(setUsageTotals)
      .catch(() => setUsageTotals(null))
      .finally(() => setUsageTotalsLoading(false))

    fetchWeeklyConversationQuality()
      .then(setConvQuality)
      .catch(() => setConvQuality(null))
      .finally(() => setConvQualityLoading(false))

    fetchWeeklyCallsByAgent()
      .then((res) => setAgentCalls(res.agents))
      .catch(() => setAgentCalls([]))
      .finally(() => setAgentCallsLoading(false))
  }, [])

  // ── Derived data ────────────────────────────────────────────────────────────

  const statCards: StatCardProps[] = STAT_CARD_BASE.map((s, i) => {
    if (i === 0) return { ...s, value: totalCalls !== null ? totalCalls.toLocaleString() : 'N/A', loading: totalCallsLoading }
    if (i === 1) return { ...s, value: avgLlmTtfb !== null ? `${Math.round(avgLlmTtfb)}ms` : 'N/A', loading: avgLlmTtfbLoading }
    if (i === 2) return { ...s, value: interruptionRate !== null ? `${interruptionRate.toFixed(1)}%` : 'N/A', loading: interruptionRateLoading }
    return s
  })

  const latencyServices = [
    STT_LATENCY,
    {
      label:   'AI brain (LLM)',
      sub:     'avg first token latency',
      color:   '#6366f1',
      value:   avgLlmTtfb !== null ? `${Math.round(avgLlmTtfb)}ms` : 'N/A',
      loading: avgLlmTtfbLoading,
    },
    {
      label:   'Voice output (TTS)',
      sub:     'avg first audio byte',
      color:   '#f97316',
      value:   avgTtsTtfb !== null ? `${Math.round(avgTtsTtfb)}ms` : 'N/A',
      loading: avgTtsTtfbLoading,
    },
  ]

  const fmt = (n: number | undefined) => n !== undefined ? fmtCount(n) : 'N/A'

  const apiUsage = [
    { label: 'LLM prompt tokens',     value: fmt(usageTotals?.total_prompt_tokens),    color: '#6366f1' },
    { label: 'LLM completion tokens', value: fmt(usageTotals?.total_completion_tokens), color: '#6366f1' },
    { label: 'TTS characters',        value: fmt(usageTotals?.total_tts_characters),    color: '#f97316' },
  ]

  const q = convQuality
  const qualityMetrics = [
    { label: 'Avg turns per call',          value: q ? q.avg_turns_per_call.toFixed(1)                    : 'N/A', color: 'text-slate-800 dark:text-slate-200' },
    { label: 'Calls with interruptions',    value: q ? `${q.calls_with_interruptions_pct.toFixed(1)}%`    : 'N/A', color: 'text-amber-500' },
    { label: 'Calls with 0 interruptions',  value: q ? `${q.calls_without_interruptions_pct.toFixed(1)}%` : 'N/A', color: 'text-emerald-500' },
    { label: 'Avg call duration',           value: q ? fmtDuration(q.avg_call_duration_seconds)           : 'N/A', color: 'text-slate-800 dark:text-slate-200' },
  ]

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar */}
        <div className="px-8 pt-5 pb-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Performance and usage data from pipecat metrics.
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-6 space-y-5">

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* ── Calls per day bar chart ── */}
          <CallsBarChart />

          {/* ── Response latency per service ── */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Response latency per service
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                TTFB — pipecat TTFBMetricsData · this week averages
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latencyServices.map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700"
                >
                  {s.loading ? (
                    <div className="h-8 w-20 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-bold mb-1" style={{ color: s.color }}>
                      {s.value}
                    </p>
                  )}
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.label}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom 2-col grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left column */}
            <div className="space-y-6">

              {/* API usage */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">API usage this week</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    LLMUsageMetricsData + TTSUsageMetricsData
                  </p>
                </div>
                <div className="space-y-4">
                  {apiUsage.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{row.label}</span>
                      {usageTotalsLoading ? (
                        <ValueSkeleton />
                      ) : (
                        <span className="text-sm font-bold" style={{ color: row.color }}>
                          {row.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-5 leading-relaxed">
                  Usage affects your Anthropic, OpenAI, and ElevenLabs bills directly.
                </p>
              </div>

              {/* Calls by agent */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Calls by agent</h2>
                {agentCallsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          <div className="h-3 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </div>
                        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : agentCalls.length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500">No data for this period.</p>
                ) : (
                  <div className="space-y-4">
                    {(() => {
                      const max = Math.max(...agentCalls.map((a) => a.total_calls))
                      return agentCalls.map((a) => (
                        <div key={`${a.agent_id}-${a.agent_name}`}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{a.agent_name}</span>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{a.total_calls}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${(a.total_calls / max) * 100}%`, backgroundColor: '#6366f1' }}
                            />
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                )}
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-6">

              {/* Conversation quality */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Conversation quality</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    TurnTrackingObserver — this week
                  </p>
                </div>
                <div className="space-y-4">
                  {qualityMetrics.map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{m.label}</span>
                      {convQualityLoading ? (
                        <ValueSkeleton />
                      ) : (
                        <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Call outcomes */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-5">Call outcomes</h2>
                <div className="space-y-4">
                  {OUTCOMES.map((o) => (
                    <div key={o.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.dot }} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">{o.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${o.text}`}>{o.value}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default ReportsPage
