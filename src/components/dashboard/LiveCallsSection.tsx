import { useEffect, useState } from 'react'
import LiveCallRow, { type LiveCallRowProps } from './LiveCallRow'

// ── Mock data ──────────────────────────────────────────────────────────────
// Replace with real API data later
const INITIAL_CALLS: LiveCallRowProps[] = [
  {
    id: 1,
    agent: 'Customer support',
    detail: 'Billing query · +44 7700 900142',
    elapsed: '1m 24s',
    turns: 6,
  },
  {
    id: 2,
    agent: 'Sales assistant',
    detail: 'New enquiry · +44 7911 123456',
    elapsed: '0m 47s',
    turns: 3,
  },
]

// ── Helper: parse "Xm Ys" → total seconds ─────────────────────────────────
const toSeconds = (elapsed: string): number => {
  const [m, s] = elapsed.replace('s', '').split('m ').map(Number)
  return m * 60 + s
}

// ── Helper: total seconds → "Xm Ys" ──────────────────────────────────────
const toElapsed = (secs: number): string => {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

// ── Component ──────────────────────────────────────────────────────────────
const LiveCallsSection = () => {
  const [calls, setCalls] = useState<LiveCallRowProps[]>(INITIAL_CALLS)

  // Tick elapsed time every second to simulate live updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCalls((prev) =>
        prev.map((call) => ({
          ...call,
          elapsed: toElapsed(toSeconds(call.elapsed) + 1),
        }))
      )
    }, 1000)

    return () => clearInterval(timer) // cleanup on unmount
  }, [])

  return (
    <section>

      {/* Section header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Agents on calls now</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Live activity — updates every 10 seconds
          </p>
        </div>

        {/* Pulsing live indicator */}
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-emerald-500">Live</span>
        </div>
      </div>

      {/* Calls card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {calls.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400 dark:text-slate-500">No active calls right now</p>
          </div>
        ) : (
          calls.map((call, index) => (
            <div key={call.id}>
              <LiveCallRow {...call} />
              {/* Divider between rows (not after the last one) */}
              {index < calls.length - 1 && (
                <div className="h-px bg-slate-50 dark:bg-slate-700 mx-5" />
              )}
            </div>
          ))
        )}
      </div>

    </section>
  )
}

export default LiveCallsSection
