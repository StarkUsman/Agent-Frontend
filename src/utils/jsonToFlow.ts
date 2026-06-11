import type { Node, Edge } from '@xyflow/react'
import type {
  PipecatFlow,
  PipecatFunctionDef,
  PipecatAction,
  PipecatPropertySchema,
} from './flowToJson'
import type { FlowFunction, FnProperty } from '../components/flow/inspector/FunctionsTab'
import type { Action } from '../components/flow/inspector/ActionsTab'

// ── Format detection ───────────────────────────────────────────────────────

export function isPipecatFlow(json: unknown): json is PipecatFlow {
  if (typeof json !== 'object' || json === null) return false
  const obj = json as Record<string, unknown>
  return (
    typeof obj.initial_node === 'string' &&
    typeof obj.nodes === 'object' &&
    !Array.isArray(obj.nodes) &&
    obj.nodes !== null
  )
}

// ── Auto-layout (BFS tree) ─────────────────────────────────────────────────

function autoLayout(
  nodeKeys: string[],
  initialKey: string,
  adjacency: Map<string, string[]>,
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number }> = {}
  const visited = new Set<string>()
  let currentLevel = [initialKey]
  let level = 0

  while (currentLevel.length > 0) {
    const nextLevel: string[] = []
    const startX = 240 - ((currentLevel.length - 1) * 220) / 2

    currentLevel.forEach((key, i) => {
      if (!visited.has(key)) {
        visited.add(key)
        positions[key] = { x: startX + i * 220, y: 60 + level * 200 }
        for (const child of adjacency.get(key) ?? []) {
          if (!visited.has(child) && !nextLevel.includes(child)) nextLevel.push(child)
        }
      }
    })

    currentLevel = nextLevel
    level++
  }

  // Disconnected nodes off to the right
  let disconnectedX = 660
  for (const key of nodeKeys) {
    if (!visited.has(key)) {
      positions[key] = { x: disconnectedX, y: 60 }
      disconnectedX += 220
    }
  }

  return positions
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
  pipecatFn: PipecatFunctionDef,
  keyToId: Map<string, string>,
  idx: number,
): FlowFunction {
  const fn     = pipecatFn.function
  const params = fn.parameters ?? { properties: {}, required: [] }

  const properties = Object.entries(params.properties ?? {}).map(
    ([name, schema], i) =>
      fromPropertySchema(name, schema, (params.required ?? []).includes(name), i),
  )

  return {
    id: `fn-import-${Date.now()}-${idx}`,
    name: fn.name ?? '',
    description: fn.description ?? '',
    properties,
    next_node: fn.transition_to ? keyToId.get(fn.transition_to) ?? null : null,
    decision: null,
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

// ── Label prettifier (snake_case → Title Case) ─────────────────────────────

function toTitleCase(key: string): string {
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ── Main import ────────────────────────────────────────────────────────────

export function jsonToFlow(pipecat: PipecatFlow): { nodes: Node[]; edges: Edge[] } {
  const { initial_node, nodes: pipecatNodes } = pipecat
  const nodeKeys = Object.keys(pipecatNodes)

  // Build adjacency for auto-layout
  const adjacency = new Map<string, string[]>()
  for (const [key, config] of Object.entries(pipecatNodes)) {
    const children: string[] = []
    for (const fn of config.functions ?? []) {
      if (fn.function.transition_to) children.push(fn.function.transition_to)
    }
    adjacency.set(key, children)
  }

  const positions = autoLayout(nodeKeys, initial_node, adjacency)

  // Use the pipecat key as the ReactFlow node id
  const keyToId = new Map<string, string>(nodeKeys.map((k) => [k, k]))

  const reactflowNodes: Node[] = nodeKeys.map((key) => {
    const config = pipecatNodes[key]
    const id     = keyToId.get(key)!

    // Determine ReactFlow node type
    let nodeType: string
    if (key === initial_node) {
      nodeType = 'initial'
    } else if (config.post_actions?.some((a) => a.type === 'end_conversation')) {
      nodeType = 'end'
    } else {
      nodeType = 'step'
    }

    const functions   = (config.functions ?? []).map((fn, i) => fromFunctionPipecat(fn, keyToId, i))
    const preActions  = (config.pre_actions  ?? []).map((a, i) => fromActionPipecat(a, `pre-${key}-${i}`))
    const postActions = (config.post_actions ?? []).map((a, i) => fromActionPipecat(a, `post-${key}-${i}`))

    // Flatten a single system task_message into the instructions field
    const taskMessages     = config.task_messages ?? []
    let instructions       = ''
    let storedTaskMessages = taskMessages
    if (taskMessages.length === 1 && taskMessages[0].role === 'system') {
      instructions       = taskMessages[0].content
      storedTaskMessages = []
    }

    const label = toTitleCase(key)

    return {
      id,
      type: nodeType,
      position: positions[key] ?? { x: 0, y: 0 },
      data: {
        label,
        ...(instructions           ? { instructions }                            : {}),
        ...(storedTaskMessages.length ? { task_messages: storedTaskMessages }    : {}),
        ...(config.role_messages?.length ? { role_messages: config.role_messages } : {}),
        ...(functions.length       ? { functions }                               : {}),
        ...(preActions.length      ? { pre_actions: preActions }                 : {}),
        ...(postActions.length     ? { post_actions: postActions }               : {}),
        ...(config.context_strategy   ? { contextStrategy: config.context_strategy }     : {}),
        ...(config.respond_immediately ? { respondImmediately: config.respond_immediately } : {}),
      },
    }
  })

  // Build edges from function transition_to references
  const edges: Edge[]       = []
  const edgeSet = new Set<string>()

  for (const [key, config] of Object.entries(pipecatNodes)) {
    const sourceId = keyToId.get(key)!
    for (const fn of config.functions ?? []) {
      const targetKey = fn.function.transition_to
      if (!targetKey) continue
      const targetId = keyToId.get(targetKey)
      if (!targetId) continue
      const edgeKey = `${sourceId}-${targetId}`
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey)
        edges.push({
          id: `e-${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          type: 'smoothstep',
        })
      }
    }
  }

  return { nodes: reactflowNodes, edges }
}
