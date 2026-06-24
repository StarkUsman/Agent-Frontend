import StatCard, { type StatCardProps } from './StatCard'
import { MdOutlineSmartToy, MdOutlineAccessTime, MdOutlinePause } from 'react-icons/md'
import { BiPhoneCall } from 'react-icons/bi'

// ── Dummy data ─────────────────────────────────────────────────────────────

export const AGENT_STATS: StatCardProps[] = [
  {
    label:     'Active agents',
    value:     '4',
    sub:       '2 on calls right now',
    subType:   'positive',
    icon:      MdOutlineSmartToy,
    iconBg:    '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label:     'Calls today',
    value:     '184',
    sub:       '↑ 12% vs yesterday',
    subType:   'positive',
    icon:      BiPhoneCall,
    iconBg:    '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    label:     'Avg response latency',
    value:     '780ms',
    sub:       'TTFB p50',
    subType:   'neutral',
    icon:      MdOutlineAccessTime,
    iconBg:    '#e0f2fe',
    iconColor: '#0284c7',
  },
  {
    label:     'Interruption rate',
    value:     '12%',
    sub:       'Caller spoke over agent',
    subType:   'neutral',
    icon:      MdOutlinePause,
    iconBg:    '#ede9fe',
    iconColor: '#7c3aed',
  },
]

export const STS_AGENT_STATS: StatCardProps[] = [
  {
    label:     'Active STS agents',
    value:     '2',
    sub:       '1 on calls right now',
    subType:   'positive',
    icon:      MdOutlineSmartToy,
    iconBg:    '#d1fae5',
    iconColor: '#059669',
  },
  {
    label:     'STS calls today',
    value:     '76',
    sub:       '↑ 8% vs yesterday',
    subType:   'positive',
    icon:      BiPhoneCall,
    iconBg:    '#d1fae5',
    iconColor: '#059669',
  },
  {
    label:     'Avg STS latency',
    value:     '540ms',
    sub:       'TTFB p50',
    subType:   'neutral',
    icon:      MdOutlineAccessTime,
    iconBg:    '#d1fae5',
    iconColor: '#059669',
  },
  {
    label:     'STS interruption rate',
    value:     '9%',
    sub:       'Caller spoke over agent',
    subType:   'neutral',
    icon:      MdOutlinePause,
    iconBg:    '#d1fae5',
    iconColor: '#059669',
  },
]

// ── Component ──────────────────────────────────────────────────────────────

interface StatsRowProps {
  title: string
  stats: StatCardProps[]
}

const StatsRow = ({ title, stats }: StatsRowProps) => (
  <div>
    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
      {title}
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  </div>
)

export default StatsRow
