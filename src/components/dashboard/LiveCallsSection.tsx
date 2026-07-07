import { useEffect, useState } from 'react'
import LiveCallRow, { type LiveCallRowProps } from './LiveCallRow'
import { fetchCalls } from '../../api/calls'

// ── Live call model (elapsed is derived from started_at on each tick) ────────
interface LiveCall {
  id: number
  agent: string
  detail: string
  turns: number
  startedAtMs: number
}

// ── Helper: total seconds → "Xm YYs" ────────────────────────────────────────
const toElapsed = (secs: number): string => {
  const s = Math.max(0, secs)
  const m = Math.floor(s / 60)
  return `${m}m ${(s % 60).toString().padStart(2, '0')}s`
}

// ── Component ──────────────────────────────────────────────────────────────
const LiveCallsSection = () => {
  const [calls, setCalls] = useState<LiveCall[]>([])
  const [now, setNow]     = useState(() => Date.now())

  // Poll for live ('onCall') calls every 5s. pipecat-flows writes an 'onCall'
  // row when a client connects and flips it to 'completed'/'failed' at end.
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await fetchCalls({ page: 1, limit: 50, status: 'onCall' })
        if (!active) return
        setCalls(res.data.map((c) => ({
          id:          Number(c.call_id),
          agent:       c.agent_name,
          detail:      c.last_node ? `Node: ${c.last_node}` : `Agent ${c.agent_id}`,
          turns:       c.turns ?? 0,
          startedAtMs: new Date(c.started_at).getTime(),
        })))
      } catch {
        // Keep the last-known list on a transient error.
      }
    }
    load()
    const poll = setInterval(load, 5000)
    return () => { active = false; clearInterval(poll) }
  }, [])

  // Tick every second so the elapsed counter climbs smoothly between polls.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const rows: LiveCallRowProps[] = calls.map((c) => ({
    id:      c.id,
    agent:   c.agent,
    detail:  c.detail,
    turns:   c.turns,
    elapsed: toElapsed(Math.floor((now - c.startedAtMs) / 1000)),
  }))

  return (
    <section>

      {/* Section header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Agents on calls now</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Live activity — updates every 5 seconds
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
        {rows.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-400 dark:text-slate-500">No active calls right now</p>
          </div>
        ) : (
          rows.map((call, index) => (
            <div key={call.id}>
              <LiveCallRow {...call} />
              {/* Divider between rows (not after the last one) */}
              {index < rows.length - 1 && (
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
