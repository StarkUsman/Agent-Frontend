import StatCard, { type StatCardProps } from './StatCard'
import { MdOutlineSmartToy, MdOutlineAccessTime, MdOutlinePause } from 'react-icons/md'
import { BiPhoneCall } from 'react-icons/bi'

// ── Mock data ──────────────────────────────────────────────────────────────
// Replace with real API data later
const STATS: StatCardProps[] = [
  {
    label: 'Active agents',
    value: '4',
    sub: '2 on calls right now',
    subType: 'positive',
    icon: MdOutlineSmartToy,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    label: 'Calls today',
    value: '184',
    sub: '↑ 12% vs yesterday',
    subType: 'positive',
    icon: BiPhoneCall,
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    label: 'Avg response latency',
    value: '780ms',
    sub: 'TTFB p50',
    subType: 'neutral',
    icon: MdOutlineAccessTime,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
  },
  {
    label: 'Interruption rate',
    value: '12%',
    sub: 'Caller spoke over agent',
    subType: 'neutral',
    icon: MdOutlinePause,
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
]

// ── Component ──────────────────────────────────────────────────────────────
const StatsRow = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}

export default StatsRow
