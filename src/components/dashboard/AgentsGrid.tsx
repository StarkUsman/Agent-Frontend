import AgentCard, { type AgentCardProps } from './AgentCard'

// ── Mock data ──────────────────────────────────────────────────────────────
// Replace values with real API data later
const AGENTS: AgentCardProps[] = [
  {
    id: 1,
    name: 'Customer support',
    status: 'Active',
    description: 'Helps callers with billing questions and account issues.',
    callsToday: 584,
    avgTtfb: '720ms',
    nodes: 4,
  },
  {
    id: 2,
    name: 'Sales assistant',
    status: 'Active',
    description: 'Qualifies new leads before connecting to a sales rep.',
    callsToday: 312,
    avgTtfb: '840ms',
    nodes: 6,
  },
  {
    id: 3,
    name: 'Appointment booking',
    status: 'Active',
    description: 'Books and reschedules appointments automatically.',
    callsToday: 241,
    avgTtfb: '680ms',
    nodes: 5,
  },
  {
    id: 4,
    name: 'IT helpdesk',
    status: 'Inactive',
    description: 'Handles common IT questions and password resets.',
    callsToday: 147,
    avgTtfb: '410ms',
    nodes: 3,
  },
]

// ── Component ──────────────────────────────────────────────────────────────
const AgentsGrid = () => {
  return (
    <section>

      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Your agents</h2>
        <a
          href="#"
          className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline transition-colors"
        >
          View all →
        </a>
      </div>

      {/* 2-column responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AGENTS.map((agent) => (
          <AgentCard key={agent.id} {...agent} />
        ))}
      </div>

    </section>
  )
}

export default AgentsGrid
