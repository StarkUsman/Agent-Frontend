import { useState } from 'react'
import { useReactFlow, type Node } from '@xyflow/react'
import {
  MdAdd,
  MdOutlineDeleteOutline,
  MdKeyboardArrowDown,
  MdChevronRight,
  MdHelpOutline,
} from 'react-icons/md'

// ── Types ──────────────────────────────────────────────────────────────────
export interface FnProperty {
  id: string
  name: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  validation: 'none' | 'enum' | 'pattern'
  enumValues: string
  pattern: string
}

export interface DecisionCondition {
  id: string
  operator: string
  value: string
  next_node: string | null
}

export interface FnDecision {
  action: string
  conditions: DecisionCondition[]
}

export interface FlowFunction {
  id: string
  name: string
  description: string
  properties: FnProperty[]
  next_node: string | null
  decision: FnDecision | null
}

// ── Constants ──────────────────────────────────────────────────────────────
const PROP_TYPES      = ['string', 'number', 'boolean', 'array', 'object']
const VALIDATION_OPTS = ['none', 'enum', 'pattern'] as const
const OPERATORS       = ['==', '!=', '>', '<', '>=', '<=', 'contains', 'not_contains']

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// ── Shared field label ─────────────────────────────────────────────────────
const FieldLabel = ({
  children,
  hint,
}: {
  children: React.ReactNode
  hint?: string
}) => (
  <div className="flex items-center gap-1 mb-1.5">
    <p className="text-xs font-medium text-slate-500">{children}</p>
    {hint && (
      <span title={hint} className="cursor-help">
        <MdHelpOutline className="text-slate-400 text-sm" />
      </span>
    )}
  </div>
)

// ── Styled full-width select ───────────────────────────────────────────────
const StyledSelect = ({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  placeholder?: string
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>{capitalize(o)}</option>
      ))}
    </select>
    <MdKeyboardArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base" />
  </div>
)

// ── Condition card ─────────────────────────────────────────────────────────
const ConditionCard = ({
  cond,
  availableNodes,
  onChange,
  onDelete,
}: {
  cond: DecisionCondition
  availableNodes: Node[]
  onChange: (c: DecisionCondition) => void
  onDelete: () => void
}) => (
  <div className="border border-slate-200 rounded-xl p-3 space-y-3 bg-white">

    {/* Operator + Value + Delete */}
    <div className="flex items-end gap-2">

      <div className="flex-1">
        <p className="text-xs text-slate-400 mb-1.5">Operator</p>
        <div className="relative">
          <select
            value={cond.operator}
            onChange={(e) => onChange({ ...cond, operator: e.target.value })}
            className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all"
          >
            {OPERATORS.map((op) => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
          <MdKeyboardArrowDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm" />
        </div>
      </div>

      <div className="flex-1">
        <p className="text-xs text-slate-400 mb-1.5">Value</p>
        <input
          value={cond.value}
          onChange={(e) => onChange({ ...cond, value: e.target.value })}
          placeholder="Value to compare"
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 transition-all"
        />
      </div>

      <button
        onClick={onDelete}
        className="mb-0.5 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
      >
        <MdOutlineDeleteOutline className="text-base" />
      </button>
    </div>

    {/* Next Node */}
    <div>
      <p className="text-xs text-slate-400 mb-1.5">Next Node</p>
      <div className="relative">
        <select
          value={cond.next_node ?? ''}
          onChange={(e) => onChange({ ...cond, next_node: e.target.value || null })}
          className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all"
        >
          <option value="">Select next node...</option>
          {availableNodes.map((n) => (
            <option key={n.id} value={n.id}>
              {(n.data?.label as string) ?? n.id} ({n.type})
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base" />
      </div>
    </div>

  </div>
)

// ── Decision section (lives inside FunctionCard) ───────────────────────────
const DecisionSection = ({
  decision,
  availableNodes,
  onChange,
  onRemove,
}: {
  decision: FnDecision | null
  availableNodes: Node[]
  onChange: (d: FnDecision) => void
  onRemove: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const current = decision ?? { action: '', conditions: [] }
  const conditions = current.conditions ?? []

  const handleToggle = () => {
    // First open: create the decision object if it doesn't exist yet
    if (!isOpen && !decision) {
      onChange({ action: '', conditions: [] })
    }
    setIsOpen((v) => !v)
  }

  const handleRemove = () => {
    onRemove()
    setIsOpen(false)
  }

  const addCondition = () =>
    onChange({
      ...current,
      conditions: [
        ...conditions,
        { id: `cond-${Date.now()}`, operator: '==', value: '', next_node: null },
      ],
    })

  const updateCondition = (i: number, updated: DecisionCondition) => {
    const next = [...conditions]; next[i] = updated
    onChange({ ...current, conditions: next })
  }

  const deleteCondition = (i: number) =>
    onChange({
      ...current,
      conditions: conditions.filter((_, idx) => idx !== i),
    })

  return (
    <div className="border-t border-slate-100 pt-3">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggle}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
        >
          <MdChevronRight
            className={`text-base transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
          Decision
        </button>

        {/* "Remove" only visible when open and a decision exists */}
        {isOpen && decision && (
          <button
            onClick={handleRemove}
            className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div className="mt-4 space-y-5">

          {/* Action — Python code block */}
          <div>
            <FieldLabel hint="Python code block executed to determine the condition result">
              Action (Python code block)
            </FieldLabel>
            <textarea
              value={current.action}
              onChange={(e) => onChange({ ...current, action: e.target.value })}
              rows={5}
              placeholder="result = my_function()"
              spellCheck={false}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 leading-relaxed transition-all"
            />
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-700">Conditions</p>
              <button
                onClick={addCondition}
                className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
              >
                <MdAdd className="text-sm" />
                Add
              </button>
            </div>

            {conditions.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">
                No conditions — click + Add to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {conditions.map((cond, i) => (
                  <ConditionCard
                    key={cond.id}
                    cond={cond}
                    availableNodes={availableNodes}
                    onChange={(updated) => updateCondition(i, updated)}
                    onDelete={() => deleteCondition(i)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  )
}

// ── Property card ──────────────────────────────────────────────────────────
const PropertyCard = ({
  prop,
  onChange,
  onDelete,
}: {
  prop: FnProperty
  onChange: (p: FnProperty) => void
  onDelete: () => void
}) => (
  <div className="border border-slate-200 rounded-xl bg-white overflow-hidden">
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-start justify-between mb-1.5">
        <p className="text-xs font-medium text-slate-500">Property name</p>
        <button
          onClick={onDelete}
          className="p-1 -mt-0.5 -mr-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <MdOutlineDeleteOutline className="text-base" />
        </button>
      </div>
      <input
        value={prop.name}
        onChange={(e) => onChange({ ...prop, name: e.target.value })}
        placeholder="e.g., size"
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 transition-all"
      />
    </div>

    <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-3">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={prop.required}
          onChange={(e) => onChange({ ...prop, required: e.target.checked })}
          className="w-4 h-4 rounded accent-slate-800 cursor-pointer"
        />
        <span className="text-sm text-slate-700 font-medium">Required</span>
      </label>

      <div>
        <FieldLabel>Type</FieldLabel>
        <StyledSelect
          value={prop.type}
          options={PROP_TYPES}
          onChange={(v) => onChange({ ...prop, type: v as FnProperty['type'] })}
        />
      </div>

      <div>
        <FieldLabel hint="Constrain the accepted values for this property">
          Validation
        </FieldLabel>
        <StyledSelect
          value={prop.validation}
          options={[...VALIDATION_OPTS]}
          onChange={(v) => onChange({ ...prop, validation: v as FnProperty['validation'] })}
        />
      </div>

      {prop.validation === 'enum' && (
        <div>
          <FieldLabel>Enum values (one per line)</FieldLabel>
          <textarea
            value={prop.enumValues}
            onChange={(e) => onChange({ ...prop, enumValues: e.target.value })}
            rows={4}
            placeholder={'small\nmedium\nlarge'}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 leading-relaxed transition-all"
          />
        </div>
      )}

      {prop.validation === 'pattern' && (
        <div>
          <FieldLabel hint="Regular expression the value must match">Pattern</FieldLabel>
          <input
            value={prop.pattern}
            onChange={(e) => onChange({ ...prop, pattern: e.target.value })}
            placeholder="e.g., ^[a-z]+$"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 transition-all"
          />
        </div>
      )}
    </div>
  </div>
)

// ── Function card ──────────────────────────────────────────────────────────
const FunctionCard = ({
  fn, index, availableNodes, onChange, onDelete,
}: {
  fn: FlowFunction
  index: number
  availableNodes: Node[]
  onChange: (updated: FlowFunction) => void
  onDelete: () => void
}) => {
  const [isOpen, setIsOpen] = useState(true)
  const props = fn.properties ?? []

  const addProperty = () =>
    onChange({
      ...fn,
      properties: [
        ...props,
        { id: `prop-${Date.now()}`, name: '', required: false, type: 'string', validation: 'none', enumValues: '', pattern: '' },
      ],
    })

  const updateProp = (i: number, p: FnProperty) => {
    const next = [...props]; next[i] = p; onChange({ ...fn, properties: next })
  }
  const deleteProp = (i: number) =>
    onChange({ ...fn, properties: props.filter((_, idx) => idx !== i) })

  return (
    <div className={`rounded-xl border-2 overflow-hidden transition-colors ${isOpen ? 'border-indigo-300' : 'border-slate-200'}`}>

      <div className="flex items-center justify-between px-4 py-3 bg-white">
        <button onClick={() => setIsOpen((v) => !v)} className="flex items-center gap-2 cursor-pointer">
          <MdKeyboardArrowDown className={`text-slate-500 text-base transition-transform ${isOpen ? '' : '-rotate-90'}`} />
          <span className="text-sm font-semibold text-slate-800">{fn.name || `Function ${index + 1}`}</span>
        </button>
        <button onClick={onDelete} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
          <MdOutlineDeleteOutline className="text-base" />
        </button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4 bg-white border-t border-slate-100">

          <div className="pt-3">
            <FieldLabel>Function name</FieldLabel>
            <input
              value={fn.name}
              onChange={(e) => onChange({ ...fn, name: e.target.value })}
              placeholder="e.g., choose_pizza"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 transition-all"
            />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={fn.description}
              onChange={(e) => onChange({ ...fn, description: e.target.value })}
              placeholder="Describe what this function does"
              rows={3}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder-slate-300 leading-relaxed transition-all"
            />
          </div>

          {/* Properties */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-slate-700">Properties</p>
              <button onClick={addProperty} className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                <MdAdd className="text-sm" /> Add Property
              </button>
            </div>
            {props.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No properties. Click "Add Property" to create one.</p>
            ) : (
              <div className="space-y-3">
                {props.map((prop, i) => (
                  <PropertyCard key={prop.id} prop={prop} onChange={(p) => updateProp(i, p)} onDelete={() => deleteProp(i)} />
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Next Node */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-2">Next Node</p>
            <div className="relative">
              <select
                value={fn.next_node ?? ''}
                onChange={(e) => onChange({ ...fn, next_node: e.target.value || null })}
                className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 pr-8 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer transition-all"
              >
                <option value="">Select next node...</option>
                {availableNodes.map((n) => (
                  <option key={n.id} value={n.id}>{(n.data?.label as string) ?? n.id} ({n.type})</option>
                ))}
              </select>
              <MdKeyboardArrowDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Decision */}
          <DecisionSection
            decision={fn.decision ?? null}
            availableNodes={availableNodes}
            onChange={(d) => onChange({ ...fn, decision: d })}
            onRemove={() => onChange({ ...fn, decision: null })}
          />

        </div>
      )}
    </div>
  )
}

// ── FunctionsTab ───────────────────────────────────────────────────────────
interface FunctionsTabProps {
  node: Node
  onUpdate: (patch: Record<string, unknown>) => void
}

const FunctionsTab = ({ node, onUpdate }: FunctionsTabProps) => {
  const { getNodes } = useReactFlow()

  const [functions, setFunctions] = useState<FlowFunction[]>(
    (node.data?.functions as FlowFunction[]) ?? []
  )

  const availableNodes = getNodes().filter((n) => n.id !== node.id)

  const sync = (fns: FlowFunction[]) => {
    setFunctions(fns)
    onUpdate({ functions: fns })
  }

  const addFunction = () =>
    sync([
      ...functions,
      { id: `fn-${Date.now()}`, name: '', description: '', properties: [], next_node: null, decision: null },
    ])

  const updateFn = (i: number, updated: FlowFunction) => {
    const next = [...functions]; next[i] = updated; sync(next)
  }
  const deleteFn = (i: number) => sync(functions.filter((_, idx) => idx !== i))

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-600">Functions</p>
        <button onClick={addFunction} className="flex items-center gap-0.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
          <MdAdd className="text-sm" /> Add
        </button>
      </div>

      {functions.length === 0 ? (
        <p className="text-[11px] text-slate-300 italic text-center py-6">
          No functions yet — click + Add to create one.
        </p>
      ) : (
        functions.map((fn, i) => (
          <FunctionCard
            key={fn.id}
            fn={fn}
            index={i}
            availableNodes={availableNodes}
            onChange={(updated) => updateFn(i, updated)}
            onDelete={() => deleteFn(i)}
          />
        ))
      )}
    </div>
  )
}

export default FunctionsTab
