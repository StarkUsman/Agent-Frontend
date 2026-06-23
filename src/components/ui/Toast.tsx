import { createPortal } from 'react-dom'
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
  title:     string
  message?:  string
  type?:     ToastType
  duration?: number
}

interface ToastItem {
  id:       string
  title:    string
  message:  string
  type:     ToastType
  duration: number
}

// ── Module-level store (no React context needed) ──────────────────────────────

let _counter = 0
const _listeners = new Set<(items: ToastItem[]) => void>()
let _items: ToastItem[] = []

function _emit() {
  _listeners.forEach((fn) => fn([..._items]))
}

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
  }, item.duration + 400)
}

// ── Public API ────────────────────────────────────────────────────────────────

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

// ── Visual config per type ────────────────────────────────────────────────────

const CONFIG = {
  success: {
    icon:        <MdCheck className="text-base" />,
    borderColor: '#10b981',
    iconClass:   'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    barColor:    '#10b981',
  },
  error: {
    icon:        <MdErrorOutline className="text-base" />,
    borderColor: '#ef4444',
    iconClass:   'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
    barColor:    '#ef4444',
  },
  warning: {
    icon:        <MdWarningAmber className="text-base" />,
    borderColor: '#f59e0b',
    iconClass:   'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    barColor:    '#f59e0b',
  },
  info: {
    icon:        <MdInfoOutline className="text-base" />,
    borderColor: '#6366f1',
    iconClass:   'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    barColor:    '#6366f1',
  },
} as const

// ── Individual toast card ─────────────────────────────────────────────────────

const ToastCard = ({
  toast,
  onDismiss,
}: {
  toast:     ToastItem
  onDismiss: (id: string) => void
}) => {
  const { title, message, type, duration } = toast
  const cfg = CONFIG[type]

  const [visible,  setVisible]  = useState(false)
  const [barWidth, setBarWidth] = useState(100)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Double-RAF ensures the invisible frame is committed before animating in.
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setVisible(true))
    )
    return () => cancelAnimationFrame(id)
  }, [])

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
  className="
    bg-white
    dark:bg-slate-900
    border
    border-slate-200
    dark:border-slate-700
  "
  style={{
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 280ms ease, transform 280ms ease',
    width: '340px',
    borderRadius: '12px',
    boxShadow:
      '0 10px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    position: 'relative',
    borderLeft: `4px solid ${cfg.borderColor}`,
  }}
>
      {/* Body */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px 12px' }}>
        {/* Icon bubble */}
        <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cfg.iconClass}`}>
          {cfg.icon}
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
            {title}
          </p>
          {message && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={dismiss}
          className="shrink-0 mt-0.5 p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <MdClose className="text-base" />
        </button>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height:          '3px',
          width:           `${barWidth}%`,
          backgroundColor: cfg.barColor,
          transition:      'none',
        }}
      />
    </div>
  )
}

// ── Container — rendered via portal into document.body ────────────────────────

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

  return createPortal(
    <div
      style={{
        position:      'fixed',
        top:           '24px',
        left:          '50%',
        transform:     'translateX(-50%)',
        zIndex:        99999,
        display:       'flex',
        flexDirection: 'column',
        gap:           '10px',
        alignItems:    'center',
        pointerEvents: 'none',
      }}
      aria-live="polite"
    >
      {items.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastCard toast={toast} onDismiss={dismiss} />
        </div>
      ))}
    </div>,
    document.body,
  )
}
