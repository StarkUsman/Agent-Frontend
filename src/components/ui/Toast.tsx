import { useEffect, useRef, useState } from 'react'
import {
  MdCheck,
  MdClose,
  MdErrorOutline,
  MdInfoOutline,
  MdWarningAmber,
} from 'react-icons/md'

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  title:    string
  message?: string
  type?:    ToastType
  duration?: number
}

interface ToastItem {
  id:       string
  title:    string
  message:  string
  type:     ToastType
  duration: number
}

// ── Module-level store (works across the entire app without a context) ────────

let _counter = 0
const _listeners = new Set<(items: ToastItem[]) => void>()
let _items: ToastItem[] = []

function _emit() {
  _listeners.forEach((fn) => fn([..._items]))
}

// ── Public API ────────────────────────────────────────────────────────────────

function _push(opts: ToastOptions) {
  const item: ToastItem = {
    id:       (_counter++).toString(),
    title:    opts.title,
    message:  opts.message ?? '',
    type:     opts.type    ?? 'info',
    duration: opts.duration ?? 4000,
  }
  _items = [..._items, item]
  _emit()
  setTimeout(() => {
    _items = _items.filter((t) => t.id !== item.id)
    _emit()
  }, item.duration + 350) // +350 for exit animation
}

export const showToast = Object.assign(
  (opts: ToastOptions | string, type: ToastType = 'info') =>
    _push(typeof opts === 'string' ? { title: opts, type } : { type: 'info', ...opts }),
  {
    success: (title: string, message?: string) => _push({ title, message, type: 'success' }),
    error:   (title: string, message?: string) => _push({ title, message, type: 'error' }),
    warning: (title: string, message?: string) => _push({ title, message, type: 'warning' }),
    info:    (title: string, message?: string) => _push({ title, message, type: 'info' }),
  },
)

// ── Per-toast visuals ─────────────────────────────────────────────────────────

const CONFIG: Record<ToastType, { icon: React.ReactNode; accent: string; iconBg: string; bar: string }> = {
  success: {
    icon:   <MdCheck className="text-base" />,
    accent: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    bar:    'bg-emerald-500',
  },
  error: {
    icon:   <MdErrorOutline className="text-base" />,
    accent: 'border-l-red-500',
    iconBg: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    bar:    'bg-red-500',
  },
  warning: {
    icon:   <MdWarningAmber className="text-base" />,
    accent: 'border-l-amber-500',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    bar:    'bg-amber-500',
  },
  info: {
    icon:   <MdInfoOutline className="text-base" />,
    accent: 'border-l-indigo-500',
    iconBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    bar:    'bg-indigo-500',
  },
}

// ── Individual toast card ─────────────────────────────────────────────────────

interface CardProps {
  toast:     ToastItem
  onDismiss: (id: string) => void
}

const ToastCard = ({ toast, onDismiss }: CardProps) => {
  const { title, message, type, duration } = toast
  const cfg = CONFIG[type]

  const [visible,   setVisible]   = useState(false)
  const [barWidth,  setBarWidth]  = useState(100)
  const rafRef = useRef<number>(0)

  // Enter animation
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Progress bar
  useEffect(() => {
    const start = performance.now()
    const tick  = (now: number) => {
      const pct = Math.max(0, 100 - ((now - start) / duration) * 100)
      setBarWidth(pct)
      if (pct > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [duration])

  const dismiss = () => {
    setVisible(false)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      className={`
        relative w-80 overflow-hidden rounded-xl border-l-4 shadow-lg
        bg-white dark:bg-slate-800
        border border-slate-100 dark:border-slate-700
        transition-all duration-300 ease-out
        ${cfg.accent}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Body */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}>
          {cfg.icon}
        </span>

        {/* Text */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{title}</p>
          {message && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          )}
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="shrink-0 mt-0.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <MdClose className="text-base" />
        </button>
      </div>

      {/* Progress bar */}
      <div
        className={`h-0.5 ${cfg.bar} transition-none`}
        style={{ width: `${barWidth}%` }}
      />
    </div>
  )
}

// ── Container — mount once in App.tsx ─────────────────────────────────────────

export default function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    _listeners.add(setItems)
    return () => { _listeners.delete(setItems) }
  }, [])

  const dismiss = (id: string) => {
    _items = _items.filter((t) => t.id !== id)
    _emit()
  }

  if (items.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3"
      aria-live="polite"
    >
      {items.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastCard toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}
