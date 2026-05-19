// ── Types ──────────────────────────────────────────────────────────────────
export interface StatCardProps {
  label: string
  value: string
  sub: string
  subType: 'positive' | 'neutral'
  icon: React.ElementType
  iconBg: string
  iconColor: string
}

// ── Component ──────────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  subType,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">

      {/* Top row: label + icon */}
      <div className="flex items-start justify-between mb-5">
        <span className="text-sm text-slate-500 font-medium leading-snug">
          {label}
        </span>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="text-xl" style={{ color: iconColor }} />
        </div>
      </div>

      {/* Value */}
      <p className="text-[2rem] font-bold text-slate-900 leading-none mb-2">
        {value}
      </p>

      {/* Sub text */}
      <p
        className={`text-xs font-medium ${
          subType === 'positive' ? 'text-emerald-500' : 'text-slate-400'
        }`}
      >
        {sub}
      </p>

    </div>
  )
}

export default StatCard
