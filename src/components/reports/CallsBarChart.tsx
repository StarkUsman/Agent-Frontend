import { useEffect, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { fetchWeeklyByDay, type WeeklyByDayItem } from '../../api/reports'

const BAR_HEIGHT = 140 // px

const abbrev = (day: string) => day.slice(0, 3)

const CallsBarChart = () => {
  const { theme } = useTheme()
  const barDefault = theme === 'dark' ? '#3730a3' : '#c7d2fe'

  const [data,    setData]    = useState<WeeklyByDayItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetchWeeklyByDay()
      .then((res) => {
        // API returns newest-first; reverse so oldest is on the left, today on the right.
        setData([...res].reverse())
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1
  // Avoid division by zero when all counts are 0
  const scale = maxCount > 0 ? maxCount : 1

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Calls per day</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">This week</p>
      </div>

      {loading ? (
        /* Skeleton */
        <div style={{ height: `${BAR_HEIGHT + 40}px` }} className="flex items-end gap-2 px-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-slate-100 dark:bg-slate-700 animate-pulse"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 py-10 text-center">{error}</p>
      ) : (
        <>
          {/* Count labels above bars */}
          <div className="flex items-end gap-2 mb-1 px-1">
            {data.map((d) => (
              <div key={d.date} className="flex-1 text-center">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {d.count > 0 ? d.count : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className="flex items-end gap-2 px-1" style={{ height: `${BAR_HEIGHT}px` }}>
            {data.map((d) => (
              <div
                key={d.date}
                className="flex-1 rounded-t-md transition-all hover:opacity-80"
                style={{
                  // Give 0-count bars a visible 2px stub so the axis isn't empty
                  height: d.count > 0 ? `${(d.count / scale) * 100}%` : '2px',
                  backgroundColor: d.today ? '#6366f1' : barDefault,
                }}
              />
            ))}
          </div>

          {/* Day labels */}
          <div className="flex items-center gap-2 mt-2 px-1">
            {data.map((d) => (
              <div key={d.date} className="flex-1 text-center">
                <span
                  className={`text-xs font-medium ${
                    d.today
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {d.today ? 'Today' : abbrev(d.day)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default CallsBarChart
