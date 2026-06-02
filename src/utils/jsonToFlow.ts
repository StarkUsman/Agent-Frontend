import type { Node, Edge } from '@xyflow/react'
import type {
  PipecatFlow,
  PipecatFunction,
  PipecatAction,
  PipecatPropertySchema,
} from './flowToJson'
import type { FlowFunction, FnProperty } from '../components/flow/inspector/FunctionsTab'
import type { Action } from '../components/flow/inspector/ActionsTab'

// ── Format detection ───────────────────────────────────────────────────────

export function isPipecatFlow(json: unknown): json is PipecatFlow {
  if (typeof json !== 'object' || json === null) return false
  const obj = json as Record<string, unknown>
  // Official pipecat editor format: has $id pointing to the schema URL, nodes as array
  return (
    typeof obj.$id === 'string' &&
    obj.$id.includes('pipecat') &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.edges)
  )
}

// ── Property deserialization ───────────────────────────────────────────────

function fromPropertySchema(
  name: string,
  schema: PipecatPropertySchema,
  required: boolean,
  idx: number,
): FnProperty {
  const validation: FnProperty['validation'] =
    schema.enum ? 'enum' : schema.pattern ? 'pattern' : 'none'
  return {
    id: `prop-import-${Date.now()}-${idx}`,
    name,
    required,
    type: (schema.type as FnProperty['type']) ?? 'string',
    validation,
    enumValues: schema.enum ? schema.enum.join('\n') : '',
    pattern: schema.pattern ?? '',
  }
}

// ── Function deserialization ───────────────────────────────────────────────

function fromFunctionPipecat(
  pipecatFn: PipecatFunction,
  // pipecat node id → reactflow node id (in our case they're the same after import)
  nodeIdMap: Map<string, string>,
  idx: number,
): FlowFunction {
  const properties = Object.entries(pipecatFn.properties ?? {}).map(
    ([name, schema], i) =>
      fromPropertySchema(name, schema, (pipecatFn.required ?? []).includes(name), i),
  )

  return {
    id:          `fn-import-${Date.now()}-${idx}`,
    name:        pipecatFn.name,
    description: pipecatFn.description,
    properties,
    next_node:   pipecatFn.next_node_id ? nodeIdMap.get(pipecatFn.next_node_id) ?? null : null,
    decision:    null,
  }
}

// ── Action deserialization ─────────────────────────────────────────────────

function fromActionPipecat(action: PipecatAction, prefix: string): Action {
  switch (action.type) {
    case 'end_conversation':
      return { id: `${prefix}-end`, type: 'end_conversation', handler: '' }
    case 'tts_say':
      return { id: `${prefix}-tts`, type: 'tts_say', handler: (action as { type: 'tts_say'; text: string }).text ?? '' }
    case 'function':
      return { id: `${prefix}-fn`, type: 'function', handler: (action as { type: 'function'; handler: string }).handler ?? '' }
    default:
      return { id: `${prefix}-unknown`, type: 'function', handler: '' }
  }
}

// ── Pipecat node type → ReactFlow node type ────────────────────────────────

function fromNodeType(pipecatType: string | undefined): string {
  if (pipecatType === 'initial') return 'initial'
  if (pipecatType === 'end')     return 'end'
  return 'step'
}

// ── Main import ────────────────────────────────────────────────────────────

export function jsonToFlow(pipecat: PipecatFlow): { nodes: Node[]; edges: Edge[] } {
  // Map pipecat node id → same id (they're used directly as ReactFlow ids)
  const nodeIdMap = new Map<string, string>()
  for (const n of pipecat.nodes) nodeIdMap.set(n.id, n.id)

  const reactflowNodes: Node[] = pipecat.nodes.map((n) => {
    const nodeType = fromNodeType(n.type ?? n.data?.type)
    const data     = n.data ?? { label: n.id, type: n.type ?? 'node' }

    const functions   = (data.functions   ?? []).map((fn, i) => fromFunctionPipecat(fn, nodeIdMap, i))
    const preActions  = (data.pre_actions  ?? []).map((a, i) => fromActionPipecat(a, `pre-${n.id}-${i}`))
    const postActions = (data.post_actions ?? []).map((a, i) => fromActionPipecat(a, `post-${n.id}-${i}`))

    // Flatten a single system task_message into the instructions field
    const taskMessages = data.task_messages ?? []
    let instructions       = ''
    let storedTaskMessages = taskMessages
    if (taskMessages.length === 1 && taskMessages[0].role === 'system') {
      instructions       = taskMessages[0].content
      storedTaskMessages = []
    }

    return {
      id:       n.id,
      type:     nodeType,
      position: n.position ?? { x: 0, y: 0 },
      data: {
        label: data.label ?? n.id,
        ...(instructions             ? { instructions }                              : {}),
        ...(storedTaskMessages.length ? { task_messages: storedTaskMessages }        : {}),
        ...(data.role_messages?.length ? { role_messages: data.role_messages }       : {}),
        ...(functions.length          ? { functions }                                : {}),
        ...(preActions.length         ? { pre_actions: preActions }                  : {}),
        ...(postActions.length        ? { post_actions: postActions }                : {}),
        ...(data.context_strategy     ? { contextStrategy: data.context_strategy }   : {}),
        ...(data.respond_immediately  ? { respondImmediately: data.respond_immediately } : {}),
      },
    }
  })

  // Convert pipecat edges directly to ReactFlow edges
  const reactflowEdges: Edge[] = pipecat.edges.map((e) => ({
    id:     e.id,
    source: e.source,
    target: e.target,
    label:  e.label,
    type:   'smoothstep',
  }))

  return { nodes: reactflowNodes, edges: reactflowEdges }
}
