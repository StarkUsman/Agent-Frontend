import { useTheme } from '../../contexts/ThemeContext'

// ── Types ──────────────────────────────────────────────────────────────────
interface BarData {
  day: string
  value: number
  isToday?: boolean
}

const BAR_DATA: BarData[] = [
  { day: 'Mon', value: 120 },
  { day: 'Tue', value: 145 },
  { day: 'Wed', value: 98 },
  { day: 'Thu', value: 167 },
  { day: 'Fri', value: 184 },
  { day: 'Sat', value: 201 },
  { day: 'Sun', value: 184, isToday: true },
]

const MAX_VALUE  = Math.max(...BAR_DATA.map((b) => b.value))
const BAR_HEIGHT = 140 // px — height of the bar area

// ── Component ──────────────────────────────────────────────────────────────
const CallsBarChart = () => {
  const { theme } = useTheme()
  const barDefault = theme === 'dark' ? '#3730a3' : '#c7d2fe'

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">

      {/* Section title */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Calls per day</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">This week</p>
      </div>

      {/* Value labels row — sits above bars */}
      <div className="flex items-end gap-2 mb-1 px-1">
        {BAR_DATA.map(({ day, value }) => (
          <div key={day} className="flex-1 text-center">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{value}</span>
          </div>
        ))}
      </div>

      {/* Bars — aligned to bottom */}
      <div
        className="flex items-end gap-2 px-1"
        style={{ height: `${BAR_HEIGHT}px` }}
      >
        {BAR_DATA.map(({ day, value, isToday }) => (
          <div
            key={day}
            className="flex-1 rounded-t-md transition-all hover:opacity-80"
            style={{
              height: `${(value / MAX_VALUE) * 100}%`,
              backgroundColor: isToday ? '#6366f1' : barDefault,
            }}
          />
        ))}
      </div>

      {/* Day labels row */}
      <div className="flex items-center gap-2 mt-2 px-1">
        {BAR_DATA.map(({ day, isToday }) => (
          <div key={day} className="flex-1 text-center">
            <span
              className={`text-xs font-medium ${
                isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {day}
            </span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default CallsBarChart
