import { useState, useRef } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import { MdOutlineCircle } from 'react-icons/md'
import { handleStyle, EditableLabel } from './InitialNode'

// ── StepNode ───────────────────────────────────────────────────────────────
const StepNode = ({ id, data, selected }: NodeProps) => {
  const { updateNodeData } = useReactFlow()

  const originalLabel = useRef((data?.label as string) ?? 'Node')
  const [labelDraft, setLabelDraft]         = useState(originalLabel.current)
  const [isEditingLabel, setIsEditingLabel] = useState(false)

  const startLabelEdit = () => {
    originalLabel.current = (data?.label as string) ?? 'Node'
    setLabelDraft(originalLabel.current)
    setIsEditingLabel(true)
  }
  const commitLabel = () => {
    const trimmed = labelDraft.trim() || originalLabel.current
    setLabelDraft(trimmed)
    updateNodeData(id, { label: trimmed })
    setIsEditingLabel(false)
  }
  const cancelLabel = () => {
    setLabelDraft(originalLabel.current)
    setIsEditingLabel(false)
  }

  return (
    <div
      className={`
        w-52 bg-white rounded-lg border-2 shadow-sm transition-all
        ${selected
          ? 'border-indigo-500 shadow-indigo-100 shadow-md'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
      `}
    >
      <Handle type="target" position={Position.Top} style={handleStyle} />

      <div className="flex items-center gap-2 px-3 py-3">
        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
          <MdOutlineCircle className="text-slate-500 text-xs" />
        </div>

        {isEditingLabel ? (
          <EditableLabel
            value={labelDraft}
            onChange={setLabelDraft}
            onCommit={commitLabel}
            onCancel={cancelLabel}
            className="text-sm font-semibold text-slate-800"
            placeholder="Step name..."
          />
        ) : (
          <span
            onDoubleClick={startLabelEdit}
            title="Double-click to rename"
            className="text-sm font-semibold text-slate-800 cursor-text select-none truncate"
          >
            {(data?.label as string) ?? 'Node'}
          </span>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} style={handleStyle} />
    </div>
  )
}

export default StepNode
