import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdArrowBack,
  MdOutlineNoteAdd,
  MdOutlineUndo,
  MdOutlineRedo,
  MdOutlineUpload,
  MdOutlineDownload,
  MdOutlinePlayCircle,
  MdOutlineMoreHoriz,
  MdCode,
  MdKeyboardArrowDown,
  MdRocketLaunch,
} from 'react-icons/md'
import logo from '../../assets/logo.png'
import { TbLayoutGridAdd } from 'react-icons/tb'

// ── Types ──────────────────────────────────────────────────────────────────
export type SaveStatus = 'idle' | 'saving' | 'saved'

export interface FlowToolbarProps {
  agentName: string
  saveStatus?: SaveStatus
  canUndo?: boolean
  canRedo?: boolean
  onNewFlow?:       () => void
  onUndo?:          () => void
  onRedo?:          () => void
  onImport?:        () => void
  onExport?:        () => void
  onExportPython?:  () => void
  onLoadExample?:   () => void
  onDeploy?:        () => void
}

// ── Small reusable toolbar button ──────────────────────────────────────────
interface ToolbarBtnProps {
  icon: React.ElementType
  label: string
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'primary'
}

const ToolbarBtn = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = 'default',
}: ToolbarBtnProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
      transition-all cursor-pointer select-none
      disabled:opacity-40 disabled:cursor-not-allowed
      ${variant === 'primary'
        ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
      }
    `}
  >
    <Icon className="text-base shrink-0" />
    {label}
  </button>
)

// ── Vertical divider between button groups ─────────────────────────────────
const Divider = () => (
  <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
)

// ── Export dropdown ────────────────────────────────────────────────────────
const ExportDropdown = ({
  onExportJson,
  onExportPython,
}: {
  onExportJson?:    () => void
  onExportPython?:  () => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const pick = (fn?: () => void) => {
    fn?.()
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
          text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200
          transition-all cursor-pointer select-none"
      >
        <MdOutlineDownload className="text-base shrink-0" />
        Export
        <MdKeyboardArrowDown
          className={`text-base transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
          <button
            onClick={() => pick(onExportJson)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MdOutlineDownload className="text-sm text-slate-400 shrink-0" />
            Export JSON
          </button>
          <button
            onClick={() => pick(onExportPython)}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <MdCode className="text-sm text-slate-400 shrink-0" />
            Export Python
          </button>
        </div>
      )}
    </div>
  )
}

// ── Toolbar ────────────────────────────────────────────────────────────────
const FlowToolbar = ({
  agentName,
  saveStatus = 'idle',
  canUndo  = false,
  canRedo  = false,
  onNewFlow,
  onUndo,
  onRedo,
  onImport,
  onExport,
  onExportPython,
  onLoadExample,
  onDeploy,
}: FlowToolbarProps) => {
  const navigate = useNavigate()

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-2 shrink-0">

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 pr-4 border-r border-slate-200 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#dde3e3' }}
        >
          <img src={logo} alt="PipeCat Studio logo" className="w-4 h-4 object-contain" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-slate-800 tracking-tight">PipeCat Studio</p>
          <p className="text-[10px] text-slate-400">Voice AI Platform</p>
        </div>
      </div>

      {/* ── Breadcrumb + save status ── */}
      <div className="flex items-center gap-1.5 pr-4 border-r border-slate-200 shrink-0">
        <span className="text-xs text-slate-400">Flow editor</span>
        <span className="text-slate-300 text-xs">·</span>
        <span className="text-xs font-semibold text-slate-700 max-w-35 truncate">
          {agentName}
        </span>

        {/* Save status pill */}
        {saveStatus === 'saving' && (
          <span className="text-[10px] text-slate-400 ml-1">Saving…</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-[10px] text-emerald-500 font-medium ml-1">✓ Saved</span>
        )}
      </div>

      {/* ── Button group 1: New Flow ── */}
      <ToolbarBtn
        icon={MdOutlineNoteAdd}
        label="New Flow"
        variant="primary"
        onClick={onNewFlow}
      />

      <Divider />

      {/* ── Button group 2: Undo / Redo ── */}
      <ToolbarBtn
        icon={MdOutlineUndo}
        label="Undo"
        disabled={!canUndo}
        onClick={onUndo}
      />
      <ToolbarBtn
        icon={MdOutlineRedo}
        label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
      />

      <Divider />

      {/* ── Button group 3: Import / Export ── */}
      <ToolbarBtn icon={MdOutlineUpload} label="Import" onClick={onImport} />
      <ExportDropdown onExportJson={onExport} onExportPython={onExportPython} />

      <Divider />

      {/* ── Button group 4: Load Example ── */}
      <ToolbarBtn
        icon={TbLayoutGridAdd}
        label="Load Example"
        onClick={onLoadExample}
      />

      {/* ── More (overflow menu placeholder) ── */}
      {/* <ToolbarBtn icon={MdOutlineMoreHoriz} label="More" /> */}

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Right: Deploy + Back ── */}
      <ToolbarBtn
        icon={MdRocketLaunch}
        label="Deploy"
        variant="primary"
        onClick={onDeploy}
      />

      <Divider />

      <button
        onClick={() => navigate('/agents')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer select-none"
      >
        <MdArrowBack className="text-base" />
        Agents
      </button>

    </div>
  )
}

export default FlowToolbar
