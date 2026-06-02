import { useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import FlowToolbar, { type SaveStatus } from '../components/flow/FlowToolbar'
import NodePalette   from '../components/flow/NodePalette'
import FlowCanvas    from '../components/flow/FlowCanvas'
import NodeInspector from '../components/flow/NodeInspector'
import { AGENTS } from '../data/agents'
import { flowToPython } from '../utils/flowToPython'
import { flowToJson } from '../utils/flowToJson'
import { jsonToFlow, isPipecatFlow } from '../utils/jsonToFlow'

// ── localStorage key per agent ─────────────────────────────────────────────
const storageKey = (agentId: string) => `pipecat-flow-agent-${agentId}`

// ── Load a saved flow from localStorage ───────────────────────────────────
// Returns { nodes, edges } if found, otherwise null (canvas uses its defaults)
const loadFlow = (agentId: string): { nodes: Node[]; edges: Edge[] } | null => {
  try {
    const raw = localStorage.getItem(storageKey(agentId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.nodes && parsed?.edges) return parsed
  } catch {
    console.warn('Failed to load flow from localStorage for agent', agentId)
  }
  return null
}

// ── Save a flow to localStorage ────────────────────────────────────────────
const saveFlow = (agentId: string, nodes: Node[], edges: Edge[]) => {
  localStorage.setItem(storageKey(agentId), JSON.stringify({ nodes, edges }))
}

// ── Example flow ───────────────────────────────────────────────────────────
const EXAMPLE_NODES: Node[] = [
  { id: 'ex-1', type: 'initial', position: { x: 240, y: 40  }, data: { label: 'Initial' } },
  { id: 'ex-2', type: 'step',    position: { x: 200, y: 200 }, data: { label: 'Greet caller',   instructions: 'Welcome the caller warmly and ask how you can help them today.' } },
  { id: 'ex-3', type: 'step',    position: { x: 200, y: 390 }, data: { label: 'Identify issue', instructions: 'Ask the caller to describe their issue in more detail.' } },
  { id: 'ex-4', type: 'step',    position: { x: 200, y: 580 }, data: { label: 'Resolve issue',  instructions: 'Provide the solution or escalate to a human agent if needed.' } },
  { id: 'ex-5', type: 'end',     position: { x: 240, y: 760 }, data: { label: 'End' } },
]
const EXAMPLE_EDGES: Edge[] = [
  { id: 'ex-e1', source: 'ex-1', target: 'ex-2', type: 'smoothstep' },
  { id: 'ex-e2', source: 'ex-2', target: 'ex-3', type: 'smoothstep' },
  { id: 'ex-e3', source: 'ex-3', target: 'ex-4', type: 'smoothstep' },
  { id: 'ex-e4', source: 'ex-4', target: 'ex-5', type: 'smoothstep' },
]

const NEW_FLOW_NODES: Node[] = [
  { id: '1', type: 'initial', position: { x: 240, y: 60 }, data: { label: 'Initial' } },
]

// ── Toast ──────────────────────────────────────────────────────────────────
const Toast = ({ message }: { message: string }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl pointer-events-none">
    {message}
  </div>
)

// ── Inner component — INSIDE ReactFlowProvider ─────────────────────────────
interface InnerProps {
  agentId: string
  agentName: string
  savedFlow: { nodes: Node[]; edges: Edge[] } | null
}

const FlowEditorInner = ({ agentId, agentName, savedFlow }: InnerProps) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [saveStatus, setSaveStatus]     = useState<SaveStatus>('idle')
  const [toast, setToast]               = useState('')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }, [])

  // ── Auto-save whenever the canvas changes ──────────────────────────────
  const handleFlowChange = useCallback((nodes: Node[], edges: Edge[]) => {
    setSaveStatus('saving')
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveFlow(agentId, nodes, edges)
      setSaveStatus('saved')
      // Reset to idle after 2 s so the "✓ Saved" doesn't stick forever
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 700)
  }, [agentId])

  // ── Toolbar actions ────────────────────────────────────────────────────
  const handleNewFlow = useCallback(() => {
    if (
      getNodes().length > 1 &&
      !window.confirm('This will clear the current flow. Continue?')
    ) return
    setNodes(NEW_FLOW_NODES)
    setEdges([])
    showToast('New flow created')
  }, [getNodes, setNodes, setEdges, showToast])

  const handleExport = useCallback(() => {
    const flow = flowToJson(getNodes(), getEdges(), agentName)
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${agentName.replace(/\s+/g, '-').toLowerCase()}-flow.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Flow exported')
  }, [getNodes, getEdges, agentName, showToast])

  const handleExportPython = useCallback(() => {
    try {
      const py       = flowToPython(getNodes(), getEdges(), agentName)
      const blob     = new Blob([py], { type: 'text/plain' })
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      a.download     = `${agentName.replace(/\s+/g, '-').toLowerCase()}-flow.py`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast('Flow exported as Python')
    } catch (err) {
      console.error('Python export failed:', err)
      showToast('Export failed — check the console for details')
    }
  }, [getNodes, getEdges, agentName, showToast])

  const handleImport = useCallback(() => {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string)
          if (isPipecatFlow(parsed)) {
            const { nodes, edges } = jsonToFlow(parsed)
            setNodes(nodes)
            setEdges(edges)
          } else {
            // Legacy ReactFlow format
            setNodes(parsed.nodes ?? [])
            setEdges(parsed.edges ?? [])
          }
          showToast('Flow imported')
        } catch {
          showToast('Invalid file — check the JSON format')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }, [setNodes, setEdges, showToast])

  const handleLoadExample = useCallback(() => {
    setNodes(EXAMPLE_NODES)
    setEdges(EXAMPLE_EDGES)
    showToast('Example flow loaded')
  }, [setNodes, setEdges, showToast])

  const handleDeploy = useCallback(() => {
    const py      = flowToPython(getNodes(), getEdges(), agentName)
    const payload = { agent_name: agentName, script: py }
    console.log('[Deploy] button pressed')
    console.log(payload)
    console.log('===============================')
    console.log(JSON.stringify(payload.script, null, 2))
    console.log('===============================')
    showToast('Deploy triggered — check console')
  }, [getNodes, getEdges, agentName, showToast])

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      <FlowToolbar
        agentName={agentName}
        saveStatus={saveStatus}
        canUndo={false}
        canRedo={false}
        onNewFlow={handleNewFlow}
        onUndo={() => {}}
        onRedo={() => {}}
        onImport={handleImport}
        onExport={handleExport}
        onExportPython={handleExportPython}
        onLoadExample={handleLoadExample}
        onDeploy={handleDeploy}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        {/* Pass the saved (or null) flow as initial state */}
        <FlowCanvas
          initialNodes={savedFlow?.nodes}
          initialEdges={savedFlow?.edges}
          onNodeSelect={setSelectedNode}
          onFlowChange={handleFlowChange}
        />
        <NodeInspector node={selectedNode} />
      </div>

      {toast && <Toast message={toast} />}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
const FlowEditorPage = () => {
  const { id }    = useParams<{ id: string }>()
  const agentId   = id ?? '0'
  const agent     = AGENTS.find((a) => a.id === Number(agentId))
  const agentName = agent?.name ?? `Agent #${agentId}`

  // Read localStorage synchronously before first render so FlowCanvas
  // gets the correct initialNodes/initialEdges on mount (not after)
  const [savedFlow] = useState(() => loadFlow(agentId))

  return (
    <ReactFlowProvider>
      <FlowEditorInner
        agentId={agentId}
        agentName={agentName}
        savedFlow={savedFlow}
      />
    </ReactFlowProvider>
  )
}

export default FlowEditorPage
