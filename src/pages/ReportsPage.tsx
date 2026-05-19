import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineAccessTime, MdOutlinePause, MdOutlineSyncAlt } from 'react-icons/md'
import { BiPhoneCall } from 'react-icons/bi'
import Sidebar from '../components/dashboard/Sidebar'
import StatCard, { type StatCardProps } from '../components/dashboard/StatCard'
import CallsBarChart from '../components/reports/CallsBarChart'

// ════════════════════════════════════════════
// Mock data
// ════════════════════════════════════════════

const REPORT_STATS: StatCardProps[] = [
  {
    label: 'Total calls this week',
    value: '1,099',
    sub: 'Across all agents',
    subType: 'neutral',
    icon: BiPhoneCall,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label: 'Avg TTFB (user→bot)',
    value: '780ms',
    sub: 'p50',
    subType: 'positive',
    icon: MdOutlineAccessTime,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
  },
  {
    label: 'Interruption rate',
    value: '12%',
    sub: 'was_interrupted',
    subType: 'neutral',
    icon: MdOutlinePause,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label: 'Transferred',
    value: '4.1%',
    sub: '53 calls',
    subType: 'indigo',
    icon: MdOutlineSyncAlt,
    iconBg: '#ede9fe',
    iconColor: '#6366f1',
  },
]

const LATENCY_SERVICES = [
  { value: '118ms', label: 'Voice recognition (STT)', sub: 'Deepgram nova-3',              color: '#10b981' },
  { value: '382ms', label: 'AI brain (LLM)',          sub: 'Claude 3.5 Sonnet first token', color: '#6366f1' },
  { value: '162ms', label: 'Voice output (TTS)',      sub: 'ElevenLabs first audio byte',   color: '#f97316' },
]

const API_USAGE = [
  { label: 'LLM prompt tokens',      value: '3.4M', color: '#6366f1' },
  { label: 'LLM completion tokens',  value: '1.6M', color: '#6366f1' },
  { label: 'TTS characters',         value: '8.2M', color: '#f97316' },
]

const AGENT_CALLS = [
  { name: 'Customer support',    calls: 584 },
  { name: 'Sales assistant',     calls: 312 },
  { name: 'Appointment booking', calls: 241 },
  { name: 'IT helpdesk',         calls: 147 },
]
const MAX_AGENT_CALLS = Math.max(...AGENT_CALLS.map((a) => a.calls))

const QUALITY_METRICS = [
  { label: 'Avg turns per call',        value: '7.4',    color: 'text-slate-800' },
  { label: 'Calls with interruptions',  value: '12%',    color: 'text-amber-500' },
  { label: 'Calls with 0 interruptions',value: '88%',    color: 'text-emerald-500' },
  { label: 'Avg call duration',         value: '2m 14s', color: 'text-slate-800' },
]

const OUTCOMES = [
  { label: 'Resolved by agent',     value: '94.2%', dot: '#10b981', text: 'text-emerald-600' },
  { label: 'Transferred to person', value: '4.1%',  dot: '#f97316', text: 'text-amber-500'   },
  { label: 'Call dropped or failed',value: '1.7%',  dot: '#ef4444', text: 'text-red-500'     },
]

// ════════════════════════════════════════════
// Page
// ════════════════════════════════════════════
const ReportsPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) navigate('/', { replace: true })
  }, [navigate])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Sticky top bar — never scrolls */}
        <div className="px-8 pt-5 pb-4 bg-slate-50 border-b border-slate-100 shrink-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Performance and usage data from pipecat metrics.
          </p>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-8 pt-5 pb-6 space-y-5">

          {/* ── Section 1: Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {REPORT_STATS.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* ── Section 2: Calls per day bar chart ── */}
          <CallsBarChart />

          {/* ── Section 3: Response latency per service ── */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-slate-900">
                Response latency per service
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                TTFB — pipecat TTFBMetricsData · this week averages
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {LATENCY_SERVICES.map((s) => (
                <div
                  key={s.label}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                >
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{s.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 4: Bottom 2-col grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left column */}
            <div className="space-y-6">

              {/* API usage */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900">API usage this week</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    LLMUsageMetricsData + TTSUsageMetricsData
                  </p>
                </div>
                <div className="space-y-4">
                  {API_USAGE.map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{row.label}</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: row.color }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-5 leading-relaxed">
                  Usage affects your Anthropic, OpenAI, and ElevenLabs bills directly.
                </p>
              </div>

              {/* Calls by agent */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-5">Calls by agent</h2>
                <div className="space-y-4">
                  {AGENT_CALLS.map(({ name, calls }) => (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-slate-600">{name}</span>
                        <span className="text-sm font-semibold text-slate-700">{calls}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(calls / MAX_AGENT_CALLS) * 100}%`,
                            backgroundColor: '#6366f1',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right column */}
            <div className="space-y-6">

              {/* Conversation quality */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-base font-bold text-slate-900">Conversation quality</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    TurnTrackingObserver — this week
                  </p>
                </div>
                <div className="space-y-4">
                  {QUALITY_METRICS.map((m) => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">{m.label}</span>
                      <span className={`text-sm font-bold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call outcomes */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-5">Call outcomes</h2>
                <div className="space-y-4">
                  {OUTCOMES.map((o) => (
                    <div key={o.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: o.dot }}
                        />
                        <span className="text-sm text-slate-600">{o.label}</span>
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
