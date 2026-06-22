import { useEffect, useRef, useState } from 'react'
import { MdExpandMore, MdCheck } from 'react-icons/md'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  /** When true, a typed value that matches no option is still accepted (free-text). */
  allowCustom?: boolean
  disabled?: boolean
  className?: string
}

const baseInputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm ' +
  'text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition'

// Small controlled combobox: a filter input + a filtered dropdown list. No
// external dependency — the project ships only the non-searchable Radix Select.
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  allowCustom = false,
  disabled = false,
  className = '',
}: Props) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement | null>(null)

  const selected = options.find((o) => o.value === value)
  // Closed: show the chosen label (or raw custom value). Open: show what's typed.
  const display = open ? query : selected?.label ?? value

  // Close on outside click.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options

  const commit = (v: string) => {
    onChange(v)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={display}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => { if (!disabled) { setOpen(true); setQuery('') } }}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            if (allowCustom) onChange(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered.length > 0) commit(filtered[0].value)
              else if (allowCustom) commit(query)
            } else if (e.key === 'Escape') {
              setOpen(false)
              setQuery('')
            }
          }}
          className={`${baseInputClass} pr-9 ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-text'}`}
        />
        <MdExpandMore
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg py-1">
          {filtered.length === 0 && (
            <div className="px-3.5 py-2 text-xs text-slate-400 dark:text-slate-500">
              {allowCustom ? 'Press Enter to use this value' : 'No matches'}
            </div>
          )}
          {filtered.map((o) => (
            <button
              key={o.value}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); commit(o.value) }}
              className={`flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm transition-colors cursor-pointer
                ${o.value === value
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <span className="truncate">{o.label}</span>
              {o.value === value && <MdCheck className="shrink-0 text-indigo-500 dark:text-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
